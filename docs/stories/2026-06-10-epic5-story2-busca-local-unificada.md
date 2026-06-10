# Story 5.2: Busca Local Unificada

## Status
Ready for Review

## Épica
Épica 5 — Busca, Loading, Motion & Imagens (`docs/epics/epic-5-busca-loading-motion-imagens.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

Catálogo, agenda, blog e admin já tinham busca, mas com comportamentos e densidade diferentes. A story unifica limpar, resumo de resultados, placeholders orientados e anúncio acessível do estado filtrado.

## Acceptance Criteria

- [x] AC1 — Cursos, Agenda, Blog e Admin usam busca com limpar e resumo textual do resultado.
- [x] AC2 — Agenda passa a refletir filtros relevantes também na URL, alinhando comportamento com catálogo e blog.
- [x] AC3 — Empty state e feedback de busca permanecem consistentes entre as áreas.
- [x] AC4 — Há teste cobrindo a unificação das buscas locais.
- [x] AC5 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC6 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-10-epic5-story2-busca-local-unificada.md`

### Modificados
- `src/components/common/search-input.tsx` — comportamento base reutilizável para limpar/loading/resumo
- `src/views/public/Courses.tsx` — busca local com limpar, resumo e loading
- `src/views/public/Agenda.tsx` — busca/filtros sincronizados e resumo acessível
- `src/views/public/Blog.tsx` — busca local com limpar, resumo e loading
- `src/views/admin/AdminResourcePage.tsx` — busca operacional com limpar e resumo
- `tests/epic5-search-motion.spec.ts` — cobertura das buscas locais

## Change Log

- 2026-06-10 — @sm (River) — Story criada a partir da Épica 5.
- 2026-06-10 — @dev (Codex) — Comportamento de busca consolidado entre público e admin sem recriar fluxos já existentes. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- A agenda ganhou URL state para não ficar atrás do catálogo/blog em previsibilidade de filtro.

## QA Results

_(a preencher pelo @qa)_
