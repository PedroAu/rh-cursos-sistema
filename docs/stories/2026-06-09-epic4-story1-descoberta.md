# Story 4.1: Jornada de Descoberta

## Status
Ready for Review

## Épica
Épica 4 — Jornadas Públicas (`docs/epics/epic-4-jornadas-publicas.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

A fundação visual e o form system já estão consolidados. A primeira jornada pública a evoluir é descoberta: home, catálogo, agenda e blog precisam ajudar o usuário a encontrar rapidamente trilha, turma e conteúdo relevante.

## Acceptance Criteria

- [x] AC1 — Home reforça a exploração inicial com caminhos claros para catálogo, agenda e conteúdo.
- [x] AC2 — Catálogo explicita resultado, filtros ativos e contexto de descoberta com mais densidade.
- [x] AC3 — Agenda resume disponibilidade de turmas além do resultado bruto.
- [x] AC4 — Blog mostra leitura de volume, categoria ativa e temas em destaque.
- [x] AC5 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC6 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-09-epic4-story1-descoberta.md`

### Modificados
- `src/views/public/Home.tsx` — atalhos de descoberta no hero
- `src/views/public/Courses.tsx` — contexto de resultado, filtros ativos e métricas de catálogo
- `src/views/public/Agenda.tsx` — métricas rápidas de disponibilidade
- `src/views/public/Blog.tsx` — resumo editorial com categoria ativa e temas em destaque
- `tests/baseline/home-baseline-desktop.png`
- `tests/baseline/home-baseline-mobile.png`
- `tests/baseline/cursos-baseline-desktop.png`
- `tests/baseline/cursos-baseline-mobile.png`
- `tests/baseline/agenda-baseline-desktop.png`
- `tests/baseline/agenda-baseline-mobile.png`
- `tests/baseline/blog-baseline-desktop.png`
- `tests/baseline/blog-baseline-mobile.png`

## Change Log

- 2026-06-09 — @sm (River) — Story criada a partir da Épica 4.
- 2026-06-09 — @dev (Codex) — Primeira jornada pública implementada nas rotas de descoberta com reforço de navegação, contexto de resultado e sumários editoriais. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- A story foi atacada sem refatoração dispersa: cada rota recebeu leitura de descoberta mais direta, preservando a base visual criada nas Épicas 1 e 2.

## QA Results

_(a preencher pelo @qa)_
