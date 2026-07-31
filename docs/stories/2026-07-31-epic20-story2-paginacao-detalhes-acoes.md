# Story 20.2 — Paginação, detalhes e ações das páginas de recursos

## Status

Done

## Epic

Épica 20 — Evolução Operacional do Admin Trust Keith

## História

**Como** administradora, **quero** paginar, abrir detalhes e operar cada registro, **para** trabalhar com listas administrativas grandes sem perder o CRUD atual.

## Acceptance Criteria

- [x] Cursos, turmas, matrículas, alunos, instrutores, leads e blog têm paginação de 5/10/25.
- [x] Busca e filtro resetam para a primeira página.
- [x] Cada linha tem ação acessível de detalhe/edição e exclusão confirmada.
- [x] O detalhe usa dados reais do registro selecionado e permite voltar à lista.
- [x] Estados vazio, erro, carregamento e exportação permanecem funcionais.
- [x] Testes unitários/componentes cobrem paginação, detalhe e confirmação de exclusão.

## Arquivos esperados

- `src/views/admin/AdminResourcePage.tsx`
- `src/lib/admin-resource-configs.tsx`
- `src/components/admin/`
- `src/__tests__/`

## Evidência

- `tests/epic20-admin-evolution.spec.ts` — paginação, busca, detalhe e retorno.
- `src/__tests__/views/admin-resource-instructors-leads.test.tsx` — paginação e confirmação de exclusão.
- `npm run test:unit` — 768 testes aprovados.
