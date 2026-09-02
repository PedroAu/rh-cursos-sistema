-- LGPD retention for abandoned Asaas checkout data.
-- Only students created in the very same transaction as an Asaas checkout are
-- eligible. Existing students, paid purchases and any active enrollment are
-- deliberately excluded.
begin;

alter type public.status_pagamento add value if not exists 'Cancelado';

alter table public.pagamento
  add column if not exists checkout_criou_aluno boolean not null default false;

create or replace function public.marcar_pagamento_asaas_aluno_temporario()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.gateway = 'ASAAS' then
    new.checkout_criou_aluno := exists (
      select 1
      from public.inscricao i
      join public.aluno a on a.id = i.aluno_id
      where i.id = new.inscricao_id
        -- Both defaults use now(), which is transaction-stable. Equality with
        -- the new payment timestamp proves the RPC created both records in
        -- one checkout transaction.
        and a.created_at = new.created_at
    );
  end if;
  return new;
end;
$$;

drop trigger if exists pagamento_asaas_aluno_temporario on public.pagamento;
create trigger pagamento_asaas_aluno_temporario
  before insert on public.pagamento
  for each row execute function public.marcar_pagamento_asaas_aluno_temporario();

-- Backfill only records that have the same transaction-stable timestamp and
-- no prior enrollment. This is the same proof used by the trigger and lets
-- already-created checkout reservations enter the retention policy safely.
update public.pagamento p
   set checkout_criou_aluno = true
  from public.inscricao i
  join public.aluno a on a.id = i.aluno_id
 where p.inscricao_id = i.id
   and p.gateway = 'ASAAS'
   and not p.checkout_criou_aluno
   and a.created_at = p.created_at
   and not exists (
     select 1
     from public.inscricao anterior
     where anterior.aluno_id = a.id
       and anterior.created_at < p.created_at
   );

create or replace function public.anonimizar_checkouts_asaas_abandonados(
  p_retencao interval default interval '30 days'
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  if p_retencao < interval '1 day' or p_retencao > interval '365 days' then
    raise exception 'A retenção deve estar entre 1 e 365 dias.' using errcode = 'P0001';
  end if;

  with candidatos as (
    select distinct a.id
    from public.aluno a
    join public.inscricao i on i.aluno_id = a.id
    join public.pagamento p on p.inscricao_id = i.id
    where a.deleted_at is null
      and p.gateway = 'ASAAS'
      and p.checkout_criou_aluno
      and p.status = 'Cancelado'
      and p.gateway_status in ('FAILED', 'CANCELED', 'EXPIRED')
      and p.created_at < now() - p_retencao
      -- A pessoa não pode ter nenhuma inscrição ativa/confirmada, nem inscrição
      -- fora do fluxo Asaas que indique relacionamento prévio.
      and not exists (
        select 1
        from public.inscricao i2
        left join public.pagamento p2 on p2.inscricao_id = i2.id
        where i2.aluno_id = a.id
          and (
            i2.status_inscricao <> 'Cancelada'
            or p2.gateway is distinct from 'ASAAS'
          )
      )
      -- A auditoria financeira é preservada, mas qualquer pagamento confirmado
      -- impede a anonimização do cadastro.
      and not exists (
        select 1
        from public.inscricao i3
        join public.pagamento p3 on p3.inscricao_id = i3.id
        where i3.aluno_id = a.id
          and p3.status = 'Pago'
      )
  ), anonimizados as (
    update public.aluno a
       set nome_completo = 'Cadastro abandonado',
           email = concat('anonimizado+', a.id, '@checkout.invalid'),
           cpf = null,
           telefone = null,
           cargo = null,
           orgao = null,
           deleted_at = now()
      from candidatos c
     where a.id = c.id
    returning a.id
  )
  select count(*)::integer into v_count from anonimizados;

  return v_count;
end;
$$;

-- The checkout path is an on-demand fallback; pg_cron provides the daily
-- automatic retention job in Supabase plans where it is enabled.
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

  perform public.anonimizar_checkouts_asaas_abandonados();
  return v_count;
end;
$$;

revoke all on function public.anonimizar_checkouts_asaas_abandonados(interval)
  from public, anon, authenticated;
grant execute on function public.anonimizar_checkouts_asaas_abandonados(interval)
  to service_role;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'anonymize-abandoned-asaas-checkouts',
      '17 3 * * *',
      'select public.anonimizar_checkouts_asaas_abandonados()'
    );
  end if;
exception when others then
  -- On plans without pg_cron, the on-demand invocation above is retained.
  null;
end;
$$;

comment on column public.pagamento.checkout_criou_aluno is
  'True only when the aluno was inserted in the same Asaas checkout transaction; used for safe LGPD retention.';
comment on function public.anonimizar_checkouts_asaas_abandonados(interval) is
  'Pseudonimiza cadastros criados por checkout Asaas cancelado após retenção; nunca toca aluno existente ou pagamento confirmado.';

commit;
