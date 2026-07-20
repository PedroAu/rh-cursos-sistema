# Story 15.4: Matrículas — Fidelidade Total Trust Keith

## Status
Done

## Epic
Épica 15 — Admin Dashboard: Fidelidade Total (Trust Keith)

## Story
**Como** administradora, **quero** operar matrículas em uma lista fiel ao canvas, **para** acompanhar aluno, turma, data, pagamento, valor e situação operacional.

## Acceptance Criteria
- [x] Tela usa o título “Matrículas”, resumo dinâmico e filtros coerentes com `Admin — Matrículas`.
- [x] Tabela apresenta Aluno, Turma, Inscrição, Pagamento, Valor e Ações usando dados reais disponíveis.
- [x] Nenhum estado financeiro é inventado; ausências aparecem como informação indisponível.
- [x] CRUD/atualização de status, validação e exportação existentes permanecem funcionais.
- [x] Testes cobrem renderização, filtro, status, empty state e responsividade.

## Tasks
- [x] Adaptar apresentação de `enrollments`.
- [x] Mapear campos financeiros somente quando sustentados pelo modelo.
- [x] Adicionar testes e executar gates.

## Dev Notes
- Article IV: o canvas é visual; contratos inexistentes não serão fabricados.
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
- Título, resumo, CTA e tabela alinhados à tela canônica de Matrículas.
- Valor é derivado exclusivamente do preço existente da turma ou curso; ausência resulta em “Informação indisponível”.
- CRUD, atualização de status, validações e exportação permanecem no fluxo compartilhado.
- Reconciliação 18.3 (2026-07-19): waiver resolvido após execução em ambiente Supabase isolado; `npm run test:epic15:fidelity` passou 9/9 e os ACs foram reconciliados como aceitos. Status `Done` representa implementação e aceite formal.

### Change Log
- 2026-07-17: apresentação canônica, busca ampliada, dados financeiros seguros e cobertura unitária implementados.
