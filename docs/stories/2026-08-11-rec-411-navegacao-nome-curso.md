# Story: Tornar o nome do curso navegável no catálogo público

## Status
Done

## Executor Assignment
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - npm run typecheck
  - npm run lint
  - npm run test:unit

## Story
**Como** visitante do catálogo público,
**quero** clicar diretamente no nome de um curso,
**para** abrir a página com seus detalhes sem precisar localizar outro CTA no card.

## Acceptance Criteria

1. O nome de cada curso elegível no catálogo público é um link para `/cursos/{slug}`.
2. O CTA existente do card continua navegando para a mesma rota.
3. O teste unitário cobre a navegação pelo nome para cursos com e sem turma aberta.

## Tasks / Subtasks

- [x] Envolver o título do card com o link canônico do curso.
- [x] Preservar estados de foco visível e estilo do design system.
- [x] Adicionar teste de regressão para os dois estados de catálogo.

## File List

- `src/views/public/Courses.tsx`
- `src/__tests__/views/public/courses.test.tsx`
- `docs/stories/2026-08-11-rec-411-navegacao-nome-curso.md`
