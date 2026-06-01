# Story: Implementar banco de dados Supabase

## Status
Ready for Review

## Contexto
O usuário solicitou análise do site atual contra as tabelas e relacionamentos propostos no diagrama anexado, ajustes no modelo quando necessário e conexão com Supabase.

## Acceptance Criteria
- [x] Analisar tabelas propostas contra os dados atuais do site.
- [x] Identificar ajustes necessários em relacionamentos e campos.
- [x] Criar migração Supabase versionada com tabelas, enums, FKs, constraints, índices e triggers.
- [x] Adicionar policies RLS para catálogo público, leads e inscrições.
- [x] Adicionar conexão Supabase no app Vite via variáveis de ambiente.
- [x] Carregar catálogo público do Supabase quando configurado, mantendo fallback em mocks locais.
- [x] Enviar leads e inscrições para o Supabase quando configurado.
- [x] Rodar quality gates disponíveis: lint/typecheck/test/build conforme scripts do projeto.

## Dev Notes
- O modelo adiciona `curso_instrutor` para representar curso com vários instrutores.
- `curso -> turma` foi modelado como 1:N.
- `aluno -> inscricao` foi modelado como 1:N, com cada inscrição pertencendo a um aluno e a uma turma.
- `avaliacao` referencia `inscricao` e `turma`, garantindo avaliação por aluno inscrito.
- Auditoria pagina a pagina refeita em 26/05/2026 contra o runtime Next ativo: as tabelas existentes cobrem catalogo, turmas, inscricoes, leads, avaliacao, certificados e pagamentos, mas ainda faltam `trilha` e `post_blog`, alem do envio estruturado de In Company/newsletter e alinhamento dos papeis de acesso.
- O resultado detalhado da auditoria e a ordem recomendada antes da carga manual estao em `docs/database/rh-cursos-schema-analysis.md`.
- Sem `.env` Supabase, o site continua usando mocks/localStorage.
- Verificacao em 26/05/2026: `npm run lint` passou com 7 warnings existentes de `<img>` em telas aprovadas.
- Verificacao em 26/05/2026: `npm run typecheck` passou.
- Verificacao em 26/05/2026: `npm test` passou, incluindo `next build` e 17 testes Playwright de rotas e autenticacao por papel.

## File List
- `.env.example`
- `package.json`
- `package-lock.json`
- `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/database.types.ts`
- `src/lib/supabase/mappers.ts`
- `src/lib/supabase/rh-cursos-api.ts`
- `src/lib/app-store.tsx`
- `src/vite-env.d.ts`
- `docs/database/rh-cursos-schema-analysis.md`
- `docs/stories/2026-05-12-supabase-database-implementation.md`
