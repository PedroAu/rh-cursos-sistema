# Story 2.3: Estados Padronizados de `Button`

## Status
Done

## Épica
Épica 2 — Form System & Acessibilidade Compartilhada (`docs/epics/epic-2-form-system-a11y.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

`Button` já atende alvo tocável e foco, mas ainda não oferece um estado compartilhado de loading/busy para fluxos críticos. Isso espalha comportamento manual em login, checkout e CRUD.

## Acceptance Criteria

- [x] AC1 — Padronizar `loading`, `disabled`, `focus` e `pressed` no componente `Button`.
- [x] AC2 — O estado `loading` deve desabilitar ação duplicada e expor semântica (`aria-busy`) consistente.
- [x] AC3 — Fluxos críticos desta épica passam a consumir o estado compartilhado.
- [x] AC4 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC5 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-09-epic2-story3-estados-button.md`

### Modificados
- `src/components/ui/button.tsx` — estado `loading`, `aria-busy` e proteção contra acionamento duplo
- `src/views/public/Contact.tsx` — ações críticas migradas para o estado compartilhado
- `src/views/public/InCompany.tsx` — ações críticas migradas para o estado compartilhado
- `src/views/public/Login.tsx` — ações críticas migradas para o estado compartilhado
- `src/components/checkout/checkout-modal.tsx` — ações críticas migradas para o estado compartilhado
- `src/views/admin/AdminResourcePage.tsx` — ações críticas migradas para o estado compartilhado

## Change Log

- 2026-06-09 — @sm (River) — Story criada a partir da Épica 2.
- 2026-06-09 — @dev (Codex) — Implementação concluída: `Button` ganhou estado de loading compartilhado e os fluxos críticos passaram a consumi-lo. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- O ajuste precisou respeitar `asChild`: o spinner só é renderizado no caminho de botão real para não quebrar o `Slot` do Radix.

## QA Results

Pass — encerramento formal em 2026-06-24. Story permanece coerente com o runtime atual após ajuste documental da file list.
