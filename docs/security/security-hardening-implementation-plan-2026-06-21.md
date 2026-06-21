# Security Hardening Implementation Plan - 2026-06-21

**Owner:** PM (Morgan)  
**Source audit:** `docs/security/site-security-audit-2026-06-21.md`  
**Product goal:** reduce exploitable security risk in admin mutations, payment status disclosure, browser security posture, dependency posture, and secret hygiene without disrupting the public enrollment/payment flow.

## Executive Summary

The implementation should be handled as one brownfield security-hardening epic with five stories. The first story is blocking because admin mutations currently rely on page/layout authorization while using a Supabase service-role client inside Server Actions. Next.js 16 guidance treats Server Actions as public-facing mutation endpoints, so each privileged mutation needs its own authorization check.

## Proposed Epic

**Epic 2: Website Security Hardening**

As the RH Cursos site owner, I want critical security findings from the 2026-06-21 audit remediated so that admin operations, payment status checks, browser protections, dependencies, and local secret handling meet a defensible production security baseline.

### Epic Outcomes

- Admin Server Actions require explicit admin authorization before privileged mutations.
- Payment status lookup does not expose payment state by charge id alone.
- Production responses include baseline browser security headers.
- Dependency audit has no known moderate-or-higher actionable vulnerability, or a documented waiver if no patched Next version exists.
- Local secret artifacts are cleaned and repository hygiene is verified.

### Non-Goals

- No destructive security testing.
- No production pentest in this epic.
- No redesign of the full auth model unless required by implementation.
- No migration away from Supabase or Asaas.

## Prioritized Stories

### Story 2.1 - Authorize Every Admin Server Action

**Priority:** P0  
**Owner:** @dev  
**Review:** @qa, @data-engineer  
**Source finding:** HIGH - Admin Server Actions Do Not Re-Authorize Inside The Action

**User story:** As an admin platform maintainer, I want every admin mutation to verify the current user is an admin inside the Server Action so that privileged service-role operations cannot be invoked outside the authorized admin context.

**Acceptance criteria:**

- A shared server-only guard exists, for example `assertAdminAction()`, that reads the current Supabase session and verifies `profiles.role === "admin"`.
- Every exported mutation in `src/app/actions/admin.ts` calls the guard before creating or using the service-role client for privileged mutations.
- Unauthorized and non-admin callers receive a safe failure result without mutating Supabase.
- Tests cover at least one create, one update, one delete/soft-delete, and one settings/asset mutation path with no user, non-admin user, and admin user.
- Existing admin happy-path behavior remains unchanged.

**Suggested implementation notes:**

- Prefer a reusable helper near `src/lib/auth.ts` or a new server-only admin action guard module.
- Avoid relying only on `src/app/(admin)/layout.tsx`.
- Keep service-role access behind server-only modules.

**Quality gates:**

- `npm run lint`
- `npm run typecheck`
- `npm test`
- QA security review focused on Broken Access Control.

### Story 2.2 - Harden Payment Status Lookup

**Priority:** P1  
**Owner:** @architect + @dev  
**Review:** @qa, @data-engineer  
**Source finding:** MEDIUM - Public Payment Status Endpoint Uses Service Role And Exposes Status By Charge ID Alone

**User story:** As a buyer checking payment progress, I want payment status lookups to be limited to authorized checkout context so that payment state is not disclosed by possession of a charge id alone.

**Acceptance criteria:**

- `/api/payments/status/[chargeId]` requires a signed lookup token, bound enrollment reference, or equivalent authorization mechanism.
- The status lookup cannot be completed with only `chargeId`.
- Invalid, expired, or mismatched lookup authorization returns a generic safe error.
- Tests cover valid token, missing token, invalid token, and unknown charge.
- If service-role remains necessary, its use is constrained and documented.

**Suggested implementation notes:**

- Architect should choose between signed token, short-lived checkout status token, or RLS-backed lookup.
- Consider rate limiting after the authorization model is defined.

**Quality gates:**

- API contract tests for status route.
- Regression test for payment checkout UI polling.
- QA review for IDOR/payment state disclosure.

### Story 2.3 - Add Baseline Security Headers

**Priority:** P1  
**Owner:** @dev  
**Review:** @qa, @architect  
**Source finding:** MEDIUM - Missing Security Headers In Next Config

**User story:** As a site visitor and admin user, I want the browser to receive baseline security headers so that XSS impact, clickjacking, MIME sniffing, referrer leakage, and excessive browser permissions are reduced.

**Acceptance criteria:**

- `next.config.ts` defines global security headers through `headers()`.
- Baseline includes `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and either `X-Frame-Options` or CSP `frame-ancestors`.
- CSP is added either enforced or report-only with a documented allowlist for required assets/scripts.
- HSTS is included only when safe for HTTPS production deployment.
- Tests or verification script confirm headers are present on representative routes.

**Suggested implementation notes:**

- Start CSP as `Content-Security-Policy-Report-Only` if third-party asset/script usage is uncertain.
- Avoid breaking Next static assets, Supabase, Asaas, or analytics if present.

**Quality gates:**

- `npm run build` or deployment build equivalent.
- Header verification against local dev or preview.
- QA browser smoke test for public, login, admin routes.

### Story 2.4 - Resolve Or Track Next/PostCSS Advisory

**Priority:** P2  
**Owner:** @devops + @dev  
**Review:** @qa  
**Source finding:** MEDIUM - Dependency Audit Reports Moderate Next/PostCSS Vulnerability

**User story:** As a maintainer, I want dependency vulnerabilities triaged and patched or explicitly waived so that releases have a known dependency risk posture.

**Acceptance criteria:**

- `npm audit --audit-level=moderate` is re-run and result is captured.
- If a patched compatible Next version exists, dependencies are upgraded and tests/build pass.
- If no compatible patched version exists, a documented waiver is created with rationale, impact, monitoring trigger, and expiration date.
- The package lock is updated only when a real dependency change is made.

**Quality gates:**

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build:cloudflare` if dependency upgrade is performed.

### Story 2.5 - Clean Secret Artifacts And Add Hygiene Check

**Priority:** P2  
**Owner:** @devops  
**Review:** @qa  
**Source finding:** LOW - Local Secret Files Are Present In The Workspace

**User story:** As a maintainer, I want local secret artifacts cleaned and checked so that secrets are less likely to leak through commits, packaged artifacts, or shared workspaces.

**Acceptance criteria:**

- `.env.example` is confirmed sanitized.
- Generated `.next/standalone/.env` is removed from local artifacts or documented as intentionally generated and excluded from packaging.
- A secret hygiene check is documented or scripted for release/deploy preparation.
- Git history/status check confirms no `.env` secrets are tracked.

**Quality gates:**

- `git status --ignored` review for env artifacts.
- Optional secret scanning tool if available in the environment.

## Suggested Delivery Sequence

1. **Wave 1:** Story 2.1 only. This is the highest security risk and should land before other hardening work.
2. **Wave 2:** Stories 2.2 and 2.3 in parallel after Story 2.1 starts, because they touch separate surfaces.
3. **Wave 3:** Stories 2.4 and 2.5 as release-readiness tasks.

## Risk And Dependency Notes

- Story 2.1 may touch many tests because admin actions are broad. Keep the guard small and reusable.
- Story 2.2 needs a short architecture decision before implementation; avoid choosing a token model ad hoc.
- Story 2.3 can break assets or integrations if CSP is too strict; use report-only first if uncertain.
- Story 2.4 may be blocked by upstream Next release availability.
- Story 2.5 must not print or commit secret contents.

## Definition Of Done For The Epic

- All stories pass `npm run lint`, `npm run typecheck`, and `npm test`.
- Security audit report is updated with remediation status.
- QA gate records no open P0/P1 security concerns.
- Any accepted residual risk has an owner and expiration/review date.

## Execution Status

| Story | Status | Notes |
| --- | --- | --- |
| 2.1 - Authorize Every Admin Server Action | Ready for Review | Implemented with QA gate `CONCERNS` due unrelated repo-wide lint issue; story-scoped tests/lint/typecheck pass. |
| 2.2 - Harden Payment Status Lookup | Approved | Architecture decision created; implementation pending. |
| 2.3 - Add Baseline Security Headers | Approved | Implementation pending. |
| 2.4 - Resolve Or Track Next/PostCSS Advisory | Approved | Implementation pending. |
| 2.5 - Clean Secret Artifacts And Add Hygiene Check | Approved | Implementation pending. |

## Handoff

Recommended next agents:

- `@architect`: design payment status authorization approach for Story 2.2.
- `@sm`: split this implementation plan into formal story files in `docs/stories/`.
- `@po`: validate acceptance criteria and prioritization before sprint execution.
- `@dev`: implement Story 2.1 after PO approval.
- `@qa`: perform security-focused review and gates.
