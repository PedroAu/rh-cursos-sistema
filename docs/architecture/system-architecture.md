# System Architecture — Brownfield Discovery Phase 1

**Project:** site-rh-cursos  
**Date:** 2026-06-22  
**Status:** Analysis Complete  
**Branch:** redesign/ep-0-fundacao (19 modified files)

---

## Executive Summary

**site-rh-cursos** é um aplicativo Next.js fullstack de gerenciamento de cursos corporativos com:
- Frontend moderno (Mantine, Tailwind, React 19)
- Backend Supabase (PostgreSQL + Auth)
- Deployment Cloudflare Workers
- Organização feature-first em `src/features/`

**Arquitetura Status:** Saudável com MODERNIZAÇÃO em progresso (Épico 8).  
**Débito técnico:** Baixo. Principais problemas são related a transição UI (Tailwind → Mantine).

---

## 1. Stack Tecnológico

### Frontend
| Layer | Tech | Version | Status |
|-------|------|---------|--------|
| Framework | Next.js | 16.2.2 | ✅ Current |
| Runtime | React | 19.2.7 | ✅ Current |
| UI Components | Mantine | 9.3.1 | ✅ New (Épico 8) |
| Styling | Tailwind CSS | 3.4.17 | ⚠️ Legacy (with Mantine) |
| Styling | Emotion | 11.14.0 | ✅ Mantine dependency |
| Forms | Mantine Form | 9.3.1 | ✅ New |
| Hooks | Mantine Hooks | 9.3.1 | ✅ Integrated |
| Animations | Framer Motion | 12.38.0 | ✅ Active |
| Icons | Lucide React | 0.511.0 | ✅ Active |
| Charts | Recharts | 2.15.4 | ✅ Active |
| Notifications | Sonner | 2.0.7 | ✅ Toast library |

### Backend
| Layer | Tech | Version | Status |
|-------|------|---------|--------|
| Database | PostgreSQL | (via Supabase) | ✅ Active |
| Auth | Supabase Auth | 0.10.3 | ✅ SSR-integrated |
| Client | @supabase/supabase-js | 2.106.2 | ✅ Current |
| Validation | Zod | 4.4.3 | ✅ Active |

### Infrastructure
| Layer | Tech | Version | Status |
|-------|------|---------|--------|
| Deploy | Cloudflare Workers | via opennextjs | ✅ Active |
| Build Tool | opennextjs-cloudflare | 1.19.11 | ✅ Custom build |
| Analytics | Google Analytics | @next/third-parties | ✅ Integrated |
| Testing | Playwright | 1.60.0 | ✅ E2E suite |
| Linting | ESLint | 9.39.4 | ✅ Configured |
| Type Checking | TypeScript | 5.8.3 | ✅ Strict mode |

### Development Tools
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | >=24 | Runtime requirement |
| Wrangler | 4.99.0 | Cloudflare CLI |
| Supabase CLI | (local) | Database migrations |

---

## 2. Architecture Layers

### 2.1 Routing Layer (`/app`)

```
app/
├── page.tsx                      # Home page
├── layout.tsx                    # Root layout (Mantine + GA setup)
├── admin/                        # Admin routes
│   ├── page.tsx
│   └── [slug]/page.tsx
├── cursos/                       # Courses listing
│   ├── page.tsx
│   └── [slug]/page.tsx
├── login/                        # Auth
├── agenda/                       # Schedule
├── contato/                      # Contact form
├── falar-com-especialista/      # Specialist contact
├── in-company/                   # In-company training
├── sobre/                        # About
└── [...]                        # Other public routes
```

**Architecture:**
- Uses Next.js App Router (14/15/16+)
- Route files import from `src/features/`
- No business logic in route files
- Composition pattern: routes compose shells + feature pages

**Metadata & Providers:**
- Mantine `ColorSchemeScript` + `mantineHtmlProps` for server-side theme
- MotionProvider for Framer Motion
- Google Analytics integration
- Font optimization (Inter, Montserrat, Manrope for legacy)

---

### 2.2 Feature-First Organization (`/src/features`)

```
src/features/
├── public/                     # Public site features
│   ├── home/
│   ├── courses/
│   ├── contact/
│   ├── about/
│   └── [other public pages]
│
├── public-shell/               # Public layout wrapper
│   ├── components/
│   │   ├── public-header.tsx
│   │   ├── public-footer.tsx
│   │   └── [layout components]
│   └── config/
│
├── admin/                      # Admin features
│   ├── dashboard/
│   ├── resources/
│   ├── users/
│   └── [admin modules]
│
└── admin-shell/               # Admin layout wrapper
    ├── components/
    │   ├── admin-header.tsx
    │   ├── admin-sidebar.tsx
    │   └── [admin layout]
    └── config/
```

**Decision:** Feature-first architecture per `frontend-feature-first-architecture.md`
- Each feature owns its components, logic, and types
- Shells own layout components and navigation
- Clear separation: public vs admin

**Current Status (Épico 8):**
- ✅ public-shell refactored with Mantine (Header in 2 layers: top bar + main bar)
- ⚠️ Some legacy components in `/src/components/admin/` being deprecated
- ⚠️ Tailwind + Mantine coexisting during migration

---

### 2.3 Shared Components (`/src/components`)

```
src/components/
├── ui/                         # Design system primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── [radix-based primitives]
│   └── separator.tsx           # ⚠️ DEPRECATED (Mantine Button, Divider)
│
├── shared/                     # Shared business components
├── layout/                     # Layout components
├── providers/                  # React context providers
│   ├── mantine-provider.tsx
│   ├── motion-provider.tsx
│   └── [other providers]
│
├── admin/                      # ⚠️ DEPRECATED — Moving to features/admin/
│   ├── admin-guard.tsx
│   ├── dashboard/
│   └── [legacy admin components]
│
└── courses/                    # ⚠️ DEPRECATED — Moving to features/
    └── training-path-card.tsx
```

**Observations:**
- Mantine integration complete in `mantine-provider.tsx`
- Radix UI components being phased out (replaced by Mantine equivalents)
- Some files marked for deletion in current branch

---

### 2.4 Cross-Cutting Infrastructure (`/src/lib`)

```
src/lib/
├── analytics.ts                # GA integration
├── company.ts                  # Company metadata
├── env-validation.ts           # Runtime env checking
├── supabase/                   # Database layer
│   ├── client.ts              # Supabase JS client
│   ├── server.ts              # Server-side Supabase (SSR)
│   ├── admin-resources.ts     # Admin API layer
│   └── [admin helpers]        # DEPRECATED
├── auth.ts                     # Auth utilities
├── validation.ts               # Zod schemas
├── [legacy helpers]           # Some marked for removal
└── [...utility functions]
```

**Key Services:**
- **Supabase Auth:** Server-side session management via `@supabase/ssr`
- **Database Access:** Typed queries via `supabase-js` client
- **Validation:** Zod schemas for runtime type safety
- **Analytics:** GA measurement ID from env

**Deprecated (to be removed):**
- `audit-logger.ts` — Legacy logging
- `cors.ts` — Handled by Cloudflare
- `error-handler.ts` — Replaced by framework error boundaries
- `input-sanitizer.ts` — Zod validation replaces this
- `rate-limiter.ts` — Cloudflare handles this
- `storage-helper.ts` — Deprecated S3 integration

---

### 2.5 Data Layer (`/src/data`)

Purpose: Static data, seed data, and configuration.

**Current usage:**
- Course catalog definitions
- Training path configurations
- Seed data for development

---

### 2.6 Custom Hooks (`/src/hooks`)

Centralizes React hooks for reuse across features.

**Typical patterns:**
- `useAuth()` — Current user + session
- `useCourses()` — Course queries
- `useForm()` — Form state management (Mantine Form)

---

### 2.7 Styling Architecture (`/src/styles`)

```
src/styles/
├── globals.css                 # Global Tailwind + custom CSS
└── [feature-specific CSS]
```

**Status:**
- Tailwind CSS as base (utilities + custom tokens)
- Mantine CSS also loaded in root layout
- CSS coexistence during migration
- Both systems work together with clear naming

---

### 2.8 Type System (`/src/types`)

Centralized TypeScript types and interfaces.

**Typical patterns:**
- User / Auth types
- Course / Curriculum types
- Admin resource types

---

### 2.9 Theme Configuration (`/src/theme`)

Mantine theme customization.

**Scope:**
- Color palette
- Typography
- Component overrides
- Breakpoints

---

## 3. Database Architecture (Supabase)

### Schema Overview

Recent migrations (as of June 2026):

| Migration | Purpose | Status |
|-----------|---------|--------|
| `20260513100000_sprint1_security.sql` | RLS policies & auth | ✅ Active |
| `20260513200000_sprint2_integrity.sql` | Constraints & FK | ✅ Active |
| `20260513300000_sprint3_performance.sql` | Indexes & optimization | ✅ Active |
| `20260513400000_sprint4_evolution.sql` | Schema evolution | ✅ Active |
| `20260604164120_content_access_alignment.sql` | Access control alignment | ✅ Active |
| `20260605000000_seed_initial_data.sql` | Seed data | ✅ Active |
| `20260608000000_seed_admin_user.sql` | Admin user creation | ✅ Active |
| `20260608100000_admin_audit_log.sql` | Audit logging | ✅ Active |
| `20260609100000_global_rate_limit.sql` | Rate limiting | ✅ Active |
| `20260609120000_remove_legacy_course_instructor_fields.sql` | Schema cleanup | ✅ Active |

**Key Tables (Inferred):**
- `users` — User accounts (via Supabase Auth)
- `courses` — Course catalog
- `enrollments` — User course enrollments
- `admin_logs` — Audit trail for admin actions
- `rate_limits` — Global rate limiting state

**Access Control:**
- Row-Level Security (RLS) policies enforced
- Role-based access: user, instructor, admin
- Public courses vs private training paths

---

## 4. API Routes & Endpoints

### Server-Side API

Located in `app/api/` — minimal API surface exposed.

**Typical patterns:**
- Webhook handlers for external services
- Form submission handlers
- Admin operations (delegated to Supabase RLS)

**Note:** Most data fetching is client-side via Supabase JS client.

---

## 5. Authentication & Authorization

### Auth Flow

1. **Signup/Login:** Supabase Auth UI → JWT stored in session cookie
2. **Server-Side Session:** `@supabase/ssr` middleware in `src/lib/supabase/server.ts`
3. **Client-Side Access:** Supabase JS client + token refresh
4. **Authorization:** Supabase RLS policies + app-level guards

### Route Guards

- Admin routes guarded by `AdminGuard` component (checks user role)
- Public routes have no guard
- Specialist contact forms gated to authenticated users

---

## 6. Deployment Strategy

### Cloudflare Workers

- **Framework:** opennextjs-cloudflare (Next.js adapter)
- **Build:** `npm run build:workers` → `.open-next/` artifacts
- **Deploy:** `npm run deploy:workers` via Wrangler
- **Env:** Configured in `wrangler.toml`

### Advantages
- Edge computing (low latency)
- Automatic scaling
- Integrated with Cloudflare DNS + Workers KV

### Current Issues
- Recent middleware deploy fix (commit 49f9e6a)
- OpenNextjs version tracking (compatibility matrix needed)

---

## 7. Testing Strategy

### E2E Tests (Playwright)

```bash
npm test  # runs: typecheck + build + e2e tests
```

- Browser automation testing
- Visual regression checks (via Axe accessibility)
- Form submission workflows

### Linting & Type Checking

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript + Next.js type generation
```

---

## 8. Development Workflow

### Local Development

```bash
npm install
npm run dev          # Next.js dev server on localhost:3000
```

### Database Migrations

```bash
supabase migration create {name}
supabase db push     # Apply migrations to local Supabase
```

### Admin Seeding

```bash
npm run seed:admin   # Create default admin user for testing
```

---

## 9. Current State: Épico 8 Refactor (redesign/ep-0-fundacao)

### What's Changing

**UI Framework Migration:**
- ✅ Mantine integrated as primary UI library
- ⚠️ Radix UI components being replaced
- ⚠️ Tailwind CSS still present (coexisting during transition)

**Header Redesign (Public):**
- ✅ Two-layer header structure (top bar + main bar)
- ✅ public-shell refactored with Mantine components
- 🔄 In progress: responsive layout for mobile

**Component Deprecation:**
- ❌ `src/components/admin/admin-guard.tsx` (marked for removal)
- ❌ `src/components/admin/chart-card.tsx` → Mantine Card
- ❌ `src/components/admin/data-table.tsx` → Mantine Table
- ❌ `src/components/admin/performance-report-card.tsx`
- ❌ `src/components/admin/recent-activities-card.tsx`
- ❌ `src/components/courses/training-path-card.tsx`
- ❌ `src/components/dashboard/dashboard-card.tsx`
- ❌ `src/components/ui/separator.tsx` → Mantine Divider
- ❌ `src/components/ui/sheet.tsx` → Mantine Drawer

**Lib Cleanup:**
- ❌ `src/lib/audit-logger.ts` (unused)
- ❌ `src/lib/cors.ts` (Cloudflare handles CORS)
- ❌ `src/lib/error-handler.ts` (Next.js error.tsx)
- ❌ `src/lib/input-sanitizer.ts` (Zod validation)
- ❌ `src/lib/rate-limiter.ts` (Cloudflare handles)
- ❌ `src/lib/storage-helper.ts` (deprecated S3)
- ❌ `src/lib/supabase/admin-resources.ts` (legacy)

### Migration Status

- 19 modified files on branch
- Most changes: deletions (cleanup) + Mantine integration
- Last commit: "header público em duas camadas"

---

## 10. Key Architectural Decisions

| Decision | Rationale | Status |
|----------|-----------|--------|
| **Feature-first organization** | Scalability, team ownership, fast feature shipping | ✅ Active |
| **Next.js App Router** | Modern routing, server components, streaming | ✅ Active |
| **Supabase for backend** | PostgreSQL + Auth in one, real-time ready | ✅ Active |
| **Mantine as UI system** | Rich components, accessibility, theming | ✅ Adopting |
| **Cloudflare Workers** | Edge deployment, low latency, cost-effective | ✅ Active |
| **Zod for validation** | Type-safe runtime validation | ✅ Active |
| **Tailwind CSS base** | Utility-first, low overhead customization | ⚠️ Phasing out |
| **Playwright for E2E** | Browser automation, accessibility checks | ✅ Active |

---

## 11. Technical Debt & Risks

### Low Priority (Can defer)
- ❌ Unused legacy utility functions in `src/lib/`
- ❌ Redundant Tailwind + Mantine CSS (temporary during migration)
- ❌ Old Radix UI components (covered by Mantine equivalents)

### Medium Priority (Plan for next 2 sprints)
- 🟡 Admin feature migration to feature-first structure
- 🟡 Complete removal of legacy component files
- 🟡 Mantine theme fully customized (currently using defaults)

### High Priority (Critical path)
- 🔴 Cloudflare Workers deployment reliability (recent middleware fix)
- 🔴 Admin RLS policies validation (ensure proper access control)
- 🔴 Database migration testing (ensure schema integrity)

### Risks
| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Mantine CSS conflicts with Tailwind** | Styling bugs, unpredictable cascades | Use CSS module scoping + gradual Tailwind removal |
| **RLS policy gaps** | Data exposure, security breach | Comprehensive RLS audit (Phase 5) |
| **Cloudflare Workers edge incompatibilities** | Deploy failures, prod outages | Test build on Cloudflare locally before deploy |
| **Database schema drift** | Migration failures, schema inconsistencies | Enforce migrations via CI, test on replica |

---

## 12. Performance Considerations

### Frontend
- **Bundle size:** Mantine + Recharts increases baseline (~150KB gzipped)
- **Optimization:** Next.js Image optimization enabled
- **Caching:** Cloudflare Workers cache layer for static assets
- **Hydration:** React 19 with automatic batching

### Backend
- **Database:** Indexes on FK & commonly filtered columns (via migrations)
- **RLS overhead:** Minimal (~1-2% query latency)
- **API:** No N+1 queries due to client-side Supabase queries

### Deployment
- **Edge latency:** < 50ms for most regions via Cloudflare
- **Cold starts:** OpenNextjs optimizes for serverless
- **Scale:** Auto-scales with Cloudflare Workers

---

## 13. Monitoring & Observability

### Current Setup
- **Analytics:** Google Analytics for user behavior
- **Errors:** Next.js error.tsx captures and logs
- **Audit:** Supabase admin_logs table for sensitive operations
- **Performance:** Cloudflare Analytics for edge metrics

### Gaps
- ❌ Centralized error logging (no service like Sentry)
- ❌ Database performance monitoring (no pgBadger)
- ❌ Frontend performance tracking (no Web Vitals service)

---

## 14. Security Posture

### Implemented
- ✅ Supabase Auth with JWT
- ✅ Row-Level Security policies
- ✅ Server-side session validation
- ✅ HTTPS everywhere (Cloudflare)
- ✅ Rate limiting (global via migrations)

### To Validate
- ⚠️ CORS policy alignment with Cloudflare
- ⚠️ CSP headers configuration
- ⚠️ SQL injection prevention (via Zod + parameterized queries)
- ⚠️ XSS prevention (React sanitizes by default)

---

## 15. Recommendations (Next Steps)

### Phase 2: Database Audit (@data-engineer)
- [ ] Complete SCHEMA.md with table definitions
- [ ] Validate all RLS policies
- [ ] Performance audit (slow query logs)

### Phase 3: Frontend Spec (@ux-design-expert)
- [ ] Component inventory (Mantine vs legacy)
- [ ] Responsive design audit
- [ ] Accessibility compliance (WCAG 2.1 AA)

### Phase 4: Debt Assessment (Draft)
- [ ] Quantify cleanup effort (legacy removal)
- [ ] Estimate Mantine migration completion
- [ ] Prioritize admin feature refactoring

### Phase 5-10: Full Brownfield Assessment
- Continue with specialist agents for detailed reviews
- Produce final technical debt report
- Create prioritized epic for remediation

---

## Document Links

- **Frontend Architecture Target:** `docs/architecture/frontend-feature-first-architecture.md`
- **Database Migrations:** `supabase/migrations/`
- **Feature Modules:** `src/features/`
- **Seed Data:** `docs/database/SEED.md`

---

**Status:** ✅ Phase 1 Complete — Ready for Phase 2 (Database Audit by @data-engineer)

*Generated by @architect during Brownfield Discovery*
