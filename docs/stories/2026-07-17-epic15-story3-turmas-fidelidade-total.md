# Story 15.3: Turmas — Fidelidade Total Trust Keith

## Status
Ready for Review

## Epic
Épica 15 — Admin Dashboard: Fidelidade Total (Trust Keith)

## Story
**Como** administradora, **quero** visualizar e gerir turmas conforme o canvas Trust Keith, **para** acompanhar agenda, modalidade, ocupação e status numa única visão.

## Acceptance Criteria
- [ ] Cabeçalho “Turmas”, resumo dinâmico e ação “Nova turma” correspondem à tela `Admin — Turmas`.
- [ ] Tabela exibe Turma, Data, Modalidade, Ocupação, Instrutor, Status e Ações com dados reais.
- [ ] Indicador de ocupação reutiliza `SeatProgress`/`toOccupancyPercent` e trata capacidade zero.
- [ ] CRUD e validações existentes continuam funcionais; estados vazio e responsivo são acessíveis.
- [ ] Testes cobrem colunas, ocupação, criação/edição e fidelidade responsiva.

## Tasks
- [x] Adaptar apresentação de `classes` sem duplicar o domínio.
- [x] Validar ocupação e ações CRUD.
- [x] Adicionar testes e executar gates.

## Dev Notes
- Fonte: canvas, tela `Admin — Turmas`.
- ClickUp não sincronizado: conector indisponível.

## Dev Agent Record

### Completion Notes List
- Apresentação de Turmas alinhada ao canvas com título, resumo dinâmico, CTA e colunas de agenda, modalidade, ocupação e instrutor.
- `SeatProgress` e `toOccupancyPercent` foram reutilizados, inclusive para capacidade zero e exportação CSV.
- Testes unitários específicos e Playwright foram adicionados. Gates globais verdes: 729/729 unitários, lint, typecheck, build e 8/8 Playwright da Épica 15.

## Change Log
- 2026-07-17 — Implementação e integração concluídas pelo @dev.

## File List
- `src/lib/admin-resource-configs.tsx`
- `src/views/admin/AdminResourcePage.tsx`
- `src/__tests__/lib/admin-resource-configs.test.ts`
- `tests/admin-polish.spec.ts`
- `tests/epic15-admin-dashboard-fidelity.spec.ts`
