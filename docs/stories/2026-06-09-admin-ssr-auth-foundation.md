# Story: Admin SSR Auth Foundation

## Status
Done

## Contexto

O projeto já está em Next.js 16 com App Router, porém o admin ainda dependia de `output: 'export'` e de proteção client-side após hidratação. Isso expunha o HTML do painel para usuários sem sessão e mantinha a autenticação acoplada ao modelo de frontend estático.

## Acceptance Criteria

- [x] Remover a dependência de `output: 'export'` para permitir rotas protegidas no servidor
- [x] Criar rota interna de login/logout no Next para estabelecer sessão server-side
- [x] Proteger `/admin` e subrotas no servidor antes da renderização
- [x] Preservar o token HMAC atual para compatibilidade com as Edge Functions administrativas
- [x] Atualizar os testes E2E para o novo fluxo de autenticação
- [x] Validar com `npm run lint`
- [x] Validar com `npm run typecheck`
- [x] Validar com `npm test`
- [x] Atualizar checklist e file list ao concluir

## Scope

### In Scope

- Migração do login admin para rota interna `/api/auth/session`
- Guard server-side para o segmento `/admin`
- Ajustes de shell/store para receber sessão inicial do servidor
- Atualização da suíte Playwright para o comportamento SSR

### Out of Scope

- Migração do deploy produtivo de Cloudflare Pages estático para um host SSR
- Reescrita completa do store admin
- Migração das mutações admin para route handlers do Next
- Refatoração visual do painel

## Tarefas / Subtarefas

- [x] Criar story técnica da fase
- [x] Implementar rota interna de sessão admin
- [x] Adicionar layout server-side do `/admin`
- [x] Adaptar `DashboardPageShell` e `AppStoreProvider` para `initialSession`
- [x] Simplificar páginas `app/admin/*` para composição via layout
- [x] Atualizar testes Playwright e web server de produção
- [x] Rodar quality gates
- [x] Atualizar file list e status final

## File List

- `docs/stories/2026-06-09-admin-ssr-auth-foundation.md`
- `next.config.mjs`
- `package.json`
- `playwright.config.ts`
- `src/features/admin/dashboard/admin-dashboard-page.tsx`
- `src/features/admin/resources/admin-resource-page.tsx`
- `src/lib/supabase/server.ts`
- `src/lib/env-validation.ts`
- `src/lib/supabase/session-token.ts`
- `src/lib/app-store.tsx`
- `src/lib/server-session.ts`
- `src/components/next-page-shell.tsx`
- `src/components/admin/data-table.tsx`
- `src/components/ui/alert-dialog.tsx`
- `src/hooks/use-hotkey.ts`
- `src/views/admin/AdminResourcePage.tsx`
- `app/api/auth/session/route.ts`
- `app/admin/layout.tsx`
- `app/admin/page.tsx`
- `app/admin/alunos/page.tsx`
- `app/admin/blog/page.tsx`
- `app/admin/cursos/page.tsx`
- `app/admin/inscricoes/page.tsx`
- `app/admin/instrutores/page.tsx`
- `app/admin/leads/page.tsx`
- `app/admin/turmas/page.tsx`
- `src/views/public/Login.tsx`
- `supabase/functions/auth-session/index.ts`
- `scripts/seed-admin.js`
- `supabase/migrations/20260608000000_seed_admin_user.sql`
- `tests/login-errors.spec.ts`
- `tests/route-auth.spec.ts`
