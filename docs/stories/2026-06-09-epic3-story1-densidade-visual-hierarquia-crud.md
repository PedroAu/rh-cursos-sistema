# Story 3.1: Densidade Visual e Hierarquia do CRUD

## Status
Ready for Review

## Épica
Épica 3 — Admin Polish (`docs/epics/epic-3-admin-polish.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

O CRUD admin já funciona, mas ainda carecia de leitura operacional mais densa: resumo de estado, busca com contexto e modal com agrupamento visível entre dados principais, detalhamento e ação.

## Acceptance Criteria

- [x] AC1 — `data-table`, busca, empty state e modal do CRUD usam a base visual consolidada das Épicas 1 e 2.
- [x] AC2 — A tela deixa explícito o estado operacional da área: quantidade visível, modo de operação e ação principal.
- [x] AC3 — O modal agrupa campos por contexto e hierarquia, sem reescrever o CRUD existente.
- [x] AC4 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC5 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-09-epic3-story1-densidade-visual-hierarquia-crud.md`

### Modificados
- `src/views/admin/AdminResourcePage.tsx` — resumo operacional, agrupamento de campos e export CSV compatível com badges
- `src/components/admin/data-table.tsx` — cabeçalhos ordenáveis acessíveis e barra de seleção refinada
- `src/lib/admin-resource-configs.tsx` — badges de status/modalidade/pagamento para leitura mais rápida

## Change Log

- 2026-06-09 — @sm (River) — Story criada a partir da Épica 3.
- 2026-06-09 — @dev (Codex) — Implementação concluída com hierarquia visual do CRUD, agrupamento de modal e leitura operacional nas listas. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- A implementação evolui o CRUD existente e não reintroduz campos em JSON cru.
- O CSV continua funcional mesmo com colunas que agora renderizam badges JSX no grid.

## QA Results

_(a preencher pelo @qa)_
