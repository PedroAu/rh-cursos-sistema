-- =============================================================
-- RH Cursos — Payments (Asaas Sandbox)
-- IDEMPOTENCY GUARANTEE:
--   Asaas delivers webhooks AT-LEAST-ONCE, so the same event may arrive
--   more than once. Dedup is enforced by UNIQUE(payment_events.asaas_event_id)
--   on the Asaas EVENT id (evt_...) — NOT on the payment id. The webhook
--   handler does INSERT ... ON CONFLICT (asaas_event_id) DO NOTHING; a
--   conflict means "already processed" and the handler returns 200 without
--   re-applying side effects. This makes redelivery a safe no-op.
-- Approved by owner (F1 gate). enrollment linkage is text (no hard FK) because
-- the running code writes to course_enrollments (text PK), not enrollments(uuid).
-- =============================================================

-- ---------- ENUMS ----------
create type payment_billing_type as enum ('PIX', 'BOLETO', 'CREDIT_CARD');

-- Mirrors Asaas payment statuses (sandbox v3). Superset is intentional:
-- we store whatever Asaas sends so the audit row never loses fidelity.
create type payment_status as enum (
  'PENDING', 'CONFIRMED', 'RECEIVED', 'OVERDUE', 'REFUNDED',
  'RECEIVED_IN_CASH', 'REFUND_REQUESTED', 'CHARGEBACK_REQUESTED',
  'CHARGEBACK_DISPUTE', 'AWAITING_CHARGEBACK_REVERSAL',
  'DUNNING_REQUESTED', 'DUNNING_RECEIVED', 'AWAITING_RISK_ANALYSIS', 'FAILED'
);

-- ---------- PAYMENTS (one row per Asaas charge) ----------
create table payments (
  id                     uuid primary key default gen_random_uuid(),

  -- Enrollment hook. NULLABLE + text on purpose: the canonical enrollment
  -- table is unresolved; enrollment_ref holds the live id as text
  -- (course_enrollments.id is text 'enr-...'). Migratable to a real FK once
  -- the enrollment schema is unified (future cycle).
  enrollment_ref         text,
  course_id              uuid not null references courses(id) on delete restrict,

  -- Server-derived amount audit. amount_cents is the value WE computed from
  -- courses.preco at charge time; never from the client.
  amount_cents           integer not null check (amount_cents >= 0),
  course_preco_snapshot  numeric(10,2) not null,

  -- Asaas linkage
  asaas_charge_id        text not null unique,        -- payment id at Asaas (pay_...)
  asaas_customer_id      text not null,               -- cus_...
  billing_type           payment_billing_type not null,
  status                 payment_status not null default 'PENDING',

  -- Method-specific artifacts (nullable; only the relevant one is set).
  -- Card: ONLY the hosted redirect URL — NO PAN, NO card fields ever (SAQ-A).
  invoice_url            text,                         -- card hosted redirect
  pix_payload            text,                         -- copia-e-cola
  pix_qrcode_image       text,                         -- encodedImage base64
  boleto_url             text,                         -- bankSlipUrl PDF
  boleto_linha_digitavel text,                         -- identificationField

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index idx_payments_course         on payments(course_id);
create index idx_payments_enrollment_ref on payments(enrollment_ref);
create index idx_payments_status         on payments(status);

-- ---------- PAYMENT_EVENTS (one row per webhook delivery — dedup unit) ----------
create table payment_events (
  id              uuid primary key default gen_random_uuid(),
  payment_id      uuid references payments(id) on delete cascade,
  asaas_event_id  text not null unique,            -- evt_... — THE dedup key
  asaas_charge_id text not null,                   -- pay_... for correlation
  event_type      text not null,                   -- PAYMENT_CONFIRMED, etc.
  raw_event       jsonb not null,                  -- full payload for audit
  received_at     timestamptz not null default now()
);

create index idx_payment_events_payment on payment_events(payment_id);
create index idx_payment_events_charge  on payment_events(asaas_charge_id);

-- ---------- updated_at trigger (payments) ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_payments_touch
  before update on payments
  for each row execute function public.touch_updated_at();

-- ---------- RLS ----------
-- Service-role (createAdminClient) BYPASSES RLS, so the webhook route and
-- server actions write freely. NO public insert/update policy: payments must
-- NEVER be written by an anon/authenticated client — amount authority is
-- server-only.
alter table payments       enable row level security;
alter table payment_events enable row level security;

create policy "payments: admin read"
  on payments for select using ( public.is_admin() );

create policy "payment_events: admin read"
  on payment_events for select using ( public.is_admin() );

-- NOTE: intentionally NO insert/update/delete policies for anon/authenticated.
-- All writes go through service-role (RLS-bypassing) server code only.
