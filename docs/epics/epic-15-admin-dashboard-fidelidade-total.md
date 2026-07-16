# Épica 15 — Admin Dashboard: Fidelidade Total (Trust Keith)

**Status:** Em andamento — Fase 1 (Story 15.1, Dashboard) `Done` (fechada via `*close-story` @po em 2026-07-15, QA PASS após correção do REL-001 em `query-logging-middleware.ts`). Fases 15.2–15.8 (Cursos, Turmas, Matrículas, Alunos, Instrutores, Leads, Blog/Páginas/Configurações) permanecem **não criadas**, aguardando priorização de `@pm` antes de virarem stories.
**PRD Source:** Auditoria de fidelidade ad-hoc (dashboard admin em produção vs. canvas Trust Keith)
**Prioridade:** P2 (débito de design — dashboard admin nunca migrado para o novo DS)
**Fonte:** Épica 14 (Redesign Trust Keith) excluiu explicitamente o redesign visual do admin do seu escopo (ver `docs/stories/2026-07-02-epic14-story1-3-admin-shell-resign.md`, linha "Redesign visual do admin — não é escopo desta epic"). Esta épica cobre essa lacuna.

---

## 🎯 Objetivo

Levar as telas do painel administrativo (`docs/design-system/RH Cursos Admin Dashboard.dc.html`) à mesma fidelidade Trust Keith já alcançada nas páginas públicas pela Épica 14 Fase 2 (`14.2.x`). O shell admin (sidebar/topbar) já foi re-skinado sem Mantine na Épica 14 Fase 1 (`14.1.3`/`14.1.4`), mas sem redesign visual — as telas de conteúdo (Dashboard, Cursos, Turmas, Matrículas, Alunos, Instrutores, Leads, Blog, Páginas, Configurações) permanecem no desenho anterior (Épica 10).

**Não confundir com:**
- Épica 10 (Admin Dashboard Optimization) — performance/real-time/search/export, já `Done`, mantido e reaproveitado aqui.
- Épica 14 (`14.1.3`/`14.1.4`) — remoção de Mantine do shell/views admin, já `Done`, base sobre a qual esta épica constrói.

---

## 📋 Acceptance Criteria (AC) da Épica

- [ ] **AC-15.1** — Tela Dashboard (`/admin` ou equivalente) implementada conforme `docs/design/redesign/spec-admin-dashboard.md`, com fidelidade de estrutura, tokens, conteúdo e contrato de dados.
- [ ] **AC-15.2** — Hooks de dados em tempo real já existentes (`useRealTimeMetrics`, `useAdminSearch`, `exportToCSV` — Épica 10) são reaproveitados, não recriados (IDS: REUSE > CREATE).
- [ ] **AC-15.3** — Zero regressão: `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build` verdes; nenhuma reintrodução de `@mantine/*`/`@emotion/*` (`npm run purge:gate`).
- [ ] **AC-15.4** — Cobertura de teste de fidelidade visual para a tela Dashboard (novo spec Playwright, análogo a `tests/epic14-mantine-removal.smoke.spec.ts`).
- [ ] **AC-15.5** — Demais telas do canvas (Cursos, Turmas, Matrículas, Alunos, Instrutores, Leads, Blog, Páginas, Configurações) explicitamente **fora de escopo** desta primeira story — ficam como fases futuras da épica (15.2+), cada uma com sua própria spec de fidelidade antes da implementação.

---

## 📂 Escopo

### IN SCOPE (Fase 1 / Story 15.1)
- `src/features/admin/dashboard/admin-dashboard-page.tsx` — redesign de conteúdo conforme `spec-admin-dashboard.md`
- Reaproveitamento dos hooks de dados da Épica 10 (`useRealTimeMetrics`, `useAdminSearch`, `csv-export`)
- Ajustes pontuais no shell (`admin-sidebar.tsx`) **somente** se necessários para os itens descritos na spec (grupos rotulados, badge de contagem em Leads) — sem redesign completo do shell

### OUT OF SCOPE (fases futuras — 15.2+)
- Redesign das demais 9 telas do canvas admin
- Novos componentes de design system além dos já catalogados em Trust Keith
- Mudança de modelo de dados/schema Supabase

---

## 🎬 Stories da Épica

### Story 15.1: Admin Dashboard — Fidelidade Total (Trust Keith)
**Objetivo:** Implementar a tela Dashboard conforme `spec-admin-dashboard.md`
**Status:** Done
**Arquivo:** `docs/stories/2026-07-13-epic15-story1-1-admin-dashboard-fidelidade-total.md`

### Stories futuras (não criadas ainda)
- 15.2 — Cursos
- 15.3 — Turmas
- 15.4 — Matrículas
- 15.5 — Alunos
- 15.6 — Instrutores
- 15.7 — Leads
- 15.8 — Blog / Páginas / Configurações

---

## 🔗 Related Documents
- Spec de fidelidade: `docs/design/redesign/spec-admin-dashboard.md`
- Canvas: `docs/design-system/RH Cursos Admin Dashboard.dc.html`
- Épica 10 (base funcional a reaproveitar): `docs/epics/epic-10-admin-dashboard-optimization.md`
- Épica 14 (padrão de fidelidade e ADR de arquitetura): `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md`, `docs/architecture/adr-014-redesign-trust-keith.md`
- Exclusão de escopo original: `docs/stories/2026-07-02-epic14-story1-3-admin-shell-resign.md`

---

**Created:** 2026-07-13
**Owner:** @ux-design-expert (Uma) — proposta; requer validação de @po e priorização de @pm antes de entrar em execução.
