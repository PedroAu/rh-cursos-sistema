# Enrollment RPC fallback observability

## Primary RPC path

`submitEnrollmentAction()` first calls Supabase RPC `registrar_inscricao_publica`
through `registerEnrollmentViaRpc()`.

Expected side effects:

- Creates the enrollment according to database-side RPC behavior.
- Receives normalized payment method values (`Pix`, `Boleto`, `Cartao`, `Empenho`).
- Revalidates the requested internal enrollment path when supplied.
- Returns a controlled success message to the user.

## Direct `course_enrollments` fallback

When the RPC fails and `course_enrollments` is available,
`submitEnrollmentAction()` inserts directly into `course_enrollments`.

Expected side effects:

- Writes the same required business fields supplied to the RPC path: applicant
  identity/contact fields, organization, course id, class id, payment method,
  LGPD acceptance, and observations.
- Adds generated `enr-*` id and `updated_at` timestamp required by the direct
  table path.
- Revalidates the requested internal enrollment path when supplied.
- Emits `console.warn("[enrollment-fallback]", { reason, target })` with
  `target: "course_enrollments"`.

The observability signal intentionally excludes applicant name, email, CPF,
phone, organization, and raw Supabase error messages.

## Lead fallback

When the RPC fails and `course_enrollments` is unavailable, the action records a
commercial lead instead of a full enrollment.

Expected side effects:

- Writes contact information and course interest to `lead`.
- Revalidates the requested internal enrollment path when supplied.
- Emits `console.warn("[enrollment-fallback]", { reason, target })` with
  `target: "lead"`.

Known mismatch:

- The lead fallback is not equivalent to a full enrollment record because it
  cannot persist class id, payment method, LGPD acceptance, or enrollment status.
  It is a degraded capture path for commercial follow-up. Schema unification or
  reliable `course_enrollments` availability is required to remove this mismatch.

## Error behavior

User-facing responses stay controlled:

- RPC failure is never exposed directly.
- Direct fallback insert failure returns a generic enrollment error.
- Lead fallback insert failure returns a generic registration error.
