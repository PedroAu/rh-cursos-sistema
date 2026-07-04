# Requirements

These requirements are based on the validated understanding of the existing RH Cursos system. They should be reviewed carefully before story sequencing, especially the exact scope of the student and instructor portals.

MVP clarification:

- Student area MVP is limited to authenticated visibility over the student's own enrollments and related learning context already supported by the platform.
- Instructor area MVP is limited to authenticated visibility over assigned teaching context and authorized student lists.
- Advanced operational features for either portal require explicit later-story scoping.

## Functional

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

## Non Functional

- **NFR1:** The enhancement must preserve the existing Next.js 16, React 19, TypeScript, Supabase, and Cloudflare Workers architecture unless a future architecture decision explicitly changes it.
- **NFR2:** Student, instructor, and admin access must fail closed and must not expose private records across roles.
- **NFR3:** Public lead capture must preserve existing rate limiting, validation, CORS, and anti-abuse protections.
- **NFR4:** The consulting conversion path must meet the same accessibility baseline as existing public pages, including keyboard access, labels, focus handling, and WCAG-oriented checks.
- **NFR5:** New public and authenticated screens must follow the current design system and feature-first organization.
  > **Errata (2026-07-03):** A referência original a "Mantine/Tailwind transition constraints" está **superada**. O Épico 14 (Redesign Trust Keith) remove 100% do Mantine e adota Radix + Tailwind + cva, react-hook-form + zod e tokens `--tk-*`, conforme `docs/architecture/adr-014-redesign-trust-keith.md` (decisões D1–D9). Toda tela nova (consultoria, portais de aluno/instrutor) deve seguir o ADR-014, **não** o Mantine. Ver dependência cruzada em `docs/prd/epic-1-rh-cursos-platform-repositioning-and-role-based-experience-activation.md`.
- **NFR6:** The enhancement must include automated verification for critical public conversion, admin lead management, and role-based access flows.
- **NFR7:** New database policies or migrations must preserve existing RLS guarantees and be covered by database or integration tests where role visibility changes.
- **NFR8:** The site must remain deployable through the existing Cloudflare Workers/OpenNext process.
- **NFR9:** Existing API documentation and OpenAPI contracts must be updated when lead, auth, or admin surfaces change.
- **NFR10:** The implementation must avoid reintroducing demo-auth behavior or mock-only data paths into production workflows.

## Compatibility Requirements

- **CR1: Existing API compatibility:** Current public, admin, auth-session, enrollments, leads, and admin-resources API behavior must remain compatible unless an explicit versioned contract change is approved.
- **CR2: Database schema compatibility:** Existing tables for courses, classes, instructors, course-instructor relationships, students, enrollments, leads, profiles, and RLS helpers must remain compatible with existing public and admin flows.
- **CR3: UI/UX consistency:** New consulting, student, and instructor interfaces must align with the current RH Cursos visual system and not create a separate visual language.
- **CR4: Integration compatibility:** Existing Supabase SSR/client access, Edge Functions, route handlers, OpenAPI documentation, Playwright tests, Vitest tests, and Cloudflare deployment scripts must continue to operate.
