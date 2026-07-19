# Story 15.7: Leads — Fidelidade Total Trust Keith

## Status
Done

## Epic
Épica 15 — Admin Dashboard: Fidelidade Total (Trust Keith)

## Story
**Como** administradora comercial, **quero** filtrar e operar leads conforme o canvas, **para** priorizar contatos sem perder contexto de origem e interesse.

## Acceptance Criteria
- [ ] Cabeçalho “Leads” mostra contagem de 30 dias e aguardando contato com dados reais.
- [ ] Chips de origem acessíveis filtram a tabela e expõem `aria-pressed`.
- [ ] Tabela apresenta Lead, Contato, Origem, Interesse, Recebido, Status e Ações.
- [ ] Exportação CSV neutralizada, CRUD e estados vazios continuam funcionais.
- [ ] Testes cobrem corte de 30 dias, chips, exportação, empty state e responsividade.

## Tasks
- [x] Reutilizar os builders de origem da Story 15.1 quando aplicável.
- [x] Adaptar a apresentação de `leads` e preservar CRUD.
- [x] Adicionar testes e executar gates.

## Dev Notes
- Fonte: canvas, tela `Admin — Leads`.
- ClickUp não sincronizado: conector indisponível.

## File List
- `src/views/admin/AdminResourcePage.tsx`
- `src/lib/admin-resource-configs.tsx`
- `src/__tests__/views/admin-resource-instructors-leads.test.tsx`
- `src/__tests__/lib/csv-export.test.ts` (gate de regressão executado)

## Dev Agent Record

### Agent Model Used
Codex (GPT-5)

### Debug Log References
- `npm run test:unit -- --run src/__tests__/views/admin-resource-instructors-leads.test.tsx src/__tests__/lib/admin-resource-configs.test.ts src/__tests__/lib/csv-export.test.ts` — 30/30 testes aprovados.
- `npm run typecheck` — aprovado.
- `npx eslint src/views/admin/AdminResourcePage.tsx src/lib/admin-resource-configs.tsx src/__tests__/views/admin-resource-instructors-leads.test.tsx` — aprovado.
- `npm run test:unit` — 722/722 testes aprovados em 68 arquivos.

### Completion Notes List
- Métricas calculadas com dados reais: recebidos nos últimos 30 dias e leads com status Novo aguardando contato.
- Chips de origem com `aria-pressed`, grupo acessível e filtro aplicado à tabela e à exportação.
- Colunas do canvas, estado vazio, CRUD e neutralização de fórmulas CSV preservados.

### Change Log
- 2026-07-17: implementação e testes da apresentação fiel de leads concluídos.
