# Story 3.1: Densidade Visual e Hierarquia do CRUD

## Status
Done

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
- `src/views/admin/AdminResourcePage.tsx` — shell CRUD refeito no padrão do novo wireframe, com KPIs, barra de ação, busca e modal reestruturados
- `src/components/admin/data-table.tsx` — grid administrativo refeito com paginação, ações visuais e barra de seleção no novo padrão
- `src/lib/admin-resource-configs.tsx` — badges de status/modalidade/pagamento para leitura mais rápida

## Change Log

- 2026-06-09 — @sm (River) — Story criada a partir da Épica 3.
- 2026-06-09 — @dev (Codex) — Implementação concluída com hierarquia visual do CRUD, agrupamento de modal e leitura operacional nas listas. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.
- 2026-06-12 — @dev (Codex) — Reescrita visual da camada CRUD administrativa para o design system novo, preservando lógica de dados e exportação. Status Ready for Review → Done.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- A camada visual do CRUD deixou de depender do layout anterior e passou a usar cards, KPIs, barras de ação e tabela no padrão do wireframe administrativo novo.
- O modal continua agrupando os campos por contexto sem alterar a lógica de validação e salvamento.
- O CSV continua funcional mesmo com colunas que renderizam badges JSX no grid.

## QA Results

_(a preencher pelo @qa)_
