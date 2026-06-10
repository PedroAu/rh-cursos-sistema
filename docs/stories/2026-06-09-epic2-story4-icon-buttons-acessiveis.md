# Story 2.4: Icon Buttons Acessíveis no Admin

## Status
Ready for Review

## Épica
Épica 2 — Form System & Acessibilidade Compartilhada (`docs/epics/epic-2-form-system-a11y.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

Os botões só-ícone do admin ainda dependem de contexto visual para editar/excluir e precisam de nome acessível explícito. A base de 44px já existe no `Button`, mas falta fechar a semântica.

## Acceptance Criteria

- [x] AC1 — Todos os icon buttons da tabela admin têm nome acessível explícito.
- [x] AC2 — Os controles mantêm alvo tocável mínimo da base compartilhada.
- [x] AC3 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC4 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-09-epic2-story4-icon-buttons-acessiveis.md`

### Modificados
- `src/components/admin/data-table.tsx` — botões de editar/excluir com `aria-label` e `title` explícitos

## Change Log

- 2026-06-09 — @sm (River) — Story criada a partir da Épica 2.
- 2026-06-09 — @dev (Codex) — Implementação concluída: icon buttons do CRUD admin receberam nomes acessíveis explícitos sem alterar o alvo tocável. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- A base de 44px já existia no `Button`; a story fechou o débito semântico restante nos controles só-ícone.

## QA Results

_(a preencher pelo @qa)_
