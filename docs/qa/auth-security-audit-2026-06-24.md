# Auth Security Audit — EP-11.4

Date: 2026-06-24  
Scope owner: `@dev` / Subagente 1  
Decision: `WAIVED`

## Scope reviewed

- `app/api/auth/session/route.ts`
- `app/admin/layout.tsx`
- `src/lib/auth.ts`
- `src/lib/auth-session.ts`
- `src/lib/authorize.ts`
- `src/lib/app-store.tsx`
- `src/views/public/Login.tsx`
- `src/__tests__/app/api/auth-session-route.test.ts`
- `tests/route-auth.spec.ts`
- `tests/login-errors.spec.ts`

## External references reviewed

- Supabase User Sessions guide: confirms session = JWT + refresh token and session lifetime behavior.
- Supabase Sign out guide: confirms logout scopes `global`, `local`, `others`.
- Supabase Product Security guide: baseline hardening checklist used for residual-risk review.

## What is now evidenced by automation

- Public/admin routing still fails closed for missing session on `/admin`.
- Non-admin session cookies are rejected both by `/admin` and `GET /api/auth/session`.
- `GET /api/auth/session` returns `401` when the cookie is missing or invalid.
- `GET /api/auth/session` rejects tampered HMAC cookies instead of accepting optimistic client state.
- `DELETE /api/auth/session` always clears the local cookie and returns deterministic `mode: local-only` when no global revocation is possible.
- Login success persists the admin HMAC token in local storage and honors `next`.
- Existing unit coverage in `src/__tests__/app/api/auth-session-route.test.ts` already covers global logout success/fallback semantics for the Next Route Handler.

## Findings

### PASS-01 — Authorization input uses `app_metadata.role`

`POST /api/auth/session` authorizes administrative login with `result.data.user.app_metadata.role`. This matches Supabase guidance to avoid `user_metadata` for authorization decisions. `user_metadata.name` is used only as display data fallback.

### PASS-02 — Session cookie is short-lived and rotates before expiry

The branch uses a 30 minute HMAC cookie (`SESSION_TTL_MS`) with rotation threshold at 5 minutes. This behavior is present in code and should reduce stale-session drift between SSR protection and the client token mirror.

### PASS-03 — Logout is fail-safe locally

`DELETE /api/auth/session` clears the cookie even when Supabase global revocation is unavailable or fails. This is the correct safety direction for UI logout because local session teardown does not depend on external revocation success.

### WAIVED-01 — Global logout cannot invalidate already-issued access JWTs immediately

Supabase documents that sign-out revokes refresh tokens, but existing access JWTs remain valid until expiry. The branch mitigates this partially with short app session TTL and explicit `mode: global|local-only` feedback, but strict immediate revocation is not provable from this branch alone.

### WAIVED-02 — Login UI still collapses `401`, `403`, `429` and `503` into a generic credential error

This preserves low information disclosure to end users, but it weakens operator-facing diagnosability for rate-limit and service-availability events. The behavior is covered by tests and should stay documented until a product decision changes it.

### WAIVED-03 — Positive HTTP proof of the rotation path is still indirect in this sub-scope

This subagent expanded HTTP evidence for missing, tampered and non-admin cookies plus local-only/global logout semantics. The exact positive rotation path remains covered primarily by route-code inspection and surrounding unit behavior, not by a green end-to-end assertion in this limited file scope.

## Residual risks

- No direct automated contract for the Supabase Edge Function `auth-session` was extended in this sub-scope; current evidence here is strongest on the Next Route Handler.
- Immediate session invalidation across already-issued JWTs remains bounded by token expiry semantics from Supabase Auth.
- Positive HTTP evidence for the rotation branch should be strengthened later with a harness that can mint or obtain a server-accepted admin cookie deterministically.

## Recommendation

Keep EP-11.4 in `WAIVED` state until the broader branch confirms Edge Function parity for auth-session and decides whether differentiated operator-visible handling for `429`/`503` is required.
