# Story REC-306: Corrigir navegação e ações administrativas

## Status

Done

## Executor Assignment

executor: "@dev" (Dex) + "@ux-design-expert" (Uma)
quality_gate: "@qa"
quality_gate_tools:
- teste de componente do menu móvel (abre por clique no hambúrguer, fecha por Escape) com Testing Library
- verificação dos atributos ARIA do botão de toggle (`aria-expanded`, `aria-controls`) e do drawer
- teste de que o drawer expõe todos os 9 itens de navegação admin, inclusive os que a barra inferior móvel não alcança (Inscrições, Instrutores, Blog, Configurações)
- teste de que as ações antes inertes (Notificações, Ajuda) estão explicitamente desabilitadas/marcadas indisponíveis, e de que a busca global inerte foi removida
- confirmação de que nenhum arquivo de autenticação (HMAC/SSR) foi tocado

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 4 — Estabilização funcional
- **Prioridade:** P1
- **Estimativa:** S
- **Findings:** FND-17 (Controles de UI inertes, navegação móvel incompleta e lacunas de acessibilidade)
- **Requisitos:** FR-10 (controles devem funcionar ou ser removidos/explicitamente marcados como indisponíveis), NFR-07 (acessibilidade: operável por teclado)
- **Dependência:** REC-303 (Done) — apenas ordenação de onda, sem relação funcional direta.

## Story

**As a** administrador (ou instrutor/aluno) que acessa o painel pelo celular,
**I want** uma navegação móvel completa e acessível por teclado, e sem botões/campos que parecem funcionar mas não fazem nada,
**so that** todas as jornadas administrativas críticas fiquem alcançáveis em telas pequenas e nenhum controle exibido seja enganoso, conforme FR-10 e NFR-07.

## Contexto e valor

O achado **FND-17** aponta "controles de UI inertes, navegação móvel incompleta e lacunas de acessibilidade" com risco de "jornadas críticas inacessíveis ou enganosas". Na investigação do admin shell (`src/features/admin-shell/`) foram confirmados os seguintes defeitos concretos:

1. **Menu móvel inerte/quebrado.** `dashboard-shell.tsx` mantinha um estado `mobileOpened` (via `useDisclosure`) e o passava para `admin-topbar.tsx`, que renderizava um botão-hambúrguer (`lg:hidden`) com `aria-expanded={opened}`. Porém **nada era renderizado em resposta a esse estado** — não existia drawer/painel móvel. Clicar no hambúrguer alternava um booleano morto. Além disso, faltava `aria-controls` (o botão não apontava para nenhum elemento controlado).

2. **Navegação móvel incompleta.** A única navegação móvel real era `admin-bottom-navigation.tsx`, que usa `getDashboardNavItems(role).slice(0, 5)`. Para o papel admin existem **9** itens de navegação, então os itens 6–9 — **Inscrições, Instrutores, Blog e Configurações** — eram **inalcançáveis no celular**. Isso é exatamente a "jornada crítica inacessível" de FND-17.

3. **Ações inertes no topbar.** O `admin-topbar.tsx` exibia:
   - um **campo de busca global** (`Input`) sem `value`/`onChange` — puramente decorativo, sem handler nem backing (o `useAdminSearch` existe mas só é usado pelo próprio teste; o `CommandPalette` só é montado no shell público);
   - um botão de **Notificações** (sino) sem `onClick` — não há sistema de notificações;
   - um botão de **Ajuda** sem `onClick` — não há central de ajuda.

O botão "Sair" do sidebar (`onClick={logout}`) e os links de navegação já funcionavam; não foram alterados no comportamento.

## Escopo

### Incluído

- Novo componente `src/features/admin-shell/components/admin-mobile-drawer.tsx` (Radix Dialog) — drawer de navegação móvel acessível com **todos** os itens de `getDashboardNavItems(role)` + "Catálogo de cursos" + "Sair", fechando ao navegar, operável por teclado (Escape fecha; foco preso e restaurado pelo Radix Dialog).
- `dashboard-shell.tsx` passa a renderizar o drawer, controlado pelo mesmo estado do hambúrguer.
- `admin-topbar.tsx`: hambúrguer ganha `aria-controls` apontando para o id do drawer; **busca global inerte removida**; **Notificações e Ajuda marcados explicitamente como indisponíveis**.
- Testes de componente/integração (Vitest + Testing Library) em `src/__tests__/features/admin-shell/admin-mobile-navigation.test.tsx`.

### Fora do escopo

- Qualquer alteração de autenticação/autorização (HMAC em `src/lib/auth.ts` / `supabase/functions/_shared/auth.ts`; sessão SSR `src/lib/supabase/session.ts`; rotas de auth). **Intocados.**
- Construir sistema de notificações, central de ajuda ou busca global real (trabalho substancial fora de escopo — por FR-10, marcados indisponíveis em vez de fingidos).
- REC-308 (acessibilidade das jornadas públicas e varredura axe completa) — story separada que depende desta.

## Decisão por controle inerte (No Invention — Article IV / FR-10)

FR-10: "Controles apresentados ao usuário devem funcionar **ou** ser removidos/explicitamente marcados como indisponíveis." Decisão caso a caso:

| Controle | Estado anterior | Decisão | Justificativa |
|---|---|---|---|
| Hambúrguer móvel (`admin-topbar`) | Alternava estado morto; nada abria; sem `aria-controls` | **Implementado** | Contrato de estado já existia (`mobileOpened`/`toggle`); faltava apenas o drawer real. Conectado a um drawer acessível de verdade. |
| Itens de nav 6–9 no mobile (Inscrições, Instrutores, Blog, Configurações) | Inalcançáveis (barra inferior só mostra 5) | **Implementado** | O drawer expõe os 9 itens; a barra inferior segue como atalho aos 5 principais. Jornada crítica restaurada. |
| Busca global do topbar (`Input`) | `Input` sem `value`/`onChange`; sem backing | **Removido** | Inerte e enganoso ("enganosas" em FND-17). Cada página de recurso já tem busca real; um campo global falso confunde. Remoção é a opção FR-10 mais limpa. |
| Notificações (sino) | Botão sem `onClick` | **Marcado indisponível** | Não há sistema de notificações; construí-lo é trabalho substancial fora de escopo. `disabled` + `aria-disabled="true"` + `title`/`aria-label` "em breve" — honesto, sem implementação fake (evita reintroduzir o "falso sucesso" que REC-302 corrigiu). |
| Ajuda (`CircleHelp`) | Botão sem `onClick` | **Marcado indisponível** | Idem: sem central de ajuda; marcado `disabled` + `aria-disabled` + label "em breve". |

## Acceptance Criteria

- [x] **AC-306.01** — O menu móvel abre ao clicar no hambúrguer e renderiza um drawer real (antes não renderizava nada). Entrega mensurável da épica: "Menu móvel acessível."
- [x] **AC-306.02** — O drawer expõe **todos** os itens de `getDashboardNavItems(role)`, incluindo Inscrições, Instrutores, Blog e Configurações, que a barra inferior móvel não alcançava.
- [x] **AC-306.03** — O menu móvel é operável por teclado: fecha com Escape (foco preso e restaurado via Radix Dialog); itens navegáveis por Tab/Enter.
- [x] **AC-306.04** — O botão de toggle tem `aria-expanded` refletindo o estado e `aria-controls` apontando para o id do drawer (`admin-mobile-drawer`); o drawer tem rótulo acessível.
- [x] **AC-306.05** — Ações inertes resolvidas por FR-10: busca global inerte removida; Notificações e Ajuda marcadas `disabled` + `aria-disabled` + label "em breve" (nenhuma implementação fake).
- [x] **AC-306.06** — Navegar por um item do drawer fecha o menu; "Sair" executa `logout` e fecha o menu.
- [x] **AC-306.07** — Nenhum arquivo de autenticação (HMAC/SSR) foi tocado.
- [x] **AC-306.08** — Baseline constitucional verde: lint OK, typecheck OK, suíte agregada 684 → 694 (+10), sem regressão.

## File List

### Criados
- `src/features/admin-shell/components/admin-mobile-drawer.tsx` (drawer de navegação móvel acessível)
- `src/__tests__/features/admin-shell/admin-mobile-navigation.test.tsx` (+10 testes)
- `docs/stories/2026-07-17-rec-306-corrigir-navegacao-acoes-admin.md`
- `docs/history/reports/rec-306-corrigir-navegacao-acoes-admin-2026-07-17.md`
- `docs/qa/gates/rec-306-corrigir-navegacao-acoes-admin.yml`

### Modificados
- `src/features/admin-shell/dashboard-shell.tsx` (renderiza o drawer; expõe `open`/`close` do disclosure)
- `src/features/admin-shell/components/admin-topbar.tsx` (`aria-controls` no hambúrguer; remove busca global inerte e função `resolvePlaceholder`; marca Notificações/Ajuda indisponíveis)
- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md` (linha de status)

## Verificação

- `npm run lint` → OK
- `npm run typecheck` → OK
- `npx vitest run` → 64 arquivos, **694/694** (baseline 684 + 10 novos), sem regressão
- `npx vitest run src/__tests__/features/admin-shell/admin-mobile-navigation.test.tsx` → **10/10**

## Change Log

- 2026-07-17 — @dev: criado drawer móvel acessível, resolvidos controles inertes do topbar por FR-10, +10 testes; story concluída (Done), gate deixado PENDING para revisão humana de @qa.
