# Story 1.4: Camada Material Formalizada

## Status
Ready for Review

## Épica
Épica 1 — Fundação Visual & Baseline A11y (`docs/epics/epic-1-fundacao-visual-baseline-a11y.md`)
PRD: `docs/prd/modernizacao-ui-2026.md`

## Contexto

O PRD aponta uma lacuna média, porém estrutural: `apple-material` está sendo usado em **conteúdo promocional**, quando a diretriz correta é reservá-lo para a **camada funcional** (`header`, sheets, dialogs, menus). Hoje essa mistura aparece no runtime público e dilui a hierarquia entre chrome funcional e conteúdo principal.

A Story 1.2 já preparou os tokens `surface`, `surface-raised` e `control`. Falta convertê-los em regra operacional de superfície: cards e painéis de conteúdo devem ser sólidos e legíveis; translucidez e blur ficam restritos a elementos de navegação/sobreposição.

## Business Value

Sem essa separação, o site continua parecendo "vidro em todo lugar", reduzindo clareza e consistência institucional. Formalizar a camada material melhora leitura, simplifica decisões de composição nas épicas seguintes e alinha o visual com a hierarquia funcional definida no PRD.

## Acceptance Criteria

- [x] AC1 — Documentar e aplicar a regra da épica: `apple-material`/blur/translucidez ficam restritos à camada funcional (app bars, sheets, dialogs, menus, navegação).
- [x] AC2 — `src/styles/globals.css` deve refletir essa separação com classes de superfície sólidas para conteúdo (`surface-card`, `section-panel`, `apple-surface` ou equivalente), consumindo os tokens semânticos da Story 1.2.
- [x] AC3 — Atualizar `public-header`/layout funcional para usar a camada material correta sem depender de blur em conteúdo.
- [x] AC4 — Migrar `Home.tsx`, `InCompany.tsx`, `card.tsx` e views correlatas para superfícies sólidas/legíveis em conteúdo promocional e cards.
- [x] AC5 — Conteúdo e cards devem manter ou melhorar legibilidade/contraste sem regressão visual intencional.
- [x] AC6 — O uso de material por camada deve ficar claro e reaproveitável para as próximas épicas.
- [x] AC7 — Validar com `npm run lint` (limpo).
- [x] AC8 — Validar com `npm run typecheck` (limpo).
- [x] AC9 — Validar com `npm test` (suite completa verde, sem flaky).
- [x] AC10 — Atualizar File List e Change Log ao concluir.

## Scope

### In Scope

- Formalização das classes de superfície/material em `globals.css`.
- Ajuste de header/nav/sheet como camada funcional.
- Migração de cards e painéis de conteúdo promocional para superfícies sólidas.
- Ajustes em `Home`, `InCompany`, cards compartilhados e superfícies equivalentes.

### Out of Scope

- Dark mode.
- Rebranding de cor/tipografia fora do necessário para distinguir camadas.
- Reestruturação de jornadas/formulários além da superfície visual.

## Tarefas / Subtarefas

- [x] Revisar e formalizar classes de material/superfície no `globals.css`.
- [x] Ajustar header/layout funcional para usar material apenas onde faz sentido.
- [x] Remover blur/translucidez de conteúdo promocional em `Home` e `InCompany`.
- [x] Consolidar cards e painéis sólidos compartilhados.
- [x] Rodar quality gates (lint, typecheck, test).
- [x] Atualizar File List e Change Log.

## Dependencies

- **Pré-requisito:** Stories 1.2 (tokens de superfície) e 1.3 (hierarquia tipográfica aplicada).
- **Bloqueia:** Épicas 2-4, que consomem a distinção entre chrome funcional e conteúdo.

## Complexity Estimate

**S-M (Pequeno/Médio)** — Poucos arquivos centrais, mas com alto impacto visual; a principal exigência é não confundir camada funcional com conteúdo.

## Risks

| Risco | Mitigação |
|-------|-----------|
| Remover blur deixar hero/cards “planos” demais | Compensar com contraste, borda, sombra e ritmo tipográfico, não com translucidez indiscriminada. |
| Alterar classes compartilhadas impactar muitas telas | Apoiar a mudança em tokens semânticos e validar as rotas críticas via testes existentes. |
| Header perder leitura sobre hero | Manter material apenas no chrome funcional (`material-app-bar`) com contraste suficiente. |

## Definition of Done

- Todos os AC marcados.
- `npm run lint`, `npm run typecheck`, `npm test` verdes.
- Uso de material restrito à camada funcional.
- Conteúdo e cards sobre superfícies sólidas, legíveis e consistentes.
- File List e Change Log atualizados.

## File List

### Criados
- `docs/stories/2026-06-09-epic1-story4-camada-material-formalizada.md`

### Modificados
- `src/styles/globals.css` — `surface-card`, `section-panel` e `apple-surface` consolidados como superfícies sólidas sobre tokens semânticos; `material-app-bar` fica como camada funcional translúcida
- `src/components/ui/card.tsx` — cards compartilhados passam a herdar a nova separação de superfície
- `src/features/public-shell/components/public-header.tsx` — header usa apenas `material-app-bar` com fundo translúcido funcional
- `src/views/public/Home.tsx` — cards métricos do hero deixam de usar `apple-material-dark` e passam a superfície sólida escura
- `src/views/public/InCompany.tsx` — card flutuante promocional deixa `apple-material` e passa para `surface-card`
- `src/views/public/Courses.tsx` — painel lateral reaproveita `apple-surface` já formalizado como superfície sólida
- `src/components/agenda/calendar-view.tsx` — painel de resumo reaproveita a nova superfície sólida compartilhada

## Dev Agent Record

### Agent Model Used
Codex (dev)

### Completion Notes
- A camada material ficou explicitamente separada: blur e translucidez permanecem na chrome funcional (`material-app-bar`, sheets/dialogs existentes), enquanto conteúdo usa superfícies sólidas por token.
- `Home` e `InCompany` eram os principais desvios do PRD; ambos foram corrigidos sem reabrir a discussão de cor ou layout.
- A classe `apple-surface` foi reaproveitada como superfície sólida para evitar churn desnecessário no markup existente.

## Change Log

- 2026-06-09 — @sm (River) — Story criada a partir da Épica 1 e do PRD para formalizar o uso de material por camada.
- 2026-06-09 — @dev (Codex) — Implementação concluída: material restrito à camada funcional, superfícies de conteúdo consolidadas em tokens sólidos e promos de `Home`/`InCompany` corrigidas. `npm run lint`, `npm run typecheck` e `npm test` verdes. Status In Progress → Ready for Review.

## Dev Notes

- O PRD cita explicitamente o uso indevido de `apple-material` em conteúdo promocional (`Home.tsx`, `InCompany.tsx`, `public-layout.tsx`/header funcional).
- A Story 1.2 já entregou os tokens `surface` e `surface-raised`; esta story consome essa base.

## QA Results

_(a preencher pelo @qa)_
