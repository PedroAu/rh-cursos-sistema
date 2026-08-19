# Story: Expandir conteúdo SEO de cursos e corrigir títulos públicos

## Status

Done

## Story

Como visitante e mecanismo de busca,
quero encontrar páginas de cursos com títulos claros e conteúdo programático mais completo,
para entender a oferta da RH Cursos e avaliar sua relevância.

## Acceptance Criteria

- [x] Os cinco cursos apontados no relatório recebem conteúdo editorial mais completo em objetivos, benefícios, módulos, destaques e FAQs.
- [x] Os títulos públicos com construção inadequada são corrigidos sem duplicar o prefixo de curso.
- [x] A migration é idempotente e evita substituir conteúdo editorial já mais completo.
- [x] Testes e validações do projeto passam.

## Tasks / Subtasks

- [x] Criar migration idempotente para os cinco cursos rasos.
- [x] Corrigir a normalização de títulos públicos e cobrir os casos com testes.
- [x] Executar lint, typecheck, testes unitários e build.

## Dev Agent Record

### Agent Model Used

GPT-5

### Completion Notes List

- Conteúdo editorial ampliado para ISO/IEC 20000-1, Redação Oficial, Tesouro Gerencial, Planilha de Preço IN 05/2017 e Relações Interpessoais.
- Títulos com construção inadequada corrigidos na migration e protegidos no helper público de SEO.
- A migration preserva conteúdo público que já tenha seis ou mais destaques/FAQs ou mais de cinco módulos.
- `npm run lint`, `npm run typecheck`, `npm run test:unit` e `npm run build` passaram.
- `npm test` passou com 184/184 testes em Supabase isolado, incluindo os fluxos públicos, admin, RBAC e baselines de acessibilidade/visual.
- `supabase db lint --linked --schema public --level error --fail-on error` passou; o dry-run de push ficou bloqueado por divergência de histórico remoto, sem aplicar alterações.

### File List

- `docs/stories/2026-08-12-seo-conteudo-cursos.md`
- `supabase/migrations/20260812090000_expand_seo_course_content.sql`
- `src/lib/seo.ts`
- `src/__tests__/lib/seo.test.ts`

### Change Log

| Data | Alteração |
| --- | --- |
| 2026-08-12 | Story criada para expansão de conteúdo e correção de títulos SEO. |
| 2026-08-12 | Migration editorial e normalização pública de títulos implementadas e validadas. |
| 2026-08-12 | Story fechada por @po (`*close-story`). Entrega rastreada no PR #13. |
| 2026-08-12 | PR #13 (feat(seo): JSON-LD de eventos na agenda + conteúdo editorial de cursos) aberto — https://github.com/PedroAu/rh-cursos-sistema/pull/13. Aguardando merge. |
