# Story 20.6 — Logo institucional e correção cromática da navegação lateral

## Status

Pending

## Epic

Épica 20 — Evolução Operacional do Admin Trust Keith

## História

**Como** administradora, **quero** ver a logo institucional no lugar do nome textual e uma navegação lateral fiel ao canvas, **para** reconhecer a marca e operar o painel com a hierarquia visual correta.

## Diagnóstico de origem

O canvas atualizado define a sidebar como superfície clara (`var(--tk-lightest-grey, #fafafa)`), com texto `var(--tk-ink)` e item ativo em `var(--tk-accent-soft)` + `var(--tk-brand)`. A shell atual preservou uma variação legada escura com valores hardcoded (`#0e4666`, `#ffe09b`, `#1c1c1c`) em `AdminSidebar`, `AdminMobileDrawer` e `AdminBottomNavigation`. A divergência observada vem dessa implementação legada, não de uma alteração recente nos tokens globais.

## Acceptance Criteria

- [ ] O texto “RH Cursos” da sidebar desktop e do drawer mobile é substituído pela logo horizontal institucional.
- [ ] A imagem usa asset existente e canônico do projeto, com `alt="RH Cursos"`, dimensões responsivas e sem distorção.
- [ ] A sidebar desktop segue a superfície clara do canvas (`tk-surface-2`), com borda e contraste adequados.
- [ ] Itens inativos, hover, grupos, item ativo, badges e ações inferiores usam tokens do design system; nenhum hex hardcoded permanece na shell.
- [ ] Drawer mobile e navegação inferior mantêm a mesma linguagem visual da sidebar desktop e continuam funcionais.
- [ ] O rótulo de papel (`admin`, `portal do aluno`, `portal do instrutor`) permanece visível junto à identidade.
- [ ] Testes visuais, acessibilidade, contraste e responsividade cobrem desktop e mobile sem regressão.

## Arquivos esperados

- `src/features/admin-shell/components/admin-sidebar.tsx`
- `src/features/admin-shell/components/admin-mobile-drawer.tsx`
- `src/features/admin-shell/components/admin-bottom-navigation.tsx`
- `public/images/brand/logo-horizontal.png`
- `tests/epic15-admin-dashboard-fidelity.spec.ts`
- `tests/epic20-admin-evolution.spec.ts`

## Evidência de referência

- Canvas: `/Users/pedroaugusto/Downloads/Site RH Cursos/RH Cursos Admin Dashboard.dc.html`, regras `.adm-side`, `.adm-item` e logo em `uploads/logoHorizontal_800X600.png`.
- Asset local candidato: `public/images/brand/logo-horizontal.png` (781×186, RGBA).
