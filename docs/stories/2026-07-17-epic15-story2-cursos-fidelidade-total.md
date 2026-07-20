# Story 15.2: Cursos — Fidelidade Total Trust Keith

## Status
Done

## Epic
Épica 15 — Admin Dashboard: Fidelidade Total (Trust Keith)

## Story
**Como** administradora, **quero** gerir cursos em uma tela fiel ao canvas Trust Keith, **para** operar o catálogo com clareza sem perder o CRUD existente.

## Acceptance Criteria
- [x] Cabeçalho “Cursos”, resumo dinâmico, busca e ação “Novo curso” seguem a tela `Admin — Cursos` do canvas canônico.
- [x] Tabela apresenta Curso, Categoria, Modalidade, Carga horária, Turmas ativas, Status e Ações com dados reais.
- [x] CRUD, validação, exportação e atalhos existentes permanecem funcionais.
- [x] Layout responsivo, teclado, estados vazio/erro e tokens `--tk-*` são preservados.
- [x] Testes unitários e Playwright cobrem conteúdo, busca, ação primária e ausência de overflow.

## Tasks
- [x] Adaptar configuração e apresentação de `courses`.
- [x] Validar modal de criação/edição e exportação CSV.
- [x] Adicionar testes e executar gates da épica.

## Dev Notes
- Fonte visual: `docs/design-system/RH Cursos Admin Dashboard.dc.html`, tela `Admin — Cursos`.
- Reutilizar `AdminResourcePage` e `buildResourceConfig`; não criar segunda camada CRUD.
- ClickUp não sincronizado: conector indisponível nesta sessão.

## Dev Agent Record

### Completion Notes List
- Apresentação de Cursos alinhada ao canvas com título, resumo dinâmico, CTA, busca por curso/categoria e colunas canônicas.
- CRUD compartilhado foi preservado; exportação ganhou valores textuais para as novas colunas.
- Testes unitários específicos e Playwright foram adicionados. Gates globais verdes: 729/729 unitários, lint, typecheck, build e 8/8 Playwright da Épica 15.
- Reconciliação 18.3 (2026-07-19): waiver resolvido após execução em ambiente Supabase isolado; `npm run test:epic15:fidelity` passou 9/9 e os ACs foram reconciliados como aceitos. Status `Done` representa implementação e aceite formal.

## Change Log
- 2026-07-17 — Implementação e integração concluídas pelo @dev.
- 2026-07-19 — Fechamento formal via `*close-story` @po: gate PASS 100/100 (docs/qa/gates/epic15-complete-fidelity.yml) confirmado, commit 1f4980e verificado em main, lint/typecheck/build reverificados sem regressão. Status promovido para Done.

## File List
- `src/lib/admin-resource-configs.tsx`
- `src/views/admin/AdminResourcePage.tsx`
- `src/__tests__/lib/admin-resource-configs.test.ts`
- `tests/admin-polish.spec.ts`
- `tests/epic15-admin-dashboard-fidelity.spec.ts`
