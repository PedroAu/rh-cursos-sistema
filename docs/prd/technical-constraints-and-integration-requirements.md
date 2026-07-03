# Technical Constraints and Integration Requirements

## Risk Assessment and Mitigation

**Product Risks:** The consulting offer may become only an institutional page if it is not clearly differentiated from open courses and in-company training. The public site may also lose conversion focus if too many CTAs compete for attention. To mitigate this, the enhancement should preserve three explicit commercial journeys and define dedicated CTA destinations for each one.

**Portal Scope Risks:** The student and instructor areas may accumulate unrealistic expectations if MVP boundaries are not preserved. In particular, users may assume certificates, materials, payment history, support workflows, attendance actions, or publishing flows are included from day one. To mitigate this, the epic must keep student and instructor MVP focused on authenticated visibility of authorized context, while any operational workflows require explicit later stories.

**Technical Risks:** The project already has partial support for `student` and `instructor` roles in schema, auth contract, and RLS helpers, but that does not guarantee complete end-to-end application support. There is a risk of enabling routes or UI surfaces without complete integration across app state, route guards, API contracts, and tests. Mitigation requires story sequencing that validates data access, route protection, and UI integration incrementally.

**Lead Management Risks:** Consulting leads may lose commercial value if they are treated as generic leads without strong origin, type, and context differentiation. The mitigation is to preserve or extend lead classification so that consulting, course, in-company, contact, and newsletter flows remain distinguishable in admin reporting and follow-up.

**Operational Risks:** The administrative area may need new content ownership and workflow rules for consulting pages, CTA text, and commercial copy. Without clear ownership, public positioning may become inconsistent. Mitigation requires explicit admin/content scope in the epic and validation of who manages consulting-related content.

**Security and Quality Risks:** New authenticated surfaces can introduce regressions in role isolation, RLS behavior, or public/admin flows that already work. The mitigation is to require fail-closed access control, automated verification for role-based access, and regression coverage for public conversion, admin leads, and existing auth behavior.

**Primary Delivery Risk:** The largest delivery risk is treating "student area" and "instructor area" as simple navigation additions when they may require new business rules, policies, screens, and test coverage. Mitigation requires incremental story slicing and refusal to bundle advanced portal capabilities into the MVP by default.
