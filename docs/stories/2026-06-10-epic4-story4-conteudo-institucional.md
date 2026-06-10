# Story 4.4: Conteúdo Institucional

## Status
Ready for Review

## Épica
Épica 4 — Jornadas Públicas (`docs/epics/epic-4-jornadas-publicas.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

As páginas institucionais precisavam sair do formato apenas informativo e ganhar leitura mais confortável, taxonomia explícita e conexão visual com a jornada comercial já modernizada.

## Acceptance Criteria

- [x] AC1 — `/sobre` reforça leitura institucional com blocos editoriais consistentes com o restante do site.
- [x] AC2 — Artigos do blog expõem taxonomia, leitura guiada e CTA relacionado sem quebrar a consistência com cursos.
- [x] AC3 — Há cobertura de regressão para os elementos centrais de leitura institucional e taxonomia.
- [x] AC4 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC5 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-10-epic4-story4-conteudo-institucional.md`

### Modificados
- `src/views/public/About.tsx` — narrativa institucional mais confortável e processual
- `src/views/public/BlogPost.tsx` — tags, leitura guiada e taxonomia lateral
- `tests/public-journeys.spec.ts` — regressão do conteúdo institucional
- `tests/visual.baseline.spec.ts` — rotas dinâmicas e institucionais no baseline visual
- `tests/baseline/blog-artigo-desktop.png`
- `tests/baseline/blog-artigo-mobile.png`
- `tests/baseline/sobre-desktop.png`
- `tests/baseline/sobre-mobile.png`

## Change Log

- 2026-06-10 — @sm (River) — Story criada a partir da Épica 4.
- 2026-06-10 — @dev (Codex) — Conteúdo institucional refinado com taxonomia e leitura guiada, alinhado à linguagem dos cursos. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- O artigo do blog agora tem reforço de taxonomia sem inventar novos campos editoriais fora dos dados existentes.

## QA Results

_(a preencher pelo @qa)_
