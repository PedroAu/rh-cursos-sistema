# Story: Foundation for Feature-First Clean Architecture

## Status
Done

## Contexto

O projeto ativo já roda em Next.js com `app/` como camada de rotas, Tailwind CSS e componentes próprios baseados em Radix. O usuário decidiu consolidar a base com:

- Next.js + TypeScript + Tailwind CSS
- `app/` preservado como camada de rotas
- organização `feature-first`
- clean architecture leve
- padrões visuais inspirados em Material
- sem dark mode nesta fase

## Acceptance Criteria

- [x] Definir arquitetura alvo em documentação do projeto
- [x] Introduzir `src/features/` como camada principal para novas rotas e shells
- [x] Atualizar as entradas de `app/` para importar de `src/features/`
- [x] Migrar o shell público para uma composição baseada em feature
- [x] Migrar o shell admin para uma composição baseada em feature
- [x] Adicionar navegação mobile admin em padrão bottom navigation
- [x] Extrair pelo menos uma derivação de domínio para `model/`
- [x] Manter o build funcional sem dark mode
- [x] Validar com `npm run lint`
- [x] Validar com `npm run typecheck`
- [x] Validar com `npm test`

## Scope

### In Scope

- Refatoração estrutural da UI ativa
- Nova documentação de arquitetura frontend
- Primeira migração de imports de `app/` para `src/features/`
- Reorganização dos shells público e admin
- Padronização visual materializada por classes utilitárias e tokens CSS

### Out of Scope

- Introdução do pacote `@mui/material`
- Migração completa de todos os componentes existentes para subpastas por feature
- Dark mode
- Mudança funcional de regras de negócio

## Tarefas / Subtarefas

- [x] Documentar arquitetura alvo
- [x] Criar módulos de `src/features/public-shell` e `src/features/admin-shell`
- [x] Criar wrappers de feature para as rotas públicas e admin
- [x] Extrair métricas do dashboard admin para `model/`
- [x] Atualizar `app/*` para consumir as features
- [x] Rodar quality gates
- [x] Atualizar checklist e file list ao concluir

## File List

- `docs/architecture/frontend-feature-first-architecture.md`
- `docs/stories/2026-06-09-feature-first-clean-architecture-foundation.md`
- `src/features/public-shell/config/public-navigation.ts`
- `src/features/public-shell/components/public-mobile-navigation.tsx`
- `src/features/public-shell/components/public-header.tsx`
- `src/features/public-shell/components/public-footer.tsx`
- `src/features/public-shell/components/whatsapp-support.tsx`
- `src/features/public-shell/public-layout.tsx`
- `src/features/admin-shell/config/admin-navigation.ts`
- `src/features/admin-shell/components/admin-sidebar.tsx`
- `src/features/admin-shell/components/admin-topbar.tsx`
- `src/features/admin-shell/components/admin-bottom-navigation.tsx`
- `src/features/admin-shell/dashboard-shell.tsx`
- `src/features/admin/dashboard/model/dashboard-metrics.ts`
- `src/features/admin/dashboard/admin-dashboard-page.tsx`
- `src/features/admin/resources/admin-resource-page.tsx`
- `src/features/public/home/home-page.tsx`
- `src/features/public/about/about-page.tsx`
- `src/features/public/agenda/agenda-page.tsx`
- `src/features/public/blog/blog-page.tsx`
- `src/features/public/contact/contact-page.tsx`
- `src/features/public/course-detail/course-detail-page.tsx`
- `src/features/public/courses/courses-page.tsx`
- `src/features/public/enrollment-success/enrollment-success-page.tsx`
- `src/features/public/in-company/in-company-page.tsx`
- `src/features/public/login/login-page.tsx`
- `src/components/layout/public-layout.tsx`
- `src/components/layout/dashboard-shell.tsx`
- `src/views/admin/AdminDashboard.tsx`
- `app/page.tsx`
- `app/sobre/page.tsx`
- `app/agenda/page.tsx`
- `app/blog/page.tsx`
- `app/contato/page.tsx`
- `app/curso/page.tsx`
- `app/cursos/page.tsx`
- `app/in-company/page.tsx`
- `app/inscricao-confirmada/page.tsx`
- `app/login/page.tsx`
- `app/admin/page.tsx`
- `app/admin/alunos/page.tsx`
- `app/admin/blog/page.tsx`
- `app/admin/cursos/page.tsx`
- `app/admin/inscricoes/page.tsx`
- `app/admin/instrutores/page.tsx`
- `app/admin/leads/page.tsx`
- `app/admin/turmas/page.tsx`
- `src/styles/globals.css`
