# Story 4.3: Jornada de Acesso

## Status
Ready for Review

## Épica
Épica 4 — Jornadas Públicas (`docs/epics/epic-4-jornadas-publicas.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

O login já tinha labels persistentes e erro inline, mas faltava deixar explícito qual papel está disponível nesta publicação e qual é o comportamento esperado quando o usuário vem do guard do admin.

## Acceptance Criteria

- [x] AC1 — A tela de login deixa claro que somente administração está disponível nesta publicação.
- [x] AC2 — A escolha de papel fica previsível, sem sugerir acesso inexistente a aluno ou instrutor.
- [x] AC3 — O redirecionamento do guard para `/login` explica o próximo passo ao usuário.
- [x] AC4 — Há cobertura de regressão para a previsibilidade do papel disponível.
- [x] AC5 — `npm run lint`, `npm run typecheck` e `npm test` verdes.
- [x] AC6 — File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-10-epic4-story3-acesso.md`

### Modificados
- `src/views/public/Login.tsx` — papéis apresentados de forma previsível e mensagem do guard
- `tests/public-journeys.spec.ts` — cobertura do fluxo de acesso público
- `tests/baseline/login-desktop.png`
- `tests/baseline/login-mobile.png`

## Change Log

- 2026-06-10 — @sm (River) — Story criada a partir da Épica 4.
- 2026-06-10 — @dev (Codex) — Login refinado para explicitar o papel disponível e o comportamento do guard server-side. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- A solução evita inventar portais fora do escopo: aluno e instrutor aparecem apenas como indisponíveis nesta publicação.

## QA Results

_(a preencher pelo @qa)_
