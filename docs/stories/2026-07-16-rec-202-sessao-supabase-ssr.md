# Story REC-202: Sessão Supabase SSR (cookies httpOnly + AAL2 fail-closed)

## Status

Done

## Executor Assignment

executor: "@dev" (Dex) — implementação da sessão SSR + AAL2
quality_gate: "@qa" (Quinn) — revisão independente (gate separado, fora desta story)
quality_gate_tools:
- verificação de que o fluxo HMAC existente (`app/api/auth/session/route.ts`, `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`) permanece intacto e continua sendo a autoridade (D5, anti-lockout)
- verificação do contrato AAL2 fail-closed (D3 / SEC-104): senha sozinha não abre sessão admin quando há MFA ativo
- verificação de que tokens do Supabase não são devolvidos no corpo nem persistidos em `localStorage` no novo caminho (D2)
- conferência de que nenhuma credencial/segredo/conta real foi alterada e nenhuma chamada de rede real contra produção foi feita

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 3 — Identidade e entrega segura
- **Prioridade:** P0 / SEV-0
- **Estimativa:** M
- **ADR de origem:** [ADR-016](../architecture/adr-016-identidade-bff-rec201.md) — D2 (cookies SSR httpOnly/secure), D3 (AAL2 fail-closed), D5 (sequência forward-only, coexistência só-leitura do HMAC)
- **Findings/Requisitos:** FND-04, FR-07, NFR-04; finding de QA absorvido: **SEC-104** (MFA enrolled mas login sem AAL2, gate de REC-002)
- **Depende de:** REC-201 (ADR-016, Done)
- **Bloqueia:** REC-203 (papel do servidor), REC-204 (remoção do HMAC/localStorage/header)

## Story

**As a** responsável pela identidade administrativa da RH Cursos,
**I want** que login/logout/leitura de sessão possam usar a sessão SSR do Supabase em cookies `httpOnly`/`secure`, exigindo AAL2 quando a conta tem MFA ativo,
**so that** a autoridade de identidade migre para o Supabase Auth (D1/D2) e o gap SEC-104 seja fechado (D3), **sem** quebrar o login administrativo atual (HMAC), evitando risco de lockout.

## Contexto e valor

O ADR-016 (REC-201) fixou a decisão de adotar o Supabase Auth como autoridade única de identidade. REC-202 é o **primeiro passo de implementação** (D5, ordem 1): introduzir a sessão SSR do Supabase (`@supabase/ssr`, cookies httpOnly) e o login com **AAL2 fail-closed**, fechando o finding SEC-104 aberto no gate de REC-002.

A épica documenta explicitamente o risco *"Migração de auth gerar lockout"* (§11), mitigado por *"conta de teste, rollout reduzido e compatibilidade apenas de leitura por uma janela"*. Por isso, REC-202 **não remove nem altera** o fluxo HMAC: a sessão SSR passa a **coexistir** com o HMAC, que permanece a autoridade de autorização até REC-203/REC-204. A remoção do HMAC é escopo de REC-204 (story futura).

## Escopo

### Incluído

- Novo módulo `src/lib/supabase/session.ts`: cliente SSR (`createServerClient` do `@supabase/ssr`, chave anon/publishable), atributos de cookie `httpOnly`/`secure`/`SameSite=Lax` (D2), login `signInSSR` com AAL2 fail-closed (D3), leitura `readSSRSession` e logout `signOutSSR`.
- Nova rota **aditiva** `app/api/auth/ssr-session/route.ts` (POST/GET/DELETE) para o fluxo SSR, sem tocar em `app/api/auth/session/route.ts` (HMAC).
- Testes mockados (Vitest) cobrindo o contrato AAL2 fail-closed e os atributos/emissão de cookie SSR.

### Fora do escopo (deliberadamente NÃO feito)

- **Remover/alterar o HMAC** (`src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`) — permanece autoridade; remoção é REC-204.
- Eliminar `localStorage` e o header `x-rh-session` (`src/lib/supabase/session-token.ts`) — REC-204.
- Migrar a autorização administrativa para papel resolvido no servidor a cada operação — REC-203.
- Trocar o `app-store`/UI de login para consumir o novo endpoint por padrão — mantido no caminho HMAC nesta janela (o novo endpoint é adicional).
- Qualquer alteração de credencial, segredo ou conta real; qualquer chamada de rede contra o Supabase de produção.

## Acceptance Criteria

1. **Sessão SSR em cookies httpOnly (D2)**
   **Given** NFR-04 e a decisão D2,
   **when** o novo login SSR é bem-sucedido,
   **then** a sessão do Supabase é mantida em cookies `httpOnly`/`secure` (em produção)/`SameSite=Lax`, e **nenhum** `access_token`/`refresh_token` é devolvido no corpo da resposta nem gravado em `localStorage`.

2. **AAL2 obrigatório quando há MFA ativo, fail-closed (D3 / SEC-104)**
   **Given** uma conta com fator MFA verificado,
   **when** o login SSR ocorre apenas com senha (sem challenge AAL2),
   **then** a sessão administrativa **não** é emitida (fail-closed) e a sessão de senha é encerrada; só após challenge/verify com `currentLevel === "aal2"` a sessão é emitida.

3. **Conta sem MFA segue AAL1**
   **Given** uma conta sem fator MFA verificado,
   **when** o login SSR ocorre,
   **then** a sessão é emitida em AAL1 (a política operacional mantém MFA ativo no admin — AC-17.02/REC-002).

4. **HMAC intacto (D5, anti-lockout)**
   **Given** o risco de lockout,
   **when** o File List é revisado,
   **then** `app/api/auth/session/route.ts`, `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts` e `src/lib/supabase/session-token.ts` **não** foram modificados — o caminho antigo continua funcionando integralmente.

5. **Nenhum toque em produção/credenciais reais**
   **Given** as restrições de segurança da story,
   **when** a implementação e os testes são executados,
   **then** nenhuma credencial/segredo/conta real é alterada e nenhum teste faz chamada de rede real contra o projeto remoto — os testes são 100% mockados.

6. **Verificação verde**
   **Given** o Definition of Done,
   **when** `npm run lint`, `npm run typecheck` e `npx vitest run` são executados,
   **then** todos passam sem regressão.

## Tasks / Subtasks

- [x] **Task 1 — Confirmar dependência e fluxo atual** (AC: 4, 5)
  - [x] `@supabase/ssr` já é dependência (`package.json` → `^0.10.3`); uso autorizado pelo ADR-016 (§Contexto de stack), não é invenção.
  - [x] Fluxo HMAC atual lido ponta a ponta (`auth.ts`, `auth-session.ts`, `session-token.ts`, `_shared/auth.ts`, `route.ts`, `app-store.tsx`, `server.ts`).

- [x] **Task 2 — Módulo `src/lib/supabase/session.ts`** (AC: 1, 2, 3)
  - [x] `createSupabaseSSRClient` (anon/publishable) + `buildSsrCookieOptions` (httpOnly/secure/SameSite=lax/path) — D2.
  - [x] `signInSSR` com AAL2 fail-closed: sem MFA → AAL1; com MFA sem código → `mfa_required` + `signOut`; com MFA + código válido e `aal2` → emite; falha de challenge/verify/nível → `mfa_failed` + `signOut` — D3.
  - [x] `readSSRSession` + `signOutSSR`.

- [x] **Task 3 — Rota aditiva `app/api/auth/ssr-session/route.ts`** (AC: 1, 4)
  - [x] POST/GET/DELETE via cookies SSR; rate limit reutilizado; nenhum token no corpo.
  - [x] Rota HMAC existente não tocada.

- [x] **Task 4 — Testes mockados** (AC: 2, 3, 5, 6)
  - [x] `src/__tests__/lib/supabase-ssr-session.test.ts`: 15 casos (contrato AAL2 fail-closed, autorização de papel, leitura de sessão, atributos de cookie, configuração). Cliente Supabase mockado; sem rede real.

- [x] **Task 5 — Verificação** (AC: 6)
  - [x] `npm run lint` → 0 erros. `npm run typecheck` → OK. `npx vitest run` → 621/621 (58 files).

## Dev Notes

### Decisão de design: rota nova aditiva vs. modificar o endpoint existente

O ADR permitia "um novo endpoint OU modificação cuidadosa do endpoint existente". Escolhi **rota nova e independente** (`app/api/auth/ssr-session/`) em vez de bifurcar o comportamento do POST de `app/api/auth/session/route.ts`.

**Justificativa (anti-lockout):** o endpoint HMAC é o caminho de login **em produção agora**. Qualquer bifurcação de comportamento dentro dele introduz risco de regressão no login real. Uma rota separada é **puramente aditiva**: o handler antigo permanece byte-a-byte inalterado, então a garantia de que "o caminho antigo continua funcionando" é trivialmente verdadeira e auditável no diff. Isso realiza a "coexistência" de D5 no nível mais seguro possível. A consolidação canônica (browser same-origin, contrato único) é escopo de REC-206.

### AAL2 fail-closed — como o "fail-closed" é garantido

Após `signInWithPassword`, o cliente SSR já tem uma sessão AAL1 nos cookies. Se há fator MFA ativo e o AAL2 não é completado, o módulo chama `client.auth.signOut()` — isso **limpa os cookies httpOnly** e garante que nenhum caminho deixe uma sessão administrativa aberta só com senha. O nível é confirmado por `getAuthenticatorAssuranceLevel().currentLevel === "aal2"`, não assumido a partir do sucesso do `verify`.

### D2 — tokens fora do alcance de scripts

A rota SSR não devolve `access_token`/`refresh_token` no corpo (diferente do HMAC atual, `route.ts:151-158`) e não usa `localStorage`. A sessão vive exclusivamente nos cookies `httpOnly` geridos pelo `@supabase/ssr`, fechando o vetor de exfiltração por XSS de NFR-04.

### Testabilidade

`signInSSR`/`readSSRSession` recebem o `SupabaseClient` por injeção, e o adaptador de cookies (`SsrCookieAdapter`) é desacoplado de `next/headers`. Isso permite testar o contrato AAL2 com um cliente mockado, sem rede. A rota fornece o adaptador concreto ligado ao `cookies()` do Next.

### Teste de integração real (Docker local) — honestidade sobre viabilidade

Não executei teste de integração contra o Supabase local (Docker/`supabase start`) nesta sessão: exigiria subir o stack Docker e provisionar uma conta de teste com fator TOTP verificado, o que não está garantido neste ambiente e foge da restrição de não tocar produção. O contrato AAL2 fail-closed e a emissão/atributos de cookie estão cobertos por testes mockados determinísticos. **Recomendação para `@qa`/REC-203:** validar o fluxo ponta a ponta contra o Docker local com uma conta de teste dedicada (nunca `admin@rhcursos.com.br` real) antes de tornar o SSR o caminho padrão da UI.

### Riscos e limitações

- **Não há rollout na UI:** o `app-store`/tela de login continuam no fluxo HMAC. REC-202 entrega o mecanismo SSR pronto e testado, mas a troca do caminho padrão do cliente é deliberadamente adiada (evita expor o login real a um caminho ainda não validado ponta a ponta contra Docker). Isso é intencional e seguro: nada muda para o usuário admin nesta story.
- **Autorização por papel a cada operação (D1/FR-07):** `readSSRSession` expõe o papel do usuário, mas a substituição da autorização HMAC pela consulta ao servidor a cada requisição é REC-203 — fora do escopo aqui.

### Project Structure Notes

- Não modificados: `.aiox-core/**` (L1/L2), migrations/endpoints de outras stories REC-* (REC-003 lockdown guards preservados — a rota SSR nova não interfere), fluxo HMAC.

## Dependências

- **Entrada:** REC-201 (ADR-016, Done); `@supabase/ssr` já instalado.
- **Bloqueia:** REC-203, REC-204.

## Roll-forward / Rollback

- **Forward-only:** a sessão SSR é aditiva. Como a rota antiga não muda, "rollback" da parte SSR é simplesmente não usá-la — o login HMAC segue operante. Rollback que restaure o HMAC como autoridade nunca foi necessário porque o HMAC nunca deixou de ser a autoridade nesta story (D5 é respeitado).

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-16 | 0.1 | **Draft.** Story criada a partir do ADR-016 (D2/D3/D5), Onda 3, primeiro passo de implementação de identidade. Escopo: sessão SSR + AAL2 fail-closed, coexistindo com o HMAC. | @dev (Dex) |
| 2026-07-16 | 1.0 | **Draft → Ready.** Auto-validação contra o checklist de 10 pontos: título claro; contexto/valor via ADR-016/SEC-104; ACs testáveis (Given/When/Then); escopo IN/OUT explícito com "deliberadamente NÃO feito"; dependências mapeadas (REC-201 entrada; bloqueia REC-203/204); estimativa M; valor (fecha SEC-104, destrava Onda 3); riscos documentados (lockout mitigado por rota aditiva). **`@po` retém a autoridade formal de GO no gate InReview.** | @dev (Dex) |
| 2026-07-16 | 1.1 | **Ready → InProgress.** Implementação: `src/lib/supabase/session.ts` (cliente SSR + AAL2 fail-closed), rota aditiva `app/api/auth/ssr-session/route.ts`, testes `src/__tests__/lib/supabase-ssr-session.test.ts`. HMAC intocado. | @dev (Dex) |
| 2026-07-16 | 1.2 | **InProgress → InReview.** Tasks 1–5 concluídas. `npm run lint` (0 erros), `npm run typecheck` (OK), `npx vitest run` (621/621, 58 files) verdes. AAL2 fail-closed coberto por 15 testes mockados; nenhuma chamada de rede real; nenhuma credencial/conta real alterada; fluxo HMAC preservado byte-a-byte. Relatório em `docs/history/reports/rec-202-sessao-ssr-2026-07-16.md`. Encaminhado a `@qa`. | @dev (Dex) |
| 2026-07-17 | 1.3 | **InReview → Done.** Gate PASS (94/100) emitido por `@qa`+`@architect` após revisão de alto rigor: `git status` confirma zero arquivo do fluxo HMAC tocado; `signInSSR` revisado linha a linha (todo ramo de falha chama `signOut` antes de retornar); `@supabase/ssr` confirmado como dependência já existente. Suíte 621/621 reexecutada. Notas `info` (PROC-104/105) sem bloqueio: teste de integração real contra Docker recomendado antes de REC-203 consumir esta sessão. | @qa (Quinn) + @architect (Aria) |

## File List

### Criado

- `docs/stories/2026-07-16-rec-202-sessao-supabase-ssr.md`
- `src/lib/supabase/session.ts`
- `app/api/auth/ssr-session/route.ts`
- `src/__tests__/lib/supabase-ssr-session.test.ts`
- `docs/history/reports/rec-202-sessao-ssr-2026-07-16.md`

### Referências somente leitura (não modificadas)

- `docs/architecture/adr-016-identidade-bff-rec201.md`
- `app/api/auth/session/route.ts` (HMAC — autoridade, intocado)
- `src/lib/auth.ts`, `src/lib/auth-session.ts`, `src/lib/supabase/session-token.ts`
- `supabase/functions/_shared/auth.ts`
- `src/lib/app-store.tsx`, `src/lib/supabase/server.ts`

## QA Results

### Gate: PASS ✅ — @qa (Quinn) + @architect (Aria), 2026-07-17

**Gate file:** [`docs/qa/gates/rec-202-sessao-supabase-ssr.yml`](../qa/gates/rec-202-sessao-supabase-ssr.yml) · **Quality score:** 94/100

Revisão de alto rigor, dado que esta story toca autenticação de produção. Verificação independente: `git status --short` sobre os 6 arquivos do fluxo HMAC confirma zero modificação. `signInSSR` revisado linha a linha: todos os ramos de falha (`unauthorized`, `mfa_required`, `mfa_failed`, `aal !== aal2`) chamam `client.auth.signOut()` antes de retornar — fail-closed sem exceção, sem caminho onde AAL1 abra sessão admin com MFA ativo. `@supabase/ssr` confirmado como dependência já presente no projeto (`^0.10.3`), nenhuma dependência nova. `npx vitest run` → `621 passed (621)`. `npm run lint`/`npm run typecheck` limpos.

**Veredito:** PASS. Risco de lockout eliminado por construção (rota aditiva, HMAC 100% intocado). Notas `info`: PROC-104 (recomenda teste de integração real contra Docker antes de REC-203 consumir esta sessão para autorização), PROC-105 (rota nova ainda inerte, intencional). Nenhuma ação bloqueante.

— Quinn, guardiã da qualidade 🛡️ + Aria, arquitetura 🏛️

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (executor)

### Debug Log / Verificação

- `npx vitest run src/__tests__/lib/supabase-ssr-session.test.ts` → 15/15 passed.
- `npm run typecheck` → `Types generated successfully`, `tsc --noEmit` sem erros.
- `npm run lint` → sem erros.
- `npx vitest run` (suíte completa) → **621 passed (621), 58 files**, 0 regressão.

### Completion Notes

- Estado do HMAC: **ainda é a autoridade**; a sessão SSR coexiste como caminho novo e aditivo (D5). Nada do HMAC foi removido/alterado.
- Deliberadamente deixado para REC-203: autorização por papel resolvida no servidor a cada operação. Para REC-204: remoção do HMAC/`localStorage`/header `x-rh-session`.
- Nenhum ponto exigiu parada por segurança: a rota aditiva evitou qualquer risco de lockout no login real. O teste de integração real (Docker) foi omitido por indisponibilidade do ambiente e documentado com honestidade acima.
