# Story 15.6: Instrutores — Fidelidade Total Trust Keith

## Status
Done

## Epic
Épica 15 — Admin Dashboard: Fidelidade Total (Trust Keith)

## Story
**Como** administradora, **quero** uma visão de instrutores fiel ao canvas, **para** acompanhar especialidade, cursos, turmas ativas e situação.

## Acceptance Criteria
- [x] Cabeçalho “Instrutores”, resumo e “Novo instrutor” seguem `Admin — Instrutores`.
- [x] Desktop usa grade de cards com identidade, área, status, número de cursos/turmas e ação; mobile usa uma coluna.
- [x] Contagens são derivadas de cursos/turmas reais e o CRUD atual permanece acessível.
- [x] Cards usam tokens Trust Keith e semântica acessível.
- [x] Testes cobrem cards, contagens, ação e breakpoints.

## Tasks
- [x] Criar variante de apresentação para `instructors` reutilizando a configuração existente.
- [x] Preservar modal/validação CRUD.
- [x] Adicionar testes e executar gates.

## Dev Notes
- Fonte: canvas, tela `Admin — Instrutores`.
- ClickUp não sincronizado: conector indisponível.

## File List
- `src/views/admin/AdminResourcePage.tsx`
- `src/lib/admin-resource-configs.tsx`
- `src/__tests__/views/admin-resource-instructors-leads.test.tsx`

## Dev Agent Record

### Agent Model Used
Codex (GPT-5)

### Debug Log References
- `npm run test:unit -- --run src/__tests__/views/admin-resource-instructors-leads.test.tsx src/__tests__/lib/admin-resource-configs.test.ts src/__tests__/lib/csv-export.test.ts` — 30/30 testes aprovados.
- `npm run typecheck` — aprovado.
- `npx eslint src/views/admin/AdminResourcePage.tsx src/lib/admin-resource-configs.tsx src/__tests__/views/admin-resource-instructors-leads.test.tsx` — aprovado.
- `npm run test:unit` — 722/722 testes aprovados em 68 arquivos.

### Completion Notes List
- Grade responsiva de cards implementada em uma coluna no mobile, duas no desktop médio e três no desktop amplo.
- Contagens de cursos e turmas ativas derivadas das coleções reais, com ações de edição/exclusão e CRUD original preservados.
- Cards usam semântica `article`, lista descritiva para métricas e tokens Trust Keith.
- Reconciliação 18.3 (2026-07-19): waiver resolvido após execução em ambiente Supabase isolado; `npm run test:epic15:fidelity` passou 9/9 e os ACs foram reconciliados como aceitos. Status `Done` representa implementação e aceite formal.

### Change Log
- 2026-07-17: implementação e testes da apresentação fiel de instrutores concluídos.
