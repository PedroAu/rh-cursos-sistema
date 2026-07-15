-- REC-301: o fluxo público é uma pré-inscrição, não uma compra confirmada.
-- A assinatura preserva o parâmetro financeiro legado por compatibilidade até
-- REC-101/REC-107, mas seu valor é deliberadamente ignorado.

create or replace function public.registrar_inscricao_publica(
  p_nome_completo   varchar,
  p_email           varchar,
  p_cpf             varchar,
  p_telefone        varchar,
  p_cargo           varchar,
  p_orgao           varchar,
  p_tipo_aluno      public.tipo_aluno,
  p_turma_id        varchar(80),
  p_tipo_inscricao  varchar,
  p_forma_pagamento public.forma_pagamento,
  p_observacoes     text default null
)
returns varchar(80)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_aluno_id varchar(80);
  v_inscricao_id varchar(80);
  v_turma record;
begin
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

  select id
    into v_aluno_id
    from public.aluno
   where lower(email) = lower(p_email)
     and deleted_at is null
   limit 1;

  if v_aluno_id is null then
    insert into public.aluno (
      nome_completo,
      email,
      cpf,
      telefone,
      cargo,
      orgao,
      tipo_aluno
    )
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
           cpf = coalesce(nullif(p_cpf, ''), cpf),
           telefone = coalesce(nullif(p_telefone, ''), telefone),
           cargo = coalesce(nullif(p_cargo, ''), cargo),
           orgao = coalesce(nullif(p_orgao, ''), orgao),
           tipo_aluno = coalesce(p_tipo_aluno, tipo_aluno)
     where id = v_aluno_id;
  end if;

  if exists (
    select 1
      from public.inscricao
     where aluno_id = v_aluno_id
       and turma_id = p_turma_id
       and status_inscricao not in ('Cancelada')
  ) then
    raise exception 'Aluno já possui inscrição ativa nesta turma.' using errcode = 'P0004';
  end if;

  insert into public.inscricao (
    aluno_id,
    turma_id,
    status_inscricao,
    status_pagamento,
    forma_pagamento,
    tipo_inscricao,
    observacoes
  )
  values (
    v_aluno_id,
    p_turma_id,
    'Pendente',
    'Pendente',
    null,
    p_tipo_inscricao,
    p_observacoes
  )
  returning id into v_inscricao_id;

  update public.turma
     set vagas_preenchidas = least(vagas_total, vagas_preenchidas + 1)
   where id = p_turma_id;

  return v_inscricao_id;
end;
$$;

comment on function public.registrar_inscricao_publica(
  varchar,
  varchar,
  varchar,
  varchar,
  varchar,
  varchar,
  public.tipo_aluno,
  varchar,
  varchar,
  public.forma_pagamento,
  text
) is
  'Registra pré-inscrição pública pendente. O parâmetro financeiro legado é ignorado até a remoção do contrato público antigo.';

-- Remove alegações financeiras enganosas já materializadas pela migration de
-- conteúdo editorial. O roll-forward é restrito aos valores legados exatos
-- para não sobrescrever conteúdo editorial personalizado.
update public.curso_public_content content
set faq_items = (
  select jsonb_agg(
    case
      when item.value->>'question' = 'Como faço minha inscrição?'
       and item.value->>'answer' like '%conclua o checkout guiado%'
      then jsonb_build_object(
        'question', 'Como faço minha inscrição?',
        'answer', format(
          'Clique em "Inscrever-se agora", selecione a turma e envie a pré-inscrição. A solicitação para o curso "%s" seguirá para análise sem confirmar vaga ou cobrança.',
          course.titulo
        )
      )
      else item.value
    end
    order by item.ordinality
  )
  from jsonb_array_elements(content.faq_items) with ordinality as item(value, ordinality)
),
sidebar = content.sidebar || jsonb_strip_nulls(jsonb_build_object(
  'investmentLabel', case
    when content.sidebar->>'investmentLabel' = 'Investimento por participante'
      then 'Valor de referência por participante'
  end,
  'installmentText', case
    when content.sidebar->>'installmentText' = 'até 6x sem juros · ou empenho para órgãos públicos'
      then 'Condições comerciais informadas após a análise da pré-inscrição.'
  end,
  'guaranteeTitle', case
    when content.sidebar->>'guaranteeTitle' = 'Garantia de satisfação.'
      then 'Solicitação sujeita a análise.'
  end,
  'guaranteeText', case
    when content.sidebar->>'guaranteeText' = 'Cancele até 7 dias antes do início e receba 100% do valor de volta, sem burocracia.'
      then 'A pré-inscrição não confirma vaga nem gera cobrança.'
  end
)),
updated_at = now()
from public.curso course
where course.id = content.curso_id
  and (
    content.faq_items::text like '%conclua o checkout guiado%'
    or content.sidebar->>'investmentLabel' = 'Investimento por participante'
    or content.sidebar->>'installmentText' = 'até 6x sem juros · ou empenho para órgãos públicos'
    or content.sidebar->>'guaranteeTitle' = 'Garantia de satisfação.'
    or content.sidebar->>'guaranteeText' = 'Cancele até 7 dias antes do início e receba 100% do valor de volta, sem burocracia.'
  );
