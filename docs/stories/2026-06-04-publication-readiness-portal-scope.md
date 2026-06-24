# Story: Revisar prontidao de publicacao e remover portal aluno/instrutor

## Status
Done

## Contexto
O site deve ser publicado hoje com foco em apresentar cursos, consultoria e servicos da RH Cursos, facilitar a geracao de leads e manter um painel admin para administrar cursos, turmas, datas, leads e informacoes do site. O portal do aluno e do instrutor fica fora do escopo desta publicacao e sera implementado depois.

## Acceptance Criteria
- [x] Remover exposicao publica do portal do aluno e do instrutor.
- [x] Manter login e protecao apenas para o painel admin.
- [x] Preservar administracao de cursos, turmas, leads, inscricoes, alunos e instrutores.
- [x] Verificar rotas principais do site para publicacao.
- [x] Remover arquivos e configuracoes legadas de deploy via FTP do repositorio.
- [x] Rodar `npm run lint`.
- [x] Rodar `npm run typecheck`.
- [x] Rodar `npm test`.

## Dev Notes
- O cadastro/inscricao publica continua podendo coletar dados do participante.
- "Aluno" e "Instrutor" continuam como entidades administrativas, mas nao como portais autenticados.
- O setup local continua em Node.js + Next.js + React com `npm run dev`, usando `.env.local` como arquivo operacional; `.env`, `.env.security` e backups locais sairam do fluxo.
- O deploy atual ficou dividido entre Cloudflare Pages para o frontend estatico e GitHub Actions + Supabase CLI para as Edge Functions.
- Os formulários públicos passaram a depender do retorno real das Edge Functions; a UI não confirma mais lead/inscrição quando o backend falha.
- A validação de inscrição foi alinhada com os IDs textuais do banco (`varchar(80)`), eliminando a rejeição incorreta por UUID.
- O modal de CRUD admin foi padronizado com shell responsivo, corpo scrollavel e grid consistente para reduzir variacao visual entre formularios curtos e longos.
- Modais e containers secundários receberam ajustes de responsividade para evitar clipping, compressao horizontal e listas inacessiveis em viewports menores.
- Alturas fixas em graficos, cards e hero foram substituidas por proporcoes/responsividade para reduzir cortes e saltos visuais entre breakpoints.
- O detalhe de curso ganhou rota estatica auxiliar (`/curso?slug=`) para evitar 404 em cursos exibidos pelo store durante o export estatico.
- O CRUD de turmas passou a separar vagas preenchidas manualmente da contagem derivada das inscricoes, evitando divergencia entre admin e site.
- O cadastro administrativo de instrutores/professores foi ampliado com foto, formacao, modalidades, publico-alvo, categorias e cursos destaque; os campos legados `tipo_publico` e `areas_atuacao` foram removidos do contrato atual.

## File List
- `.claude/settings.json`
- `.env.example`
- `.github/workflows/deploy-frontend.yml`
- `.github/workflows/deploy-functions.yml`
- `app/api/auth/session/route.ts`
- `package.json`
- `playwright.config.ts`
- `middleware.ts`
- `src/lib/auth.ts`
- `src/lib/app-store.tsx`
- `src/lib/admin-resource-configs.tsx`
- `src/components/ui/dialog.tsx`
- `src/lib/supabase/functions-client.ts`
- `src/types/index.ts`
- `src/lib/validation.ts`
- `src/components/checkout/checkout-modal.tsx`
- `src/views/public/Login.tsx`
- `src/views/public/Contact.tsx`
- `src/views/public/InCompany.tsx`
- `src/views/public/Blog.tsx`
- `src/components/layout/public-layout.tsx`
- `src/components/common/command-palette.tsx`
- `src/components/layout/dashboard-shell.tsx`
- `src/components/next-page-shell.tsx`
- `src/views/admin/AdminResourcePage.tsx`
- `src/components/courses/course-card.tsx`
- `src/components/blog/blog-card.tsx`
- `src/views/public/Home.tsx`
- `src/views/public/CourseDetail.tsx`
- `src/views/public/EnrollmentSuccess.tsx`
- `scripts/promote-admin.js`
- `scripts/seed-admin.js`
- `supabase/config.toml`
- `supabase/functions/_shared/auth.ts`
- `supabase/functions/_shared/validation.ts`
- `supabase/functions/leads/index.ts`
- `tests/route-auth.spec.ts`
- `src/components/agenda/class-card.tsx`
- `src/lib/admin-form-validation.ts`
- `src/lib/supabase/database.types.ts`
- `src/lib/supabase/mappers.ts`
- `src/lib/supabase/rh-cursos-api.ts`
- `src/views/public/BlogPost.tsx`
- `supabase/functions/_shared/admin-mappers.ts`
- `supabase/functions/_shared/admin-validation.ts`
- `supabase/migrations/20260605000000_seed_initial_data.sql`
- `supabase/migrations/20260609120000_remove_legacy_course_instructor_fields.sql`
- `supabase/sql/create_all_rh_cursos_schema.sql`
- `supabase/sql/seed_rh_cursos_demo.sql`

## QA Results

Pass — encerramento documental em 2026-06-24. Story mantida como concluída; itens legados da file list foram superados por limpeza posterior de runtime/deploy, sem evidência de gap funcional aberto.
