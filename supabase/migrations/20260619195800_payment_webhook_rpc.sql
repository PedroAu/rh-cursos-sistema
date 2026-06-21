-- Atomic Asaas webhook application.
-- Keeps payment_events audit insertion and payment status side-effect in one
-- database transaction, and prevents stale deliveries from regressing status.

create or replace function public.payment_status_rank(p_status payment_status)
returns integer
language sql
immutable
as $$
  select case p_status
    when 'PENDING' then 10
    when 'AWAITING_RISK_ANALYSIS' then 20
    when 'OVERDUE' then 30
    when 'DUNNING_REQUESTED' then 40
    when 'DUNNING_RECEIVED' then 50
    when 'CONFIRMED' then 60
    when 'RECEIVED_IN_CASH' then 70
    when 'RECEIVED' then 80
    when 'REFUND_REQUESTED' then 90
    when 'REFUNDED' then 100
    when 'CHARGEBACK_REQUESTED' then 110
    when 'CHARGEBACK_DISPUTE' then 120
    when 'AWAITING_CHARGEBACK_REVERSAL' then 130
    when 'FAILED' then 140
    else 0
  end
$$;

drop function if exists public.apply_payment_webhook_event(text, text, text, payment_status, jsonb);

create or replace function public.apply_payment_webhook_event(
  p_asaas_event_id  text,
  p_asaas_charge_id text,
  p_event_type      text,
  p_new_status      payment_status,
  p_raw_event       jsonb
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
    set status = p_new_status
    where p.id = v_payment_id
      and public.payment_status_rank(p_new_status) >= public.payment_status_rank(p.status);
  end if;

  if v_payment_id is not null then
    select status into v_payment_status
    from payments
    where id = v_payment_id;
  end if;

  return query select v_payment_id, (v_inserted = 0), v_payment_status;
end;
$$;
