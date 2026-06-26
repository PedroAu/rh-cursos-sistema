# Story EP-11.2: RBAC unificado no app e no Supabase

## Status
Done

> ACs reconciliados com a evidência de implementação e com o quality gate verde de 2026-06-25. Story encerrada como `Done`.

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

- [x] **AC1** — Tipos de sessão/autorização suportam `admin`, `instructor` e `student` de forma explícita
- [x] **AC2** — `authorize()` e equivalentes falham fechado para papéis não permitidos
- [x] **AC3** — O app não expõe `/aluno` ou `/instrutor`; apenas fica pronto para autorização futura
- [x] **AC4** — Contrato entre `app_metadata.role`, `profiles.role` e helpers SQL fica documentado
- [x] **AC5** — Casos positivos e negativos de RBAC têm testes

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
- 2026-06-24 — Codex — ACs reconciliados com `npm run lint`, `npm run typecheck` e `npm test` verdes.

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

## QA Results

### Review Date: 2026-06-25

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

O RBAC explícito ficou consistente entre tipagem, autorização e escopo de publicação. A revisão atual confirma que a matriz de roles continua fail-closed e que o gate global do branch segue verde em 2026-06-25.

### Refactoring Performed

Nenhum. Revisão somente de evidência e gate.

### Compliance Check

- Coding Standards: ✓ Sem desvios detectados nesta revisão
- Project Structure: ✓ Contrato app ↔ banco documentado e sem expansão indevida de escopo
- Testing Strategy: ✓ Evidência atual validada com `118 passed` em `npm test`
- All ACs Met: ✓ AC1-AC5 confirmados por código e testes

### Improvements Checklist

- [x] Validado gate completo do branch em 2026-06-25
- [x] Confirmada semântica fail-closed para sessão ausente e role não permitida
- [x] Confirmado que portais `/aluno` e `/instrutor` seguem fora da publicação

### Security Review

Sem achado bloqueante nesta story. O comportamento admin-only exposto publicamente continua coerente com o escopo vigente.

### Performance Considerations

Sem impacto material de performance identificado na revisão.

### Files Modified During Review

- `docs/stories/2026-06-24-epic11-story2-rbac-unificado.md`
- `docs/qa/gates/epic11.2-rbac-unificado.yml`

### Gate Status

Gate: PASS → `docs/qa/gates/epic11.2-rbac-unificado.yml`

### Recommended Status

[✓ Ready for Done]

- 2026-06-25 — @devops (Gage/Codex) — Revisão final consumida; status promovido de `Ready for Review` para `Done`.
