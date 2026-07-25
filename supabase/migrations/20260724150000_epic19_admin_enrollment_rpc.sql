-- Epic 19 / Story 19.3: operação administrativa de inscrição.
-- Mantém registrar_inscricao_publica deliberadamente pendente e sem pagamento.
create or replace function public.admin_criar_inscricao(
  p_nome_completo varchar,
  p_email varchar,
  p_cpf varchar,
  p_telefone varchar,
  p_cargo varchar,
  p_orgao varchar,
  p_tipo_aluno public.tipo_aluno,
  p_turma_id varchar(80),
  p_tipo_inscricao varchar,
  p_forma_pagamento public.forma_pagamento,
  p_observacoes text default null,
  p_status public.status_inscricao default 'AguardandoPagamento'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_aluno_id varchar(80);
  v_inscricao_id varchar(80);
  v_codigo varchar(80);
begin
  if p_status not in ('Pendente', 'AguardandoPagamento', 'Confirmada', 'Cancelada', 'Concluida') then
    raise exception 'Status de inscrição inválido.' using errcode = '22023';
  end if;

  update public.turma
     set vagas_preenchidas = vagas_preenchidas + 1
   where id = p_turma_id
     and deleted_at is null
     and status in ('Aberta', 'PoucasVagas')
     and vagas_preenchidas < vagas_total;
  if not found then
    raise exception 'Turma sem vagas disponíveis ou indisponível.' using errcode = 'P0003';
  end if;

  select id into v_aluno_id
    from public.aluno
   where lower(email) = lower(p_email)
     and deleted_at is null
   limit 1;

  if v_aluno_id is null then
    insert into public.aluno (nome_completo, email, cpf, telefone, cargo, orgao, tipo_aluno)
    values (p_nome_completo, p_email, nullif(p_cpf, ''), nullif(p_telefone, ''), nullif(p_cargo, ''), nullif(p_orgao, ''), p_tipo_aluno)
    returning id into v_aluno_id;
  end if;

  if exists (
    select 1 from public.inscricao
     where aluno_id = v_aluno_id and turma_id = p_turma_id and status_inscricao <> 'Cancelada'
  ) then
    raise exception 'Aluno já possui inscrição ativa nesta turma.' using errcode = 'P0004';
  end if;

  insert into public.inscricao (aluno_id, turma_id, status_inscricao, status_pagamento, forma_pagamento, tipo_inscricao, observacoes)
  values (v_aluno_id, p_turma_id, p_status, 'Pendente', p_forma_pagamento, p_tipo_inscricao, p_observacoes)
  returning id, codigo_confirmacao into v_inscricao_id, v_codigo;

  return jsonb_build_object(
    'id', v_inscricao_id,
    'codigo_confirmacao', v_codigo,
    'status', p_status,
    'forma_pagamento', p_forma_pagamento,
    'aluno_id', v_aluno_id,
    'turma_id', p_turma_id
  );
end;
$$;

revoke execute on function public.admin_criar_inscricao(varchar, varchar, varchar, varchar, varchar, varchar, public.tipo_aluno, varchar, varchar, public.forma_pagamento, text, public.status_inscricao) from public, anon, authenticated;
grant execute on function public.admin_criar_inscricao(varchar, varchar, varchar, varchar, varchar, varchar, public.tipo_aluno, varchar, varchar, public.forma_pagamento, text, public.status_inscricao) to service_role;

-- Atomic N:N replacement used by the admin instructor mutation.
create or replace function public.admin_sync_instrutor_cursos(
  p_instrutor_id varchar(80),
  p_curso_ids jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.curso_instrutor where instrutor_id = p_instrutor_id;
  insert into public.curso_instrutor (curso_id, instrutor_id, principal)
  select value::text, p_instrutor_id, row_number() over () = 1
    from jsonb_array_elements_text(coalesce(p_curso_ids, '[]'::jsonb))
   where exists (select 1 from public.curso c where c.id = value::text and c.deleted_at is null);
end;
$$;

revoke execute on function public.admin_sync_instrutor_cursos(varchar, jsonb) from public, anon, authenticated;
grant execute on function public.admin_sync_instrutor_cursos(varchar, jsonb) to service_role;
