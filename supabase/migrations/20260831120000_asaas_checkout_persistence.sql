-- Story 2026-08-31: persistência transacional do Checkout Asaas para DP Zero.
--
-- Esta migration não chama o Asaas. Ela mantém apenas referências opacas do
-- gateway e fingerprints SHA-256; nenhum payload bruto ou dado de cartão é
-- persistido.

begin;

alter table public.pagamento
  alter column forma_pagamento drop not null,
  alter column parcelas drop not null,
  add column if not exists gateway varchar(20),
  add column if not exists gateway_status varchar(32),
  add column if not exists checkout_expires_at timestamptz,
  add column if not exists idempotency_key uuid,
  add column if not exists request_hash varchar(64);

alter table public.pagamento
  drop constraint if exists pagamento_parcelas_chk;

alter table public.pagamento
  add constraint pagamento_parcelas_chk
    check (parcelas is null or parcelas between 1 and 12),
  add constraint pagamento_gateway_chk
    check (gateway is null or gateway = 'ASAAS'),
  add constraint pagamento_gateway_status_chk
    check (
      gateway_status is null
      or gateway_status in (
        'CREATING',
        'CREATION_UNKNOWN',
        'ACTIVE',
        'FAILED',
        'PAID',
        'CANCELED',
        'EXPIRED',
        'MANUAL_REVIEW'
      )
    ),
  add constraint pagamento_gateway_method_chk
    check (
      gateway is distinct from 'ASAAS'
      or forma_pagamento is null
      or forma_pagamento in ('Pix', 'Cartao')
    ),
  add constraint pagamento_asaas_metadata_chk
    check (
      gateway is distinct from 'ASAAS'
      or (
        gateway_status is not null
        and checkout_expires_at is not null
        and idempotency_key is not null
        and request_hash ~ '^[0-9a-f]{64}$'
      )
    );

create unique index if not exists pagamento_gateway_ref_unique_idx
  on public.pagamento (gateway, gateway_ref)
  where gateway is not null and gateway_ref is not null;

create unique index if not exists pagamento_asaas_idempotency_unique_idx
  on public.pagamento (idempotency_key)
  where gateway = 'ASAAS';

create unique index if not exists pagamento_asaas_active_enrollment_unique_idx
  on public.pagamento (inscricao_id)
  where gateway = 'ASAAS'
    and gateway_status in ('CREATING', 'CREATION_UNKNOWN', 'ACTIVE');

create index if not exists pagamento_asaas_expiration_idx
  on public.pagamento (checkout_expires_at)
  where gateway = 'ASAAS'
    and status = 'Pendente'
    and gateway_status in ('CREATING', 'CREATION_UNKNOWN', 'ACTIVE');

create table if not exists public.pagamento_gateway_evento (
  id uuid primary key default gen_random_uuid(),
  gateway varchar(20) not null,
  gateway_event_id varchar(255) not null,
  event_type varchar(80) not null,
  gateway_ref varchar(120),
  pagamento_id uuid references public.pagamento(id) on delete restrict,
  normalized_hash varchar(64) not null,
  event_created_at timestamptz,
  processing_status varchar(24) not null default 'RECEIVED',
  processing_error text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pagamento_gateway_evento_gateway_chk
    check (gateway = 'ASAAS'),
  constraint pagamento_gateway_evento_type_chk
    check (
      event_type in (
        'CHECKOUT_CREATED',
        'CHECKOUT_PAID',
        'CHECKOUT_CANCELED',
        'CHECKOUT_EXPIRED'
      )
    ),
  constraint pagamento_gateway_evento_hash_chk
    check (normalized_hash ~ '^[0-9a-f]{64}$'),
  constraint pagamento_gateway_evento_processing_chk
    check (processing_status in ('RECEIVED', 'PROCESSED', 'RETRYABLE_ERROR')),
  constraint pagamento_gateway_evento_unique unique (gateway, gateway_event_id)
);

drop trigger if exists pagamento_gateway_evento_set_updated_at
  on public.pagamento_gateway_evento;
create trigger pagamento_gateway_evento_set_updated_at
  before update on public.pagamento_gateway_evento
  for each row execute function public.set_updated_at();

create index if not exists pagamento_gateway_evento_pending_idx
  on public.pagamento_gateway_evento (created_at, id)
  where processing_status in ('RECEIVED', 'RETRYABLE_ERROR');

create index if not exists pagamento_gateway_evento_pagamento_idx
  on public.pagamento_gateway_evento (pagamento_id, created_at);

alter table public.pagamento_gateway_evento enable row level security;
revoke all on table public.pagamento_gateway_evento from public, anon, authenticated;
grant all on table public.pagamento_gateway_evento to service_role;

comment on table public.pagamento_gateway_evento is
  'Eventos normalizados de gateway para idempotência; não armazena payload bruto nem PII.';
comment on column public.pagamento.request_hash is
  'Fingerprint SHA-256 com salt da chave idempotente; não contém payload bruto.';
comment on column public.pagamento.gateway_ref is
  'Identificador opaco do checkout no gateway; pagamento.id é enviado como externalReference.';

create or replace function public.iniciar_checkout_asaas_dp_zero(
  p_idempotency_key uuid,
  p_nome_completo varchar,
  p_email varchar,
  p_cpf varchar,
  p_telefone varchar,
  p_minutes_to_expire integer default 30
)
returns table (
  aluno_id varchar(80),
  inscricao_id varchar(80),
  pagamento_id uuid,
  gateway_status varchar(32),
  idempotency_key uuid,
  created boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_nome varchar(180) := trim(coalesce(p_nome_completo, ''));
  v_email varchar(180) := lower(trim(coalesce(p_email, '')));
  v_cpf varchar(20) := regexp_replace(coalesce(p_cpf, ''), '[^0-9]', '', 'g');
  v_telefone varchar(30) := regexp_replace(coalesce(p_telefone, ''), '[^0-9]', '', 'g');
  v_request_hash varchar(64);
  v_existing record;
  v_email_count integer;
  v_cpf_count integer;
  v_email_aluno_id varchar(80);
  v_cpf_aluno_id varchar(80);
  v_aluno_id varchar(80);
  v_turma_id varchar(80);
  v_inscricao_id varchar(80);
  v_pagamento_id uuid;
  v_reserved_id varchar(80);
begin
  if p_idempotency_key is null then
    raise exception 'Chave de idempotência é obrigatória.' using errcode = 'P0001';
  end if;
  if v_nome = '' or char_length(v_nome) > 180 then
    raise exception 'Nome inválido.' using errcode = 'P0001';
  end if;
  if v_email = '' or char_length(v_email) > 180 or position('@' in v_email) <= 1 then
    raise exception 'E-mail inválido.' using errcode = 'P0001';
  end if;
  if char_length(v_cpf) <> 11 then
    raise exception 'CPF inválido.' using errcode = 'P0001';
  end if;
  if char_length(v_telefone) < 10 or char_length(v_telefone) > 13 then
    raise exception 'Telefone inválido.' using errcode = 'P0001';
  end if;
  if p_minutes_to_expire is null or p_minutes_to_expire not between 10 and 1440 then
    raise exception 'Expiração do checkout deve estar entre 10 e 1440 minutos.' using errcode = 'P0001';
  end if;

  v_request_hash := encode(
    extensions.digest(
      concat_ws(
        chr(31),
        p_idempotency_key::text,
        'departamento-pessoal-do-zero',
        v_nome,
        v_email,
        v_cpf,
        v_telefone
      ),
      'sha256'
    ),
    'hex'
  );

  -- Serializa chamadas concorrentes com a mesma chave antes de qualquer vaga.
  perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key::text, 0));

  select
    p.inscricao_id,
    p.id,
    p.gateway_status,
    p.request_hash,
    i.aluno_id
  into v_existing
  from public.pagamento p
  join public.inscricao i on i.id = p.inscricao_id
  where p.gateway = 'ASAAS'
    and p.idempotency_key = p_idempotency_key
  for update of p, i;

  if found then
    if v_existing.request_hash <> v_request_hash then
      raise exception 'Chave de idempotência já utilizada com payload diferente.'
        using errcode = 'P0004';
    end if;

    return query select
      v_existing.aluno_id::varchar(80),
      v_existing.inscricao_id::varchar(80),
      v_existing.id::uuid,
      v_existing.gateway_status::varchar(32),
      p_idempotency_key,
      false;
    return;
  end if;

  select count(*)::integer, min(a.id)
    into v_email_count, v_email_aluno_id
  from public.aluno a
  where a.deleted_at is null and lower(a.email) = v_email;

  select count(*)::integer, min(a.id)
    into v_cpf_count, v_cpf_aluno_id
  from public.aluno a
  where a.deleted_at is null and a.cpf = v_cpf;

  if v_email_count = 0 and v_cpf_count = 0 then
    insert into public.aluno (
      nome_completo, email, cpf, telefone, tipo_aluno
    ) values (
      v_nome, v_email, v_cpf, v_telefone, 'PF'
    ) returning id into v_aluno_id;
  elsif v_email_count = 1
    and v_cpf_count = 1
    and v_email_aluno_id = v_cpf_aluno_id then
    -- Identidade consistente: reutiliza sem sobrescrever qualquer PII.
    v_aluno_id := v_email_aluno_id;
  elsif v_email_count > 1 or v_cpf_count > 1 then
    raise exception 'Identidade ambígua para e-mail ou CPF.' using errcode = 'P0004';
  else
    raise exception 'Conflito entre e-mail e CPF informados.' using errcode = 'P0004';
  end if;

  select t.id
    into v_turma_id
  from public.turma t
  join public.curso c on c.id = t.curso_id
  where c.slug = 'departamento-pessoal-do-zero'
    and c.deleted_at is null
    and t.deleted_at is null
    and t.modalidade = 'Gravado'
    and t.status in ('Aberta', 'PoucasVagas')
    and t.preco_turma = 297.00
    and t.vagas_preenchidas < t.vagas_total
  order by t.data_inicio asc nulls last, t.id asc
  limit 1;

  if v_turma_id is null then
    raise exception 'Nenhuma turma gravada de R$ 297 disponível para o produto.'
      using errcode = 'P0003';
  end if;

  update public.turma t
     set vagas_preenchidas = t.vagas_preenchidas + 1
   where t.id = v_turma_id
     and t.deleted_at is null
     and t.modalidade = 'Gravado'
     and t.status in ('Aberta', 'PoucasVagas')
     and t.preco_turma = 297.00
     and t.vagas_preenchidas < t.vagas_total
  returning t.id into v_reserved_id;

  if v_reserved_id is null then
    raise exception 'Turma sem vagas disponíveis.' using errcode = 'P0003';
  end if;

  insert into public.inscricao (
    aluno_id,
    turma_id,
    status_inscricao,
    status_pagamento,
    valor_pago,
    forma_pagamento,
    tipo_inscricao,
    observacoes
  ) values (
    v_aluno_id,
    v_turma_id,
    'AguardandoPagamento',
    'Pendente',
    0,
    null,
    'Pessoa física',
    'Checkout Asaas — Departamento Pessoal do Zero'
  ) returning id into v_inscricao_id;

  insert into public.pagamento (
    inscricao_id,
    valor,
    forma_pagamento,
    status,
    parcelas,
    gateway,
    gateway_status,
    checkout_expires_at,
    idempotency_key,
    request_hash
  ) values (
    v_inscricao_id,
    297.00,
    null,
    'Pendente',
    null,
    'ASAAS',
    'CREATING',
    now() + make_interval(mins => p_minutes_to_expire),
    p_idempotency_key,
    v_request_hash
  ) returning id into v_pagamento_id;

  return query select
    v_aluno_id,
    v_inscricao_id,
    v_pagamento_id,
    'CREATING'::varchar(32),
    p_idempotency_key,
    true;
end;
$$;

create or replace function public.vincular_checkout_asaas(
  p_pagamento_id uuid,
  p_gateway_ref varchar,
  p_checkout_expires_at timestamptz
)
returns varchar(32)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_pagamento public.pagamento%rowtype;
begin
  if trim(coalesce(p_gateway_ref, '')) = '' or char_length(p_gateway_ref) > 120 then
    raise exception 'Referência de checkout inválida.' using errcode = 'P0001';
  end if;

  select p.* into v_pagamento
  from public.pagamento p
  where p.id = p_pagamento_id and p.gateway = 'ASAAS'
  for update;

  if not found then
    raise exception 'Pagamento Asaas não encontrado.' using errcode = 'P0001';
  end if;

  if v_pagamento.gateway_ref is not null and v_pagamento.gateway_ref <> p_gateway_ref then
    raise exception 'Pagamento já vinculado a outro checkout.' using errcode = 'P0004';
  end if;

  if v_pagamento.gateway_status = 'ACTIVE' and v_pagamento.gateway_ref = p_gateway_ref then
    return 'ACTIVE';
  end if;

  if v_pagamento.gateway_status not in ('CREATING', 'CREATION_UNKNOWN') then
    raise exception 'Transição de estado do checkout não permitida.' using errcode = 'P0004';
  end if;
  if p_checkout_expires_at is null or p_checkout_expires_at <= now() then
    raise exception 'Expiração do checkout deve estar no futuro.' using errcode = 'P0001';
  end if;

  update public.pagamento p
     set gateway_ref = p_gateway_ref,
         gateway_status = 'ACTIVE',
         checkout_expires_at = p_checkout_expires_at
   where p.id = p_pagamento_id;

  return 'ACTIVE';
end;
$$;

create or replace function public.marcar_checkout_asaas_creation_unknown(
  p_pagamento_id uuid
)
returns varchar(32)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status varchar(32);
begin
  select p.gateway_status into v_status
  from public.pagamento p
  where p.id = p_pagamento_id and p.gateway = 'ASAAS'
  for update;

  if not found then
    raise exception 'Pagamento Asaas não encontrado.' using errcode = 'P0001';
  end if;
  if v_status = 'CREATION_UNKNOWN' then
    return v_status;
  end if;
  if v_status <> 'CREATING' then
    raise exception 'Transição de estado do checkout não permitida.' using errcode = 'P0004';
  end if;

  update public.pagamento p
     set gateway_status = 'CREATION_UNKNOWN'
   where p.id = p_pagamento_id;

  return 'CREATION_UNKNOWN';
end;
$$;

create or replace function public.marcar_checkout_asaas_failed(
  p_pagamento_id uuid
)
returns varchar(32)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status varchar(32);
  v_inscricao_id varchar(80);
  v_turma_id varchar(80);
  v_cancelled_id varchar(80);
begin
  select p.gateway_status, p.inscricao_id
    into v_status, v_inscricao_id
  from public.pagamento p
  where p.id = p_pagamento_id and p.gateway = 'ASAAS'
  for update;

  if not found then
    raise exception 'Pagamento Asaas não encontrado.' using errcode = 'P0001';
  end if;
  if v_status = 'FAILED' then
    return v_status;
  end if;
  if v_status <> 'CREATING' then
    raise exception 'Transição de estado do checkout não permitida.' using errcode = 'P0004';
  end if;

  update public.pagamento p
     set gateway_status = 'FAILED'
   where p.id = p_pagamento_id;

  select i.turma_id into v_turma_id
  from public.inscricao i
  where i.id = v_inscricao_id
  for update;

  update public.inscricao i
     set status_inscricao = 'Cancelada',
         cancelled_at = coalesce(i.cancelled_at, now())
   where i.id = v_inscricao_id
     and i.status_inscricao = 'AguardandoPagamento'
  returning i.id into v_cancelled_id;

  if v_cancelled_id is not null then
    update public.turma t
       set vagas_preenchidas = greatest(0, t.vagas_preenchidas - 1)
     where t.id = v_turma_id;
  end if;

  return 'FAILED';
end;
$$;

create or replace function public.processar_evento_checkout_asaas(
  p_event_id varchar,
  p_event_type varchar,
  p_gateway_ref varchar,
  p_external_reference uuid,
  p_normalized_hash varchar,
  p_event_created_at timestamptz default null,
  p_valor numeric default null,
  p_forma_pagamento public.forma_pagamento default null,
  p_parcelas integer default null
)
returns table (
  event_status varchar(24),
  payment_gateway_status varchar(32),
  processed boolean,
  duplicate boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_event public.pagamento_gateway_evento%rowtype;
  v_payment_count integer;
  v_pagamento_id uuid;
  v_pagamento public.pagamento%rowtype;
  v_inscricao public.inscricao%rowtype;
  v_reserved_id varchar(80);
  v_cancelled_id varchar(80);
  v_is_duplicate boolean := false;
  v_error text;
begin
  if trim(coalesce(p_event_id, '')) = '' or char_length(p_event_id) > 255 then
    raise exception 'ID de evento inválido.' using errcode = 'P0001';
  end if;
  if p_event_type not in (
    'CHECKOUT_CREATED', 'CHECKOUT_PAID', 'CHECKOUT_CANCELED', 'CHECKOUT_EXPIRED'
  ) then
    raise exception 'Tipo de evento de checkout inválido.' using errcode = 'P0001';
  end if;
  if p_normalized_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Hash normalizado inválido.' using errcode = 'P0001';
  end if;
  if p_forma_pagamento is not null and p_forma_pagamento not in ('Pix', 'Cartao') then
    raise exception 'Forma de pagamento não conciliável para o Asaas.' using errcode = 'P0001';
  end if;
  if p_parcelas is not null and p_parcelas not between 1 and 12 then
    raise exception 'Parcelas devem estar entre 1 e 12.' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('ASAAS:' || p_event_id, 0));

  insert into public.pagamento_gateway_evento (
    gateway,
    gateway_event_id,
    event_type,
    gateway_ref,
    normalized_hash,
    event_created_at
  ) values (
    'ASAAS',
    p_event_id,
    p_event_type,
    nullif(trim(coalesce(p_gateway_ref, '')), ''),
    p_normalized_hash,
    p_event_created_at
  )
  on conflict (gateway, gateway_event_id) do nothing;

  get diagnostics v_payment_count = row_count;
  v_is_duplicate := v_payment_count = 0;

  select e.* into v_event
  from public.pagamento_gateway_evento e
  where e.gateway = 'ASAAS' and e.gateway_event_id = p_event_id
  for update;

  if v_event.normalized_hash <> p_normalized_hash
    or v_event.event_type <> p_event_type
    or v_event.gateway_ref is distinct from nullif(trim(coalesce(p_gateway_ref, '')), '') then
    raise exception 'Evento duplicado recebido com conteúdo divergente.' using errcode = 'P0004';
  end if;

  if v_event.processing_status = 'PROCESSED' then
    return query select
      'PROCESSED'::varchar(24),
      (select p.gateway_status from public.pagamento p where p.id = v_event.pagamento_id),
      true,
      true;
    return;
  end if;

  select count(distinct p.id)::integer, min(p.id::text)::uuid
    into v_payment_count, v_pagamento_id
  from public.pagamento p
  where p.gateway = 'ASAAS'
    and (
      (p_external_reference is not null and p.id = p_external_reference)
      or (
        nullif(trim(coalesce(p_gateway_ref, '')), '') is not null
        and p.gateway_ref = nullif(trim(coalesce(p_gateway_ref, '')), '')
      )
    );

  if v_payment_count <> 1 then
    v_error := case
      when v_payment_count = 0 then 'Pagamento não encontrado para o evento.'
      else 'Referências do evento apontam para pagamentos distintos.'
    end;
    update public.pagamento_gateway_evento e
       set processing_status = 'RETRYABLE_ERROR', processing_error = v_error
     where e.id = v_event.id;
    return query select
      'RETRYABLE_ERROR'::varchar(24), null::varchar(32), false, v_is_duplicate;
    return;
  end if;

  select p.* into v_pagamento
  from public.pagamento p
  where p.id = v_pagamento_id
  for update;

  if v_pagamento.gateway_ref is not null
    and nullif(trim(coalesce(p_gateway_ref, '')), '') is not null
    and v_pagamento.gateway_ref <> p_gateway_ref then
    update public.pagamento_gateway_evento e
       set processing_status = 'RETRYABLE_ERROR',
           processing_error = 'Checkout diverge do pagamento localizado.'
     where e.id = v_event.id;
    return query select
      'RETRYABLE_ERROR'::varchar(24), v_pagamento.gateway_status, false, v_is_duplicate;
    return;
  end if;

  if v_pagamento.gateway_ref is null and nullif(trim(coalesce(p_gateway_ref, '')), '') is not null then
    update public.pagamento p
       set gateway_ref = p_gateway_ref
     where p.id = v_pagamento.id;
    v_pagamento.gateway_ref := p_gateway_ref;
  end if;

  update public.pagamento_gateway_evento e
     set pagamento_id = v_pagamento.id,
         processing_status = 'RECEIVED',
         processing_error = null
   where e.id = v_event.id;

  select i.* into v_inscricao
  from public.inscricao i
  where i.id = v_pagamento.inscricao_id
  for update;

  if p_event_type = 'CHECKOUT_CREATED' then
    if v_pagamento.gateway_status in ('CREATING', 'CREATION_UNKNOWN') then
      update public.pagamento p set gateway_status = 'ACTIVE' where p.id = v_pagamento.id;
      v_pagamento.gateway_status := 'ACTIVE';
    elsif v_pagamento.gateway_status in ('ACTIVE', 'PAID', 'MANUAL_REVIEW') then
      null; -- Evento atrasado ou repetido: monotônico, sem regressão.
    else
      v_error := 'CHECKOUT_CREATED não permitido a partir de ' || v_pagamento.gateway_status || '.';
    end if;

  elsif p_event_type in ('CHECKOUT_CANCELED', 'CHECKOUT_EXPIRED') then
    if v_pagamento.gateway_status in ('CREATION_UNKNOWN', 'ACTIVE') then
      update public.pagamento p
         set gateway_status = case
           when p_event_type = 'CHECKOUT_CANCELED' then 'CANCELED'
           else 'EXPIRED'
         end
       where p.id = v_pagamento.id;
      v_pagamento.gateway_status := case
        when p_event_type = 'CHECKOUT_CANCELED' then 'CANCELED'
        else 'EXPIRED'
      end;

      update public.inscricao i
         set status_inscricao = 'Cancelada',
             cancelled_at = coalesce(i.cancelled_at, now())
       where i.id = v_inscricao.id
         and i.status_inscricao = 'AguardandoPagamento'
      returning i.id into v_cancelled_id;

      if v_cancelled_id is not null then
        update public.turma t
           set vagas_preenchidas = greatest(0, t.vagas_preenchidas - 1)
         where t.id = v_inscricao.turma_id;
      end if;
    elsif v_pagamento.gateway_status in ('PAID', 'MANUAL_REVIEW') then
      null; -- Cancelamento/expiração tardio nunca reverte pagamento.
    elsif (
      p_event_type = 'CHECKOUT_CANCELED' and v_pagamento.gateway_status = 'CANCELED'
    ) or (
      p_event_type = 'CHECKOUT_EXPIRED' and v_pagamento.gateway_status = 'EXPIRED'
    ) then
      null;
    else
      v_error := p_event_type || ' não permitido a partir de ' || v_pagamento.gateway_status || '.';
    end if;

  elsif p_event_type = 'CHECKOUT_PAID' then
    if p_valor is null or p_valor <> v_pagamento.valor then
      v_error := 'Valor pago não confere com o valor autoritativo.';
    elsif v_pagamento.gateway_status in ('ACTIVE', 'CREATION_UNKNOWN') then
      if v_inscricao.status_inscricao <> 'AguardandoPagamento' then
        v_error := 'Inscrição não está aguardando pagamento.';
      else
        update public.pagamento p
           set gateway_status = 'PAID',
               status = 'Pago',
               data_pagamento = coalesce(p_event_created_at, now()),
               forma_pagamento = p_forma_pagamento,
               parcelas = p_parcelas
         where p.id = v_pagamento.id;
        update public.inscricao i
           set status_inscricao = 'Confirmada',
               status_pagamento = 'Pago',
               valor_pago = v_pagamento.valor,
               forma_pagamento = p_forma_pagamento,
               cancelled_at = null
         where i.id = v_inscricao.id;
        v_pagamento.gateway_status := 'PAID';
      end if;
    elsif v_pagamento.gateway_status in ('CANCELED', 'EXPIRED') then
      -- Pagamento tardio: a vaga anterior já foi liberada. Tenta reservá-la
      -- novamente antes de confirmar; jamais ultrapassa vagas_total.
      update public.turma t
         set vagas_preenchidas = t.vagas_preenchidas + 1
       where t.id = v_inscricao.turma_id
         and t.deleted_at is null
         and t.status in ('Aberta', 'PoucasVagas')
         and t.vagas_preenchidas < t.vagas_total
      returning t.id into v_reserved_id;

      if v_reserved_id is not null then
        update public.pagamento p
           set gateway_status = 'PAID',
               status = 'Pago',
               data_pagamento = coalesce(p_event_created_at, now()),
               forma_pagamento = p_forma_pagamento,
               parcelas = p_parcelas
         where p.id = v_pagamento.id;
        update public.inscricao i
           set status_inscricao = 'Confirmada',
               status_pagamento = 'Pago',
               valor_pago = v_pagamento.valor,
               forma_pagamento = p_forma_pagamento,
               cancelled_at = null
         where i.id = v_inscricao.id;
        v_pagamento.gateway_status := 'PAID';
      else
        update public.pagamento p
           set gateway_status = 'MANUAL_REVIEW',
               status = 'Pago',
               data_pagamento = coalesce(p_event_created_at, now()),
               forma_pagamento = p_forma_pagamento,
               parcelas = p_parcelas
         where p.id = v_pagamento.id;
        update public.inscricao i
           set status_pagamento = 'Pago',
               valor_pago = v_pagamento.valor,
               forma_pagamento = p_forma_pagamento
         where i.id = v_inscricao.id;
        v_pagamento.gateway_status := 'MANUAL_REVIEW';
      end if;
    elsif v_pagamento.gateway_status in ('PAID', 'MANUAL_REVIEW') then
      null;
    else
      v_error := 'CHECKOUT_PAID não permitido a partir de ' || v_pagamento.gateway_status || '.';
    end if;
  end if;

  if v_error is not null then
    update public.pagamento_gateway_evento e
       set processing_status = 'RETRYABLE_ERROR',
           processing_error = v_error,
           processed_at = null
     where e.id = v_event.id;
    return query select
      'RETRYABLE_ERROR'::varchar(24), v_pagamento.gateway_status, false, v_is_duplicate;
    return;
  end if;

  update public.pagamento_gateway_evento e
     set processing_status = 'PROCESSED',
         processing_error = null,
         processed_at = now()
   where e.id = v_event.id;

  return query select
    'PROCESSED'::varchar(24), v_pagamento.gateway_status, true, v_is_duplicate;
end;
$$;

revoke execute on function public.iniciar_checkout_asaas_dp_zero(uuid, varchar, varchar, varchar, varchar, integer)
  from public, anon, authenticated;
revoke execute on function public.vincular_checkout_asaas(uuid, varchar, timestamptz)
  from public, anon, authenticated;
revoke execute on function public.marcar_checkout_asaas_creation_unknown(uuid)
  from public, anon, authenticated;
revoke execute on function public.marcar_checkout_asaas_failed(uuid)
  from public, anon, authenticated;
revoke execute on function public.processar_evento_checkout_asaas(varchar, varchar, varchar, uuid, varchar, timestamptz, numeric, public.forma_pagamento, integer)
  from public, anon, authenticated;

grant execute on function public.iniciar_checkout_asaas_dp_zero(uuid, varchar, varchar, varchar, varchar, integer)
  to service_role;
grant execute on function public.vincular_checkout_asaas(uuid, varchar, timestamptz)
  to service_role;
grant execute on function public.marcar_checkout_asaas_creation_unknown(uuid)
  to service_role;
grant execute on function public.marcar_checkout_asaas_failed(uuid)
  to service_role;
grant execute on function public.processar_evento_checkout_asaas(varchar, varchar, varchar, uuid, varchar, timestamptz, numeric, public.forma_pagamento, integer)
  to service_role;

comment on function public.iniciar_checkout_asaas_dp_zero(uuid, varchar, varchar, varchar, varchar, integer) is
  'Cria ou devolve checkout DP Zero idempotente; resolve identidade/turma no servidor e reserva uma vaga.';
comment on function public.processar_evento_checkout_asaas(varchar, varchar, varchar, uuid, varchar, timestamptz, numeric, public.forma_pagamento, integer) is
  'Persiste e processa eventos Asaas atomicamente conforme máquina de estados; CHECKOUT_PAID é a única confirmação.';

-- Rollback operacional (executar somente após interromper checkout/webhook):
-- 1. Revogar e remover as cinco RPCs acima.
-- 2. Remover pagamento_gateway_evento, índices pagamento_asaas_* e constraints
--    pagamento_gateway_* / pagamento_asaas_metadata_chk.
-- 3. Remover as seis colunas adicionadas a pagamento.
-- 4. Antes de restaurar NOT NULL em forma_pagamento/parcelas, reconciliar ou
--    excluir tentativas Asaas com NULL; restaurar a constraint parcelas >= 1.
-- O rollback de nulabilidade não é seguro enquanto existirem checkouts mistos.

commit;
