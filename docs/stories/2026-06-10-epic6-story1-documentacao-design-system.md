# Story 6.1: Documentação de Tokens e Componentes

## Status
Ready for Review

## Épica
Épica 6 — Governança de Design (`docs/epics/epic-6-governanca-design.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

As Épicas 1-5 consolidaram tokens, componentes compartilhados, padrões de formulário, busca, loading, motion e imagens. Sem documentação operacional, a base volta facilmente para estilos locais, variantes duplicadas e acessibilidade inconsistente.

## Acceptance Criteria

- [x] AC1 — Tokens semânticos e suas regras de uso ficam documentados em um guia único.
- [x] AC2 — Componentes compartilhados críticos (`Button`, `FormField`, `SearchInput`, `LoadingBlocks`, `Dialog`/`Sheet`) ficam referenciados com contrato de uso.
- [x] AC3 — O guia inclui exemplos de uso aprovado e usos a evitar.
- [x] AC4 — `npm run lint`, `npm run typecheck` e `npm test` verdes no fechamento da épica.
- [x] AC5 — File List e Change Log atualizados.

## File List

### Criados
- `docs/design/sistema-design-rh-cursos.md`
- `docs/stories/2026-06-10-epic6-story1-documentacao-design-system.md`

## Change Log

- 2026-06-10 — @sm (River) — Story criada a partir da Épica 6.
- 2026-06-10 — @dev (Codex) — Guia consolidado de design system criado com tokens, camadas, componentes e padrões aprovados/evitar. `npm run lint`, `npm run typecheck` e `npm test` verdes no fechamento da épica. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes

- A documentação foi escrita em cima dos contratos já existentes no código, sem criar novos componentes fora do escopo do PRD.

## QA Results

_(a preencher pelo @qa)_
