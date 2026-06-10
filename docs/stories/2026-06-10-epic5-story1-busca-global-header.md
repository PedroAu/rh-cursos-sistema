# Story 5.1: Busca Global do Header Conectada

## Status
Ready for Review

## Épica
Épica 5 — Busca, Loading, Motion & Imagens (`docs/epics/epic-5-busca-loading-motion-imagens.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

O PRD trava a decisão D5: a busca do header não pode continuar como elemento visual sem ação. Nesta story, a busca global passa a abrir o catálogo com o termo aplicado e com feedback textual de operação real.

## Acceptance Criteria

- [x] AC1 — O header envia o usuário para `/cursos?q=termo` quando a busca é submetida.
- [x] AC2 — O campo do header informa que a ação abrirá o catálogo com o termo aplicado.
- [x] AC3 — O header preserva a camada funcional translúcida sem voltar material promocional.
- [x] AC4 — Há teste cobrindo o fluxo de busca global.
- [x] AC5 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC6 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-10-epic5-story1-busca-global-header.md`

### Modificados
- `src/features/public-shell/components/public-header.tsx` — busca global conectada ao catálogo e remoção de `priority` do logo
- `src/components/common/search-input.tsx` — suporte a limpar, loading e resumo acessível
- `src/lib/router-compat.tsx` — setter de query params estabilizado
- `tests/epic5-search-motion.spec.ts` — cobertura da busca global

## Change Log

- 2026-06-10 — @sm (River) — Story criada a partir da Épica 5.
- 2026-06-10 — @dev (Codex) — Busca global conectada ao catálogo com feedback textual e guard de regressão. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- A ação global agora é real, sem introduzir uma nova página ou fluxo fora do PRD.

## QA Results

_(a preencher pelo @qa)_
