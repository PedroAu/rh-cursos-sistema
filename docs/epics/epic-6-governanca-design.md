# Épica 6 — Governança de Design

**Status:** COMPLETE — stories 6.1 a 6.3 `Done`

**PRD:** `docs/prd/modernizacao-ui-2026.md`
**Prioridade:** P4
**Depende de:** Épicas 1-5 (sistema consolidado)
**Fonte:** Apple HIG plan Fase 5; plano original Fase 6

---

## Objetivo

Evitar regressão para estilos avulsos ou acessibilidade parcial. Documentar e instrumentar o sistema para que nenhuma alteração de UI seja concluída sem gates.

---

## Stories propostas (para @sm *draft)

### Story 6.1 — Documentação de tokens e componentes
- Documentar tokens, componentes, padrões de formulário e regras de uso.
- Exemplos de uso aprovado e usos a evitar (materiais, ação primária, badges, erros).
- Status: concluída em `docs/stories/2026-06-10-epic6-story1-documentacao-design-system.md`

### Story 6.2 — Checklist visual/a11y no fluxo de review
- Checklist de design/acessibilidade integrado ao review contínuo.
- Auditar novos componentes: texto mínimo, contraste, labels, teclado, motion reduzido, loading, tema.
- Status: concluída em `docs/stories/2026-06-10-epic6-story2-checklist-review-ui-a11y.md`

### Story 6.3 — Gates automatizados de UI
- Snapshots visuais de pontos críticos; checks a11y nos fluxos alterados.
- Vincular mudanças de UI aos gates: `lint`, `typecheck`, `test`, build.
- Manter File List e critérios de aceite das stories atualizados.
- Status: concluída em `docs/stories/2026-06-10-epic6-story3-gates-automatizados-ui.md`

---

## Critérios de aceite da épica

- [x] Checklist de design/a11y integra o fluxo de review.
- [x] Nenhuma alteração de UI concluída sem gates automatizados + revisão visual.
- [x] Tokens e componentes documentados com exemplos aprovado/evitar.

## Gates

`npm run lint` · `npm run typecheck` · `npm test` · revisão visual · checklist a11y (`docs/checklists/ui-a11y-review.md`).
