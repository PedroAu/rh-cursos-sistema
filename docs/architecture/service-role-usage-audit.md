# Service-role Supabase usage audit

## Boundary rule

`createAdminClient()` uses the Supabase service-role key and must remain server-only.
The module `src/lib/supabase/admin.ts` imports `server-only`, so Next.js rejects
client bundle imports. A static test also checks that files with `"use client"` do
not import `@/lib/supabase/admin` directly.

Allowed usage:

- Server Actions under `src/app/actions/` and auth action modules.
- Route handlers under `src/app/api/` or server-only route groups.
- Server Components and server data modules that are only called from server
  rendering or actions.
- Supabase auth/session proxy code that runs on the server edge/runtime.

Disallowed usage:

- Client Components.
- Browser utilities.
- Shared component modules that can be imported by Client Components.
- Any code path that serializes service-role keys, Supabase secrets, or admin
  client objects to the browser.

## Current inventory

| File | Classification | Purpose | Server-only justification |
| --- | --- | --- | --- |
| `src/lib/supabase/admin.ts` | Service-role factory | Creates Supabase service-role client | Protected by `server-only`; no React client directive |
| `src/lib/auth.ts` | Auth helper | Reads `profiles.role` for admin authorization | Called from server layout/auth paths; uses Supabase server auth first |
| `src/lib/supabase/proxy.ts` | Auth/session proxy | Refreshes session and reads profile role for redirects | Used by middleware/proxy runtime, not browser code |
| `src/lib/public-data.ts` | Server data module | Reads public catalog/enrollment context from legacy tables | Imported by Server Components/pages; no client directive |
| `src/lib/admin-data.ts` | Server data module | Reads admin dashboards/lists and restore metadata | Imported by admin Server Components/pages; admin layout protects access |
| `src/lib/admin-settings.ts` | Server data module | Reads/writes admin site settings and branding metadata | Used by server pages/actions only |
| `src/app/actions/public.ts` | Server Action | Inserts leads/enrollments and fallback records | `"use server"` module |
| `src/app/actions/payment.ts` | Server Action | Creates Asaas Pix/Boleto charges and writes payment rows | `"use server"` module; amount derived server-side |
| `src/app/actions/admin.ts` | Server Action | Admin CRUD, user management, settings, and storage writes | `"use server"` module; admin UI calls server actions |
| `src/app/(auth)/login/actions.ts` | Server Action | Login and role lookup | `"use server"` module |
| `src/app/api/payments/status/[chargeId]/route.ts` | Route handler | Reads payment status by Asaas charge id | App Router route handler, server-only |
| `src/app/api/payments/webhook/route.ts` | Route handler | Authenticates Asaas webhooks, writes audit/status updates | App Router route handler, server-only |
| `src/app/(admin)/admin/leads/export/route.ts` | Route handler | Verifies admin session and exports leads CSV | App Router route handler under admin route group |

## Risks and controls

- Highest-risk boundary: accidental import of `src/lib/supabase/admin.ts` into a
  Client Component. Control: `server-only` import plus
  `src/lib/supabase/admin-boundary.test.ts`.
- Broadest privileged surface: `src/app/actions/admin.ts`, which owns many admin
  mutations. Existing admin routes are protected by `requireAdmin()` at admin
  layout level, but individual server actions should continue to validate inputs
  and avoid returning raw Supabase errors.
- Public Server Actions use service-role access for legacy tables. This is
  acceptable only because actions run server-side; they must keep controlled
  error responses and never expose admin client data.

No client-boundary violation was found in the current app source.
