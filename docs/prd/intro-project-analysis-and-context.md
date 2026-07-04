# Intro Project Analysis and Context

## Existing Project Overview

### Analysis Source

IDE-based fresh analysis using existing brownfield discovery outputs and current repository artifacts:

- `docs/history/reports/BROWNFIELD-DISCOVERY-COMPLETE.md`
- `docs/ARCHITECTURE.md`
- `docs/architecture/system-architecture.md`
- `docs/architecture/TECHNICAL-DEBT-REPORT.md`
- `docs/database/SCHEMA.md`
- `docs/api/openapi.yaml`
- `README.md`
- Current `app/`, `src/`, `supabase/`, `tests/`, and `docs/` structure

### Current Project State

RH Cursos is an existing production-oriented SaaS platform for corporate training and technical education. The current application already includes a public website with home, courses, agenda, in-company, blog, contact, specialist contact, login, and enrollment confirmation routes; an administrative area for courses, classes, students, leads, enrollments, instructors, blog, and settings; Supabase-backed data access; RLS policies; OpenAPI documentation; automated tests; and Cloudflare Workers deployment.

The product direction validated for this PRD is to position RH Cursos as a courses and consulting company for public and private sector organizations, delivering practical knowledge that can be applied according to current laws and regulatory requirements.

## Available Documentation Analysis

### Available Documentation

- [x] Tech Stack Documentation
- [x] Source Tree/Architecture
- [x] Coding Standards
- [x] API Documentation
- [x] External API Documentation
- [x] UX/UI Guidelines
- [x] Technical Debt Documentation
- [x] Other: database schema, RLS audit, design system, deployment, troubleshooting, QA gates, accessibility reports, market research, and prior epics/stories

Prior brownfield discovery was completed on 2026-06-22 and found the project production-ready, with strategic remediation themes around accessibility, error handling, testing, monitoring, security headers, documentation, and AppStore/data-layer cleanup.

## Enhancement Scope Definition

### Enhancement Type

- [x] New Feature Addition
- [x] Major Feature Modification
- [ ] Integration with New Systems
- [ ] Performance/Scalability Improvements
- [x] UI/UX Overhaul
- [ ] Technology Stack Upgrade
- [ ] Bug Fix and Stability Improvements
- [x] Other: public consulting offer, student portal, and instructor portal

### Enhancement Description

The enhancement will evolve the current RH Cursos site into a clearer commercial and operational platform for courses, in-company training, and consulting. It must present the public agenda of courses, promote in-company training, introduce consulting as a conversion-focused public offer with its own page or section and lead capture, and extend the authenticated experience with student and instructor areas while preserving the existing administrative area.

### Impact Assessment

- [ ] Minimal Impact (isolated additions)
- [x] Moderate Impact (some existing code changes)
- [x] Significant Impact (substantial existing code changes)
- [ ] Major Impact (architectural changes required)

The enhancement is significant because student and instructor portals were previously kept out of active release scope, and consulting requires public navigation, content model decisions, lead capture semantics, and admin operational visibility. However, the existing database, RBAC helpers, admin resources, lead model, and public routes provide a strong foundation, so a full architectural rewrite is not expected.

## Goals and Background Context

### Goals

- Make the public site communicate RH Cursos as a provider of practical training and consulting for public and private sector organizations.
- Make course agenda discovery clear, searchable, and connected to enrollment or commercial contact.
- Make in-company training a clear corporate conversion path.
- Add consulting as a public conversion offer with its own lead capture path.
- Preserve and improve the administrative area as the operational control center for site content and commercial records.
- Enable student and instructor areas without weakening the existing admin security model.
- Keep the current Next.js, Supabase, Cloudflare Workers, design system, and testing foundations.

### Background Context

The current platform already covers many public and administrative workflows, but the business positioning needs to be clearer: RH Cursos is not only a course catalog, but a company that helps organizations and professionals apply knowledge in legally regulated contexts. The website should therefore make the relationship between courses, in-company programs, consulting, and legal applicability visible throughout the user journey.

The next major gap is role-based experience. The admin area is active and protected, while student and instructor experiences are supported by parts of the data model and auth contract but are not currently enabled as product surfaces. This PRD treats those areas as coordinated brownfield enhancements that must be introduced incrementally and verified against existing admin, public catalog, enrollment, lead, and RLS behavior.

## Change Log

| Change | Date | Version | Description | Author |
| --- | --- | --- | --- | --- |
| Initial brownfield PRD draft | 2026-06-30 | 0.1 | Created validated context and initial requirements for public consulting, admin, student, and instructor expansion | Morgan |
| NFR5 errata + Epic 14 cross-dependency | 2026-07-03 | 0.2 | Superseded Mantine reference in NFR5 (points to ADR-014); registered mandatory sequencing between Epic 1 (consulting/portals) and Epic 14 (Trust Keith redesign) in both epic docs | Orion (@aiox-master) |
