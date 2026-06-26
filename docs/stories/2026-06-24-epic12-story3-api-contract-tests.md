# Story EP-12.3: Contract tests dos endpoints híbridos

## Status
Done

> Validação PO concluída em 2026-06-25: **GO (9/10)**. A story foi refinada
> com matriz mínima de contratos, ambiente exigido, rastreabilidade Task→AC e
> comandos reproduzíveis.
> Verificação final repetida em 2026-06-26: implementação presente, `lint`,
> `typecheck` e suíte direcionada de contratos verdes. Status atualizado para
> `Done`.

## Executor Assignment

executor: "@dev"  
quality_gate: "@architect"  
quality_gate_tools:
- `npm run lint`
- `npm run typecheck`
- `npm test`
- contract test suite

## Épica
EP-12 — Integration Test Suite  
Spec: `docs/epics/epic-12-integration-test-suite.md`

## Story

**As a** mantenedor da API,  
**I want** testes explícitos de contrato para os endpoints Next e Supabase,  
**so that** payloads, códigos, auth e erros não quebrem silenciosamente.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: N/A por configuração do projeto
>
> `.aiox-core/core-config.yaml` não define `coderabbit_integration.enabled`.
> Aplicam-se revisão manual e os quality gates declarados nesta story.

## Contexto

Os docs manuais já descrevem bem a superfície HTTP, mas faltam testes automatizados diretos para `app/api/auth/session` e para as quatro Edge Functions atuais.

## Acceptance Criteria

- [x] **AC1** — `app/api/auth/session` possui contract tests de POST e DELETE
- [x] **AC2** — `enrollments`, `leads`, `admin-resources` e `auth-session` possuem contract tests mínimos
- [x] **AC3** — Casos de `401/403/405/429` relevantes ficam cobertos
- [x] **AC4** — Os testes referenciam a documentação canônica de API quando aplicável

## Scope

### In Scope
- Contract tests HTTP
- Respostas de erro
- Auth e rate limit

### Out of Scope
- Swagger UI
- Concorrência e transação profunda

## Tasks / Subtasks

- [x] Consolidar o harness de contratos sobre o ambiente de integração (AC: 1, 2, 3, 4)
  - [x] Reutilizar `tests/helpers/integration-env.ts`.
  - [x] Usar IPs/dados únicos para evitar colisão de rate limit e estado.
  - [x] Anotar os testes com o documento canônico correspondente.
- [x] Cobrir `app/api/auth/session` (AC: 1, 3, 4)
  - [x] POST: payload inválido, credenciais inválidas, role não autorizada e rate limit.
  - [x] DELETE: contrato de encerramento local e headers/cookie aplicáveis.
  - [x] Preservar a cobertura GET existente para sessão ausente, inválida e não-admin.
- [x] Cobrir as quatro Edge Functions atuais (AC: 2, 3, 4)
  - [x] `auth-session`: método, origem, payload/auth e erros relevantes.
  - [x] `enrollments`: payload, origem, método e rate limit quando determinístico.
  - [x] `leads`: campos obrigatórios, origem, método e rate limit quando determinístico.
  - [x] `admin-resources`: ausência de auth, role/autorização, método e mutação inválida.
- [x] Verificar códigos, payloads e headers críticos contra a documentação canônica (AC: 3, 4)
  - [x] Não duplicar no teste uma especificação divergente de `docs/api/openapi.yaml`.
  - [x] Falhar de forma explícita quando o ambiente de integração estiver incompleto.
- [x] Executar os gates e atualizar o Dev Agent Record/File List (AC: 1, 2, 3, 4)

## Dependencies

- Story EP-12.1 em estado utilizável como harness
- `app/api/auth/session/route.ts`
- `supabase/functions/auth-session/index.ts`
- `supabase/functions/enrollments/index.ts`
- `supabase/functions/leads/index.ts`
- `supabase/functions/admin-resources/index.ts`
- `docs/api/README.md`
- `docs/api/auth-session.md`
- `docs/api/edge-functions.md`
- `docs/api/openapi.yaml`
- `tests/helpers/integration-env.ts`

## Dev Notes

- A superfície canônica atual contém um Route Handler Next e quatro Edge
  Functions; não ampliar a story para SDK ou Swagger UI.
- O harness exige URL Supabase, publishable key, service role key e URL base
  das functions. A chave privilegiada fica restrita ao processo Node de teste.
- Testes de auth devem criar/atualizar usuários isolados com
  `app_metadata.role`; `user_metadata` não pode ser fonte de autorização.
- Os códigos `401/403/405/429` devem ser cobertos apenas onde o handler atual
  realmente os declara. Não inventar respostas ausentes no código/spec.
- O worktree já contém `tests/api-contract.spec.ts` não rastreado. A decisão
  GO valida o draft; a implementação ainda precisa passar pelos gates e ser
  reconciliada com a File List.

## Testing

- Targeted:
  `npm run build && node scripts/run-playwright.mjs --project=functional tests/api-contract.spec.ts tests/route-auth.spec.ts`
- Quality gates:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`

## File List

- `tests/api-contract.spec.ts`
- `tests/route-auth.spec.ts`
- `tests/helpers/integration-env.ts`
- `tests/checkout.e2e.spec.ts`
- `tests/public-journeys.spec.ts`
- `docs/stories/2026-06-24-epic12-story3-api-contract-tests.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm run lint` — passed
- `npm run typecheck` — passed
- `npm run build` — passed
- `node scripts/run-playwright.mjs tests/api-contract.spec.ts tests/checkout.e2e.spec.ts tests/login-errors.spec.ts --project=functional` — 17 passed
- `node scripts/run-playwright.mjs tests/public-journeys.spec.ts tests/api-contract.spec.ts tests/checkout.e2e.spec.ts tests/login-errors.spec.ts --project=functional` — 21 passed
- `npm test` — 124 passed
- 2026-06-26 — `npm run lint` — passed
- 2026-06-26 — `npm run typecheck` — passed
- 2026-06-26 — `node scripts/run-playwright.mjs --project=functional tests/api-contract.spec.ts tests/route-auth.spec.ts` — 26 passed
- 2026-06-26 — `node scripts/run-playwright.mjs --project=functional tests/checkout.e2e.spec.ts tests/public-journeys.spec.ts tests/api-contract.spec.ts tests/route-auth.spec.ts` — 35 passed
- 2026-06-26 — `npm test` — 124 passed

### Completion Notes List

- Added Playwright contract coverage for `app/api/auth/session` POST/DELETE, including invalid payload, invalid credentials, unauthorized role and rate limit.
- Added direct HTTP contract coverage for Supabase Edge Functions `auth-session`, `enrollments`, `leads` and `admin-resources`.
- Centralized integration environment, service-role client, test user provisioning, canonical API doc annotations and cleanup helpers in `tests/helpers/integration-env.ts`.
- Kept remote Edge Function rate-limit assertions limited to deterministic local/Next coverage because upstream gateway headers do not reliably preserve synthetic client IP.
- Hardened checkout E2E setup to resolve an active course with an available class via the integration database instead of using the first agenda card, which can point to an `Encerrada` class as real data changes.

## Validação PO

### Resultado

- **Decisão:** GO
- **Implementation Readiness Score:** 9/10
- **Confiança:** Alta

### Evidências e ressalvas

- Executor e quality gate são válidos e distintos.
- A matriz de endpoints deriva do catálogo e da spec OpenAPI existentes.
- Todos os ACs possuem tasks e comandos verificáveis.
- A suíte deve falhar quando faltar ambiente; não deve degradar
  silenciosamente para mocks no caminho feliz.

## Change Log

- 2026-06-24 — @po (Pax) — Story refinada para tornar a superfície HTTP da plataforma verificável por contrato.
- 2026-06-25 — @po (Pax) — Validação GO 9/10; definida matriz mínima de contratos, segurança do harness, Task→AC e comandos targeted.
- 2026-06-25 — @dev (Dex) — Implementados contract tests HTTP dos endpoints híbridos; gates completos passaram.
- 2026-06-26 — @dev (Dex) — EP-12.3 verificada novamente; ACs reconciliados, checkout E2E estabilizado contra dados reais, suíte completa verde e status atualizado para `Done`.
