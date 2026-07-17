# Épica 15 — Admin Dashboard: Fidelidade Total (Trust Keith)

**Status:** Implementação completa — Ready for Review (2026-07-17). Stories 15.1–15.8 implementadas; gate final `PASS` 100/100 em `docs/qa/gates/epic15-complete-fidelity.yml`. Fechamento formal `Done` permanece condicionado ao merge, conforme lifecycle do `@po`.
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

- [x] **AC-15.1** — Dashboard implementado conforme `spec-admin-dashboard.md`.
- [x] **AC-15.2** — Infraestrutura e CRUD existentes reaproveitados (IDS: REUSE > CREATE).
- [x] **AC-15.3** — Lint, typecheck, unit, build e purge gate verdes.
- [x] **AC-15.4** — Cobertura Playwright de fidelidade registrada em `test:epic15:fidelity`.
- [x] **AC-15.5** — Cursos, Turmas, Matrículas, Alunos, Instrutores, Leads, Blog, Páginas e Configurações entregues nas fases 15.2–15.8.

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

### Stories em execução
- 15.2 — Cursos — `docs/stories/2026-07-17-epic15-story2-cursos-fidelidade-total.md`
- 15.3 — Turmas — `docs/stories/2026-07-17-epic15-story3-turmas-fidelidade-total.md`
- 15.4 — Matrículas — `docs/stories/2026-07-17-epic15-story4-matriculas-fidelidade-total.md`
- 15.5 — Alunos — `docs/stories/2026-07-17-epic15-story5-alunos-fidelidade-total.md`
- 15.6 — Instrutores — `docs/stories/2026-07-17-epic15-story6-instrutores-fidelidade-total.md`
- 15.7 — Leads — `docs/stories/2026-07-17-epic15-story7-leads-fidelidade-total.md`
- 15.8 — Blog / Páginas / Configurações — `docs/stories/2026-07-17-epic15-story8-conteudo-configuracoes-fidelidade-total.md`

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
