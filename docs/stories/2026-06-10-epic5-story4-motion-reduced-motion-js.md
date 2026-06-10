# Story 5.4: Motion com Reduced Motion no JS

## Status
Ready for Review

## Épica
Épica 5 — Busca, Loading, Motion & Imagens (`docs/epics/epic-5-busca-loading-motion-imagens.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

O projeto já tinha base CSS e provider do Framer Motion, mas ainda restavam animações JS explícitas em títulos, cards e passos da home. A story remove dependência de deslocamento essencial quando o sistema pede menos movimento.

## Acceptance Criteria

- [x] AC1 — `SectionTitle` respeita `prefers-reduced-motion` no próprio JS.
- [x] AC2 — `CourseCard` não depende de animação de entrada quando a preferência reduzida está ativa.
- [x] AC3 — Os cards da jornada na Home não disparam movimento essencial em reduced motion.
- [x] AC4 — Há teste cobrindo ausência de animação essencial sob reduced motion.
- [x] AC5 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC6 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-10-epic5-story4-motion-reduced-motion-js.md`

### Modificados
- `src/components/common/section-title.tsx` — fallback estático sob reduced motion
- `src/components/courses/course-card.tsx` — fallback estático sob reduced motion
- `src/views/public/Home.tsx` — jornada com animação condicional
- `tests/epic5-search-motion.spec.ts` — cobertura reduced motion

## Change Log

- 2026-06-10 — @sm (River) — Story criada a partir da Épica 5.
- 2026-06-10 — @dev (Codex) — Motion JS condicionado a `prefers-reduced-motion` nos pontos remanescentes do runtime. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- O provider global continua importante, mas a story fecha os componentes que ainda declaravam movimento de forma explícita.

## QA Results

_(a preencher pelo @qa)_
