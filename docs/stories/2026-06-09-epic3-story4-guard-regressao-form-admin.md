# Story 3.4: Guard de Regressão dos Componentes de Formulário

## Status
Done

## Épica
Épica 3 — Admin Polish (`docs/epics/epic-3-admin-polish.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

O PRD trava dois invariantes que não podem regredir: nenhum campo crítico volta para JSON cru e nenhuma relação importante volta a depender de ID manual quando já existe entidade relacionada.

## Acceptance Criteria

- [x] AC1 — Há teste cobrindo S1: campos críticos não são editados por JSON cru.
- [x] AC2 — Há teste cobrindo S2: relações importantes usam seleção estruturada, não ID manual.
- [x] AC3 — O guard roda dentro da suíte padrão do projeto.
- [x] AC4 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC5 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-09-epic3-story4-guard-regressao-form-admin.md`
- `tests/admin-polish.spec.ts` — guard de regressão estrutural do form system admin

### Modificados
- `src/lib/admin-resource-configs.tsx` — estrutura dos campos validada pelo spec

## Change Log

- 2026-06-09 — @sm (River) — Story criada a partir da Épica 3.
- 2026-06-09 — @dev (Codex) — Guard de regressão adicionado para garantir arrays/módulos/relacionamentos estruturados no admin. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- O spec mistura verificação estrutural direta do `buildResourceConfig` com validação dos resumos derivados usados pelo dashboard.

## QA Results

Pass — encerramento formal em 2026-06-24. Acceptance Criteria fechados, artefatos presentes e sem gap funcional identificado na auditoria atual.
