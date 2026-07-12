# RH Cursos Brownfield Enhancement PRD

## Intro Project Analysis and Context

### Existing Project Overview

#### Analysis Source

IDE-based fresh analysis using existing brownfield discovery outputs and current repository artifacts:

- `docs/history/reports/BROWNFIELD-DISCOVERY-COMPLETE.md`
- `docs/ARCHITECTURE.md`
- `docs/architecture/system-architecture.md`
- `docs/architecture/TECHNICAL-DEBT-REPORT.md`
- `docs/database/SCHEMA.md`
- `docs/api/openapi.yaml`
- `README.md`
- Current `app/`, `src/`, `supabase/`, `tests/`, and `docs/` structure

#### Current Project State

RH Cursos is an existing production-oriented SaaS platform for corporate training and technical education. The current application already includes a public website with home, courses, agenda, in-company, blog, contact, specialist contact, login, and enrollment confirmation routes; an administrative area for courses, classes, students, leads, enrollments, instructors, blog, and settings; Supabase-backed data access; RLS policies; OpenAPI documentation; automated tests; and Cloudflare Workers deployment.

The product direction validated for this PRD is to position RH Cursos as a courses and consulting company for public and private sector organizations, delivering practical knowledge that can be applied according to current laws and regulatory requirements.

### Available Documentation Analysis

#### Available Documentation

- [x] Tech Stack Documentation
- [x] Source Tree/Architecture
- [x] Coding Standards
- [x] API Documentation
- [x] External API Documentation
- [x] UX/UI Guidelines
- [x] Technical Debt Documentation
- [x] Other: database schema, RLS audit, design system, deployment, troubleshooting, QA gates, accessibility reports, market research, and prior epics/stories

Prior brownfield discovery was completed on 2026-06-22 and found the project production-ready, with strategic remediation themes around accessibility, error handling, testing, monitoring, security headers, documentation, and AppStore/data-layer cleanup.

### Enhancement Scope Definition

#### Enhancement Type

- [x] New Feature Addition
- [x] Major Feature Modification
- [ ] Integration with New Systems
- [ ] Performance/Scalability Improvements
- [x] UI/UX Overhaul
- [ ] Technology Stack Upgrade
- [ ] Bug Fix and Stability Improvements
- [x] Other: public consulting offer, student portal, and instructor portal

#### Enhancement Description

The enhancement will evolve the current RH Cursos site into a clearer commercial and operational platform for courses, in-company training, and consulting. It must present the public agenda of courses, promote in-company training, introduce consulting as a conversion-focused public offer with its own page or section and lead capture, and extend the authenticated experience with student and instructor areas while preserving the existing administrative area.

#### Impact Assessment

- [ ] Minimal Impact (isolated additions)
- [x] Moderate Impact (some existing code changes)
- [x] Significant Impact (substantial existing code changes)
- [ ] Major Impact (architectural changes required)

The enhancement is significant because student and instructor portals were previously kept out of active release scope, and consulting requires public navigation, content model decisions, lead capture semantics, and admin operational visibility. However, the existing database, RBAC helpers, admin resources, lead model, and public routes provide a strong foundation, so a full architectural rewrite is not expected.

### Goals and Background Context

#### Goals

- Make the public site communicate RH Cursos as a provider of practical training and consulting for public and private sector organizations.
- Make course agenda discovery clear, searchable, and connected to enrollment or commercial contact.
- Make in-company training a clear corporate conversion path.
- Add consulting as a public conversion offer with its own lead capture path.
- Preserve and improve the administrative area as the operational control center for site content and commercial records.
- Enable student and instructor areas without weakening the existing admin security model.
- Keep the current Next.js, Supabase, Cloudflare Workers, design system, and testing foundations.

#### Background Context

The current platform already covers many public and administrative workflows, but the business positioning needs to be clearer: RH Cursos is not only a course catalog, but a company that helps organizations and professionals apply knowledge in legally regulated contexts. The website should therefore make the relationship between courses, in-company programs, consulting, and legal applicability visible throughout the user journey.

The next major gap is role-based experience. The admin area is active and protected, while student and instructor experiences are supported by parts of the data model and auth contract but are not currently enabled as product surfaces. This PRD treats those areas as coordinated brownfield enhancements that must be introduced incrementally and verified against existing admin, public catalog, enrollment, lead, and RLS behavior.

### Change Log

| Change | Date | Version | Description | Author |
| --- | --- | --- | --- | --- |
| Initial brownfield PRD draft | 2026-06-30 | 0.1 | Created validated context and initial requirements for public consulting, admin, student, and instructor expansion | Morgan |

## Requirements

These requirements are based on the validated understanding of the existing RH Cursos system. They should be reviewed carefully before story sequencing, especially the exact scope of the student and instructor portals.

MVP clarification:

- Student area MVP is limited to authenticated visibility over the student's own enrollments and related learning context already supported by the platform.
- Instructor area MVP is limited to authenticated visibility over assigned teaching context and authorized student lists.
- Advanced operational features for either portal require explicit later-story scoping.

### Functional

- **FR1:** The public website must clearly present RH Cursos as a company for courses and consulting serving public and private sector organizations.
- **FR2:** The public website must communicate that RH Cursos delivers practical knowledge for application according to current laws and regulatory requirements.
- **FR3:** The public website must expose three explicit commercial journeys: open courses, in-company training, and consulting.
- **FR4:** The public agenda must allow visitors to discover scheduled courses and proceed toward enrollment or commercial contact from relevant course and agenda contexts.
- **FR5:** The in-company offer must remain a public conversion path for organizations seeking tailored training, with clear CTAs from the public site.
- **FR6:** Consulting must include lead capture that records the visitor's contact details, organization context, area of interest, and message.
- **FR7:** Consulting must be introduced as a public offer with a dedicated page, with positioning, audience/problem framing, and conversion-oriented CTAs.
- **FR8:** Consulting leads must be visible and manageable in the administrative lead workflow without breaking existing lead sources.
- **FR9:** The administrative area must continue to support management of site content and operational records, including courses, classes, instructors, students, enrollments, leads, blog content, settings, and consulting-related public content.
- **FR10:** Admin users must be able to distinguish lead origin or interest for course, in-company, consulting, contact, and newsletter-style flows.
- **FR11:** The student MVP area must allow authenticated students to view their own identity context, enrollments, and relevant class/course information.
- **FR12:** Certificates, materials, payment history, and support artifacts for students are out of MVP unless the underlying data model, API contract, and operational workflow are explicitly confirmed and scoped in later stories.
- **FR13:** The instructor MVP area must allow authenticated instructors to view their own identity context, assigned courses/classes, and enrolled students according to authorized relationships.
- **FR14:** Instructor workflow actions such as attendance tracking, class completion, material publishing, or student communication are out of MVP unless they are explicitly backed by schema, API, and RLS changes in later stories.
- **FR15:** Public navigation must expose the key business paths: courses, agenda, in-company, consulting, blog/content, contact, login, and specialist contact where appropriate.
- **FR16:** Existing public course catalog, agenda, in-company, checkout/enrollment, admin, and auth behavior must continue to work after the enhancement.

### Non Functional

- **NFR1:** The enhancement must preserve the existing Next.js 16, React 19, TypeScript, Supabase, and Cloudflare Workers architecture unless a future architecture decision explicitly changes it.
- **NFR2:** Student, instructor, and admin access must fail closed and must not expose private records across roles.
- **NFR3:** Public lead capture must preserve existing rate limiting, validation, CORS, and anti-abuse protections.
- **NFR4:** The consulting conversion path must meet the same accessibility baseline as existing public pages, including keyboard access, labels, focus handling, and WCAG-oriented checks.
- **NFR5:** New public and authenticated screens must follow the existing design system, Mantine/Tailwind transition constraints, and feature-first organization.
- **NFR6:** The enhancement must include automated verification for critical public conversion, admin lead management, and role-based access flows.
- **NFR7:** New database policies or migrations must preserve existing RLS guarantees and be covered by database or integration tests where role visibility changes.
- **NFR8:** The site must remain deployable through the existing Cloudflare Workers/OpenNext process.
- **NFR9:** Existing API documentation and OpenAPI contracts must be updated when lead, auth, or admin surfaces change.
- **NFR10:** The implementation must avoid reintroducing demo-auth behavior or mock-only data paths into production workflows.

### Compatibility Requirements

- **CR1: Existing API compatibility:** Current public, admin, auth-session, enrollments, leads, and admin-resources API behavior must remain compatible unless an explicit versioned contract change is approved.
- **CR2: Database schema compatibility:** Existing tables for courses, classes, instructors, course-instructor relationships, students, enrollments, leads, profiles, and RLS helpers must remain compatible with existing public and admin flows.
- **CR3: UI/UX consistency:** New consulting, student, and instructor interfaces must align with the current RH Cursos visual system and not create a separate visual language.
- **CR4: Integration compatibility:** Existing Supabase SSR/client access, Edge Functions, route handlers, OpenAPI documentation, Playwright tests, Vitest tests, and Cloudflare deployment scripts must continue to operate.

## Technical Constraints and Integration Requirements

### Risk Assessment and Mitigation

**Product Risks:** The consulting offer may become only an institutional page if it is not clearly differentiated from open courses and in-company training. The public site may also lose conversion focus if too many CTAs compete for attention. To mitigate this, the enhancement should preserve three explicit commercial journeys and define dedicated CTA destinations for each one.

**Portal Scope Risks:** The student and instructor areas may accumulate unrealistic expectations if MVP boundaries are not preserved. In particular, users may assume certificates, materials, payment history, support workflows, attendance actions, or publishing flows are included from day one. To mitigate this, the epic must keep student and instructor MVP focused on authenticated visibility of authorized context, while any operational workflows require explicit later stories.

**Technical Risks:** The project already has partial support for `student` and `instructor` roles in schema, auth contract, and RLS helpers, but that does not guarantee complete end-to-end application support. There is a risk of enabling routes or UI surfaces without complete integration across app state, route guards, API contracts, and tests. Mitigation requires story sequencing that validates data access, route protection, and UI integration incrementally.

**Lead Management Risks:** Consulting leads may lose commercial value if they are treated as generic leads without strong origin, type, and context differentiation. The mitigation is to preserve or extend lead classification so that consulting, course, in-company, contact, and newsletter flows remain distinguishable in admin reporting and follow-up.

**Operational Risks:** The administrative area may need new content ownership and workflow rules for consulting pages, CTA text, and commercial copy. Without clear ownership, public positioning may become inconsistent. Mitigation requires explicit admin/content scope in the epic and validation of who manages consulting-related content.

**Security and Quality Risks:** New authenticated surfaces can introduce regressions in role isolation, RLS behavior, or public/admin flows that already work. The mitigation is to require fail-closed access control, automated verification for role-based access, and regression coverage for public conversion, admin leads, and existing auth behavior.

**Primary Delivery Risk:** The largest delivery risk is treating "student area" and "instructor area" as simple navigation additions when they may require new business rules, policies, screens, and test coverage. Mitigation requires incremental story slicing and refusal to bundle advanced portal capabilities into the MVP by default.

## User Interface Enhancement Goals

### Integration with Existing UI

The enhancement must extend the current RH Cursos public and authenticated experience without creating a parallel product language. Public consulting pages, lead capture flows, and authenticated student/instructor surfaces should reuse the existing design tokens, layout patterns, shell structure, accessibility conventions, and Mantine/Tailwind transition rules already established in the public site and admin area.

The public experience should preserve the current high-trust, professional positioning while making the three commercial journeys more explicit: open courses, in-company training, and consulting. Student and instructor interfaces should feel like authenticated extensions of the same product, not separate applications.

### Modified/New Screens and Views

- Home page and/or public navigation entry points for clearer journey segmentation
- Dedicated consulting page
- Existing agenda and course-detail CTA surfaces where consulting and in-company paths intersect
- Lead capture surfaces related to consulting
- Student authenticated area
- Instructor authenticated area
- Administrative lead/content surfaces if consulting content and lead classification require management changes

### UI Consistency Requirements

- Public pages must keep consistent typography, spacing, CTA hierarchy, and trust cues across courses, in-company, and consulting journeys.
- Consulting must be visually differentiated as a service offer, but still consistent with the RH Cursos design system.
- Student and instructor areas must reuse existing authenticated layout, navigation, and component patterns where possible.
- New forms must preserve existing accessibility and validation behavior, especially labels, focus order, keyboard operation, and error feedback.
- Existing public conversion flows must not become visually or behaviorally secondary after consulting is introduced.

### Existing Technology Stack

**Languages**: TypeScript, SQL, JavaScript
**Frameworks**: Next.js 16 (App Router), React 19, Mantine 9, Tailwind CSS 3, Radix UI, Zod
**Database**: Supabase PostgreSQL with RLS, auth helpers, edge functions, and typed database contracts
**Infrastructure**: Cloudflare Workers via OpenNext, Node.js 24+, GitHub-based automation, Storybook, Vitest, Playwright
**External Dependencies**: Supabase, Cloudflare Workers, Google Analytics, Sentry package integration, Recharts, Framer Motion

### Integration Approach

**Database Integration Strategy**: Reuse the current Supabase schema, RLS policies, `student`/`instructor` helper paths, and lead model as the base. Any portal expansion or consulting-specific lead semantics should be introduced through explicit migrations and validated against the existing public/admin contract.

**API Integration Strategy**: Preserve current Route Handlers and Edge Functions for auth, enrollments, leads, and admin resources. Extend only where student/instructor authenticated surfaces or consulting-specific lead classification require explicit new contracts.

**Frontend Integration Strategy**: Build new public and authenticated surfaces inside the current App Router and feature-first structure, reusing existing shells, form patterns, and state/data access boundaries.

**Testing Integration Strategy**: Expand the existing Vitest, Playwright, and database/integration coverage to include consulting conversion, role-based route access, and regression checks for current public and admin flows.

### Code Organization and Standards

**File Structure Approach**: Keep new work inside the existing feature-first organization, with public consulting flows under public features and student/instructor experiences under clearly separated authenticated feature areas.

**Naming Conventions**: Preserve current route, feature, and TypeScript naming patterns already used in `app/`, `src/features/`, `src/lib/`, and `supabase/`.

**Coding Standards**: Preserve the current Next.js/TypeScript/RLS patterns, accessibility requirements, API validation approach, and fail-closed authorization posture.

**Documentation Standards**: Update PRD, epics, stories, OpenAPI documentation, and any auth or operational references affected by consulting or portal activation.

### Deployment and Operations

**Build Process Integration**: The enhancement must remain compatible with the current Next.js build, OpenNext Cloudflare build, lint, typecheck, unit, and E2E verification commands.

**Deployment Strategy**: Continue using the current Cloudflare Workers deployment path with no requirement for a separate runtime or independent portal deployment.

**Monitoring and Logging**: Preserve existing monitoring and logging conventions; expand them only where consulting conversion or authenticated portal flows require operational visibility.

**Configuration Management**: Avoid introducing new production-critical secrets or feature flags unless student/instructor activation or new backend contracts require them explicitly.

## Epic and Story Structure

### Epic Approach

**Epic Structure Decision**: Single epic.

**Rationale**: This enhancement is one cohesive brownfield initiative centered on repositioning the public product experience and activating the next layer of authenticated role-based experience on top of the same RH Cursos platform. Although it spans public pages, admin behavior, leads, and authenticated surfaces, the work shares the same business objective, same technical boundaries, and same compatibility constraints. Splitting it into multiple epics now would create artificial separation between consulting conversion, portal activation, and admin/governance adjustments that must be validated together.

The epic should still be broken into incremental stories with strict scope control:

- Public positioning and journey clarity
- Consulting page and conversion flow
- Lead classification and admin visibility updates
- Student MVP portal activation
- Instructor MVP portal activation
- Regression, access control, and compatibility hardening

## Epic 1: RH Cursos Platform Repositioning and Role-Based Experience Activation

**Epic Goal**: Evolve the existing RH Cursos platform so that the public experience clearly communicates courses, in-company training, and consulting as distinct commercial journeys, while activating secure MVP experiences for students and instructors on top of the current authenticated and administrative foundation.

**Integration Requirements**: Preserve existing public catalog, agenda, in-company, checkout/enrollment, admin, auth, Supabase, RLS, OpenAPI, test, and Cloudflare deployment behavior while introducing consulting conversion and authenticated role-based surfaces incrementally.

### Story 1.1 Public Positioning and Journey Clarity

As a public visitor,
I want to quickly understand the three main RH Cursos offers,
so that I can choose the right path between open courses, in-company training, and consulting.

#### Acceptance Criteria

1. Public navigation and key entry points expose the three main commercial journeys clearly.
2. The public site communicates RH Cursos as a provider of practical knowledge applied to legal and regulatory contexts.
3. Existing course and agenda discovery flows remain available and understandable after the public positioning update.
4. Journey CTAs do not reduce visibility of existing enrollment-oriented actions for open courses.

#### Integration Verification

- **IV1:** Existing public routes for home, courses, agenda, in-company, blog, contact, and login continue to render and navigate correctly.
- **IV2:** Public navigation changes preserve existing shell/layout integration and route structure.
- **IV3:** No material regression is introduced in current public conversion and discovery paths.

### Story 1.2 Consulting Offer and Conversion Flow

As an organization evaluating RH Cursos,
I want a dedicated consulting page and contact flow,
so that I can understand the offer and request commercial follow-up.

#### Acceptance Criteria

1. A dedicated public consulting page is available with clear positioning, audience/problem framing, and conversion-oriented CTAs.
2. Consulting lead capture records contact details, organization context, area of interest, and message.
3. Consulting conversion paths are reachable from relevant public surfaces without replacing core course enrollment flows.
4. Consulting capture follows existing accessibility, validation, and anti-abuse standards.

#### Integration Verification

- **IV1:** Existing public lead-related and contact-related flows continue to function after consulting is added.
- **IV2:** Consulting conversion integrates with current lead infrastructure without breaking in-company or contact submissions.
- **IV3:** Public performance and form usability remain acceptable after adding the new consulting surface.

### Story 1.3 Lead Classification and Admin Visibility

As an admin user,
I want consulting leads to be distinguishable from other lead sources,
so that I can triage, report, and follow up correctly.

#### Acceptance Criteria

1. Admin lead workflows differentiate consulting, course, in-company, contact, and newsletter-style origins or interests.
2. Consulting-origin leads are visible in the current admin lead management flow.
3. Lead classification changes preserve compatibility with the existing data model or introduce explicit safe migrations.
4. Public-to-admin lead traceability is documented in the relevant contract or operational documentation.

#### Integration Verification

- **IV1:** Existing lead records and admin lead screens continue to work with new classification semantics.
- **IV2:** Integration between public lead capture and admin visibility remains intact across current lead sources.
- **IV3:** No regression is introduced in current admin lead performance or reporting behavior.

### Story 1.4 Student MVP Portal Activation

As a student,
I want to access my authenticated learning context,
so that I can see my enrollments and related course/class information.

#### Acceptance Criteria

1. An authenticated student area is available for viewing the student's own identity context, enrollments, and relevant course/class information.
2. Student access is limited to the authenticated student's own authorized records.
3. The MVP excludes advanced artifacts such as certificates, materials, payment history, and support workflows unless explicitly added through a later scoped story.
4. Student route protection, empty states, and session behavior align with the existing auth model.

#### Integration Verification

- **IV1:** Existing admin and public auth behavior remains intact when the student area is activated.
- **IV2:** Student record visibility respects current or explicitly updated RLS and route-guard behavior.
- **IV3:** No unauthorized cross-user data exposure occurs in student views.

### Story 1.5 Instructor MVP Portal Activation

As an instructor,
I want to access my assigned teaching context,
so that I can see my courses, classes, and authorized student lists.

#### Acceptance Criteria

1. An authenticated instructor area is available for viewing instructor identity context, assigned courses/classes, and authorized enrolled student lists.
2. Instructor access is limited to records tied to the authenticated instructor relationship model.
3. Instructor operational actions such as attendance, publishing, or student communication remain out of MVP unless explicitly added through a later scoped story.
4. Instructor route protection, empty states, and session behavior align with the existing auth model.

#### Integration Verification

- **IV1:** Existing admin and public auth behavior remains intact when the instructor area is activated.
- **IV2:** Instructor record visibility respects current or explicitly updated RLS and route-guard behavior.
- **IV3:** No unauthorized access to unrelated courses, classes, or student records occurs.

### Story 1.6 Regression, Access Control, and Compatibility Hardening

As the product team,
I want the new journeys and portals to be verified against current platform behavior,
so that the brownfield enhancement does not destabilize production flows.

#### Acceptance Criteria

1. Critical public conversion, admin lead management, student access, and instructor access flows have automated verification appropriate to their risk.
2. Existing public catalog, agenda, in-company, checkout/enrollment, admin, and auth flows are regression-checked after the enhancement.
3. Any schema, API, or route changes are reconciled with current documentation and compatibility constraints.
4. Role-based access remains fail-closed across admin, student, and instructor surfaces.

#### Integration Verification

- **IV1:** Existing core platform journeys continue to pass after all enhancement stories are integrated.
- **IV2:** Public, admin, student, and instructor integration points remain coherent across routes, auth, API contracts, and data access.
- **IV3:** Performance, build, and deployment behavior remain compatible with the current delivery pipeline.
