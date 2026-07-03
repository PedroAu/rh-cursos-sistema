# User Interface Enhancement Goals

## Integration with Existing UI

The enhancement must extend the current RH Cursos public and authenticated experience without creating a parallel product language. Public consulting pages, lead capture flows, and authenticated student/instructor surfaces should reuse the existing design tokens, layout patterns, shell structure, accessibility conventions, and Mantine/Tailwind transition rules already established in the public site and admin area.

The public experience should preserve the current high-trust, professional positioning while making the three commercial journeys more explicit: open courses, in-company training, and consulting. Student and instructor interfaces should feel like authenticated extensions of the same product, not separate applications.

## Modified/New Screens and Views

- Home page and/or public navigation entry points for clearer journey segmentation
- Dedicated consulting page
- Existing agenda and course-detail CTA surfaces where consulting and in-company paths intersect
- Lead capture surfaces related to consulting
- Student authenticated area
- Instructor authenticated area
- Administrative lead/content surfaces if consulting content and lead classification require management changes

## UI Consistency Requirements

- Public pages must keep consistent typography, spacing, CTA hierarchy, and trust cues across courses, in-company, and consulting journeys.
- Consulting must be visually differentiated as a service offer, but still consistent with the RH Cursos design system.
- Student and instructor areas must reuse existing authenticated layout, navigation, and component patterns where possible.
- New forms must preserve existing accessibility and validation behavior, especially labels, focus order, keyboard operation, and error feedback.
- Existing public conversion flows must not become visually or behaviorally secondary after consulting is introduced.

## Existing Technology Stack

**Languages**: TypeScript, SQL, JavaScript
**Frameworks**: Next.js 16 (App Router), React 19, Mantine 9, Tailwind CSS 3, Radix UI, Zod
**Database**: Supabase PostgreSQL with RLS, auth helpers, edge functions, and typed database contracts
**Infrastructure**: Cloudflare Workers via OpenNext, Node.js 24+, GitHub-based automation, Storybook, Vitest, Playwright
**External Dependencies**: Supabase, Cloudflare Workers, Google Analytics, Sentry package integration, Recharts, Framer Motion

## Integration Approach

**Database Integration Strategy**: Reuse the current Supabase schema, RLS policies, `student`/`instructor` helper paths, and lead model as the base. Any portal expansion or consulting-specific lead semantics should be introduced through explicit migrations and validated against the existing public/admin contract.

**API Integration Strategy**: Preserve current Route Handlers and Edge Functions for auth, enrollments, leads, and admin resources. Extend only where student/instructor authenticated surfaces or consulting-specific lead classification require explicit new contracts.

**Frontend Integration Strategy**: Build new public and authenticated surfaces inside the current App Router and feature-first structure, reusing existing shells, form patterns, and state/data access boundaries.

**Testing Integration Strategy**: Expand the existing Vitest, Playwright, and database/integration coverage to include consulting conversion, role-based route access, and regression checks for current public and admin flows.

## Code Organization and Standards

**File Structure Approach**: Keep new work inside the existing feature-first organization, with public consulting flows under public features and student/instructor experiences under clearly separated authenticated feature areas.

**Naming Conventions**: Preserve current route, feature, and TypeScript naming patterns already used in `app/`, `src/features/`, `src/lib/`, and `supabase/`.

**Coding Standards**: Preserve the current Next.js/TypeScript/RLS patterns, accessibility requirements, API validation approach, and fail-closed authorization posture.

**Documentation Standards**: Update PRD, epics, stories, OpenAPI documentation, and any auth or operational references affected by consulting or portal activation.

## Deployment and Operations

**Build Process Integration**: The enhancement must remain compatible with the current Next.js build, OpenNext Cloudflare build, lint, typecheck, unit, and E2E verification commands.

**Deployment Strategy**: Continue using the current Cloudflare Workers deployment path with no requirement for a separate runtime or independent portal deployment.

**Monitoring and Logging**: Preserve existing monitoring and logging conventions; expand them only where consulting conversion or authenticated portal flows require operational visibility.

**Configuration Management**: Avoid introducing new production-critical secrets or feature flags unless student/instructor activation or new backend contracts require them explicitly.
