# Story 6.2: Checklist Visual e A11y no Review

## Status
Ready for Review

## Épica
Épica 6 — Governança de Design (`docs/epics/epic-6-governanca-design.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

Governança só funciona se a revisão cotidiana tiver um contrato simples e versionado. Esta story transforma os critérios da modernização em checklist operacional para qualquer mudança de UI.

## Acceptance Criteria

- [x] AC1 — Existe checklist versionado cobrindo tokens, tipografia, contraste, labels, teclado, reduced motion, loading e imagens.
- [x] AC2 — O checklist referencia explicitamente os gates obrigatórios (`lint`, `typecheck`, `test` e revisão visual).
- [x] AC3 — A épica passa a apontar para o checklist como parte do fluxo de review.
- [x] AC4 — `npm run lint`, `npm run typecheck` e `npm test` verdes no fechamento da épica.
- [x] AC5 — File List e Change Log atualizados.

## File List

### Criados
- `docs/checklists/ui-a11y-review.md`
- `docs/stories/2026-06-10-epic6-story2-checklist-review-ui-a11y.md`

### Modificados
- `docs/epics/epic-6-governanca-design.md`

## Change Log

- 2026-06-10 — @sm (River) — Story criada a partir da Épica 6.
- 2026-06-10 — @dev (Codex) — Checklist de review UI/a11y versionado e vinculado à épica. `npm run lint`, `npm run typecheck` e `npm test` verdes no fechamento da épica. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes

- O checklist foi mantido curto e operacional para caber no fluxo real de story review.

## QA Results

_(a preencher pelo @qa)_
