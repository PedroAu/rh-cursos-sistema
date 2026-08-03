# Story 20.6 — Logo institucional e correção cromática da navegação lateral

## Status

Done

## Epic

Épica 20 — Evolução Operacional do Admin Trust Keith

## História

**Como** administradora, **quero** ver a logo institucional no lugar do nome textual e uma navegação lateral fiel ao canvas, **para** reconhecer a marca e operar o painel com a hierarquia visual correta.

## Diagnóstico de origem

O canvas atualizado define a sidebar como superfície clara (`var(--tk-lightest-grey, #fafafa)`), com texto `var(--tk-ink)` e item ativo em `var(--tk-accent-soft)` + `var(--tk-brand)`. A shell atual preservou uma variação legada escura com valores hardcoded (`#0e4666`, `#ffe09b`, `#1c1c1c`) em `AdminSidebar`, `AdminMobileDrawer` e `AdminBottomNavigation`. A divergência observada vem dessa implementação legada, não de uma alteração recente nos tokens globais.

## Acceptance Criteria

- [x] O texto “RH Cursos” da sidebar desktop e do drawer mobile é substituído pela logo horizontal institucional.
- [x] A imagem usa asset existente e canônico do projeto, com `alt="RH Cursos"`, dimensões responsivas e sem distorção.
- [x] A sidebar desktop segue a superfície clara do canvas (`tk-surface-2`), com borda e contraste adequados.
- [x] Itens inativos, hover, grupos, item ativo, badges e ações inferiores usam tokens do design system; nenhum hex hardcoded permanece na shell.
- [x] Drawer mobile e navegação inferior mantêm a mesma linguagem visual da sidebar desktop e continuam funcionais.
- [x] O rótulo de papel (`admin`, `portal do aluno`, `portal do instrutor`) permanece visível junto à identidade.
- [x] Testes visuais, acessibilidade, contraste e responsividade cobrem desktop e mobile sem regressão.

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

## Evidência de implementação

- `src/features/admin-shell/components/admin-sidebar.tsx` — logo, superfície clara e estados tokenizados.
- `src/features/admin-shell/components/admin-mobile-drawer.tsx` — logo e paleta alinhadas no drawer.
- `src/features/admin-shell/components/admin-bottom-navigation.tsx` — navegação inferior com tokens claros.
- `src/features/admin-shell/components/admin-topbar.tsx` — borda/topbar sem hex hardcoded.
- `tests/epic20-admin-evolution.spec.ts` — cobertura desktop/mobile da logo e paleta.
- `src/__tests__/features/admin-shell/admin-mobile-navigation.test.tsx` — logo no drawer e regressões de navegação.
- `npm run typecheck`, `npm run lint`, unit targeted e E2E Story 20.6 (3/3): aprovados.
- Regressão Epic 15: 10/10; a11y: 9/9; visual: 8/8; build, bundle, purge, CSS e design-system: aprovados.
- O agregado `npm test` foi executado duas vezes; os testes da Story 20.6 passaram, mas a suíte compartilhada apresentou falhas externas/intermitentes de fixtures CRUD e HTTP 502 em mutação de inscrições (182–183/184). Essas falhas não apontam para a shell alterada e devem ser revalidadas no ambiente E2E isolado antes do deploy.
