# Story: Implementar banco de dados Supabase

## Status
Done

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
- Auditoria pagina a pagina refeita em 26/05/2026 contra o runtime Next ativo: as tabelas existentes cobriam catalogo, turmas, inscricoes, leads, avaliacao, certificados e pagamentos; a migration `20260604164120_content_access_alignment.sql` adiciona `trilha`, `post_blog`, campos estruturados de In Company/newsletter e roles `student`/`instructor`/`admin`.
- O resultado detalhado da auditoria e a ordem recomendada antes da carga manual estao em `docs/database/rh-cursos-schema-analysis.md`.
- Tentativa de aplicacao remota em 04/06/2026 bloqueada porque `hwpsrujkxjhmmwphqdlz.supabase.co` e `db.hwpsrujkxjhmmwphqdlz.supabase.co` nao resolveram DNS nesta maquina; a migration local esta pronta para executar quando a connection string correta estiver disponivel.
- Sem `.env` Supabase, o site continua usando mocks/localStorage; para escrita administrativa remota, configurar `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor.
- Em 04/06/2026, o CRUD administrativo passou a persistir via `/api/admin/resources` para cursos, turmas, alunos, leads, inscricoes, instrutores e blog, mantendo fallback local.
- Em 04/06/2026, migrations e SQL consolidado foram alinhados para IDs textuais estaveis usados pelo seed demo (`course-dp-1`, `inst-1`, `class-1-1`, etc.).
- Em 04/06/2026, a recomendacao Supabase para Data API foi aplicada: grants explicitos junto das policies RLS, com escrita admin limitada por `public.is_admin()` e `service_role` reservado ao servidor.
- Em 04/06/2026, os SQL foram revisados contra o ajuste administrativo: policies publicas de `turma` e `curso_instrutor` agora respeitam soft delete/status de cursos e instrutores, e `EXECUTE` foi revogado por padrao em funcoes publicas com grants explicitos apenas para RPC publica e `is_admin()`.
- Em 04/06/2026, a validacao local das migrations corrigiu a conversao de `instrutor.status` para `status_instrutor`, removendo o default antigo e recriando a policy dependente antes/depois do `alter column type`.
- Verificacao em 26/05/2026: `npm run lint` passou com 7 warnings existentes de `<img>` em telas aprovadas.
- Verificacao em 26/05/2026: `npm run typecheck` passou.
- Verificacao em 26/05/2026: `npm test` passou, incluindo `next build` e 17 testes Playwright de rotas e autenticacao por papel.
- Verificacao em 04/06/2026: `npm run lint` passou com 6 warnings existentes de `<img>`.
- Verificacao em 04/06/2026: `npm run typecheck` passou.
- Verificacao em 04/06/2026: `npm test` passou, incluindo `next build` e 16 testes Playwright.
- Verificacao em 04/06/2026: migrations completas + `seed_rh_cursos_demo.sql` passaram em Postgres temporario local.
- Verificacao em 04/06/2026: `create_all_rh_cursos_schema.sql` + `seed_rh_cursos_demo.sql` passaram em Postgres temporario local.

## File List
- `.env.example`
- `package.json`
- `package-lock.json`
- `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`
- `supabase/migrations/20260513100000_sprint1_security.sql`
- `supabase/migrations/20260513200000_sprint2_integrity.sql`
- `supabase/migrations/20260513300000_sprint3_performance.sql`
- `supabase/migrations/20260513400000_sprint4_evolution.sql`
- `supabase/migrations/20260604164120_content_access_alignment.sql`
- `supabase/migrations/20260623144035_rbac_authorization_helpers.sql`
- `supabase/sql/create_all_rh_cursos_schema.sql`
- `supabase/sql/seed_rh_cursos_demo.sql`
- `app/api/admin/resources/route.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/supabase/admin-resources.ts`
- `src/lib/supabase/database.types.ts`
- `src/lib/supabase/mappers.ts`
- `src/lib/supabase/rh-cursos-api.ts`
- `src/lib/app-store.tsx`
- `app/blog/[slug]/page.tsx`
- `app/cursos/[slug]/page.tsx`
- `src/types/index.ts`
- `src/views/public/Blog.tsx`
- `src/views/public/InCompany.tsx`
- `docs/database/rh-cursos-schema-analysis.md`
- `docs/stories/2026-05-12-supabase-database-implementation.md`
