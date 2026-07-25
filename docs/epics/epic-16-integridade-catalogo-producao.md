# Épica 16 — Integridade de Dados do Catálogo em Produção

**Status:** Complete (2026-07-15, fechada via `*close-story` @po) — Story 16.1 `Done`, gate PASS em `docs/qa/gates/16.1-remover-fallback-mock-producao.yml`, commits `d6a8bc8`/`d221b37` confirmados em `main`. Banner corrigido nesta entrada — permanecia `Draft` por omissão.
**PRD Source:** Investigação ad-hoc de causa raiz (`@architect`) sobre divergência entre dados exibidos em produção (admin + páginas públicas) e o estado real do banco Supabase.
**Prioridade:** P1 (defeito de correção de dados — usuário reporta que a população de dados reais em produção está sendo afetada)
**Fonte:** Handoff `@architect → @sm`, `.aiox/handoffs/2026-07-13-architect-to-sm-mock-fallback-story.yaml`, consolidando achados de uma investigação (agente Explore) sobre por que cursos/turmas/instrutores/posts fictícios aparecem em produção mesmo após limpezas manuais do banco (commits `29da4dc`, `fa284aa`).

---

## 🎯 Objetivo

Eliminar as fontes de dados fictícios ("mock") do caminho de renderização de produção das páginas públicas, e revisar a estratégia de geração estática (SSG) do catálogo de cursos para que falhas/estado vazio do banco no momento do build não "assem" permanentemente páginas incorretas.

**Não confundir com:**
- Causa raiz #1 do mesmo diagnóstico (isolamento do ambiente de testes E2E do Supabase de produção) — **explicitamente fora desta épica**, por decisão do usuário. Ver nota abaixo.

---

## 📋 Acceptance Criteria (AC) da Épica

- [x] **AC-16.1** — Nenhuma página pública ou de checkout renderiza dados de `src/lib/mock-public-data.ts` em produção, seja por merge de catálogo ou por fallback de estado.
- [x] **AC-16.2** — Catálogo vazio ou erro de query propaga um estado explícito ("vazio"/"erro") na UI pública, em vez de substituir silenciosamente por dados fictícios.
- [x] **AC-16.3** — `mock-public-data.ts` permanece utilizável apenas em testes unitários/Storybook, nunca importado por código de página (`app/**/page.tsx`) ou pela store client-side (`app-store.tsx`) em build de produção.
- [x] **AC-16.4** — Decisão documentada e implementada sobre a estratégia de `generateStaticParams` do catálogo de cursos: build de produção falha/alerta explicitamente se não conseguir buscar o catálogo real, ou as rotas migram para renderização dinâmica — com justificativa registrada.
- [x] **AC-16.5** — Zero regressão: `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build` verdes.

> Reconciliação documental: itens marcados a partir do gate `PASS` da Story
> 16.1, que registra `AC1`–`AC10` como `met` e os gates constitucionais verdes.

---

## 📂 Escopo

### IN SCOPE (Story 16.1)
- `src/lib/mock-public-data.ts` — restringir uso a testes/Storybook
- `app/cursos/[slug]/page.tsx` — remover merge/fallback de mock em `generateStaticParams()` e no render de curso inexistente
- `app/cursos/[slug]/checkout/page.tsx` — mesmo tratamento
- `src/lib/app-store.tsx` — remover `initialState` populado com mock e o fallback silencioso de `resolveCatalogBootstrapState()`
- Revisão/decisão sobre `generateStaticParams` vs. renderização dinâmica nas rotas de curso

### OUT OF SCOPE (não faz parte desta épica)
- Isolamento do ambiente de testes E2E do Supabase de produção (causa raiz #1 do diagnóstico do arquiteto) — deixado de fora por pedido explícito do usuário em 2026-07-13.
- Redesign visual de qualquer tela (não é o objetivo aqui).

---

## 🎬 Stories da Épica

### Story 16.1: Remover fallback de dados mock em produção e revisar SSG do catálogo
**Objetivo:** Implementar AC-16.1 a AC-16.5
**Status:** Done
**Arquivo:** `docs/stories/2026-07-13-epic16-story1-1-remover-fallback-mock-producao.md`

---

## 🔗 Related Documents
- Handoff de diagnóstico: `.aiox/handoffs/2026-07-13-architect-to-sm-mock-fallback-story.yaml`
- Commits relacionados (limpeza manual do sintoma, não da causa): `29da4dc`, `fa284aa`

---

**Created:** 2026-07-13
**Owner:** @architect (Aria) — diagnóstico; requer validação de @po antes de entrar em execução.
