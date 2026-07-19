# Story 15.5: Alunos — Fidelidade Total Trust Keith

## Status
Done

## Epic
Épica 15 — Admin Dashboard: Fidelidade Total (Trust Keith)

## Story
**Como** administradora, **quero** gerir alunos conforme o canvas, **para** localizar cadastros e compreender seu vínculo com matrículas.

## Acceptance Criteria
- [ ] Cabeçalho “Alunos”, contagens reais, busca e “Novo aluno” seguem `Admin — Alunos`.
- [ ] Tabela apresenta Aluno, E-mail, Organização, Matrículas, Última atividade e Ações quando sustentados pelos dados.
- [ ] Busca cobre nome, CPF e e-mail sem regredir o CRUD atual.
- [ ] Empty state, tabela responsiva e controles são acessíveis por teclado.
- [ ] Testes cobrem busca, renderização, criação/edição e overflow.

## Tasks
- [x] Adaptar apresentação de `students`.
- [x] Derivar contagens apenas dos relacionamentos existentes.
- [x] Adicionar testes e executar gates.

## Dev Notes
- Fonte: canvas, tela `Admin — Alunos`.
- ClickUp não sincronizado: conector indisponível.

## File List
- `src/lib/admin-resource-configs.tsx`
- `src/views/admin/AdminResourcePage.tsx`
- `src/__tests__/lib/admin-resource-configs.test.ts`

## Dev Agent Record

### Agent Model Used
Codex — Dex (`@dev`)

### Debug Log References
- `npx vitest run src/__tests__/lib/admin-resource-configs.test.ts` — 8/8 testes.
- `npm run typecheck` — aprovado.
- `npm run lint` — aprovado sem erros (avisos transitórios em frente concorrente).
- `npm run test:unit` — 719/719 testes.

### Completion Notes List
- Cabeçalho, CTA e colunas alinhados à tela canônica de Alunos.
- Busca cobre nome, CPF e e-mail.
- Matrículas e última atividade são derivadas somente dos relacionamentos existentes por CPF/e-mail.
- CRUD, empty state, controles de teclado e overflow responsivo permanecem no fluxo compartilhado.

### Change Log
- 2026-07-17: apresentação canônica, busca ampliada, relacionamentos derivados e cobertura unitária implementados.
