# RH Cursos Data Structure Improvement Plan

## Status

Proposed architecture plan. This document does not authorize implementation by itself; per the AIOX Constitution, implementation requires a story with acceptance criteria before code changes.

## Objective

Improve the site's current data structure so public catalog, enrollment, payment, CRM, and analytics flows share stable identities and produce actionable funnel metrics.

## Current Findings

The current system is brownfield and has two overlapping operational models:

- Newer schema: `courses`, `instructors`, `turmas`, `enrollments`, `leads`, `settings`.
- Legacy production schema: `curso`, `instrutor`, `turma`, `lead`, `aluno`, `course_enrollments`.

The running public/admin code primarily uses the legacy Portuguese schema, while payment creation writes to `payments.course_id`, which references `courses.id`. Existing stories 1.2 and 1.4 made the boundary safer but intentionally left model unification as future work.

## Architectural Decision

Use a staged migration, not a big-bang rewrite.

The target architecture should define one canonical course and enrollment identity, expose compatibility views or mapping tables for legacy surfaces during transition, and add a separate analytics event layer for funnel measurement.

## Scope

In scope:

- Canonical identity strategy for course, class, enrollment, payment, lead, and student records.
- Migration path from legacy tables to canonical reads/writes.
- Funnel event model for site analytics.
- Aggregated reporting model for admin/observability.
- Verification gates for each phase.

Out of scope:

- Full database schema design details. Those should be owned by `@data-engineer`.
- UI redesign.
- New marketing requirements or dashboard metrics not tied to decisions.
- Remote push, PR creation, or release operations.

## Target Data Boundaries

### Operational Data

Operational tables answer: what exists and what state is it in?

- Course catalog: canonical course, course slug, pricing source, content fields.
- Class schedule: class/turma dates, seats, instructor, status.
- Enrollment: applicant, class, selected payment method, LGPD acceptance, lifecycle status.
- Payment: Asaas charge, payment status, event audit, amount snapshot.
- CRM lead: commercial intent and follow-up state.
- Student/aluno: learner identity after enrollment or admin creation.

### Event Data

Event tables answer: what happened and through which path?

Recommended first event model:

- `event_name`: `course_viewed`, `lead_submitted`, `enrollment_started`, `enrollment_submitted`, `payment_started`, `payment_confirmed`.
- `anonymous_id` or `session_id`.
- `lead_id`, `enrollment_id`, `course_id`, `turma_id`, when available.
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`.
- `path`, `referrer`, `occurred_at`.
- `metadata` for small event-specific payloads.

### Reporting Data

Reporting should consume aggregates, not raw UI/admin queries.

Recommended first aggregate:

- `course_funnel_daily`
- Keys: `date`, `course_id`, `turma_id`
- Metrics: `course_views`, `leads`, `enrollments_submitted`, `payments_started`, `payments_confirmed`, `revenue_cents`, `seats_total`, `seats_filled`.

## Implementation Plan

### Phase 1: Discovery and Canonical Identity

Goal: decide the identity contract before writing migrations.

Subtasks:

1. Inventory live reads/writes for `curso`, `courses`, `turma`, `course_enrollments`, `enrollments`, `lead`, `leads`, `aluno`, and `payments`.
   - Service: backend/database
   - Files likely involved: `src/lib/public-data.ts`, `src/lib/admin-data.ts`, `src/app/actions/public.ts`
   - Verification: `rg` inventory checked into the story notes.

2. Define canonical ownership for course and enrollment identity.
   - Service: database
   - Output: architecture decision record or story notes.
   - Verification: payment and enrollment flows can name the same canonical course key.

3. Choose transition mechanism: mapping table or compatibility views.
   - Service: database
   - Owner: `@data-engineer` with `@architect` review.
   - Verification: legacy IDs are not silently coerced into canonical IDs.

### Phase 2: Schema Transition Slice

Goal: make identity explicit without changing user-facing behavior.

Subtasks:

1. Create migration for legacy-to-canonical course identity mapping or read-only compatibility view.
   - Service: database
   - Files likely involved: `supabase/migrations/*`, migration tests.
   - Verification: migration dry run and focused SQL/RPC tests.

2. Add server-side resolver for catalog/enrollment identity if the existing payment resolver is insufficient.
   - Service: backend
   - Files likely involved: `src/lib/payments/course-identity.ts`, new shared identity module.
   - Verification: unit tests for slug, canonical ID, legacy ID, and mismatch behavior.

3. Document rollback and fallback behavior.
   - Service: infra
   - Files likely involved: `docs/architecture/*`, story file.
   - Verification: rollback path reviewed before migration application.

### Phase 3: Enrollment Lifecycle Unification

Goal: remove the current ambiguity between RPC, `course_enrollments`, and `lead` fallback.

Subtasks:

1. Define enrollment lifecycle statuses.
   - Proposed minimum: `submitted`, `payment_pending`, `paid`, `cancelled`, `fallback_lead`.
   - Service: database
   - Verification: each public path maps to exactly one lifecycle transition.

2. Make RPC and direct fallback write equivalent canonical enrollment data or explicitly degrade to CRM lead.
   - Service: backend/database
   - Files likely involved: `src/app/actions/public.ts`, RPC migration.
   - Verification: tests cover RPC success, fallback success, degraded lead capture, and total failure.

3. Link payments to canonical enrollment where available.
   - Service: backend/database
   - Files likely involved: `supabase/migrations/*`, `src/app/actions/payment.ts`.
   - Verification: payment can correlate to enrollment without relying only on text fallback refs.

### Phase 4: Analytics Event Layer

Goal: measure the funnel without overloading operational tables.

Subtasks:

1. Create a minimal event capture contract.
   - Service: backend/database
   - Verification: every event has an action decision tied to it.

2. Emit events from public lead, enrollment, and payment paths.
   - Service: backend
   - Files likely involved: `src/app/actions/public.ts`, `src/app/actions/payment.ts`, webhook route.
   - Verification: unit tests assert event insertion payloads exclude sensitive CPF/payment details.

3. Preserve UTM fields from forms and event capture.
   - Service: backend
   - Verification: UTM parameters survive lead/enrollment/payment funnel attribution.

### Phase 5: Funnel Reporting

Goal: provide decision-ready metrics for admin and growth analysis.

Subtasks:

1. Create `course_funnel_daily` as a view or materialized view.
   - Service: database
   - Verification: aggregate matches fixture data for at least one course and turma.

2. Update admin dashboard data access to consume aggregates for funnel metrics.
   - Service: backend/frontend
   - Files likely involved: `src/lib/admin-data/dashboard.ts`, admin dashboard page/tests.
   - Verification: dashboard tests cover aggregate mapping and empty-state behavior.

3. Define the first OMTM.
   - Recommendation: confirmed qualified enrollments per course/turma.
   - Verification: metric has a documented "so what" action.

## Suggested Story Breakdown

1. Story: Canonical course identity migration plan and mapping.
2. Story: Enrollment lifecycle canonicalization.
3. Story: Minimal site funnel event capture.
4. Story: Daily funnel aggregate for admin reporting.
5. Story: Admin dashboard consumes funnel aggregate.

Each story should include:

- Source of truth references.
- Acceptance criteria.
- File list.
- Required quality gates: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build:cloudflare`.
- Database migration verification when applicable.

## Risks and Mitigations

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Data drift between `curso` and `courses` | High | Explicit mapping/view; reject ambiguous identity. |
| Payment records cannot correlate to enrollment | High | Add canonical enrollment reference once lifecycle is unified. |
| Event table captures PII unnecessarily | High | Store identifiers and coarse metadata only; avoid CPF and raw payment payloads. |
| Dashboard reads raw high-volume data | Medium | Use daily aggregate view/materialized view. |
| Big-bang migration breaks production admin/public flows | High | Use staged compatibility layer and keep public behavior unchanged per slice. |

## Verification Checklist Result

Checklist used: `.aiox-core/product/checklists/architect-checklist.md`.

Project type: full-stack brownfield Next.js/Supabase application.

Summary:

- Requirements alignment: Partial. The plan aligns with documented architecture debt and stories 1.2/1.4, but a new implementation story/PRD is still required before development.
- Architecture fundamentals: Pass for staged boundaries and component responsibilities; partial for diagrams because this plan is text-only.
- Technical stack: Pass. The plan keeps existing Next.js 16, Supabase, Asaas, Cloudflare Workers, Vitest, and Playwright stack.
- Data architecture: Partial. Ownership and target boundaries are defined, but exact table/index/RLS design is delegated to `@data-engineer`.
- Resilience and observability: Pass for fallback visibility and aggregate reporting direction; partial for alert thresholds.
- Security and compliance: Partial/pass. PII minimization is explicit, but retention/purge policy still needs a dedicated data-engineering/security story.
- Implementation guidance: Pass. Phases and verification gates are defined; implementation still requires story files.
- Dependency and integration management: Pass. No new vendor dependency proposed.
- AI agent suitability: Pass. Work is split into small story-sized slices with bounded files and verification.
- Accessibility: Not applicable to this architecture slice unless dashboard UI changes are introduced later.

Overall readiness: Medium.

Blocking conditions before implementation:

1. Create one or more stories from the suggested breakdown.
2. Have `@data-engineer` refine schema/RLS/index details.
3. Have `@po` validate acceptance criteria before `@dev` implementation.

