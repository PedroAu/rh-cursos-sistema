# Épica 6 — Governança de Design

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

### Story 6.2 — Checklist visual/a11y no fluxo de review
- Checklist de design/acessibilidade integrado ao review contínuo.
- Auditar novos componentes: texto mínimo, contraste, labels, teclado, motion reduzido, loading, tema.

### Story 6.3 — Gates automatizados de UI
- Snapshots visuais de pontos críticos; checks a11y nos fluxos alterados.
- Vincular mudanças de UI aos gates: `lint`, `typecheck`, `test`, build.
- Manter File List e critérios de aceite das stories atualizados.

---

## Critérios de aceite da épica

- [ ] Checklist de design/a11y integra o fluxo de review.
- [ ] Nenhuma alteração de UI concluída sem gates automatizados + revisão visual.
- [ ] Tokens e componentes documentados com exemplos aprovado/evitar.

## Gates

`npm run lint` · `npm run typecheck` · `npm test` · revisão visual · checklist a11y.
