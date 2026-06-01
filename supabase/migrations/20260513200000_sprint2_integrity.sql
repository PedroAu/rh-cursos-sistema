-- ═══════════════════════════════════════════════════════════════════════════
-- Sprint 2 — Integridade de Dados
-- ═══════════════════════════════════════════════════════════════════════════
--   I2.1  deleted_at em avaliacao e lead (padroniza soft delete)
--   I2.2  registrar_inscricao_publica: validação de turma + erro amigável
--   I2.3  Trigger sync_turma_status: atualiza status ao preencher vagas
--   I2.4  Trigger validate_avaliacao_turma: garante turma_id consistente
-- ═══════════════════════════════════════════════════════════════════════════

-- ── I2.1  deleted_at em avaliacao e lead ────────────────────────────────────
alter table public.avaliacao
  add column if not exists deleted_at timestamptz;

alter table public.lead
  add column if not exists deleted_at timestamptz;

-- ── I2.2  registrar_inscricao_publica com validação ─────────────────────────
create or replace function public.registrar_inscricao_publica(
  p_nome_completo   varchar,
  p_email           varchar,
  p_cpf             varchar,
  p_telefone        varchar,
  p_cargo           varchar,
  p_orgao           varchar,
  p_tipo_aluno      public.tipo_aluno,
  p_turma_id        uuid,
  p_tipo_inscricao  varchar,
  p_forma_pagamento public.forma_pagamento,
  p_observacoes     text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_aluno_id     uuid;
  v_inscricao_id uuid;
  v_turma        record;
begin
  -- Validar disponibilidade da turma
  select id, status, vagas_total, vagas_preenchidas, vagas_restantes, deleted_at
    into v_turma
    from public.turma
   where id = p_turma_id
   limit 1;

  if not found or v_turma.deleted_at is not null then
    raise exception 'Turma não encontrada.' using errcode = 'P0001';
  end if;

  if v_turma.status not in ('Aberta', 'PoucasVagas') then
    raise exception 'Turma não está disponível para inscrição (status: %).', v_turma.status
      using errcode = 'P0002';
  end if;

  if v_turma.vagas_restantes <= 0 then
    raise exception 'Turma sem vagas disponíveis.' using errcode = 'P0003';
  end if;

  -- Upsert aluno por email (case-insensitive)
  select id into v_aluno_id
    from public.aluno
   where lower(email) = lower(p_email)
     and deleted_at is null
   limit 1;

  if v_aluno_id is null then
    insert into public.aluno (nome_completo, email, cpf, telefone, cargo, orgao, tipo_aluno)
    values (
      p_nome_completo,
      p_email,
      nullif(p_cpf, ''),
      nullif(p_telefone, ''),
      nullif(p_cargo, ''),
      nullif(p_orgao, ''),
      p_tipo_aluno
    )
    returning id into v_aluno_id;
  else
    update public.aluno
       set nome_completo = coalesce(nullif(p_nome_completo, ''), nome_completo),
           cpf           = coalesce(nullif(p_cpf, ''), cpf),
           telefone      = coalesce(nullif(p_telefone, ''), telefone),
           cargo         = coalesce(nullif(p_cargo, ''), cargo),
           orgao         = coalesce(nullif(p_orgao, ''), orgao),
           tipo_aluno    = coalesce(p_tipo_aluno, tipo_aluno)
     where id = v_aluno_id;
  end if;

  -- Verificar inscrição duplicada
  if exists (
    select 1 from public.inscricao
     where aluno_id = v_aluno_id
       and turma_id = p_turma_id
       and status_inscricao not in ('Cancelada')
  ) then
    raise exception 'Aluno já possui inscrição ativa nesta turma.' using errcode = 'P0004';
  end if;

  -- Inserir inscrição
  insert into public.inscricao (
    aluno_id, turma_id, status_inscricao, status_pagamento,
    forma_pagamento, tipo_inscricao, observacoes
  )
  values (
    v_aluno_id, p_turma_id, 'Confirmada', 'Pendente',
    p_forma_pagamento, p_tipo_inscricao, p_observacoes
  )
  returning id into v_inscricao_id;

  -- Incrementar vagas (o trigger sync_turma_status atualiza o status automaticamente)
  update public.turma
     set vagas_preenchidas = least(vagas_total, vagas_preenchidas + 1)
   where id = p_turma_id;

  return v_inscricao_id;
end;
$$;

-- ── I2.3  Trigger sync_turma_status ─────────────────────────────────────────
create or replace function public.sync_turma_status()
returns trigger
language plpgsql
as $$
begin
  -- Não altera status fixado manualmente (Cancelada, Realizada, EmBreve)
  if new.status in ('Cancelada', 'Realizada', 'EmBreve') then
    return new;
  end if;

  new.status := case
    when new.vagas_preenchidas >= new.vagas_total
      then 'Encerrada'::public.status_turma
    when new.vagas_total > 0
         and (new.vagas_total - new.vagas_preenchidas) <= greatest(5, new.vagas_total / 5)
      then 'PoucasVagas'::public.status_turma
    else 'Aberta'::public.status_turma
  end;

  return new;
end;
$$;

drop trigger if exists turma_sync_status on public.turma;
create trigger turma_sync_status
  before update of vagas_preenchidas on public.turma
  for each row execute function public.sync_turma_status();

-- ── I2.4  Trigger validate_avaliacao_turma ──────────────────────────────────
create or replace function public.validate_avaliacao_turma()
returns trigger
language plpgsql
as $$
declare
  v_turma_id uuid;
begin
  select turma_id into v_turma_id
    from public.inscricao
   where id = new.inscricao_id;

  if v_turma_id is null or v_turma_id != new.turma_id then
    raise exception
      'avaliacao.turma_id (%) diverge de inscricao.turma_id (%).',
      new.turma_id, v_turma_id
      using errcode = 'P0010';
  end if;

  return new;
end;
$$;

drop trigger if exists avaliacao_validate_turma on public.avaliacao;
create trigger avaliacao_validate_turma
  before insert or update on public.avaliacao
  for each row execute function public.validate_avaliacao_turma();

comment on function public.sync_turma_status()
  is 'Atualiza turma.status automaticamente ao alterar vagas_preenchidas.';
comment on function public.validate_avaliacao_turma()
  is 'Garante que avaliacao.turma_id coincide com inscricao.turma_id.';
comment on function public.registrar_inscricao_publica(varchar,varchar,varchar,varchar,varchar,varchar,public.tipo_aluno,uuid,varchar,public.forma_pagamento,text)
  is 'Inscreve aluno em turma validando disponibilidade. Callable por anon/authenticated via RPC.';
