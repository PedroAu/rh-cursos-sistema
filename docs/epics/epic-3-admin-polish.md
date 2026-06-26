# Épica 3 — Admin Polish

**Status:** COMPLETE — stories 3.1 a 3.4 `Done`

**PRD:** `docs/prd/modernizacao-ui-2026.md`
**Prioridade:** P1 (a "primeira dor" do solicitante — mas barata, pois 80% já pronto)
**Depende de:** Épicas 1 e 2 (tokens + FormField + a11y compartilhada)
**Fonte:** form-audit + implementation-summary + verificação 2026-06-09

---

## Objetivo

Concluir os ~20% de débito que sobraram no admin após a modernização de 2026-06-04, fazendo o CRUD parecer ferramenta de operação real. **Não reconstruir** o que já existe (ArrayInput, ModulesBuilder, SelectField, validação — ver PRD §2.1).

## Por que é barata

A descoberta de 2026-06-09 confirmou que o grosso da Fase 2/3 do plano original já está implementado e ligado. Sobra polish de superfície, a11y e contexto read-only.

---

## Stories propostas (para @sm *draft)

### Story 3.1 — Densidade visual e hierarquia do CRUD
- Aplicar tokens/tipografia da Épica 1 às superfícies admin (`data-table`, `search-input`, `empty-state`).
- Agrupamento de campos no modal; ação primária/secundária clara.
- **Arquivos:** `src/components/admin/data-table.tsx`, `src/views/admin/AdminResourcePage.tsx`.

### Story 3.2 — Contexto read-only em Inscrições
- Adicionar campos read-only: aluno, curso, turma, data, status derivado (form-audit §5).
- **Aceite:** admin vê contexto sem precisar navegar.

### Story 3.3 — Gráficos admin acessíveis
- Alternativa textual + diferencial além de cor no dashboard.
- **Arquivos:** `src/views/admin/AdminDashboard.tsx`.
- **Aceite:** dados não diferenciados apenas por cor (HIG Charts).

### Story 3.4 — Guard de regressão dos componentes de formulário
- Teste que garante S1 (nenhum JSON cru) e S2 (nenhum ID manual quando há entidade) não regridem.
- **Aceite:** S1 e S2 cobertos por teste.

---

## Critérios de aceite da épica

- [x] S1 e S2 protegidos por teste (regressão-guard).
- [x] Superfícies admin consistentes com tokens da Épica 1 (S6).
- [x] Inscrições com contexto read-only.
- [x] Gráficos acessíveis.

## Gates

`npm run lint` · `npm run typecheck` · `npm test` · revisão visual · checklist a11y.
