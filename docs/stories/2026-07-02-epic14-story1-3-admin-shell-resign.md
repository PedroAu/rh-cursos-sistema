# Story 14.1.3: Remoção Mantine — Admin Shell (Re-skin Trust Keith)

## Status
InReview

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
- [x] Levantamento de imports Mantine (AC: 1)
- [x] `dashboard-shell.tsx` reescrito — AppShell → grid HTML/Tailwind, `useDisclosure` migrado para `src/hooks/use-disclosure.ts` (AC: 1)
- [x] `admin-sidebar.tsx`, `admin-topbar.tsx`, `admin-bottom-navigation.tsx` sem Mantine (AC: 1)
- [x] Tokens re-apontados — `tk-surface-2`, `tk-ink`, `tk-ink-muted`, `tk-focus`; cores hardcoded do shell (`#0e4666`, `#ffe09b`) mantidas como classes arbitrárias Tailwind (AC: 1)
- [x] Verificação completa (AC: 1-4)

### Nota de escopo (nomes de arquivo)
A story lista `AdminShell.tsx` / `AdminSidebar.tsx` / `AdminHeader.tsx` / `AdminNavigation.tsx` (PascalCase), mas os arquivos reais na árvore atual do projeto são `dashboard-shell.tsx` e `components/{admin-sidebar,admin-topbar,admin-bottom-navigation}.tsx` (kebab-case). Os 4 arquivos reais de `src/features/admin-shell/` foram os re-skinados; não há arquivos `AdminHeader.tsx`/`AdminNavigation.tsx` distintos no código atual (o topbar e a navegação mobile cobrem esse escopo).

## File List
- `docs/stories/2026-07-02-epic14-story1-3-admin-shell-resign.md`
- `src/features/admin-shell/dashboard-shell.tsx` (modificado)
- `src/features/admin-shell/components/admin-sidebar.tsx` (modificado)
- `src/features/admin-shell/components/admin-topbar.tsx` (modificado)
- `src/features/admin-shell/components/admin-bottom-navigation.tsx` (modificado)

## PO Validation
2026-07-02 · @po via @aiox-master YOLO · **GO** — escopo cercado; views já migradas reduzem risco; sem redesign; ACs claros. Status: Draft → Ready.

## Change Log
- 2026-07-02 - @aiox-master (Orion) - Story criada como prompt Codex (Epic 14 §4.3).
- 2026-07-02 - Codex (@dev) - Removido Mantine (`@mantine/core`, `@mantine/hooks`) dos 4 arquivos de `src/features/admin-shell/`. `AppShell`/`AppShell.Navbar`/`AppShell.Header` substituídos por layout Tailwind com `aside` fixo (sidebar desktop, `lg:flex`), `header` fixo (topbar) e `nav` fixo inferior (mobile, `lg:hidden`). `useDisclosure` migrado do Mantine para `src/hooks/use-disclosure.ts` (já existente desde 14.1.1, mesma assinatura de retorno — sem mudança de API). Componentes Mantine (`Group`, `Stack`, `Box`, `Text`, `Divider`, `NavLink`, `ScrollArea`, `ThemeIcon`, `Paper`, `SimpleGrid`, `UnstyledButton`, `ActionIcon`, `Burger`, `TextInput`, `Avatar`) substituídos por HTML+Tailwind e primitivas Trust Keith (`Button`, `Input`, `Avatar`/`AvatarFallback` de `src/components/ui/`). Lógica de rota ativa e estrutura de navegação preservadas sem mudança de comportamento. Views admin e portais não tocados (fora de escopo). Status → InReview.

