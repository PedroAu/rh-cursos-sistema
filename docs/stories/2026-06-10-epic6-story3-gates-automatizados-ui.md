# Story 6.3: Gates Automatizados de UI

## Status
Done

## Épica
Épica 6 — Governança de Design (`docs/epics/epic-6-governanca-design.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

O baseline capturado na Épica 1 precisava virar gate real nesta fase. Esta story adiciona regressão visual por snapshots em regiões críticas e axe blocking nas rotas públicas mais sensíveis à modernização.

## Acceptance Criteria

- [x] AC1 — Rotas públicas críticas passam por axe como critério de aprovação, não só medição.
- [x] AC2 — Há snapshots visuais versionados de superfícies críticas e estáveis da UI.
- [x] AC3 — O gate roda dentro de `npm test`.
- [x] AC4 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC5 — File List e Change Log atualizados.

## File List

### Criados
- `tests/ui-governance.spec.ts`
- `tests/ui-governance.spec.ts-snapshots/home-hero-governance-functional-darwin.png`
- `tests/ui-governance.spec.ts-snapshots/courses-filters-governance-functional-darwin.png`
- `tests/ui-governance.spec.ts-snapshots/agenda-filters-governance-functional-darwin.png`
- `tests/ui-governance.spec.ts-snapshots/contact-form-governance-functional-darwin.png`
- `tests/ui-governance.spec.ts-snapshots/login-card-governance-functional-darwin.png`
- `docs/stories/2026-06-10-epic6-story3-gates-automatizados-ui.md`

### Modificados
- `docs/epics/epic-6-governanca-design.md`
- `src/views/public/Home.tsx`
- `src/views/public/Courses.tsx`
- `src/views/public/Agenda.tsx`
- `src/views/public/Contact.tsx`
- `src/views/public/Login.tsx`

## Change Log

- 2026-06-10 — @sm (River) — Story criada a partir da Épica 6.
- 2026-06-10 — @dev (Codex) — Suite de governança adicionada com axe blocking e snapshots regionais; âncoras de teste mínimas adicionadas às superfícies críticas. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes

- Os snapshots foram concentrados em regiões estáveis da UI para evitar diffs irrelevantes de páginas inteiras.

## QA Results

Pass — encerramento formal em 2026-06-24. Acceptance Criteria fechados, artefatos presentes e sem gap funcional identificado na auditoria atual.
