-- Timestamp-arbitrated Asaas webhook status application.
-- Replaces the temporary linear status rank guard with "newest event wins" using
-- the Asaas webhook dateCreated field when available.

alter table payments
  add column if not exists status_event_at timestamptz;

create index if not exists idx_payments_status_event_at on payments(status_event_at);

drop function if exists public.apply_payment_webhook_event(text, text, text, payment_status, jsonb);
drop function if exists public.apply_payment_webhook_event(text, text, text, payment_status, timestamptz, jsonb);

create or replace function public.apply_payment_webhook_event(
  p_asaas_event_id   text,
  p_asaas_charge_id  text,
  p_event_type       text,
  p_new_status       payment_status,
  p_event_created_at timestamptz,
  p_raw_event        jsonb
)
returns table (payment_id uuid, duplicate boolean, applied_status payment_status)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment_id uuid;
  v_payment_status payment_status;
  v_inserted integer := 0;
begin
  select id into v_payment_id
  from payments
  where asaas_charge_id = p_asaas_charge_id;

  insert into payment_events (
    payment_id,
    asaas_event_id,
    asaas_charge_id,
    event_type,
    raw_event
  )
  values (
    v_payment_id,
    p_asaas_event_id,
    p_asaas_charge_id,
    p_event_type,
    p_raw_event
  )
  on conflict (asaas_event_id) do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted > 0 and v_payment_id is not null and p_new_status is not null then
    update payments p
    set
      status = p_new_status,
      status_event_at = coalesce(p_event_created_at, p.status_event_at)
    where p.id = v_payment_id
      and (
        p_event_created_at is null
        or p.status_event_at is null
        or p_event_created_at >= p.status_event_at
      );
  end if;

  if v_payment_id is not null then
    select status into v_payment_status
    from payments
    where id = v_payment_id;
  end if;

  return query select v_payment_id, (v_inserted = 0), v_payment_status;
end;
$$;

create or replace function public.apply_payment_webhook_event(
  p_asaas_event_id  text,
  p_asaas_charge_id text,
  p_event_type      text,
  p_new_status      payment_status,
  p_raw_event       jsonb
)
returns table (payment_id uuid, duplicate boolean, applied_status payment_status)
language sql
security definer
set search_path = public
as $$
  select *
  from public.apply_payment_webhook_event(
    p_asaas_event_id,
    p_asaas_charge_id,
    p_event_type,
    p_new_status,
    null::timestamptz,
    p_raw_event
  )
$$;

drop function if exists public.payment_status_rank(payment_status);
