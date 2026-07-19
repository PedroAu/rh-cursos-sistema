# Relatório sanitizado — REC-408: Endurecer CSP, cache, logs e privacidade

- **Story:** `docs/stories/2026-07-17-rec-408-endurecer-csp-cache-logs-privacidade.md`
- **Épica:** 17 — Recuperação SEV-0 (Onda 5, P1)
- **Executor:** @dev (Dex)
- **Data:** 2026-07-17
- **Status de qualidade:** PENDENTE. Este relatório NÃO emite veredito de QA. A revisão transversal cabe a `@architect` (Aria) e o veredito final a `@qa` (Quinn).

> Todos os valores abaixo são **sintéticos**. Nenhum segredo, token, e-mail, telefone ou PII real aparece neste documento nem nas asserções de teste.

---

## 1. Resumo por área

### 1.1 CSP — fonte canônica única (Tasks 1 / AC1, AC2)

- `src/lib/security-headers.ts` é agora a **única** fonte da CSP, aplicada no runtime por `middleware.ts` via `applySecurityHeaders()`.
- `next.config.mjs`: removida a diretiva `Content-Security-Policy` concorrente do `headers()`. Os demais headers estáticos permanecem (com nota apontando a fonte canônica). Nenhuma CSP é mais declarada aqui.
- `public/_headers`: removidas a CSP e os headers de segurança concorrentes; mantida apenas a regra de cache imutável de `/_next/static/*` (não é política de segurança) e nota documental.
- **Inventário de origens (consumidor rastreável — AC2):**
  | Origem | Consumidor | Ação |
  |---|---|---|
  | `www.googletagmanager.com` / `www.google-analytics.com` | Google Analytics 4 — `app/layout.tsx:62` (`<GoogleAnalytics>`) + `src/lib/analytics.ts` (`@next/third-parties`) | Mantida (consolidada do `next.config`) |
  | `*.supabase.co` / `wss://*.supabase.co` | Cliente Supabase (dados + realtime) | Mantida |
  | `api.rhcursos.com.br` | Domínio de API próprio da organização; sem consumidor de código direto encontrado | **Mantida de forma conservadora — sinalizada para revisão de @architect** |
  | `cdn.jsdelivr.net` | **Nenhum consumidor** em todo o repositório (grep vazio) | **Removida** (AC2: nenhuma origem sem consumidor) |
  | `fonts.googleapis.com` / `fonts.gstatic.com` | Sem consumidor (fontes self-hosted via `next/font`) | Não incluídas na canônica (`font-src 'self' https:` cobre casos legítimos) |
- `unsafe-eval` **não** aparece na política de produção (permanece apenas em desenvolvimento, para HMR).
- Diretivas de endurecimento preservadas: `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `default-src 'self'`, `upgrade-insecure-requests`.

**CSP de produção emitida (fonte canônica):**

```
default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' https:; connect-src 'self' https://api.rhcursos.com.br https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests
```

### 1.2 Cache `no-store` uniforme (Task 2 / AC3, AC4, AC7)

- Novo helper canônico `applyNoStore<T extends Response>()` em `src/lib/security-headers.ts` (constante `NO_STORE_CACHE_CONTROL`). Genérico sobre `Response` e `NextResponse` — cobre rotas que devolvem `NextResponse.json` e o proxy que devolve `Response` cru.
- `applyApiSecurityHeaders()` foi refatorada para reutilizar `applyNoStore` (fonte única do contrato de cache).
- **Aplicação por ponto único de saída** (delegação `handleX` → wrapper que aplica `applyNoStore`), garantindo cobertura de **todos** os retornos sem alterar payload, status nem o fluxo de autorização:
  - `app/api/auth/session/route.ts` — GET/POST/DELETE (sucesso, 400, 401, 403, 429 rate limit, 503, MFA, logout).
  - `app/api/auth/ssr-session/route.ts` — GET/POST/DELETE (todos os status do switch).
  - `app/api/functions/[name]/route.ts` — GET/POST/DELETE, inclusive 401/403/503 e a resposta do upstream (o cache do upstream não é propagado; `FORWARDED_HEADERS` não inclui `cache-control`).
  - `app/api/admin/{students,classes,courses,enrollments,instructors}/route.ts` — GET, inclusive as negações 401/403/503 de `requireAdminApi` e o 500.
- **AC7:** nenhuma decisão de autorização, cookie, `x-rh-session`, allowlist ou código de cutover foi adicionada/removida. O REC-204 Fase B permanece intocado — apenas o contrato de cache foi acrescentado no ponto de saída.

### 1.3 Redaction central no logger (Task 3 / AC5)

- `src/lib/logger.ts`: redaction recursiva na fronteira do `emit`, sem depender de chamadores.
  - **Por nome de campo** (case-insensitive, normalizando `_`/`-`): `authorization`, `cookie`, `set-cookie`, `token`, `access_token`, `refresh_token`, `id_token`, `password`, `secret`, `api_key`, `email`, `phone`/`telefone`, `mfa_code`, `otp`, `bearer`, `credential(s)`, `x-rh-session`, `service_role_key`, etc.
  - **Por formato de valor** (em qualquer campo): `Bearer <token>`, JWT (`eyJ...`) e e-mail.
  - **Erros:** `message` e `cause` saneados; `stack` só é emitido fora de produção (e ainda saneado).
  - **Robustez:** `WeakSet` para estruturas circulares (`[Circular]`), limite de profundidade (`[Truncated]`), e `try/catch` externo — o logger nunca lança.

### 1.4 Telemetria de query saneada (Task 4 / AC6)

- `src/lib/supabase/query-logging-middleware.ts`: o campo `errorMessage` (mensagem bruta) foi **substituído** por `errorCategory` — um rótulo sanitizado derivado de status HTTP / SQLSTATE / padrão estrutural da mensagem (`timeout`, `network`, `server_error`, `integrity`, `unauthorized`, ...) via nova `classifyQueryError()`.
- Removido o vazamento de mensagem bruta em: métricas em memória (`recordQueryMetrics`), console (`logQueryToConsole`) e breadcrumb do Sentry (`captureFailedQuery`). `captureMessage` já não incluía a mensagem.
- Metadados preservados (permitidos por AC6): `method`, `table`, `duration`, `status`, `isSlow`, `errorCategory`.
- `src/lib/supabase/api-validation.ts` mantido como padrão seguro de referência (`describeShape` — registra o shape, nunca valores). Não modificado.

---

## 2. Gates executados (evidência fresca)

| Gate | Comando | Resultado |
|---|---|---|
| Lint | `npm run lint` | **PASS** — 0 erros/0 warnings |
| Typecheck | `npm run typecheck` | **PASS** — `Types generated successfully`, `tsc --noEmit` sem erros |
| Testes unitários | `npm run test:unit` (vitest) | **PASS** — 74 arquivos, **746 testes** |
| Build | `npm run build` | **PASS** — `Compiled successfully`, 36/36 páginas geradas |
| Build/typecheck de teste | `npm test` (typecheck + playwright build) | ver seção 4 |

### Testes direcionados adicionados/atualizados

- `src/__tests__/lib/security-headers.test.ts`: CSP de produção (sem `unsafe-eval`, diretivas mínimas, sem jsdelivr, origens GA/Supabase rastreáveis), guarda de fonte única (next.config e `_headers` sem CSP ativa) e contrato `no-store` (`applyNoStore` sobre `NextResponse` e `Response` cru; `applyApiSecurityHeaders`).
- `src/__tests__/lib/logger.test.ts` (novo): redaction de campos aninhados, redaction por formato em campo não sensível, saneamento de `Error.message`/`cause`, ausência de `stack` em produção, e não-lançamento em estrutura circular. Valores 100% sintéticos.
- `src/__tests__/lib/query-logging-middleware.test.ts`: asserção migrada para `errorCategory`; novo teste prova que e-mail/telefone/JWT/mensagem bruta sintéticos nunca aparecem nas métricas.
- `src/__tests__/app/api/functions-route.test.ts`: `no-store` no sucesso do upstream e no 503.
- `src/__tests__/app/api/auth-session-route.test.ts`: `no-store` no login 200 e no rate limit 429.
- `src/__tests__/app/api/admin-read-models-route.test.ts`: `no-store` no 401 (negação) e no 200 (dados autenticados).

---

## 3. Verificação de Acceptance Criteria

| AC | Verificação | Evidência |
|---|---|---|
| **AC1** — CSP fonte canônica única | CSP emitida só por `security-headers.ts`/`middleware.ts`; `next.config.mjs` e `public/_headers` sem CSP ativa | Testes de "Fonte única" em `security-headers.test.ts`; diffs de `next.config.mjs` e `public/_headers` |
| **AC2** — Só origens necessárias | Cada origem com consumidor rastreável; `unsafe-eval` ausente em prod; `base-uri`/`form-action`/`frame-ancestors` ativos; jsdelivr removida; nada inventado | Testes "CSP canônica de produção"; inventário §1.1 |
| **AC3** — Auth sempre `no-store` | Todos os retornos de `auth/session` e `auth/ssr-session` (sucesso/erro/logout/MFA/rate limit) com `Cache-Control: no-store` | Wrappers `applyNoStore`; testes de login 200 e 429 |
| **AC4** — Admin/BFF `no-store` | BFF (`functions/[name]`) e admin (401/403/503 inclusive) com `no-store`; cache do upstream não propagado | Wrappers; testes de functions (200/503) e admin (200/401) |
| **AC5** — Redaction bloqueia token/PII | Campos sensíveis aninhados e formatos de credencial redigidos; sem vazamento por message/cause/stack; sem lançar em circular | `logger.ts`; `logger.test.ts` |
| **AC6** — Telemetria só metadados | `errorCategory` sanitizado substitui mensagem bruta em console/Sentry/métricas; sem payload/token/e-mail/telefone | `query-logging-middleware.ts`; teste de não-vazamento |
| **AC7** — Compatível com REC-204 sem antecipar Fase B | Nenhuma mudança de autorização/cookie/`x-rh-session`/allowlist/cutover; só cache/log | Diffs das rotas (apenas wrappers de saída e imports) |
| **AC8** — Evidência e gates verdes | lint/typecheck/test:unit/build verdes; relatório sanitizado | §2 |

---

## 4. Notas para @architect e @qa

- **Ponto de decisão (AC2):** `api.rhcursos.com.br` foi **mantida** em `connect-src` sem consumidor de código direto encontrado, por ser o subdomínio de API próprio da organização e por o risco de remoção (quebrar fetches configurados por env) superar o benefício. Recomenda-se validação explícita de @architect: manter ou remover.
- **Consolidação de GA:** as origens do Google Analytics foram trazidas para a fonte canônica porque o consumidor é real e rastreável (`app/layout.tsx` + `analytics.ts`). Não é origem inventada — é consolidação das políticas que antes divergiam entre `next.config.mjs` e `security-headers.ts`.
- **Escopo respeitado:** nenhum arquivo de REC-406 (`docs/api/openapi.yaml`, `docs/api/README.md`, `public/api-docs.html`, `scripts/check-openapi-drift.mjs`) foi tocado; nenhuma lógica de autoridade HMAC/SSR/allowlist/login/`x-rh-session` foi alterada (REC-204).
- **Veredito de QA:** não emitido por este executor. Encaminhado para revisão de `@architect` e gate independente de `@qa`.
