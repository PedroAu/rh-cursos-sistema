# Story 3.2: Contexto Read-only em Inscrições

## Status
Ready for Review

## Épica
Épica 3 — Admin Polish (`docs/epics/epic-3-admin-polish.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

O operador do admin precisava abrir uma inscrição e enxergar contexto suficiente para decidir sem navegar para outras telas. Antes, o modal mostrava apenas o `status`.

## Acceptance Criteria

- [x] AC1 — O modal de inscrições exibe aluno, curso, turma, data e status derivado em leitura direta.
- [x] AC2 — O contexto é somente leitura; a ação editável continua restrita ao status operacional.
- [x] AC3 — O operador consegue decidir sem sair da tela de inscrições.
- [x] AC4 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC5 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-09-epic3-story2-contexto-readonly-inscricoes.md`

### Modificados
- `src/lib/admin-resource-configs.tsx` — contexto derivado de inscrições e campos read-only
- `src/views/admin/AdminResourcePage.tsx` — renderização de cards read-only dentro do modal
- `tests/admin-polish.spec.ts` — valida o contexto derivado de inscrições no `buildResourceConfig`

## Change Log

- 2026-06-09 — @sm (River) — Story criada a partir da Épica 3.
- 2026-06-09 — @dev (Codex) — Implementação concluída com contexto read-only em inscrições e atualização supervisionada de status. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- O `status derivado` resume o momento operacional da inscrição com base no status atual e na janela temporal da turma.

## QA Results

_(a preencher pelo @qa)_
