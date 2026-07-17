-- REC-105: reserva de vaga atômica em registrar_inscricao_publica (FND-12, FR-03, NFR-05).
--
-- Contexto: a versão da função vigente até esta migration
-- (20260714231000_public_pre_enrollment_pending.sql) já usava
-- `select ... for update` para travar a linha de public.turma antes de ler
-- vagas_restantes, o que em READ COMMITTED já serializa concorrentes na
-- mesma turma (a segunda chamada bloqueia até a primeira liberar a trava e
-- então relê o valor já commitado). Ou seja, a janela clássica de
-- "duas leituras concorrentes veem '1 vaga restante' antes de qualquer
-- commit" já não existia de forma explorável na prática.
--
-- Esta migration substitui esse padrão (checagem via SELECT ... FOR UPDATE
-- seguida de um UPDATE de incremento em outro momento da função) por uma
-- reserva atômica de vaga em uma única instrução: um
-- `UPDATE ... WHERE vagas_preenchidas < vagas_total RETURNING id`, cujo
-- resultado (linha afetada ou não) é a própria decisão de sucesso/conflito.
-- Não há mais nenhum SELECT prévio separado decidindo se há vaga — a
-- checagem de capacidade e a reserva ocorrem na mesma instrução, dentro da
-- mesma transação da função. Isso reduz a superfície de corretude a uma
-- garantia elementar do MVCC do Postgres (duas UPDATEs concorrentes sobre a
-- mesma linha nunca aplicam a mesma condição de WHERE sobre o mesmo valor
-- "stale"; a segunda só enxerga o efeito da primeira já commitado ou
-- serializado pelo lock de linha implícito da própria UPDATE), em vez de
-- depender de um SELECT ... FOR UPDATE cuja correção exige entender a
-- semântica de bloqueio de leitura sob READ COMMITTED.
--
-- Ordem de operações relevante para concorrência: a reserva de vaga
-- acontece ANTES do upsert de aluno e da checagem de inscrição duplicada.
-- Se a checagem de duplicidade (P0004) falhar depois da reserva ter sido
-- bem-sucedida, a exceção não tratada aborta toda a transação da chamada —
-- o que desfaz automaticamente o incremento de vagas_preenchidas junto com
-- qualquer insert/update de public.aluno, sem necessidade de rollback
-- manual dentro da função.
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
  -- Reserva atômica de vaga: checagem de capacidade e incremento na mesma
  -- instrução. Se duas chamadas concorrentes disputam a última vaga, no
  -- máximo uma delas afeta uma linha; a outra simplesmente não atualiza
  -- nada (vagas_preenchidas < vagas_total deixa de valer assim que a
  -- primeira é aplicada) e cai no ramo de conflito abaixo.
  update public.turma
     set vagas_preenchidas = vagas_preenchidas + 1
   where id = p_turma_id
     and deleted_at is null
     and status in ('Aberta', 'PoucasVagas')
     and vagas_preenchidas < vagas_total
  returning id into v_reserved_id;

  if v_reserved_id is null then
    -- A reserva atômica já decidiu que não há vaga/elegibilidade; o SELECT
    -- abaixo serve apenas para escolher a mensagem de erro correta
    -- (turma inexistente/excluída vs. status fechado vs. sem vaga) e não
    -- influencia mais a decisão de sucesso/conflito.
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

  -- Upsert aluno por email (case-insensitive) — inalterado por esta story.
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
  'Registra pré-inscrição pública pendente. Reserva de vaga atômica via UPDATE ... WHERE vagas_preenchidas < vagas_total RETURNING id (REC-105/FND-12). Parâmetro financeiro legado é ignorado até a remoção do contrato público antigo.';
