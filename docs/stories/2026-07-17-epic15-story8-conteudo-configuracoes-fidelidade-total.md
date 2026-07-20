# Story 15.8: Blog, Páginas e Configurações — Fidelidade Total Trust Keith

## Status
Done

## Epic
Épica 15 — Admin Dashboard: Fidelidade Total (Trust Keith)

## Story
**Como** administradora, **quero** gerir conteúdo institucional e preferências em telas fiéis ao canvas, **para** manter a presença digital e a operação com uma linguagem única.

## Acceptance Criteria
- [x] Blog segue `Admin — Blog`, preservando CRUD, autor, status, atualização e ações.
- [x] Rota `Páginas do site` existe, lista somente páginas reais conhecidas e não oferece edição falsa.
- [x] Configurações segue o grid do canvas com Dados da empresa, Notificações e Equipe de acesso.
- [x] Persistência local existente é mantida; nenhuma integração ou permissão inexistente é simulada.
- [x] Navegação lateral inclui Páginas e todos os grupos/itens do canvas sem quebrar o mobile drawer.
- [x] Testes cobrem as três telas, navegação, persistência, acessibilidade e responsividade.

## Tasks
- [x] Adaptar Blog e Configurações.
- [x] Criar rota read-only de Páginas com dados canônicos do produto.
- [x] Alinhar navegação desktop/mobile.
- [x] Adicionar testes e executar todos os gates da épica.

## Dev Notes
- Fontes: telas `Admin — Blog`, `Admin — Páginas` e `Admin — Configurações` do canvas.
- Article IV: ações sem backend devem ser omitidas ou marcadas indisponíveis.
- ClickUp não sincronizado: conector indisponível.

## Dev Agent Record

- Blog preserva CRUD e ganhou busca, metadados e colunas canônicos.
- `/admin/paginas` lista nove rotas públicas reais em modo somente leitura e usa cards responsivos no mobile.
- Configurações preserva `rhc:admin-settings` e remove integrações/permissões simuladas.
- Navegação desktop/drawer agrupada e sincronizada; gate WCAG 2.1 A/AA da tela Páginas verde.
- Gates globais: lint, typecheck, 729/729 unitários, build, purge, bundle e 8/8 Playwright verdes.
- Reconciliação 18.3 (2026-07-19): waiver resolvido após execução em ambiente Supabase isolado; `npm run test:epic15:fidelity` passou 9/9 e os ACs foram reconciliados como aceitos. Status `Done` representa implementação e aceite formal.

## File List
- `app/admin/paginas/page.tsx`
- `src/features/admin/pages/admin-pages-page.tsx`
- `src/features/admin/pages/model/site-pages.ts`
- `src/views/admin/AdminSettingsPage.tsx`
- `src/features/admin-shell/config/admin-navigation.ts`
- `src/features/admin-shell/components/admin-sidebar.tsx`
- `src/features/admin-shell/components/admin-mobile-drawer.tsx`
- `src/lib/admin-resource-configs.tsx`
- `src/__tests__/features/admin-pages/admin-pages-page.test.tsx`
- `src/__tests__/views/admin-settings-page.test.tsx`
- `src/__tests__/features/admin-shell/admin-mobile-navigation.test.tsx`
- `tests/epic15-blog-pages.spec.ts`
- `package.json`

## Change Log
- 2026-07-17 — Implementação e integração concluídas pelo @dev.
- 2026-07-19 — Fechamento formal via `*close-story` @po: gate PASS 100/100 (docs/qa/gates/epic15-complete-fidelity.yml) confirmado, commit 1f4980e verificado em main, lint/typecheck/build reverificados sem regressão. Status promovido para Done.
