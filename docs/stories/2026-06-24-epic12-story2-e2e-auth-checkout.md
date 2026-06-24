# Story EP-12.2: Fluxos críticos E2E reais — login, logout e checkout

## Status
Approved

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

- [ ] Expandir a suíte Playwright de auth
- [ ] Adaptar o checkout para ambiente de integração reproduzível
- [ ] Cobrir cenários de sucesso e falha

## Dependencies

- `tests/route-auth.spec.ts`
- `tests/login-errors.spec.ts`
- `tests/checkout.e2e.spec.ts`
- `app/api/auth/session/route.ts`
- `supabase/functions/enrollments/index.ts`

## Testing

- `tests/route-auth.spec.ts`
- `tests/login-errors.spec.ts`
- `tests/checkout.e2e.spec.ts`

## File List

- `tests/route-auth.spec.ts`
- `tests/login-errors.spec.ts`
- `tests/checkout.e2e.spec.ts`
- `docs/stories/2026-06-24-epic12-story2-e2e-auth-checkout.md`

## Change Log

- 2026-06-24 — @po (Pax) — Story refinada para fechar os ACs mais visíveis de integração da EP-12.
