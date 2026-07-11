# Story EP-12.2: Fluxos críticos E2E reais — login, logout e checkout

## Status
Done

> Validação PO concluída em 2026-06-25: **GO (9/10)**. QA gate realizado em 2026-06-30: **PASS**.
> Todos os ACs implementados e testados, gates de qualidade verdes, ready para merge.

## Executor Assignment

executor: "@dev"  
quality_gate: "@architect"  
quality_gate_tools:
- `npm run lint`
- `npm run typecheck`
- `npm test`
- targeted Playwright runs

## Épica
EP-12 — Integration Test Suite  
Spec: `docs/epics/epic-12-integration-test-suite.md`

## Story

**As a** responsável pela confiabilidade dos journeys críticos,  
**I want** validar login, logout e checkout contra o backend real,  
**so that** o sistema tenha prova ponta a ponta dos fluxos mais sensíveis.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: N/A por configuração do projeto
>
> `.aiox-core/core-config.yaml` não define `coderabbit_integration.enabled`.
> Aplicam-se revisão manual e os quality gates declarados nesta story.

## Contexto

Existem cenários de erro em login e validações de checkout, mas ainda falta prova de login bem-sucedido, persistência de sessão e inscrição fechando com backend real.

## Acceptance Criteria

- [ ] **AC1** — Login bem-sucedido cria sessão válida e libera `/admin`
- [ ] **AC2** — Logout encerra a sessão e volta a bloquear `/admin`
- [ ] **AC3** — Checkout/enrollment executa contra backend real ou ambiente de integração controlado, sem apenas interceptar a rede
- [ ] **AC4** — Falhas previsíveis de auth/checkout geram mensagens consistentes

## Scope

### In Scope
- Login E2E real
- Logout E2E real
- Checkout E2E com backend

### Out of Scope
- CRUD admin completo
- Testes de transação concorrente

## Tasks / Subtasks

- [x] Confirmar o harness da EP-12.1 e o ambiente isolado de integração (AC: 1, 2, 3, 4)
  - [x] Carregar somente variáveis de ambiente não versionadas.
  - [x] Criar/atualizar usuários de teste por helper server-side, sem expor chave privilegiada ao browser.
  - [x] Usar dados únicos por execução ou cleanup explícito para evitar colisão entre execuções.
- [x] Cobrir login real com credenciais de teste e persistência de sessão (AC: 1)
  - [x] Validar redirecionamento para o destino permitido.
  - [x] Validar que `/admin` fica acessível após autenticação admin válida.
- [x] Cobrir logout real e revogação do acesso administrativo (AC: 2)
  - [x] Encerrar a sessão pelo fluxo da UI.
  - [x] Confirmar remoção do estado local/cookie aplicável e novo bloqueio de `/admin`.
- [x] Cobrir checkout com persistência real no backend de integração (AC: 3)
  - [x] Não interceptar a chamada de sucesso.
  - [x] Confirmar resposta de criação e identificador de inscrição.
  - [x] Se o proxy local `app/api/enrollments/route.ts` for mantido, garantir que ele permaneça um adaptador fino para a RPC existente.
- [x] Cobrir falhas previsíveis sem tornar a suíte dependente de falhas externas (AC: 4)
  - [x] Manter cenários controlados para payload inválido, credenciais inválidas, indisponibilidade e rate limit.
  - [x] Verificar mensagens apresentadas ao usuário e ausência de navegação indevida.
- [x] Executar os gates e atualizar o Dev Agent Record/File List (AC: 1, 2, 3, 4)

## Dependencies

- Story EP-12.1 em estado utilizável como harness
- `tests/route-auth.spec.ts`
- `tests/login-errors.spec.ts`
- `tests/checkout.e2e.spec.ts`
- `tests/helpers/integration-env.ts`
- `app/api/auth/session/route.ts`
- `app/api/enrollments/route.ts`, se o proxy local for mantido
- `supabase/functions/enrollments/index.ts`
- `supabase/config.toml`

## Dev Notes

- O Playwright usa bundle de produção local por meio de
  `scripts/start-test-server.mjs`; o projeto funcional é `functional`.
- O caminho feliz de login/logout/checkout deve usar o backend configurado.
  Intercepts são aceitáveis apenas para erros determinísticos de UI.
- Variáveis esperadas pelo harness atual:
  `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ou `NEXT_PUBLIC_SUPABASE_ANON_KEY`),
  `SUPABASE_SERVICE_ROLE_KEY` e, quando não derivável,
  `NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL`.
- `SUPABASE_SERVICE_ROLE_KEY` só pode ser lida pelo processo Node de teste.
  Nunca deve ser enviada ao browser, registrada em output ou executada contra
  o projeto de produção.
- Os documentos canônicos para anotações/evidência são
  `docs/api/auth-session.md` e `docs/api/edge-functions.md`.
- O worktree já contém alterações relacionadas a esta story. A decisão GO
  valida a qualidade do draft; não certifica a implementação ainda não
  submetida aos gates.

## Testing

- Targeted:
  `npm run build && node scripts/run-playwright.mjs --project=functional tests/route-auth.spec.ts tests/login-errors.spec.ts tests/checkout.e2e.spec.ts`
- Quality gates:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`

## File List

- `app/api/enrollments/route.ts`
- `src/lib/app-store.tsx`
- `tests/checkout.e2e.spec.ts`
- `tests/login-errors.spec.ts`
- `tests/public-journeys.spec.ts`
- `tests/helpers/integration-env.ts`
- `docs/stories/2026-06-24-epic12-story2-e2e-auth-checkout.md`

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
- 2026-07-11 - `app/api/enrollments/route.ts`, `supabase/functions/enrollments/index.ts` e `supabase/functions/_shared/enrollment-errors.ts` passaram a traduzir erros conhecidos da RPC para mensagens operacionais de checkout, evitando o fallback genérico para falhas de turma/vagas/duplicidade.

### Completion Notes List

- Added a same-origin `/api/enrollments` integration adapter that validates payloads, rate-limits, and delegates creation to the existing Supabase RPC.
- Updated checkout to fail closed against the local integration adapter instead of allowing optimistic success when backend sync fails.
- Expanded login/logout E2E coverage to use a real Supabase admin test user and verify persisted session state plus `/admin` re-block after logout.
- Updated checkout/public journey tests to use unique data and cleanup, then verify backend persistence through the service-role test helper.

## Validação PO

### Resultado

- **Decisão:** GO
- **Implementation Readiness Score:** 9/10
- **Confiança:** Alta

### Evidências e ressalvas

- Executor e quality gate são válidos e distintos.
- ACs cobrem os journeys exigidos pela EP-12.
- Tasks agora possuem mapeamento explícito para todos os ACs.
- O fluxo de sucesso deve permanecer real; mocks/intercepts ficam limitados a
  falhas controladas.
- Credenciais privilegiadas exigem ambiente isolado e uso exclusivo no
  processo de teste.

## Change Log

- 2026-06-24 — @po (Pax) — Story refinada para fechar os ACs mais visíveis de integração da EP-12.
- 2026-06-25 — @po (Pax) — Validação GO 9/10; adicionados Task→AC, Dev Notes, segurança do harness, comandos de teste e File List planejada.
- 2026-06-25 — @dev (Dex) — Implementados fluxos E2E reais de login, logout e checkout; gates completos passaram.
