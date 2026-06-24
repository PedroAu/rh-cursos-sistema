# Story EP-11.2: RBAC unificado no app e no Supabase

## Status
Ready for Review

## Executor Assignment

executor: "@dev"  
quality_gate: "@architect"  
quality_gate_tools:
- `npm run lint`
- `npm run typecheck`
- `npm test`
- targeted RBAC tests

## Épica
EP-11 — Auth Enhancement  
Spec: `docs/epics/epic-11-auth-enhancement.md`

## Story

**As a** responsável técnico pela autorização,  
**I want** alinhar os papéis `admin`, `instructor` e `student` entre app e Supabase,  
**so that** o sistema falhe fechado e não dependa de contratos implícitos.

## Contexto

O banco já possui helpers `is_instructor()` e `is_student()`, mas o app ainda trabalha praticamente só com `admin`. `authorize()` é preparatório e os portais de aluno/instrutor seguem fora da publicação.

## Acceptance Criteria

- [ ] **AC1** — Tipos de sessão/autorização suportam `admin`, `instructor` e `student` de forma explícita
- [ ] **AC2** — `authorize()` e equivalentes falham fechado para papéis não permitidos
- [ ] **AC3** — O app não expõe `/aluno` ou `/instrutor`; apenas fica pronto para autorização futura
- [ ] **AC4** — Contrato entre `app_metadata.role`, `profiles.role` e helpers SQL fica documentado
- [ ] **AC5** — Casos positivos e negativos de RBAC têm testes

## Scope

### In Scope
- Tipos de role
- Utilitários de autorização
- Contrato app ↔ banco
- Testes de matriz de papéis

### Out of Scope
- Construção dos portais aluno/instrutor
- Nova UI de permissões

## Tasks / Subtasks

- [x] Auditar os papéis existentes no app e no banco
- [x] Refatorar tipos e helpers para RBAC explícito
- [x] Garantir que rotas fora do escopo continuem indisponíveis
- [x] Cobrir a matriz de autorização em testes

## Dependencies

- `src/lib/auth.ts`
- `src/lib/authorize.ts`
- `src/lib/supabase/database.types.ts`
- `supabase/migrations/20260623144035_rbac_authorization_helpers.sql`
- `docs/stories/2026-06-04-publication-readiness-portal-scope.md`

## Testing

- `src/__tests__/lib/authorize.test.ts`
- testes adicionais de guards e tipos

## File List

- `app/api/auth/session/route.ts`
- `src/lib/auth.ts`
- `src/lib/authorize.ts`
- `src/lib/supabase/session-token.ts`
- `src/lib/supabase/database.types.ts`
- `src/types/index.ts`
- `src/__tests__/lib/auth.test.ts`
- `src/__tests__/lib/authorize.test.ts`
- `src/__tests__/lib/session-token.test.ts`
- `docs/stories/2026-06-24-epic11-story2-rbac-unificado.md`

## Change Log

- 2026-06-24 — @po (Pax) — Story refinada para separar RBAC do hardening de sessão e preservar o escopo publicado atual.
- 2026-06-24 — @dev (Dex) — Contrato de roles alinhado ao `profiles.role`, `authorize()` reforçado como fail-closed e login HTTP mantido admin-only para preservar o escopo publicado.

## Dev Agent Record

### Agent Model Used

- GPT-5 Codex

### Debug Log References

- `npx vitest run src/__tests__/lib/auth.test.ts src/__tests__/lib/session-token.test.ts src/__tests__/lib/authorize.test.ts src/__tests__/lib/app-store.test.ts`
- `npm run typecheck`
- `npm run lint`

### Completion Notes

- O app agora tipa explicitamente `admin`, `instructor` e `student` a partir de `profiles.role` do Supabase.
- `authorize()` continua falhando fechado para sessão ausente, role não permitida ou lista vazia.
- O login exposto em `/api/auth/session` permanece admin-only; isso preserva a publicação atual sem reativar `/aluno` ou `/instrutor`.
