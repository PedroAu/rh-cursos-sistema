# Epic 1: RH Cursos Platform Repositioning and Role-Based Experience Activation

**Epic Goal**: Evolve the existing RH Cursos platform so that the public experience clearly communicates courses, in-company training, and consulting as distinct commercial journeys, while activating secure MVP experiences for students and instructors on top of the current authenticated and administrative foundation.

**Integration Requirements**: Preserve existing public catalog, agenda, in-company, checkout/enrollment, admin, auth, Supabase, RLS, OpenAPI, test, and Cloudflare deployment behavior while introducing consulting conversion and authenticated role-based surfaces incrementally.

## Story 1.1 Public Positioning and Journey Clarity

As a public visitor,
I want to quickly understand the three main RH Cursos offers,
so that I can choose the right path between open courses, in-company training, and consulting.

### Acceptance Criteria

1. Public navigation and key entry points expose the three main commercial journeys clearly.
2. The public site communicates RH Cursos as a provider of practical knowledge applied to legal and regulatory contexts.
3. Existing course and agenda discovery flows remain available and understandable after the public positioning update.
4. Journey CTAs do not reduce visibility of existing enrollment-oriented actions for open courses.

### Integration Verification

- **IV1:** Existing public routes for home, courses, agenda, in-company, blog, contact, and login continue to render and navigate correctly.
- **IV2:** Public navigation changes preserve existing shell/layout integration and route structure.
- **IV3:** No material regression is introduced in current public conversion and discovery paths.

## Story 1.2 Consulting Offer and Conversion Flow

As an organization evaluating RH Cursos,
I want a dedicated consulting page and contact flow,
so that I can understand the offer and request commercial follow-up.

### Acceptance Criteria

1. A dedicated public consulting page is available with clear positioning, audience/problem framing, and conversion-oriented CTAs.
2. Consulting lead capture records contact details, organization context, area of interest, and message.
3. Consulting conversion paths are reachable from relevant public surfaces without replacing core course enrollment flows.
4. Consulting capture follows existing accessibility, validation, and anti-abuse standards.

### Integration Verification

- **IV1:** Existing public lead-related and contact-related flows continue to function after consulting is added.
- **IV2:** Consulting conversion integrates with current lead infrastructure without breaking in-company or contact submissions.
- **IV3:** Public performance and form usability remain acceptable after adding the new consulting surface.

## Story 1.3 Lead Classification and Admin Visibility

As an admin user,
I want consulting leads to be distinguishable from other lead sources,
so that I can triage, report, and follow up correctly.

### Acceptance Criteria

1. Admin lead workflows differentiate consulting, course, in-company, contact, and newsletter-style origins or interests.
2. Consulting-origin leads are visible in the current admin lead management flow.
3. Lead classification changes preserve compatibility with the existing data model or introduce explicit safe migrations.
4. Public-to-admin lead traceability is documented in the relevant contract or operational documentation.

### Integration Verification

- **IV1:** Existing lead records and admin lead screens continue to work with new classification semantics.
- **IV2:** Integration between public lead capture and admin visibility remains intact across current lead sources.
- **IV3:** No regression is introduced in current admin lead performance or reporting behavior.

## Story 1.4 Student MVP Portal Activation

As a student,
I want to access my authenticated learning context,
so that I can see my enrollments and related course/class information.

### Acceptance Criteria

1. An authenticated student area is available for viewing the student's own identity context, enrollments, and relevant course/class information.
2. Student access is limited to the authenticated student's own authorized records.
3. The MVP excludes advanced artifacts such as certificates, materials, payment history, and support workflows unless explicitly added through a later scoped story.
4. Student route protection, empty states, and session behavior align with the existing auth model.

### Integration Verification

- **IV1:** Existing admin and public auth behavior remains intact when the student area is activated.
- **IV2:** Student record visibility respects current or explicitly updated RLS and route-guard behavior.
- **IV3:** No unauthorized cross-user data exposure occurs in student views.

## Story 1.5 Instructor MVP Portal Activation

As an instructor,
I want to access my assigned teaching context,
so that I can see my courses, classes, and authorized student lists.

### Acceptance Criteria

1. An authenticated instructor area is available for viewing instructor identity context, assigned courses/classes, and authorized enrolled student lists.
2. Instructor access is limited to records tied to the authenticated instructor relationship model.
3. Instructor operational actions such as attendance, publishing, or student communication remain out of MVP unless explicitly added through a later scoped story.
4. Instructor route protection, empty states, and session behavior align with the existing auth model.

### Integration Verification

- **IV1:** Existing admin and public auth behavior remains intact when the instructor area is activated.
- **IV2:** Instructor record visibility respects current or explicitly updated RLS and route-guard behavior.
- **IV3:** No unauthorized access to unrelated courses, classes, or student records occurs.

## Story 1.6 Regression, Access Control, and Compatibility Hardening

As the product team,
I want the new journeys and portals to be verified against current platform behavior,
so that the brownfield enhancement does not destabilize production flows.

### Acceptance Criteria

1. Critical public conversion, admin lead management, student access, and instructor access flows have automated verification appropriate to their risk.
2. Existing public catalog, agenda, in-company, checkout/enrollment, admin, and auth flows are regression-checked after the enhancement.
3. Any schema, API, or route changes are reconciled with current documentation and compatibility constraints.
4. Role-based access remains fail-closed across admin, student, and instructor surfaces.

### Integration Verification

- **IV1:** Existing core platform journeys continue to pass after all enhancement stories are integrated.
- **IV2:** Public, admin, student, and instructor integration points remain coherent across routes, auth, API contracts, and data access.
- **IV3:** Performance, build, and deployment behavior remain compatible with the current delivery pipeline.
