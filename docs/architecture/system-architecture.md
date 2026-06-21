# RH Cursos Brownfield System Architecture

## Introduction

This document captures the current state of the RH Cursos codebase for the Brownfield Discovery workflow. It documents what exists today, including working patterns, constraints, technical debt, and integration risks.

### Document Scope

Comprehensive documentation of the current system. No PRD or feature-specific scope was provided for this discovery run.

### Change Log

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-06-19 | 1.0 | Initial brownfield system analysis for `*brown-disc` | Aria |

## Quick Reference

### Critical Files

| Area | Files |
| --- | --- |
| Root layout and global CSS | `src/app/layout.tsx`, `src/app/globals.css` |
| Marketing routes | `src/app/(marketing)/*` |
| Admin routes | `src/app/(admin)/admin/page.tsx`, `src/app/(admin)/layout.tsx` |
| Auth | `src/app/(auth)/login/actions.ts`, `src/lib/auth.ts`, `src/middleware.ts` |
| Server actions | `src/app/actions/admin.ts`, `src/app/actions/public.ts`, `src/app/actions/payment.ts` |
| Public data access | `src/lib/public-data.ts`, `src/lib/site-data.ts` |
| Admin data access | `src/lib/admin-data.ts`, `src/lib/admin-settings.ts` |
| Supabase clients | `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, `src/lib/supabase/proxy.ts`, `src/lib/supabase/env.ts` |
| Asaas payments | `src/lib/asaas/client.ts`, `src/lib/asaas/env.ts`, `src/lib/asaas/money.ts`, `src/lib/asaas/types.ts` |
| Database migrations | `supabase/migrations/*.sql` |
| Deployment | `open-next.config.ts`, `wrangler.jsonc`, `docs/deploy.md` |
| Tests | colocated `*.test.ts(x)`, `vitest.config.ts`, `playwright.config.ts` |

## High Level Architecture

RH Cursos is a Next.js App Router application for a course/training business. It has a public marketing/catalog site, public lead/enrollment flows, an admin backoffice, Supabase-backed data/auth, and Asaas Pix/Boleto charge creation. Deployment is designed for Cloudflare Workers through OpenNext.

Per the local Next.js 16 docs in `node_modules/next/dist/docs/01-app/index.md`, the app uses the App Router model with file-system routing, Server Components, Suspense, and Server Functions. This codebase relies heavily on Server Components and Server Actions rather than API route handlers.

### Actual Tech Stack

| Category | Technology | Version / Config | Notes |
| --- | --- | --- | --- |
| Runtime | Node.js | `>=22.0.0` | Declared in `package.json`. |
| Framework | Next.js | `16.2.9` | App Router, React Server Components, Server Actions. |
| UI | React | `19.2.4` | Client components are used for interactive forms/tables/filters. |
| Styling | Tailwind CSS | `4.3.1` | Tokens live in `src/app/globals.css` via `@theme`; no `tailwind.config.js`. |
| Components | shadcn/Radix | shadcn CLI `^4.11.0`, Radix packages | Local primitives in `src/components/ui`. |
| Database/Auth | Supabase | `@supabase/supabase-js`, `@supabase/ssr` | Server admin client uses service role key. Browser/server auth uses SSR cookies. |
| Payments | Asaas | REST v3 | Server-only client for Pix/Boleto. |
| Deployment | Cloudflare Workers | `@opennextjs/cloudflare`, `wrangler` | `wrangler.jsonc` targets `rhcursos.com.br` and `www.rhcursos.com.br`. |
| Unit tests | Vitest | `vitest.config.ts` | jsdom environment; tests colocated near source. |
| E2E | Playwright | `playwright.config.ts` | Config exists; no `e2e/` files were found during this pass. |

## Repository Structure Reality Check

```text
rh-cursos/
├── src/
│   ├── app/                  # Next App Router route groups and server actions
│   ├── components/           # Admin, forms, layout, payment, shadcn, shared UI
│   ├── lib/                  # Data access, auth, Supabase, Asaas, utilities
│   ├── middleware.ts         # Supabase session refresh proxy
│   └── test/                 # Test setup/utilities
├── supabase/
│   └── migrations/           # New schema, legacy schema, RLS, payments
├── docs/                     # Deploy, design-system audit/proposal, stories
├── scripts/                  # Vitest wrapper and Workers deploy verifier
├── .aiox-core/               # AIOX framework files, currently untracked in git status
└── .codex/                   # Codex/AIOX skill and agent sync artifacts
```

### Notable Repository State

- The current branch is `pr/design-fase-a-tokens`.
- `.aiox-core/`, `.aiox/`, `.codex/`, and several IDE agent folders appear as untracked in the current worktree.
- The app source itself follows a conventional `src/` layout, but AIOX metadata is now present in the project root.
- The README is still the default create-next-app README and does not describe the real system.

## Application Modules

### Marketing Site

Route group: `src/app/(marketing)`.

Key pages:

- `/` in `src/app/(marketing)/page.tsx`
- `/cursos` in `src/app/(marketing)/cursos/page.tsx`
- `/agenda` in `src/app/(marketing)/agenda/page.tsx`
- `/in-company`, `/especialista`, `/sobre`, `/contato`

The marketing pages use mostly Server Components, with interactive filtering and form widgets delegated to client components under `src/components/shared` and `src/components/forms`.

### Admin Backoffice

Route group: `src/app/(admin)`.

`src/app/(admin)/layout.tsx` calls `requireAdmin()`, so every admin page is protected at layout level. `src/app/(admin)/admin/page.tsx` loads the dashboard snapshot through `getAdminDashboardSnapshot()`.

Admin UI modules are concentrated in:

- `src/components/admin`
- `src/components/admin/crud`
- `src/components/admin/entities`
- `src/components/forms/admin-*`

The admin data layer is mostly in `src/lib/admin-data.ts`, with CRUD Server Actions in `src/app/actions/admin.ts`.

### Auth

Auth uses Supabase Auth.

- `src/lib/supabase/server.ts` creates the SSR cookie-aware Supabase client.
- `src/lib/supabase/proxy.ts` is used by `src/middleware.ts` to refresh sessions.
- `src/lib/auth.ts` provides `getOptionalUserProfile()` and `requireAdmin()`.
- `requireAdmin()` redirects unauthenticated users to `/login` and non-admin users to `/`.

The app validates admin role by reading `profiles.role` through the service-role admin client after checking the authenticated Supabase user.

### Public Leads and Enrollment

`src/app/actions/public.ts` handles public lead and enrollment submissions.

Current behavior:

- Leads insert into legacy table `lead`.
- Enrollment first tries RPC `registrar_inscricao_publica`.
- If the RPC fails and `course_enrollments` is usable, it falls back to inserting into `course_enrollments`.
- Public catalog data is loaded from legacy tables through `src/lib/public-data.ts`, with static fallback data from `src/lib/site-data.ts` if the legacy catalog is unavailable.

### Payments

`src/app/actions/payment.ts` creates Pix/Boleto charges through Asaas.

Important payment constraints already encoded in the code:

- The client-supplied amount is accepted in the input type but intentionally ignored.
- Price is server-derived from `courses.preco`.
- `courseSlug` is preferred because the public flow still uses legacy `curso`/`turma` tables while payments reference the newer `courses.id`.
- Money conversion is centralized in `src/lib/asaas/money.ts` to avoid the off-by-100 risk between cents storage and reais wire values.
- Created charges are persisted in `payments`.

## Data Architecture

The database layer is brownfield. There are two overlapping models:

### Newer English-Named Schema

From `20260612202319_init_schema.sql` and `20260612202320_rls_policies.sql`:

- `profiles`
- `instructors`
- `courses`
- `turmas`
- `enrollments`
- `leads`
- `settings`

RLS is enabled for these tables, with public reads for course/turma/instructor data and admin policies for writes.

### Legacy Portuguese-Named Schema

From `20260619023000_production_legacy_base.sql`:

- `instrutor`
- `curso`
- `turma`
- `lead`
- `aluno`
- `admin_settings`
- `course_enrollments`

The running public/admin code primarily reads and writes this legacy schema for course catalog, classes, leads, students, and admin settings.

### Payments Schema

From `20260617120000_payments.sql`:

- `payments`
- `payment_events`

Payments intentionally avoid a hard FK to the current public enrollment flow because `course_enrollments.id` is text (`enr-*`) while the newer enrollment model is UUID-based. This is explicitly documented in the migration and reflected in `payment.enrollment_ref`.

## External Integrations

| Service | Purpose | Integration Type | Key Files |
| --- | --- | --- | --- |
| Supabase Auth | Login/session/admin users | SSR client + admin service client | `src/lib/auth.ts`, `src/lib/supabase/*` |
| Supabase Postgres | Catalog, admin, leads, enrollments, payments | SQL migrations + Supabase JS | `supabase/migrations`, `src/lib/admin-data.ts`, `src/lib/public-data.ts` |
| Supabase Storage | Admin branding assets | Server action upload to `admin-assets` bucket | `src/app/actions/admin.ts` |
| Asaas | Pix/Boleto customer and charge creation | REST API v3 via server-only fetch | `src/lib/asaas/*`, `src/app/actions/payment.ts` |
| Cloudflare Workers | Runtime hosting | OpenNext worker build | `open-next.config.ts`, `wrangler.jsonc` |

## Development and Deployment

### Local Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run build:cloudflare
npm run preview:cloudflare
```

### Deploy Commands

`docs/deploy.md` defines the deployment posture:

```bash
npm ci
npm run deploy:check
npm run preview:cloudflare
```

`npm run deploy:check` runs lint, typecheck, tests, and Cloudflare build. Static export / Cloudflare Pages static deploy is not suitable because the app uses Server Actions, dynamic routes, auth cookies, and server-side integrations.

### Environment Variables

Required runtime variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or fallback `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` or fallback `SUPABASE_SECRET_KEY`
- `ASAAS_BASE_URL`
- `ASAAS_API_KEY`
- `ASAAS_USER_AGENT`
- `ASAAS_WEBHOOK_AUTH_TOKEN`

`.env.example` also contains AIOX-related variables. These are not part of the app runtime architecture unless AIOX tooling is used.

## Testing Reality

The codebase has colocated unit/component tests across app routes, forms, admin components, Supabase/Asaas helpers, pagination, and settings.

Current test commands:

```bash
npm test
npm run test:watch
npm run test:e2e
```

E2E configuration exists in `playwright.config.ts`, but no `e2e/` test files were found during this analysis. Playwright is therefore configured but not materially covering production flows yet.

## Current Technical Debt and Known Issues

### Critical / High

1. **Dual schema model**
   - Public/admin flows use legacy `curso`, `turma`, `instrutor`, `lead`, `aluno`, and `course_enrollments`.
   - Payments require newer `courses.id` and `courses.preco`.
   - `src/app/actions/payment.ts` has explicit workaround logic to resolve course identity by slug.
   - Risk: inconsistent course records, failed charge creation, or data drift between catalog and payment model.

2. **Service-role admin client is widely used server-side**
   - `createAdminClient()` is used for admin operations, public submissions, catalog reads, and auth profile checks.
   - This is acceptable only because the code runs server-side, but it concentrates privilege in application code.
   - Risk: any accidental client boundary violation or future refactor can become severe.

3. **Enrollment flow has fallback behavior after RPC failure**
   - `submitEnrollmentAction()` falls back from RPC to direct `course_enrollments` insert.
   - The fallback improves resilience but can hide schema/RPC regressions.
   - Risk: inconsistent side effects if RPC and fallback do not do equivalent work.

4. **No Asaas webhook handling visible**
   - `ASAAS_WEBHOOK_AUTH_TOKEN` exists and `getAsaasEnv()` requires it, but no route handler was found for webhooks in this analysis.
   - Risk: payments can be created but status reconciliation may remain manual or incomplete.

### Medium

5. **Design system inconsistency is already documented**
   - `docs/design-system-audit.md` reports arbitrary spacing, typography fragmentation, repeated containers, and missing `Section`/`Container` abstractions.
   - This is concentrated in marketing pages and shared heading/hero components.

6. **README is stale**
   - The root README is the default create-next-app text and references Vercel, while real deployment uses Cloudflare Workers/OpenNext.

7. **E2E coverage gap**
   - Playwright is configured but no E2E specs were found.
   - Critical flows like login, admin CRUD, lead submission, enrollment, and Pix/Boleto checkout need browser-level coverage.

8. **Large admin data module**
   - `src/lib/admin-data.ts` concentrates many row types, filters, mappers, and queries.
   - Risk: changes across entities can become hard to review and test.

9. **AIOX and IDE agent artifacts are mixed into the app repo**
   - Many AIOX/IDE integration folders exist in the worktree.
   - Risk: app repository concerns and framework/tooling concerns may be hard to separate unless tracked intentionally.

### Low / Operational

10. **Create-next-app residue**
    - README and some default framing do not match the actual product.

11. **Cloudflare-specific build path must be respected**
    - `next build` is not the deploy artifact; Cloudflare deployment goes through `opennextjs-cloudflare build`.

## Workarounds and Gotchas

- Do not trust client-submitted payment amounts. The current payment action derives price from `courses.preco`.
- When creating a charge from public checkout, prefer `courseSlug`; legacy `curso.id` is not a valid `courses.id`.
- Do not use Cloudflare Pages static export for this app.
- Admin route protection depends on `profiles.role`, not only Supabase Auth metadata.
- Public catalog has static fallback data; a working page does not guarantee Supabase catalog health.
- The design system is in transition. Existing docs propose tokens/components but not all implementation is complete.

## Suggested Next Brownfield Discovery Handoffs

Per `brownfield-discovery.yaml`, the next phases are:

1. `@data-engineer`: run `*db-schema-audit` and `*security-audit`.
   - Expected outputs: `supabase/docs/SCHEMA.md`, `supabase/docs/DB-AUDIT.md`.
   - Focus areas: dual schema, RLS, service-role usage assumptions, enrollment/payment data consistency.

2. `@ux-design-expert`: run `*create-front-end-spec`.
   - Expected output: `docs/frontend/frontend-spec.md`.
   - Focus areas: design-system audit findings, marketing route consistency, admin UX, forms, accessibility.

3. `@architect`: consolidate findings into `docs/prd/technical-debt-DRAFT.md` after the specialist documents exist.

## Appendix: Useful Commands

```bash
npm run lint
npm run typecheck
npm test
npm run build:cloudflare
npm run deploy:check
```

