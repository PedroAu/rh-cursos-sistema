# Relatório de execução — REC-306: Corrigir navegação e ações administrativas

- **Data:** 2026-07-17
- **Story:** [REC-306](../../stories/2026-07-17-rec-306-corrigir-navegacao-acoes-admin.md)
- **Épica:** Épica 17 — Recuperação SEV-0 (Onda 4)
- **Finding:** FND-17 · **Requisitos:** FR-10, NFR-07
- **Escopo:** puramente frontend/UX do admin shell. Nenhuma alteração de auth.

## 1. Investigação (read-only)

Orientação inicial via `graphify query` (admin navigation/menu/sidebar) apontou o cluster `src/features/admin-shell/`. Leitura confirmada dos arquivos:

- `dashboard-shell.tsx` — orquestra sidebar, topbar e bottom-nav; mantém `mobileOpened` via `useDisclosure`.
- `components/admin-sidebar.tsx` — sidebar desktop (`hidden lg:flex`), com nav completa, catálogo e logout funcionais.
- `components/admin-topbar.tsx` — topbar fixo com hambúrguer (mobile), busca, sino e ajuda.
- `components/admin-bottom-navigation.tsx` — nav móvel real, mas `.slice(0, 5)`.
- `config/admin-navigation.ts` — 9 itens de nav para admin, 3 para aluno, 3 para instrutor.
- `hooks/use-disclosure.ts` — `{ open, close, toggle }`.

### Defeitos confirmados

| # | Defeito | Evidência no código |
|---|---|---|
| D1 | Hambúrguer inerte: alterna `mobileOpened`, mas nada renderiza | `dashboard-shell.tsx` passava `mobileOpened`/`toggleMobile` ao topbar; nenhum drawer existia no shell |
| D2 | `aria-controls` ausente no botão de toggle | `admin-topbar.tsx` tinha `aria-expanded` mas não `aria-controls` |
| D3 | Navegação móvel incompleta | `admin-bottom-navigation.tsx` `getDashboardNavItems(role).slice(0, 5)` → itens 6–9 (Inscrições, Instrutores, Blog, Configurações) inalcançáveis no mobile |
| D4 | Busca global inerte | `Input` em `admin-topbar.tsx` sem `value`/`onChange`; `useAdminSearch` só usado por teste; `CommandPalette` só montado no shell público (`public-layout.tsx`) |
| D5 | Notificações inerte | botão do sino sem `onClick`; sem sistema de notificações no projeto |
| D6 | Ajuda inerte | botão `CircleHelp` sem `onClick`; sem central de ajuda |

## 2. Decisão por controle (FR-10 / Article IV)

FR-10 admite duas saídas legítimas: **funcionar** ou **ser removido/marcado indisponível**. Decisão consciente, evitando implementação fake (o antipadrão de "falso sucesso" que REC-302 já erradicou):

| Controle | Decisão | Como |
|---|---|---|
| Hambúrguer + drawer (D1/D2) | **Implementado** | Novo `admin-mobile-drawer.tsx`; `aria-controls` ligando toggle ↔ drawer |
| Itens de nav 6–9 no mobile (D3) | **Implementado** | Drawer expõe os 9 itens; bottom-nav mantido como atalho aos 5 principais |
| Busca global (D4) | **Removido** | Inerte e enganoso; busca real já existe por página de recurso |
| Notificações (D5) | **Marcado indisponível** | `disabled` + `aria-disabled="true"` + `title`/`aria-label` "em breve" |
| Ajuda (D6) | **Marcado indisponível** | idem |

Construir notificações/ajuda/busca global reais seria trabalho substancial (nova API + nova UI), fora do escopo de um bugfix de UX — daí a marcação honesta em vez de fingir função.

## 3. Implementação

### Criado — `src/features/admin-shell/components/admin-mobile-drawer.tsx`
Drawer de navegação móvel sobre **Radix Dialog** (`@radix-ui/react-dialog`, já dependência do projeto, usado por `components/ui/dialog.tsx`). Ganhos de acessibilidade herdados do Radix: foco preso no painel, **Escape fecha**, foco restaurado ao fechar, `role="dialog"` + `aria-modal`. Conteúdo: título, itens de `getDashboardNavItems(role)` (todos), badge de leads novos, "Catálogo de cursos" e "Sair" (`logout`). Cada item chama `onOpenChange(false)` ao navegar. Exporta a constante `ADMIN_MOBILE_DRAWER_ID` usada pelo `aria-controls` do topbar. Espelha o padrão visual/estado do `admin-sidebar.tsx` (mesmo `useAppStore`/`useLocation`, mesmas classes).

### Modificado — `dashboard-shell.tsx`
Renderiza `<AdminMobileDrawer>` controlado pelo mesmo estado do hambúrguer (`open`/`close` do `useDisclosure`). Sidebar/topbar/bottom-nav inalterados.

### Modificado — `admin-topbar.tsx`
- Hambúrguer: adicionado `aria-controls={ADMIN_MOBILE_DRAWER_ID}` (mantém `aria-expanded`/`aria-label`).
- **Removida** a busca global inerte (`Input` + `Search` + função `resolvePlaceholder` + imports/`useLocation` órfãos).
- **Notificações** e **Ajuda**: `disabled` + `aria-disabled="true"` + `title` + `aria-label` "(em breve)".

## 4. Testes — `src/__tests__/features/admin-shell/admin-mobile-navigation.test.tsx` (+10)

Padrão do projeto (mock de `@/lib/router-compat` e `@/lib/app-store`, como em `views/public/courses.test.tsx`). Cobertura:

- **AdminTopbar:** ARIA do toggle (`aria-expanded`, `aria-controls`); clique dispara `onToggle`; Notificações/Ajuda `disabled` + `aria-disabled`; busca global ausente (`queryByRole("textbox")` → null).
- **AdminMobileDrawer:** fora do DOM quando fechado; expõe os 9 itens (incl. Inscrições/Instrutores/Blog/Configurações) + catálogo; navegar fecha (`onOpenChange(false)`); "Sair" chama `logout` e fecha; badge de leads novos.
- **Integração:** harness que espelha o `DashboardShell` (estado compartilhado) — **abre por clique** no hambúrguer e **fecha por Escape**, com `aria-expanded` acompanhando.

## 5. Verificação

| Gate | Comando | Resultado |
|---|---|---|
| Lint | `npm run lint` | OK |
| Typecheck | `npm run typecheck` | OK (`next typegen && tsc --noEmit`) |
| Testes (foco) | `npx vitest run …/admin-mobile-navigation.test.tsx` | 10/10 |
| Testes (suíte) | `npx vitest run` | **694/694** (baseline 684 + 10), 64 arquivos, sem regressão |

## 6. Não-invasão de autenticação

`git status` confirma que nenhum destes foi tocado: `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`, `src/lib/supabase/session.ts`, `src/lib/supabase/authorize.ts`. Todas as mudanças ficam em `src/features/admin-shell/**` e no arquivo de teste.

## 7. Pendências / follow-up

- Notificações, Ajuda e busca global permanecem marcadas "em breve" — quando houver contrato real (API/serviço), transformar em stories próprias (não inventadas aqui).
- REC-308 (varredura axe e acessibilidade das jornadas públicas) depende desta story e cobre a verificação de violações sérias/críticas end-to-end.
