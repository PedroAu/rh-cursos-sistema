# Story 5.5: Migração de Imagens para next/image

## Status
Ready for Review

## Épica
Épica 5 — Busca, Loading, Motion & Imagens (`docs/epics/epic-5-busca-loading-motion-imagens.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

O artefato da épica previa migração de 7 `<img>`, mas a base atual já estava majoritariamente em `next/image`. A story virou verificação factual + guard de regressão, além do ajuste de prioridade para ficar restrita ao hero.

## Acceptance Criteria

- [x] AC1 — Não há `<img>` cru no runtime TS/TSX do projeto.
- [x] AC2 — `priority` não fica em imagem de navegação; apenas no hero aplicável.
- [x] AC3 — Não restam usos de `apple-material`/`apple-surface` em conteúdo runtime fora do escopo funcional.
- [x] AC4 — Há guard automatizado para impedir regressão.
- [x] AC5 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC6 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-10-epic5-story5-migracao-imagens-next-image.md`

### Modificados
- `src/features/public-shell/components/public-header.tsx` — remoção de `priority` do logo
- `src/views/public/InCompany.tsx` — `priority` aplicada ao hero
- `src/components/agenda/calendar-view.tsx` — remoção de `apple-surface` no conteúdo
- `tests/epic5-search-motion.spec.ts` — guard de código-fonte para `next/image` e material funcional

## Change Log

- 2026-06-10 — @sm (River) — Story criada a partir da Épica 5.
- 2026-06-10 — @dev (Codex) — Estado real de imagens verificado, guard de regressão adicionado e prioridades ajustadas ao uso em hero. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- Em vez de reimplementar migração inexistente, a story formaliza o estado verificado e previne retorno de `<img>` cru.

## QA Results

_(a preencher pelo @qa)_
