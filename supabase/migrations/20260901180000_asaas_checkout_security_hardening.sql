-- Security follow-up for the Asaas checkout. This migration is additive and
-- does not rewrite the already-applied persistence migration.
begin;

create or replace function public.limpar_checkouts_asaas_expirados()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer := 0;
  v_payment record;
begin
  for v_payment in
    select p.id, p.inscricao_id, i.turma_id
    from public.pagamento p
    join public.inscricao i on i.id = p.inscricao_id
    where p.gateway = 'ASAAS'
      and p.status = 'Pendente'
      and p.gateway_status in ('CREATING', 'CREATION_UNKNOWN', 'ACTIVE')
      and p.checkout_expires_at < now()
    for update of p, i
  loop
    update public.pagamento
       set gateway_status = 'EXPIRED', status = 'Cancelado'
     where id = v_payment.id
       and gateway_status in ('CREATING', 'CREATION_UNKNOWN', 'ACTIVE');
    update public.inscricao
       set status_inscricao = 'Cancelada', status_pagamento = 'Cancelado'
     where id = v_payment.inscricao_id
       and status_inscricao = 'AguardandoPagamento';
    update public.turma
       set vagas_preenchidas = greatest(0, vagas_preenchidas - 1)
     where id = v_payment.turma_id
       and vagas_preenchidas > 0;
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

-- Prevent a distributed botnet from reserving every seat with unique identities.
-- The row update already serializes on turma; the trigger observes only a
-- +1 reservation and leaves ordinary admin capacity edits unaffected.
create or replace function public.enforce_asaas_pending_reservation_cap()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_pending integer;
  v_cap integer;
begin
  if new.vagas_preenchidas = old.vagas_preenchidas + 1 then
    perform pg_advisory_xact_lock(hashtextextended(new.id::text, 0));
    select count(*)::integer into v_pending
    from public.pagamento p
    join public.inscricao i on i.id = p.inscricao_id
    where i.turma_id = new.id
      and i.status_inscricao = 'AguardandoPagamento'
      and p.gateway = 'ASAAS'
      and p.status = 'Pendente'
      and p.gateway_status in ('CREATING', 'CREATION_UNKNOWN', 'ACTIVE')
      and p.checkout_expires_at > now();
    v_cap := greatest(5, least(20, ceil(new.vagas_total * 0.10)::integer));
    if v_pending >= v_cap then
      raise exception 'Limite de reservas pendentes atingido. Tente novamente em alguns minutos.' using errcode = 'P0003';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists turma_asaas_pending_reservation_cap on public.turma;
create trigger turma_asaas_pending_reservation_cap
  before update of vagas_preenchidas on public.turma
  for each row execute function public.enforce_asaas_pending_reservation_cap();

revoke all on function public.limpar_checkouts_asaas_expirados() from public, anon, authenticated;
grant execute on function public.limpar_checkouts_asaas_expirados() to service_role;

comment on function public.limpar_checkouts_asaas_expirados() is
  'Libera reservas Asaas expiradas e suas vagas; chamada oportunisticamente pelo checkout e por job operacional.';
comment on function public.enforce_asaas_pending_reservation_cap() is
  'Limita reservas pendentes Asaas para reduzir abuso distribuído de vagas.';

commit;
