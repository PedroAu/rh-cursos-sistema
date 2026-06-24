# Story EP-12.4: Testes transacionais de banco e RLS

## Status
Approved

## Executor Assignment

executor: "@data-engineer"  
quality_gate: "@dev"  
quality_gate_tools:
- `npm run lint`
- `npm run typecheck`
- `npm test`
- targeted DB/RLS tests

## Épica
EP-12 — Integration Test Suite  
Spec: `docs/epics/epic-12-integration-test-suite.md`

## Story

**As a** responsável pela integridade de dados,  
**I want** testes para duplicidade, concorrência, rollback e RLS,  
**so that** a camada de banco prove os casos críticos que a UI não consegue garantir sozinha.

## Contexto

Hoje não há evidência automatizada para concorrência de inscrição, rollback em falha parcial, nem role emulation de RLS, apesar de esses riscos já aparecerem em auditorias de banco.

## Acceptance Criteria

- [ ] **AC1** — Casos de inscrição duplicada/concorrente têm teste automatizado
- [ ] **AC2** — Falhas transacionais relevantes demonstram rollback correto
- [ ] **AC3** — Políticas RLS críticas têm role emulation mínima automatizada
- [ ] **AC4** — Achados relevantes ficam ligados à documentação/auditoria de banco

## Scope

### In Scope
- Testes de transação
- Role emulation/RLS
- Integração com RPCs/operations críticas

### Out of Scope
- Otimização de performance ampla
- Novos índices ou redesign de schema

## Tasks / Subtasks

- [ ] Selecionar cenários transacionais críticos
- [ ] Definir abordagem de role emulation
- [ ] Implementar os testes
- [ ] Referenciar os resultados nas auditorias

## Dependencies

- `docs/database/DB-AUDIT.md`
- `supabase/migrations/20260609100000_global_rate_limit.sql`
- `supabase/migrations/20260623144035_rbac_authorization_helpers.sql`
- `supabase/functions/enrollments/index.ts`
- `supabase/functions/admin-resources/index.ts`

## Testing

- suíte dedicada de integração DB/RLS
- smoke no pipeline principal

## File List

- `supabase/migrations/20260609100000_global_rate_limit.sql`
- `supabase/migrations/20260623144035_rbac_authorization_helpers.sql`
- `supabase/functions/enrollments/index.ts`
- `supabase/functions/admin-resources/index.ts`
- `tests/` ou pasta dedicada de integração
- `docs/stories/2026-06-24-epic12-story4-db-transactions-rls.md`

## Change Log

- 2026-06-24 — @po (Pax) — Story refinada para fechar a lacuna mais fraca da evidência atual: transações e RLS reais.
