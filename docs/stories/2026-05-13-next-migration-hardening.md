# Story: Migrar aplicação ativa para Next.js e corrigir achados técnicos

## Status
Ready for Review

## Contexto
O diagnóstico técnico identificou que o app ativo era Vite/React em `src/`, enquanto existia uma árvore Next paralela em `app/`. O usuário solicitou migrar para Next.js e executar as correções dos achados principais: duplicidade de arquitetura, proteção de rotas, bundle grande, higiene de repositório, autenticação demo e integração Supabase.

## Acceptance Criteria
- [x] Tornar Next.js o runtime oficial do projeto.
- [x] Atualizar scripts para `next dev`, `next build`, `next start`, `typecheck` e `test`.
- [x] Arquivar a árvore Vite como legado fora do build ativo.
- [x] Converter a navegação ativa para rotas reais do Next App Router sem trocar o visual aprovado.
- [x] Adicionar ESLint real para Next.js.
- [x] Adicionar testes de rota/autenticação com Playwright.
- [x] Atualizar TypeScript, Tailwind e alias `@/` para a estrutura Next.
- [x] Proteger `/admin`, `/aluno` e `/instrutor` com Proxy/Middleware e sessão assinada por cookie HTTP-only.
- [x] Substituir links diretos de login por rota server-side de sessão com Supabase Auth quando configurado e fallback demo.
- [x] Adicionar logout por rota server-side nos dashboards.
- [x] Adicionar rota de instrutor no app Next.
- [x] Conectar formulários de Contato e In Company a rota API que grava lead no Supabase quando configurado.
- [x] Enviar inscrições públicas por rota API server-side.
- [x] Adicionar SSG/metadados para páginas dinâmicas de cursos e blog sem alterar componentes visuais.
- [x] Atualizar variáveis de ambiente públicas para padrão Next (`NEXT_PUBLIC_*`).
- [x] Atualizar `.gitignore` para `.next/`, `out/` e `*.tsbuildinfo`.
- [x] Reduzir dependências removendo Vite e React Router do runtime ativo.
- [x] Ocultar os códigos internos `T01` a `T06` das trilhas nas páginas públicas.
- [x] Rodar quality gates disponíveis.

## Dev Notes
- Correção pós-feedback: a primeira migração usou a árvore Next paralela antiga e perdeu a experiência visual aprovada. A correção restaurou a versão aprovada de `legacy/vite/src` como fonte ativa em `src/`.
- O app ativo agora é a versão aprovada em `src/`, renderizada por páginas reais do Next App Router em `app/`.
- O catch-all `app/[[...slug]]/page.tsx` foi removido; cada rota pública e privada possui seu próprio `page.tsx`.
- `src/lib/router-compat.tsx` preserva a API usada pelas telas aprovadas (`Link`, `NavLink`, `useNavigate`, `useParams`, `useSearchParams`) sobre `next/link` e `next/navigation`.
- `src/components/next-page-shell.tsx` centraliza `AppStoreProvider`, layouts aprovados e `Suspense` exigido pelo Next 16 para query strings.
- A pasta `src/pages` foi renomeada para `src/views` para o Next não tratá-la como Pages Router.
- A árvore Next antiga foi movida para `legacy/next-scaffold/`.
- A árvore Vite de configuração foi mantida em `legacy/vite/` apenas como referência.
- `proxy.ts` protege rotas por papel: admin, student e instructor.
- O login visual aprovado agora chama `/api/auth/session`, tenta Supabase Auth quando configurado e mantém fallback demo para desenvolvimento.
- A sessão HTTP-only passou a ser assinada em `src/lib/auth.ts`; `proxy.ts` valida a assinatura antes de liberar dashboards.
- As escritas de lead e inscrição foram movidas para `/api/leads` e `/api/enrollments`, preservando fallback local na UI.
- As páginas `app/cursos/[slug]/page.tsx` e `app/blog/[slug]/page.tsx` agora exportam `generateStaticParams` e `generateMetadata`; o visual permanece em wrappers client.
- Os códigos internos das trilhas continuam disponíveis para identificadores estáveis, mas deixaram de ser exibidos nos cards e filtros públicos.
- Ajuste visual solicitado na pagina `/cursos`: a hero passou a exibir somente a acao de busca, os indicadores foram centralizados, os tres atalhos grandes de trilhas foram removidos e o resumo de resultados foi simplificado sem a label de matricula/orcamento.
- Refinamento posterior da hero de `/cursos`: conteudo, CTA e indicadores passaram a compor um unico painel central em navy/dourado, alinhado a linguagem institucional da Home.
- Foram criadas seis capas editoriais locais para os cursos, uma por trilha, substituindo imagens externas aleatorias no catalogo e fornecendo fallback consistente para registros do Supabase sem `imagem_capa`.
- ESLint real foi adicionado via `eslint.config.mjs`. Avisos restantes são majoritariamente uso de `<img>` em telas aprovadas; foram mantidos para evitar alteração visual neste passo.
- `npm audit --omit=dev` ainda reporta vulnerabilidade moderada em `next` por `postcss` interno. `npm audit fix` atualizou para `next@16.2.6`, mas o fix restante sugerido pelo npm é `--force` com downgrade para `next@9.3.3`, portanto foi recusado.

## Quality Gates
- [x] `npm run typecheck` passou.
- [x] `npm run lint` passou.
- [x] `npm run build` passou.
- [x] `npm test` passou, executando `npm run typecheck`, `npm run build` e `playwright test`.
- [x] Playwright passou com 19 cenários, incluindo a ausência de códigos internos das trilhas e o uso de capas locais nos cards públicos.
- [x] Build confirmou SSG para `/cursos/[slug]` e `/blog/[slug]`.
- [!] `npm audit --omit=dev` com risco residual documentado em Dev Notes.

## File List
- `.env.example`
- `.gitignore`
- `package.json`
- `package-lock.json`
- `eslint.config.mjs`
- `playwright.config.ts`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.js`
- `next.config.mjs`
- `proxy.ts`
- `app/layout.tsx`
- `app/page.tsx`
- `app/cursos/page.tsx`
- `app/cursos/[slug]/page.tsx`
- `app/agenda/page.tsx`
- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/in-company/page.tsx`
- `app/sobre/page.tsx`
- `app/contato/page.tsx`
- `app/login/page.tsx`
- `app/inscricao-confirmada/page.tsx`
- `app/admin/page.tsx`
- `app/admin/cursos/page.tsx`
- `app/admin/turmas/page.tsx`
- `app/admin/alunos/page.tsx`
- `app/admin/leads/page.tsx`
- `app/admin/inscricoes/page.tsx`
- `app/admin/instrutores/page.tsx`
- `app/admin/blog/page.tsx`
- `app/aluno/page.tsx`
- `app/instrutor/page.tsx`
- `app/api/demo-session/route.ts`
- `app/api/auth/session/route.ts`
- `app/api/leads/route.ts`
- `app/api/enrollments/route.ts`
- `src/`
- `public/images/courses/departamento-pessoal-esocial.jpg`
- `public/images/courses/licitacoes-contratos.jpg`
- `public/images/courses/pessoas-lideranca.jpg`
- `public/images/courses/comunicacao-atendimento.jpg`
- `public/images/courses/auditoria-tributaria.jpg`
- `public/images/courses/tecnologia-inovacao.jpg`
- `src/data/courseCovers.ts`
- `src/data/index.ts`
- `src/data/mockCourses.ts`
- `src/components/page-clients/blog-post-client.tsx`
- `src/components/page-clients/course-detail-client.tsx`
- `src/components/next-page-shell.tsx`
- `src/components/courses/training-path-card.tsx`
- `src/lib/auth.ts`
- `src/lib/router-compat.tsx`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/mappers.ts`
- `src/lib/app-store.tsx`
- `src/views/public/Login.tsx`
- `src/views/public/Courses.tsx`
- `tests/route-auth.spec.ts`
- `legacy/next-scaffold/`
- `legacy/vite/`
- `docs/stories/2026-05-13-next-migration-hardening.md`
