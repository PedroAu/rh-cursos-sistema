# Story 14.1.3: Remoção Mantine — Admin Shell (Re-skin Trust Keith)

## Status
Ready

## Executor Assignment
executor: "Codex" (@dev delegado)
quality_gate: "@qa" (story 14.1.6 PASS → aprovado este)

## Epic
EPIC 14, Fase 1 — Source: `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md`
ADR: `docs/architecture/adr-014-redesign-trust-keith.md` (D1, D8) · Depende de: 14.1.2 (forms — CONCLUÍDA)

## Complexity Estimate
M — 5 pontos (shell + sidebar + header, sem redesign visual, apenas remoção Mantine).

---

## 📋 Escopo

**IN:**
- `src/features/admin-shell/` — remover imports Mantine; re-skin com primitivas Trust Keith + tokens
- `src/features/admin-shell/AdminShell.tsx` — layout principal
- `src/features/admin-shell/components/AdminSidebar.tsx` — menu lateral
- `src/features/admin-shell/components/AdminHeader.tsx` — cabeçalho
- `src/features/admin-shell/components/AdminNavigation.tsx` — navegação
- Qualquer componente de layout admin que importe Mantine

**OUT:**
- Portais (`StudentPortal`, `InstructorPortal`) — stories 14.1.4
- Views admin (`AdminSettingsPage`, `AdminResourcePage`, etc.) — já migradas na 14.1.2
- Redesign visual do admin — não é escopo desta epic (funcionalidade padrão, sem novo design)

### 🤖 PROMPT CODEX (autossuficiente)

#### Contexto

Projeto Next.js 16 em `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos`. Fase 1: remover Mantine de `src/features/admin-shell/`. As views já foram migradas em 14.1.2. Esta story toca apenas na camada de layout/shell — componentes de UI, navegação, sidebars.

#### Tarefas

1. **Levantamento:** `grep -rn "@mantine" src/features/admin-shell/` — identificar todos imports.
2. **Reescrever componentes shell sem Mantine:**
   - Substituir componentes Mantine (`Navbar`, `Group`, `Stack`, `Drawer`, `ActionIcon`, etc.) por Tailwind + primitivas Trust Keith (`Button`, `Badge`, `Card`, etc.)
   - Navbars/drawers podem usar `<nav>` + Tailwind ou `<Popover>` do Radix se interativo
   - Mantém comportamento/exports — sem mudança de API
3. **re-apontar tokens:** se há refs a `--mantine-color-*` em estilos de shell, apontar para `--tk-*`/`--rh-*` equivalentes
4. **Testes:** manter/ajustar testes de shell; stories Storybook se existirem
5. **Não tocar em:** views (já feitas), portais (14.1.4)

#### ACs

1. `grep -rn "@mantine" src/features/admin-shell/` → vazio.
2. `npm run lint && npm run typecheck && npm run test:unit` → verdes.
3. `npm run build` → sucesso.
4. Admin layout em dev renderiza sem erro de runtime (shell ausência Mantine não quebra).

### Ao concluir
Atualizar esta story: checkboxes, status → InReview, Change Log.

---

## Tasks / Subtasks
- [ ] Levantamento de imports Mantine (AC: 1)
- [ ] AdminShell.tsx reescrito (AC: 1)
- [ ] AdminSidebar, AdminHeader, AdminNavigation sem Mantine (AC: 1)
- [ ] Tokens re-apontados (AC: 1)
- [ ] Verificação completa (AC: 1-4)

## File List
- `docs/stories/2026-07-02-epic14-story1-3-admin-shell-resign.md`

## PO Validation
2026-07-02 · @po via @aiox-master YOLO · **GO** — escopo cercado; views já migradas reduzem risco; sem redesign; ACs claros. Status: Draft → Ready.

## Change Log
- 2026-07-02 - @aiox-master (Orion) - Story criada como prompt Codex (Epic 14 §4.3).

