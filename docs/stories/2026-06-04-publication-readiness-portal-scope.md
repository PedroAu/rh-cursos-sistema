# Story: Revisar prontidao de publicacao e remover portal aluno/instrutor

## Status
Ready for Review

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

## File List
- `.claude/settings.json`
- `.env`
- `.env.backup-20260608`
- `.env.example`
- `.env.security`
- `.github/DEPLOY.md`
- `.github/workflows/deploy-frontend.yml`
- `.github/workflows/deploy-functions.yml`
- `DEPLOY-HYBRID.md`
- `DEPLOY-STATIC.md`
- `DEPLOYMENT.md`
- `SETUP-PROD.md`
- `app/aluno/page.tsx`
- `app/instrutor/page.tsx`
- `app/api/auth/session/route.ts`
- `package.json`
- `playwright.config.ts`
- `proxy.ts`
- `src/components/admin/admin-guard.tsx`
- `src/lib/auth.ts`
- `src/lib/app-store.tsx`
- `src/lib/admin-resource-configs.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/sheet.tsx`
- `src/lib/supabase/functions-client.ts`
- `src/types/index.ts`
- `src/lib/validation.ts`
- `src/data/mockAccess.ts`
- `src/data/mockCourses.ts`
- `src/data/mockClasses.ts`
- `src/components/checkout/checkout-modal.tsx`
- `src/views/public/Login.tsx`
- `src/views/public/Contact.tsx`
- `src/views/public/InCompany.tsx`
- `src/views/public/Blog.tsx`
- `src/views/student/StudentDashboard.tsx`
- `src/views/instructor/InstructorDashboard.tsx`
- `src/components/layout/public-layout.tsx`
- `src/components/common/command-palette.tsx`
- `src/components/admin/data-table.tsx`
- `src/components/admin/chart-card.tsx`
- `src/components/layout/dashboard-shell.tsx`
- `src/components/next-page-shell.tsx`
- `src/views/admin/AdminResourcePage.tsx`
- `src/components/courses/course-card.tsx`
- `src/components/blog/blog-card.tsx`
- `src/views/public/Home.tsx`
- `src/views/public/CourseDetail.tsx`
- `src/views/public/EnrollmentSuccess.tsx`
- `src/components/common/faq-accordion.tsx`
- `scripts/promote-admin.js`
- `scripts/seed-admin.js`
- `scripts/setup-prod.sh`
- `supabase/config.toml`
- `supabase/functions/_shared/auth.ts`
- `supabase/functions/_shared/validation.ts`
- `supabase/functions/leads/index.ts`
- `tests/route-auth.spec.ts`
