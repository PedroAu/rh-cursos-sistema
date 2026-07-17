-- REC-106: proteger PII de aluno existente em registrar_inscricao_publica
-- (FND-02, FR-04).
--
-- Contexto: a versão da função vigente até esta migration
-- (20260716100000_rec105_atomic_enrollment.sql) faz, ao encontrar um
-- public.aluno existente pelo e-mail (case-insensitive), um
-- `UPDATE public.aluno SET nome_completo = ..., cpf = ..., telefone = ...,
-- cargo = ..., orgao = ..., tipo_aluno = ...` incondicional com os valores
-- recebidos no payload da chamada. Qualquer chamador que conheça (ou
-- adivinhe) um e-mail de aluno já cadastrado pode, assim, sobrescrever os
-- dados desse aluno sem qualquer verificação de que é de fato o dono daquele
-- e-mail — uma violação direta de identidade e integridade de dados
-- (FND-02). REC-101 já revogou a execução pública direta desta RPC como
-- contenção de curto prazo, mas a lógica interna da função ainda tem esse
-- defeito, que volta a importar assim que REC-104/REC-107 restaurarem o
-- acesso via endpoint controlado.
--
-- Decisão (Opção A, FR-04 literal): o schema de public.aluno
-- (20260512193000_initial_rh_cursos_schema.sql, linhas 76-89) não possui
-- nenhuma coluna ou conceito de "e-mail verificado"/"identidade confirmada".
-- Inventar uma coluna nova de verificação nesta story seria escopo de
-- REC-201+ (autenticação), violando o Artigo IV (No Invention) da
-- Constitution AIOX. Portanto, quando o e-mail já corresponde a um aluno
-- existente, esta migration faz a função REUSAR o aluno_id existente para a
-- nova inscrição, mas NÃO sobrescrever nenhum campo de PII
-- (nome_completo, cpf, telefone, cargo, orgao, tipo_aluno) — as diferenças
-- entre o payload recebido e os dados já cadastrados são silenciosamente
-- ignoradas para esse aluno. O aluno existente mantém exatamente os dados
-- que já tinha antes desta chamada. Este é o comportamento normativo de
-- FR-04 para esta story: dados de aluno existente não podem ser alterados
-- apenas pela coincidência de e-mail.
--
-- Único novo aluno (e-mail ainda não cadastrado) continua sendo criado
-- normalmente com todos os dados do payload — este caminho é inalterado.
--
-- Nenhuma outra parte da função (reserva atômica de vaga de REC-105,
-- checagem de duplicidade P0004, códigos de erro P0001-P0004, contrato de
-- retorno) é alterada por esta migration.
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
  v_reserved_id varchar(80);
  v_turma_status public.status_turma;
  v_turma_deleted timestamptz;
begin
  -- Reserva atômica de vaga (REC-105/FND-12) — inalterada por esta story.
  update public.turma
     set vagas_preenchidas = vagas_preenchidas + 1
   where id = p_turma_id
     and deleted_at is null
     and status in ('Aberta', 'PoucasVagas')
     and vagas_preenchidas < vagas_total
  returning id into v_reserved_id;

  if v_reserved_id is null then
    select status, deleted_at
      into v_turma_status, v_turma_deleted
      from public.turma
     where id = p_turma_id
     limit 1;

    if not found or v_turma_deleted is not null then
      raise exception 'Turma não encontrada.' using errcode = 'P0001';
    end if;

    if v_turma_status not in ('Aberta', 'PoucasVagas') then
      raise exception 'Turma não está disponível para inscrição (status: %).', v_turma_status
        using errcode = 'P0002';
    end if;

    raise exception 'Turma sem vagas disponíveis.' using errcode = 'P0003';
  end if;

  -- Upsert aluno por email (case-insensitive).
  --
  -- REC-106/FND-02/FR-04: quando o e-mail já corresponde a um aluno
  -- existente, a função REUSA v_aluno_id para a nova inscrição, mas NÃO
  -- sobrescreve nenhum campo de PII do aluno já cadastrado. O e-mail sozinho
  -- não é prova de identidade — sem um mecanismo de verificação (fora do
  -- escopo desta story), qualquer diferença entre o payload recebido e os
  -- dados já cadastrados é silenciosamente ignorada para esse aluno.
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
  end if;

  -- Verificar inscrição duplicada. Se disparar, a exceção não tratada
  -- aborta toda a transação da chamada e desfaz também a reserva de vaga
  -- feita acima (nenhuma vaga é consumida por uma tentativa duplicada).
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
  returning codigo_confirmacao into v_inscricao_id;

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
  'Registra pré-inscrição pública pendente. Reserva de vaga atômica via UPDATE ... WHERE vagas_preenchidas < vagas_total RETURNING id (REC-105/FND-12). Aluno existente identificado por e-mail é REUTILIZADO mas nunca tem PII sobrescrita pelo payload (REC-106/FND-02/FR-04). Parâmetro financeiro legado é ignorado até a remoção do contrato público antigo.';
