# Story 5.3: Loading e Submissão Padronizados

## Status
Ready for Review

## Épica
Épica 5 — Busca, Loading, Motion & Imagens (`docs/epics/epic-5-busca-loading-motion-imagens.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

Os fluxos públicos já tinham alguns estados de carregamento e botões com loading, mas ainda faltava padronizar a leitura de skeleton e fechar lacunas como newsletter e filtros do blog/agenda/catálogo.

## Acceptance Criteria

- [x] AC1 — Skeletons usam mensagem de carregamento consistente.
- [x] AC2 — Busca em catálogo, agenda e blog expõe loading de forma padronizada.
- [x] AC3 — Submissão de newsletter mostra estado de botão carregando, alinhado aos demais formulários públicos.
- [x] AC4 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC5 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-10-epic5-story3-loading-submissao-padronizados.md`

### Modificados
- `src/components/common/loading-blocks.tsx` — summary acessível e padronizado
- `src/views/public/Courses.tsx` — summary de loading do catálogo
- `src/views/public/Agenda.tsx` — summary de loading da agenda
- `src/views/public/Blog.tsx` — loading padronizado + newsletter com botão carregando
- `src/components/agenda/calendar-view.tsx` — summary de loading e superfície atualizada

## Change Log

- 2026-06-10 — @sm (River) — Story criada a partir da Épica 5.
- 2026-06-10 — @dev (Codex) — Estados de loading e submissão alinhados entre os principais fluxos alterados. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- A mudança prioriza leitura de estado, não efeitos visuais adicionais sem progresso real.

## QA Results

_(a preencher pelo @qa)_
