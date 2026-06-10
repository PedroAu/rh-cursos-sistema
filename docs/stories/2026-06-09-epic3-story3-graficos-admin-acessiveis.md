# Story 3.3: Gráficos Admin Acessíveis

## Status
Ready for Review

## Épica
Épica 3 — Admin Polish (`docs/epics/epic-3-admin-polish.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

O dashboard admin mostrava dados úteis, mas parte da leitura dependia de cor e tooltip. A story fecha isso com descrição textual, labels numéricos e resumo complementar.

## Acceptance Criteria

- [x] AC1 — Cada gráfico exibe descrição textual do que está sendo mostrado.
- [x] AC2 — Os dados deixam de depender apenas de cor para interpretação.
- [x] AC3 — O dashboard oferece resumo textual acessível dos valores principais.
- [x] AC4 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC5 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-09-epic3-story3-graficos-admin-acessiveis.md`

### Modificados
- `src/features/admin/dashboard/admin-dashboard-page.tsx` — labels visíveis, descrição e resumo textual dos gráficos
- `src/components/admin/chart-card.tsx` — descrição e área de resumo compartilhada
- `src/components/dashboard/dashboard-card.tsx` — hierarquia tipográfica ajustada
- `src/features/admin/dashboard/model/dashboard-metrics.ts` — helpers compartilhados de resumo textual dos gráficos
- `tests/admin-polish.spec.ts` — valida os resumos textuais derivados do dashboard

## Change Log

- 2026-06-09 — @sm (River) — Story criada a partir da Épica 3.
- 2026-06-09 — @dev (Codex) — Implementação concluída com labels, descrições e resumo textual no dashboard. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- O gráfico de modalidades passou a usar barras horizontais rotuladas, removendo a dependência anterior de diferenciação por cor em pizza.

## QA Results

_(a preencher pelo @qa)_
