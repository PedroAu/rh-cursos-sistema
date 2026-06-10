# Story 2.5: Dialog e Sheet Padronizados

## Status
Ready for Review

## Épica
Épica 2 — Form System & Acessibilidade Compartilhada (`docs/epics/epic-2-form-system-a11y.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

`Dialog` e `Sheet` já usam Radix, mas faltam convenções compartilhadas para descrição, foco inicial e cabeçalhos reaproveitáveis. Isso afeta checkout, command palette, atendimento e navegação móvel.

## Acceptance Criteria

- [x] AC1 — Padronizar `Dialog`/`Sheet` com suporte compartilhado a descrição e foco inicial.
- [x] AC2 — Consumidores críticos desta épica usam cabeçalho/título/descrição claros.
- [x] AC3 — O comportamento de teclado e fechamento não regride.
- [x] AC4 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC5 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-09-epic2-story5-dialog-sheet-padronizados.md`

### Modificados
- `src/components/ui/dialog.tsx` — suporte compartilhado a `DialogFooter` e `initialFocusRef`
- `src/components/ui/sheet.tsx` — `SheetHeader`, `SheetTitle`, `SheetDescription` e `initialFocusRef`
- `src/components/common/command-palette.tsx` — descrição explícita do diálogo
- `src/features/public-shell/components/public-mobile-navigation.tsx` — sheet com título/descrição semânticos
- `src/features/public-shell/components/whatsapp-support.tsx` — diálogo com descrição explícita
- `src/components/checkout/checkout-modal.tsx` — descrição e footer padronizados
- `src/views/admin/AdminResourcePage.tsx` — footer do dialog alinhado à base compartilhada

## Change Log

- 2026-06-09 — @sm (River) — Story criada a partir da Épica 2.
- 2026-06-09 — @dev (Codex) — Implementação concluída: `Dialog` e `Sheet` ganharam convenções compartilhadas de descrição/foco/footer e os consumidores críticos foram alinhados. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- A padronização foi feita sem trocar Radix nem reescrever fluxos; a épica evolui a base existente e deixa os consumidores mais previsíveis.

## QA Results

_(a preencher pelo @qa)_
