# Story EP-12.3: Contract tests dos endpoints híbridos

## Status
Approved

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

## Contexto

Os docs manuais já descrevem bem a superfície HTTP, mas faltam testes automatizados diretos para `app/api/auth/session` e para as quatro Edge Functions atuais.

## Acceptance Criteria

- [ ] **AC1** — `app/api/auth/session` possui contract tests de POST e DELETE
- [ ] **AC2** — `enrollments`, `leads`, `admin-resources` e `auth-session` possuem contract tests mínimos
- [ ] **AC3** — Casos de `401/403/405/429` relevantes ficam cobertos
- [ ] **AC4** — Os testes referenciam a documentação canônica de API quando aplicável

## Scope

### In Scope
- Contract tests HTTP
- Respostas de erro
- Auth e rate limit

### Out of Scope
- Swagger UI
- Concorrência e transação profunda

## Tasks / Subtasks

- [ ] Definir harness de contract tests
- [ ] Cobrir o Route Handler do Next
- [ ] Cobrir as Edge Functions atuais
- [ ] Validar erros e headers críticos

## Dependencies

- `app/api/auth/session/route.ts`
- `supabase/functions/auth-session/index.ts`
- `supabase/functions/enrollments/index.ts`
- `supabase/functions/leads/index.ts`
- `supabase/functions/admin-resources/index.ts`
- `docs/api/README.md`

## Testing

- nova suíte de contract tests
- integração com `npm test`

## File List

- `app/api/auth/session/route.ts`
- `supabase/functions/auth-session/index.ts`
- `supabase/functions/enrollments/index.ts`
- `supabase/functions/leads/index.ts`
- `supabase/functions/admin-resources/index.ts`
- `tests/` (novos specs)
- `docs/stories/2026-06-24-epic12-story3-api-contract-tests.md`

## Change Log

- 2026-06-24 — @po (Pax) — Story refinada para tornar a superfície HTTP da plataforma verificável por contrato.
