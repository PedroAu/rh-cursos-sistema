# Site Security Audit - 2026-06-21

**Scope:** local authorized review of this Next.js/Supabase website repository.  
**Mode:** defensive, non-destructive static audit plus dependency audit.  
**Dynamic testing:** not performed; no production target was attacked or scanned.

## Checks Run

- Reviewed Cybersecurity Squad command/task coverage and added `*audit-site`.
- Reviewed Next.js local docs in `node_modules/next/dist/docs/` for Server Actions, data security, auth, and headers.
- Reviewed privileged Supabase service-role usage, server actions, route handlers, middleware, redirects, payment webhook handling, and config.
- Ran `npm audit --audit-level=moderate --json`.
- Checked for local env/secret files without printing their contents.

## Overall Posture

The site has a reasonable authentication boundary for rendered admin pages and a strong webhook token comparison, but mutation boundaries need hardening. The main risk is that admin server actions use the Supabase service-role client directly without re-authorizing inside each action. Next.js guidance treats Server Actions as public-facing mutation endpoints and requires authentication/authorization checks inside the action itself, not only in layouts or UI.

## Findings

### HIGH - Admin Server Actions Do Not Re-Authorize Inside The Action

**OWASP:** A01 Broken Access Control  
**CWE:** CWE-862 Missing Authorization  
**Evidence:** `src/app/actions/admin.ts:134`, `src/app/actions/admin.ts:193`, and subsequent exported mutations use `createAdminClient()` but the file does not import or call `requireAdmin()`, `getOptionalUserProfile()`, `auth.getUser()`, or an equivalent guard before privileged mutations.

**Impact:** If a server action endpoint/id is invoked outside the intended admin UI, the action can perform service-role mutations such as creating users, changing roles/status, inserting courses/classes/leads/students, deleting/soft-deleting records, and updating branding/settings. Relying on the admin layout is insufficient for mutation endpoints.

**Remediation:**

- Add a shared guard, for example `assertAdminAction()`, that reads the current Supabase session and verifies `profiles.role === "admin"`.
- Call it at the start of every exported function in `src/app/actions/admin.ts` before reading or mutating data.
- Add tests that call representative admin actions with no user, non-admin user, and admin user.

### MEDIUM - Public Payment Status Endpoint Uses Service Role And Exposes Status By Charge ID Alone

**OWASP:** A01 Broken Access Control / A04 Insecure Design  
**CWE:** CWE-639 Authorization Bypass Through User-Controlled Key  
**Evidence:** `src/app/api/payments/status/[chargeId]/route.ts:8` exposes a public `GET`; `src/app/api/payments/status/[chargeId]/route.ts:18` creates a service-role Supabase client; `src/app/api/payments/status/[chargeId]/route.ts:22` authorizes only by `asaas_charge_id`.

**Impact:** Anyone who knows or obtains a charge id can query payment status. Depending on charge id entropy and exposure in checkout URLs or client state, this can disclose payment state and support enumeration/timing probes.

**Remediation:**

- Require a signed status token, enrollment reference bound to the session, or a short-lived lookup token generated when the checkout is created.
- Rate-limit this endpoint.
- Avoid service-role reads for public status where RLS plus a constrained anonymous/session policy can satisfy the lookup.

### MEDIUM - Missing Security Headers In Next Config

**OWASP:** A05 Security Misconfiguration  
**CWE:** CWE-693 Protection Mechanism Failure  
**Evidence:** `next.config.ts:3` defines only `turbopack.root`; there is no `headers()` configuration for CSP, `X-Frame-Options` or `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, or HSTS.

**Impact:** The app has less browser-side protection against XSS impact, clickjacking, MIME sniffing, excessive referrer leakage, and unwanted browser capabilities. This is especially relevant because the site handles login, leads, enrollment, payment flow, and admin workflows.

**Remediation:**

- Add conservative global headers in `next.config.ts`.
- Start CSP in `Report-Only` if needed, then enforce after validating third-party scripts/assets.
- Include HSTS only for HTTPS production domains.

### MEDIUM - Dependency Audit Reports Moderate Next/PostCSS Vulnerability

**OWASP:** A06 Vulnerable and Outdated Components  
**CWE:** CWE-79 Cross-Site Scripting  
**Evidence:** `npm audit --audit-level=moderate --json` reports `postcss <8.5.10` via `next`, advisory `GHSA-qx2v-qp2m-jg93`, affecting `next` range `9.3.4-canary.0 - 16.3.0-canary.5`. Current `package.json` pins `next` to `16.2.9`.

**Impact:** Moderate XSS risk in CSS stringify output. Exploitability depends on whether attacker-controlled CSS can reach PostCSS stringify paths, but the dependency should be patched.

**Remediation:**

- Upgrade Next to a patched release once available for this major line.
- Re-run `npm audit --audit-level=moderate`.
- If no patched Next exists yet, track the advisory and avoid processing attacker-controlled CSS.

### LOW - Local Secret Files Are Present In The Workspace

**OWASP:** A05 Security Misconfiguration / A02 Cryptographic Failures  
**Evidence:** local files matching secret patterns exist: `.env`, `.env.local`, `.next/standalone/.env`, and `.env.example`. Contents were intentionally not printed. `.gitignore` ignores `.env*` and `.next/`, so this is local hygiene rather than confirmed repository leakage.

**Impact:** Local secret sprawl increases accidental disclosure risk through backups, screen sharing, artifact packaging, or deployment bundles.

**Remediation:**

- Keep `.env.example` sanitized.
- Remove `.next/standalone/.env` before packaging artifacts unless explicitly required by the target platform.
- Rotate secrets if any were ever committed, shared, or bundled into public artifacts.

## Positive Findings

- Payment webhook uses constant-time token comparison and rejects invalid/missing tokens before parsing payload: `src/app/api/payments/webhook/route.ts`.
- Admin page rendering is guarded through `requireAdmin()` in admin layout/page paths.
- `createAdminClient()` is marked `server-only`, reducing accidental client bundling risk.
- Admin lead CSV export performs an explicit current-user admin check before returning data.

## Recommended Next Fix Order

1. Add and test an admin action authorization guard for every exported mutation in `src/app/actions/admin.ts`.
2. Add security headers in `next.config.ts`, starting with CSP report-only if the asset/script surface is uncertain.
3. Harden `/api/payments/status/[chargeId]` with a signed lookup token or authenticated ownership check plus rate limiting.
4. Track and patch the Next/PostCSS advisory.
5. Clean local env artifacts and confirm no secrets are committed.

## Remediation Status

| Finding | Status | Evidence |
| --- | --- | --- |
| HIGH - Admin Server Actions Do Not Re-Authorize Inside The Action | Remediated in Story 2.1 | `src/lib/admin-action-auth.ts`, `src/app/actions/admin.ts`, `docs/stories/2.1.authorize-admin-server-actions.md`, `docs/qa/gates/2.1-authorize-admin-server-actions.yml` |
| MEDIUM - Public Payment Status Endpoint Uses Service Role And Exposes Status By Charge ID Alone | Remediated in Story 2.2 | `docs/stories/2.2.harden-payment-status-lookup.md`, `docs/security/payment-status-authorization-design-2026-06-21.md`, `src/lib/payments/status-token.ts`, `src/app/api/payments/status/[chargeId]/route.ts` |
| MEDIUM - Missing Security Headers In Next Config | Remediated in Story 2.3 | `docs/stories/2.3.add-baseline-security-headers.md`, `next.config.ts`, `next.config.test.ts` |
| MEDIUM - Dependency Audit Reports Moderate Next/PostCSS Vulnerability | Waived temporarily | `docs/stories/2.4.resolve-next-postcss-advisory.md`, `docs/security/waivers/next-postcss-ghsa-qx2v-qp2m-jg93-2026-06-21.md` |
| LOW - Local Secret Files Are Present In The Workspace | Remediated in Story 2.5 | `docs/stories/2.5.clean-secret-artifacts-and-hygiene-check.md`, `docs/security/secret-hygiene-check.md`, `scripts/check-secret-hygiene.mjs` |

## Command Added

The Cybersecurity Squad now supports `*audit-site`, backed by:

- `squads/cybersecurity/tasks/audit-site-security.md`
- `squads/cybersecurity/agents/cyber-chief.md`
- `squads/cybersecurity/squad.yaml`
- regenerated `.codex/skills/aiox-cyber-chief/SKILL.md`
