# Story: Dados estruturados de eventos na agenda pública

## Status

Done

## Story

Como mecanismo de busca,
quero interpretar cada turma futura da agenda como um evento com data, modalidade e local,
para apresentar a oferta pública da RH Cursos com contexto suficiente.

## Acceptance Criteria

- [x] A rota `/agenda` emite JSON-LD `Event` para turmas públicas não encerradas e futuras.
- [x] Cada evento informa curso, datas, modalidade, local ou ambiente virtual, organizador e URL pública.
- [x] Turmas encerradas, cursos inexistentes e dados privados não entram no schema.
- [x] Existe teste unitário para modalidades e filtro de turmas.
- [x] Lint, typecheck, testes unitários e build passam.

## Tasks / Subtasks

- [x] Criar builder de eventos na camada SEO.
- [x] Renderizar o JSON-LD da agenda no Server Component.
- [x] Adicionar testes e validar o projeto.

## Dev Agent Record

### Agent Model Used

GPT-5

### Completion Notes List

- A agenda agora publica eventos futuros com `Event`, modalidade presencial/online/híbrida, datas, local ou ambiente virtual, organizador, URL e oferta.
- O filtro exclui turmas encerradas, passadas e referências de curso inexistentes.
- `npm run lint`, `npm run typecheck`, `npm run test:unit` (796 testes) e `npm run build` passaram.
- `npm test` passou com 184/184 testes em Supabase isolado após a inclusão do JSON-LD na rota `/agenda`.

### File List

- `docs/stories/2026-08-12-event-jsonld-agenda.md`
- `app/agenda/page.tsx`
- `src/lib/seo.ts`
- `src/__tests__/lib/seo.test.ts`

### Change Log

| Data | Alteração |
| --- | --- |
| 2026-08-12 | Story criada para dados estruturados de eventos na agenda pública. |
| 2026-08-12 | JSON-LD de eventos implementado, testado e validado em build. |
| 2026-08-12 | Story fechada por @po (`*close-story`). Entrega rastreada no PR #13. |
| 2026-08-12 | PR #13 (feat(seo): JSON-LD de eventos na agenda + conteúdo editorial de cursos) aberto — https://github.com/PedroAu/rh-cursos-sistema/pull/13. Aguardando merge. |
