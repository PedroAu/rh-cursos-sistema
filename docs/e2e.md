# E2E tests

Playwright specs live in `e2e/` and are wired by `playwright.config.ts`.

Run:

```bash
npm run test:e2e
```

The config starts `npm run dev` at `http://localhost:3000` and reuses an existing
server when available.

## Coverage

- `e2e/smoke.spec.ts`: home page smoke check.
- `e2e/login.spec.ts`: unauthenticated login form/admin-entry coverage that does
  not require a real Supabase user.
- `e2e/enrollment.spec.ts`: public course navigation and enrollment form coverage.
- `e2e/a11y.spec.ts`: axe checks for critical public routes.
- `e2e/payment.spec.ts`: Pix/Boleto checkout UI coverage.

## Payment safety

`e2e/payment.spec.ts` uses `/pagamento/:slug?e2eMockCheckout=1`.
`PaymentPage` only enables this mock when `NODE_ENV !== "production"`, and the
client returns deterministic Pix/Boleto artifacts without calling Asaas or
Supabase. No real charge is created by the E2E checkout specs.

## Test data

The CI seeds the following dedicated fixture into the isolated E2E Supabase
project before Playwright starts. The job uses `upsert` only by its fixed E2E
IDs, so it never alters operational or manual agenda records:

```text
curso-e2e-atualizacao-esocial
```

Login tests intentionally avoid real credentials. Full authenticated admin E2E
coverage requires seeded Supabase test users and is outside the current local
fixture scope.

## CI environment isolation

The GitHub Actions E2E job uses the `e2e` Environment only for internal pull
requests and pushes. It is skipped for forks, so untrusted code never receives
test-project credentials.

The job validates these controls before Playwright starts:

- `E2E_ALLOW_DATABASE_WRITES=1` and `E2E_TARGET_KIND=isolated-test`;
- `E2E_SUPABASE_PROJECT_REF` differs from `E2E_PRODUCTION_PROJECT_REF`;
- the Supabase and Functions URLs belong to the declared E2E project;
- the Supabase credentials are not placeholders.

Only after this validation passes does CI upsert the dedicated E2E course and
class fixture. The seeding script imports the same validator, so it cannot
write to an undeclared or production target when invoked independently.

Configure the `e2e` Environment with the E2E Supabase URL, Functions URL,
publishable key, service-role key, and session secret. Store the two project
refs as Environment variables, never as application code. The CI serializes
this job because all future write-capable tests share the same isolated target.
