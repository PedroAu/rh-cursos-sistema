# Relatório REC-107 — Endurecer endpoints públicos (inscrição)

**Data:** 2026-07-16
**Story:** `docs/stories/2026-07-16-rec-107-endurecer-endpoints-publicos.md`
**Épica:** Épica 17 — Recuperação SEV-0 (Onda 2, última story)

## 1. Resumo executivo

O endpoint público de inscrição estava funcionalmente quebrado desde REC-101: `supabase/functions/enrollments/index.ts` chamava `registrar_inscricao_publica` via `anonClient()`, role que teve `execute` revogado por REC-101 (SEV-0/FND-02) e nunca restaurado por nenhuma story subsequente. Esta story restaura o acesso funcional e aplica um conjunto de endurecimentos pontuais no endpoint (Edge Function e rota Next.js equivalente), sem reabrir o vetor original de chamada direta via PostgREST.

## 2. Decisão de arquitetura: `adminClient()` em vez de `grant execute`

Duas opções foram avaliadas para restaurar o acesso:

| Opção | Resultado |
|---|---|
| A — `grant execute` a `anon`/`authenticated` | Reabriria a RPC como endpoint chamável diretamente via PostgREST, fora do controle de rate limit/origem/body-limit do endpoint. Reintroduz parcialmente o vetor de REC-101. |
| **B — `adminClient()`/`createSupabaseServerClient()` (service-role, server-only)** | **Escolhida.** Mesmo padrão já validado por REC-102 (gate PASS 96/100) para o dilema idêntico em `leads/index.ts`. Endpoint continua sendo o único caminho de escrita; PostgREST direto permanece fechado. |

**Achado que eliminou a necessidade de migration:** `service_role` já detinha `grant execute on all functions in schema public to service_role` desde `20260604164120_content_access_alignment.sql` — grant amplo, fora do escopo do `revoke` de REC-101 (que atingiu apenas `anon`/`authenticated`/`public`). Confirmado por teste `pgTAP` novo (`has_function_privilege('service_role', ..., 'execute')` → `true`, sem nenhuma alteração de grant nesta story).

## 3. Least privilege dentro do endpoint

O privilégio elevado (`adminClient()`/service-role) foi restrito exclusivamente à chamada `.rpc("registrar_inscricao_publica", ...)`. As duas leituras de `turma` (resolução de disponibilidade) permanecem no cliente público (`anonClient()` na Edge Function; `createSupabasePublicServerClient()` na rota Next.js), consistente com o padrão estabelecido por REC-104.

Achado adicional: a rota Next.js (`app/api/enrollments/route.ts`) já usava o cliente privilegiado (`createSupabaseServerClient()`) para tudo, incluindo as leituras de `turma` — funcionalmente não quebrada por REC-101 (por isso só a Edge Function estava de fato inoperante), mas inconsistente com a separação de responsabilidade documentada explicitamente em `src/lib/supabase/server.ts` desde REC-104. Corrigido nesta story: leituras de `turma` migradas para o cliente público também na rota Next.js.

## 4. Itens de endurecimento da Épica 17

| Item pedido pela Épica 17 | Situação após esta story |
|---|---|
| Schema estrito | Já existia (`enrollmentSchema.strict()`, tipos, `min`/`max` em todos os campos, regex em CPF/telefone/IDs). Confirmado sem regressão; nenhuma alteração necessária. |
| Body limit | **Adicionado.** Ausente até esta story. Limite de 8 KiB, validado por `Content-Length` (rejeição rápida) **e** pelo tamanho real do texto lido (`TextEncoder().encode(...).length`), cobrindo o caso de header ausente/incorreto (requisições chunked). HTTP 413. Aplicado em ambos os pontos de entrada. |
| Idempotência | **Analisada, não reinventada.** O índice único parcial `inscricao_aluno_turma_active_idx` (`on public.inscricao (aluno_id, turma_id) where status_inscricao not in ('Cancelada')`, existente desde o schema inicial) já é a barreira real de idempotência a nível de banco, mesmo sob concorrência real — a checagem `if exists`/P0004 dentro da RPC tem uma janela teórica de corrida, mas o índice único garante que nenhuma segunda inscrição ativa é persistida em nenhum caso. Hardening pontual aplicado: `enrollment-errors.ts` agora mapeia a violação bruta desse índice (`23505`) para a mesma mensagem amigável de P0004, para que a chamada perdedora de uma corrida real não receba um erro genérico sem contexto. |
| Rate limit por proxy confiável | Já correto (`checkRateLimit`/`rateLimitConfigs.enrollment`/`clientIp()`, que prioriza `x-forwarded-for`/`cf-connecting-ip`/`x-real-ip`). Confirmado sem alteração necessária. |
| CAPTCHA | **Gap documentado, não implementado.** Nenhuma infraestrutura (chave de site, biblioteca, variável de ambiente) existe no projeto para nenhum provedor (hCaptcha/reCAPTCHA/Turnstile). Implementar uma integração completa nesta story seria uma dependência externa nova não autorizada (Artigo IV — No Invention). O gap fica registrado como pendência conhecida, mitigado parcialmente por rate limit + validação de origem + body limit + idempotência nesta rodada. Candidato a story própria (REC-107b) se priorizado. |
| Status server-side | Já correto (REC-302): sucesso só é reportado após a RPC confirmar persistência (`error` nulo + recibo válido). Confirmado sem regressão, coberto por teste novo. |

## 5. Arquivos alterados

- `supabase/functions/enrollments/index.ts` — import de `adminClient`; body limit; RPC via `adminClient()`; leituras de `turma` mantidas em `anonClient()`.
- `app/api/enrollments/route.ts` — import de `createSupabasePublicServerClient`/`isSupabasePublicServerConfigured`; body limit; leituras de `turma` via cliente público; RPC via `createSupabaseServerClient()`.
- `supabase/functions/_shared/enrollment-errors.ts` — novo matcher: violação `23505` da constraint `inscricao_aluno_turma_active_idx` → mesma mensagem de P0004.
- `supabase/tests/database/rec-107-enrollment-endpoint-hardening.test.sql` (novo) — 4 asserções pgTAP.
- `src/__tests__/app/api/enrollments-route.test.ts` (novo) — 6 testes Vitest.
- `src/__tests__/lib/enrollment-errors.test.ts` — 1 asserção nova.

**Nenhuma migration criada** — achado da seção 2 tornou desnecessária.

## 6. Evidência de teste

### 6.1 `npm run test:db` (Docker, banco local)

```
Files=11, Tests=113
Result: PASS
```

Inclui os 10 arquivos pré-existentes (109 testes, sem regressão) mais `rec-107-enrollment-endpoint-hardening.test.sql` (4 asserções novas: `service_role` mantém `execute`; `anon`/`authenticated` continuam sem `execute` — REC-101 preservada; `anon` mantém `select` nas colunas de `turma` usadas pelo endpoint).

Ambos os scripts de concorrência real reexecutados sem regressão:
- `node scripts/test-db-concurrency.mjs` (EP12): PASS.
- `node scripts/test-db-rec105-concurrency.mjs` (REC-105): PASS — última vaga sob concorrência real produz 1 sucesso e 1 conflito coerente, sem overbooking.

### 6.2 `npm run lint`

Limpo, sem warnings novos.

### 6.3 `npm run typecheck`

`next typegen && tsc --noEmit` limpo. Uma correção de tipo foi necessária durante a implementação: o novo matcher de `enrollment-errors.ts` precisou de `code: undefined` explícito para satisfazer o tipo de união inferido pelo array `as const` com formas heterogêneas.

### 6.4 `npx vitest run`

```
Test Files  56 passed (56)
     Tests  601 passed (601)
```

Inclui os 6 testes novos de `enrollments-route.test.ts` (body limit, separação de cliente, status server-side, mapeamento de erro de concorrência, rate limit, schema estrito) e a asserção nova de `enrollment-errors.test.ts`, sem nenhuma regressão nos 594 testes pré-existentes.

## 7. Gaps e pendências conhecidas

- **CAPTCHA não implementado** (ver seção 4) — nenhuma infraestrutura existe no projeto; implementá-lo exigiria uma decisão de produto sobre provedor, mais uma story própria com escopo de integração externa.
- Nenhum outro gap identificado nesta story.

## 8. Segurança e privacidade

- Nenhum `grant execute` restaurado para `anon`/`authenticated` — REC-101 permanece integralmente em vigor (confirmado por teste `pgTAP` novo).
- `adminClient()`/`createSupabaseServerClient()` (service-role) usados exclusivamente na chamada da RPC, nunca exposto ao browser.
- Nenhum dado real de aluno em qualquer teste; testes de aplicação usam mocks, testes de banco usam `has_function_privilege`/`has_column_privilege` (sem dado sintético de aluno necessário).
- Nenhum segredo exposto neste relatório.
