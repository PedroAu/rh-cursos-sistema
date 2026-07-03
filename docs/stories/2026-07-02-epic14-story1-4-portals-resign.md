# Story 14.1.4: Remoção Mantine — Portals (StudentPortal, InstructorPortal)

## Status
InReview

## Executor Assignment
executor: "Codex" (@dev delegado)
quality_gate: "@qa" (story 14.1.6 PASS → aprovado este)

## Epic
EPIC 14, Fase 1 — Source: `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md`
ADR: `docs/architecture/adr-014-redesign-trust-keith.md` (D1, D8) · Depende de: 14.1.2 (forms), 14.1.3 (admin-shell — sequencial recomendado)

## Complexity Estimate
L — 7 pontos (dois portals; muitos componentes; toca fluxos de user autenticado).

---

## 📋 Escopo

**IN:**
- `src/features/StudentPortal/` — remover imports Mantine; re-skin com Trust Keith
- `src/features/InstructorPortal/` — remover imports Mantine; re-skin com Trust Keith
- Componentes de UI dentro dos portais

**OUT:**
- Views de negócio (user data, enrollments, etc.) — apenas UI
- Redesign visual dos portals — manter funcionalidade; usar Trust Keith defaults

### 🤖 PROMPT CODEX (autossuficiente)

#### Contexto

Projeto Next.js 16 em `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos`. Fase 1: remover Mantine de `src/features/StudentPortal/` e `src/features/InstructorPortal/`. Views já foram migradas em 14.1.2; shells em 14.1.3. Esta story toca apenas camada de UI/componentes dos portals.

#### Tarefas

1. **Levantamento:** `grep -rn "@mantine" src/features/StudentPortal/ src/features/InstructorPortal/` — identificar imports.
2. **Reescrever componentes:** substituir Mantine por Tailwind + primitivas Trust Keith. Navs/drawers com `<nav>` ou Radix Popover; tabelascom `<table>` + classes tk.
3. **Tokens:** re-apontar `--mantine-color-*` para `--tk-*`/`--rh-*`.
4. **Testes/Stories:** manter/ajustar; adicionar se houver.
5. **Não tocar em:** lógica de dados, endpoints, autenticação.

#### ACs

1. `grep -rn "@mantine" src/features/StudentPortal/ src/features/InstructorPortal/` → vazio.
2. `npm run lint && npm run typecheck && npm run test:unit` → verdes.
3. `npm run build` → sucesso.
4. Portals em dev carregam sem erro de runtime.

### Ao concluir
Atualizar esta story: checkboxes, status → InReview, Change Log.

---

## Tasks / Subtasks
- [x] Levantamento (AC: 1)
- [x] StudentPortal reescrito (AC: 1)
- [x] InstructorPortal reescrito (AC: 1)
- [x] Tokens re-apontados (AC: 1)
- [x] Verificação completa (AC: 1-4)

## Dev Notes

O código real dos portais não está em `src/features/StudentPortal/` /
`src/features/InstructorPortal/` (paths do prompt original) — vive em
`src/views/portal/StudentPortal.tsx` e `src/views/portal/InstructorPortal.tsx`.
O trabalho desta story foi aplicado nesses dois arquivos, que são os únicos
consumidores de `@mantine/core` na camada de portals (confirmado via grep).

Substituições Mantine → Trust Keith:
- `Card` (Mantine) → `@/components/ui/card` (`Card`)
- `Table`/`Table.Thead`/`Table.Tr`/`Table.Th`/`Table.Td`/`Table.ScrollContainer` → `@/components/ui/table` (`Table`, `TableHeader`, `TableRow`, `TableHead`, `TableCell`; scroll horizontal já embutido no wrapper do componente)
- `Badge variant="light"` → `@/components/ui/badge` (`Badge variant="muted"`, seguindo padrão já usado em `AdminResourcePage.tsx`)
- `Alert` (erro/indisponibilidade) → `div role="alert"` com tokens `border-warning/25 bg-warning/10 text-warning` + ícone `AlertCircle` (lucide-react), mesmo padrão de `src/views/public/Login.tsx`
- `Alert` (lista vazia) → bloco de empty state `rounded-2xl bg-tk-surface-2 p-8 text-center`, mesmo padrão de `src/views/admin/AdminResourcePage.tsx`
- `Stack`/`Group`/`SimpleGrid`/`Title`/`Text` → `flex`/`grid` Tailwind + `h1`-`h4`/`p` com tokens `text-tk-ink` / `text-tk-ink-muted`

Nenhuma mudança de API, lógica de dados, endpoints ou autenticação. `app/aluno/page.tsx` e `app/instrutor/page.tsx` seguem consumindo `StudentPortal`/`InstructorPortal` sem alterações.

## File List
- `docs/stories/2026-07-02-epic14-story1-4-portals-resign.md`
- `src/views/portal/StudentPortal.tsx`
- `src/views/portal/InstructorPortal.tsx`

## PO Validation
2026-07-02 · @po via @aiox-master YOLO · **GO** — escopo cercado a UI; lógica de dados não toca; ACs claros. Status: Draft → Ready.

## Change Log
- 2026-07-02 - @aiox-master (Orion) - Story criada como prompt Codex (Epic 14 §4.4).
- 2026-07-02 - @dev (Dex) - Removido `@mantine/core` de `src/views/portal/StudentPortal.tsx` e `src/views/portal/InstructorPortal.tsx` (paths reais dos portais); re-skin com primitivas Trust Keith (`Card`, `Table`, `Badge`) + Tailwind. `grep -rn "@mantine"` nesses arquivos → vazio. `npm run lint`, `npm run typecheck` (`tsc --noEmit`), `npm run test:unit` (394 testes) e `npm run build` → todos verdes. Status: Ready → InReview.

