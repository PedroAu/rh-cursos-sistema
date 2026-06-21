# Payment course identity boundary

## Live paths

Public catalog and enrollment surfaces still read the legacy Portuguese schema:

- `src/lib/public-data.ts` loads public courses from `curso` and classes from `turma`.
- `src/app/actions/public.ts` records public enrollment data using legacy course/class ids.
- Payment creation is separate: `src/app/actions/payment.ts` creates Asaas Pix/Boleto charges and writes to `payments`, whose `course_id` references the newer `courses.id` UUID.

Because those models are not unified, checkout must not treat a legacy `curso.id`
as a valid `payments.course_id`.

## Canonical resolver

`src/lib/payments/course-identity.ts` owns the payment identity boundary.

Allowed inputs:

- `courseSlug`: resolved server-side against `courses.slug`.
- `courseId`: accepted only when it resolves as an actual `courses.id`.

Rejected inputs:

- Missing identity.
- Legacy `curso.id` text values that do not match a row in `courses.id`.
- Any lookup failure or mismatch.

Payment creation continues to derive the charged amount from `courses.preco` after
the resolver returns the canonical row. Client-provided amounts remain ignored.

## Remaining dual-schema risk

The brownfield risk remains until the public catalog/enrollment model and the
payment model share one canonical course table or a versioned mapping table.
Until that migration is done, new payment entry points must call
`resolveCourseForPayment()` instead of querying legacy course tables directly.

Recommended migration path:

1. Backfill a stable mapping between legacy `curso.id` and canonical `courses.id`.
2. Move public catalog reads to the canonical course model or expose a database view
   that makes the mapping explicit.
3. Retire direct payment dependencies on legacy ids after enrollment and payment
   records share the same canonical course identity.
