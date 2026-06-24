# Story EP-11.4: Testes de auth e security audit de autenticação

## Status
Ready for Review

## Executor Assignment

executor: "@dev"  
quality_gate: "@architect"  
quality_gate_tools:
- `npm run lint`
- `npm run typecheck`
- `npm test`
- auth security review

## Épica
EP-11 — Auth Enhancement  
Spec: `docs/epics/epic-11-auth-enhancement.md`

## Story

**As a** PO responsável por evidência de qualidade,  
**I want** uma suíte objetiva de testes e um audit dedicado de autenticação,  
**so that** a épica possa ser encerrada com prova concreta dos ACs de segurança.

## Contexto

Hoje há testes de erro e proteção de rota, mas faltam sucesso do login, rotação, logout global, matriz RBAC e uma evidência consolidada de security audit específica de auth.

## Acceptance Criteria

- [ ] **AC1** — Login bem-sucedido, persistência de sessão e logout são testados
- [ ] **AC2** — Expiração/rotação e matriz RBAC possuem evidência automatizada
- [ ] **AC3** — Route Handler e Edge Function de auth têm contract tests mínimos
- [ ] **AC4** — Audit de segurança dedicado documenta achados, riscos residuais e decisão PASS/WAIVED/FAIL
- [ ] **AC5** — A épica EP-11 fica fechável sem depender de inferência manual

## Scope

### In Scope
- Testes de auth
- Contract tests de auth
- Documento de audit

### Out of Scope
- Refatorações amplas fora da camada auth

## Tasks / Subtasks

- [x] Completar a matriz de testes de auth
- [x] Criar/atualizar contract tests dos endpoints de sessão
- [x] Produzir relatório de security audit

## Dependencies

- Stories EP-11.1, EP-11.2, EP-11.3
- `tests/route-auth.spec.ts`
- `tests/login-errors.spec.ts`

## Testing

- `tests/route-auth.spec.ts`
- `tests/login-errors.spec.ts`
- `src/__tests__/lib/auth.test.ts`
- `src/__tests__/lib/authorize.test.ts`

## File List

- `tests/route-auth.spec.ts`
- `tests/login-errors.spec.ts`
- `src/__tests__/lib/auth.test.ts`
- `src/__tests__/lib/authorize.test.ts`
- `docs/qa/auth-security-audit-2026-06-24.md`
- `docs/stories/2026-06-24-epic11-story4-auth-tests-security-audit.md`

## Change Log

- 2026-06-24 — @po (Pax) — Story refinada para transformar os ACs de segurança da EP-11 em evidência verificável.
- 2026-06-24 — @dev (Dex) — Adicionados contract tests HTTP para `GET/DELETE /api/auth/session`, fluxo de sucesso do login com persistência local e relatório inicial de auth security audit.

## Dev Agent Record

### Agent Model Used

- GPT-5 Codex

### Debug Log References

- `npx playwright test tests/route-auth.spec.ts tests/login-errors.spec.ts --project=functional`

### Completion Notes

- A suíte Playwright agora cobre rejeição fail-closed para sessão não-admin, rejeição explícita de cookie adulterado e contrato determinístico de logout `local-only`.
- O login ganhou evidência de sucesso controlado por contrato da rota interna, incluindo persistência do token HMAC no cliente e respeito ao parâmetro `next`.
- O relatório `docs/qa/auth-security-audit-2026-06-24.md` consolida os achados atuais e mantém a decisão `WAIVED` por risco residual de revogação imediata de JWT, ausência de paridade automatizada da Edge Function neste subescopo e prova positiva ainda indireta para a rotação HTTP.
