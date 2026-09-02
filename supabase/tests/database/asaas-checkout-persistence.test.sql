-- Story 2026-08-31 — persistência transacional do Checkout Asaas DP Zero.

begin;

select no_plan();

insert into public.curso (
  id, titulo, slug, descricao_curta, descricao, ementa, objetivos, beneficios,
  publico_alvo, carga_horaria, modalidade, nivel, preco_base, status, destaque
) values (
  'asaas-dp-zero-course', 'Departamento Pessoal do Zero',
  'departamento-pessoal-do-zero', 'Curso teste Asaas', 'Curso teste Asaas',
  '[]', '[]', '[]', '[]', 20, 'Gravado', 'Basico', 297, 'Ativo', false
)
on conflict (slug) do update set
  titulo = excluded.titulo,
  deleted_at = null,
  status = 'Ativo';

insert into public.turma (
  id, curso_id, data_inicio, data_fim, vagas_total, vagas_preenchidas,
  preco_turma, modalidade, status
) values
  (
    'asaas-dp-zero-first',
    (select id from public.curso where slug = 'departamento-pessoal-do-zero'),
    '2026-11-01', null, 20, 0, 297, 'Gravado', 'Aberta'
  ),
  (
    'asaas-dp-zero-later',
    (select id from public.curso where slug = 'departamento-pessoal-do-zero'),
    '2026-11-02', null, 20, 0, 297, 'Gravado', 'Aberta'
  ),
  (
    'asaas-dp-zero-wrong-price',
    (select id from public.curso where slug = 'departamento-pessoal-do-zero'),
    '2026-10-01', null, 20, 0, 296, 'Gravado', 'Aberta'
  )
on conflict (id) do update set
  curso_id = excluded.curso_id,
  vagas_total = excluded.vagas_total,
  vagas_preenchidas = 0,
  preco_turma = excluded.preco_turma,
  modalidade = excluded.modalidade,
  status = excluded.status,
  deleted_at = null;

select ok(
  (select relrowsecurity from pg_class where oid = 'public.pagamento_gateway_evento'::regclass),
  'RLS está habilitada na tabela privada de eventos'
);

select ok(
  not has_table_privilege('anon', 'public.pagamento_gateway_evento', 'SELECT')
  and not has_table_privilege('authenticated', 'public.pagamento_gateway_evento', 'SELECT'),
  'anon e authenticated não leem eventos'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.iniciar_checkout_asaas_dp_zero(uuid,character varying,character varying,character varying,character varying,integer)',
    'EXECUTE'
  )
  and has_function_privilege(
    'service_role',
    'public.iniciar_checkout_asaas_dp_zero(uuid,character varying,character varying,character varying,character varying,integer)',
    'EXECUTE'
  ),
  'RPC inicial é exclusiva de service_role'
);

create temporary table asaas_start_one as
select * from public.iniciar_checkout_asaas_dp_zero(
  '10000000-0000-0000-0000-000000000001',
  '  Pessoa Asaas Um  ',
  ' PESSOA.UM@EXAMPLE.COM ',
  '111.111.111-11',
  '(61) 99999-0001',
  30
);

select ok((select created from asaas_start_one), 'primeira chave cria checkout');
select is((select gateway_status from asaas_start_one), 'CREATING', 'checkout inicia em CREATING');
select is(
  (
    select i.turma_id
    from public.inscricao i
    where i.id = (select inscricao_id from asaas_start_one)
  ),
  'asaas-dp-zero-first',
  'entre múltiplas turmas elegíveis escolhe data_inicio e id ascendentes'
);
select is(
  (select vagas_preenchidas from public.turma where id = 'asaas-dp-zero-first'),
  1,
  'início reserva exatamente uma vaga'
);
select ok(
  (
    select p.valor = 297
      and p.status = 'Pendente'
      and p.forma_pagamento is null
      and p.parcelas is null
    from public.pagamento p
    where p.id = (select pagamento_id from asaas_start_one)
  ),
  'pagamento usa preço autoritativo e não infere forma ou parcelas'
);
select ok(
  (
    select i.status_inscricao = 'AguardandoPagamento'
      and i.status_pagamento = 'Pendente'
    from public.inscricao i
    where i.id = (select inscricao_id from asaas_start_one)
  ),
  'inscrição aguarda pagamento sem falso sucesso'
);

create temporary table asaas_start_one_retry as
select * from public.iniciar_checkout_asaas_dp_zero(
  '10000000-0000-0000-0000-000000000001',
  'Pessoa Asaas Um',
  'pessoa.um@example.com',
  '11111111111',
  '61999990001',
  30
);

select ok(not (select created from asaas_start_one_retry), 'retry normalizado reutiliza checkout');
select is(
  (select pagamento_id from asaas_start_one_retry),
  (select pagamento_id from asaas_start_one),
  'retry devolve o mesmo pagamento'
);
select is(
  (select vagas_preenchidas from public.turma where id = 'asaas-dp-zero-first'),
  1,
  'retry não reserva nova vaga'
);

select throws_ok(
  $$
    select * from public.iniciar_checkout_asaas_dp_zero(
      '10000000-0000-0000-0000-000000000001',
      'Pessoa Diferente', 'pessoa.um@example.com', '11111111111', '61999990001', 30
    );
  $$,
  'P0004',
  'Chave de idempotência já utilizada com payload diferente.',
  'mesma chave com payload divergente falha'
);

select is(
  public.marcar_checkout_asaas_creation_unknown((select pagamento_id from asaas_start_one)),
  'CREATION_UNKNOWN',
  'timeout ambíguo muda CREATING para CREATION_UNKNOWN'
);
select is(
  (select vagas_preenchidas from public.turma where id = 'asaas-dp-zero-first'),
  1,
  'CREATION_UNKNOWN preserva a vaga'
);
select is(
  public.vincular_checkout_asaas(
    (select pagamento_id from asaas_start_one),
    'checkout-asaas-one',
    now() + interval '30 minutes'
  ),
  'ACTIVE',
  'bind reconcilia CREATION_UNKNOWN para ACTIVE'
);
select is(
  public.vincular_checkout_asaas(
    (select pagamento_id from asaas_start_one),
    'checkout-asaas-one',
    now() + interval '30 minutes'
  ),
  'ACTIVE',
  'bind repetido com a mesma referência é idempotente'
);

create temporary table asaas_paid_one as
select * from public.processar_evento_checkout_asaas(
  'evt-asaas-paid-one', 'CHECKOUT_PAID', 'checkout-asaas-one',
  (select pagamento_id from asaas_start_one), repeat('a', 64), now(), 297, null, null
);

select ok(
  (select processed and event_status = 'PROCESSED' and payment_gateway_status = 'PAID' from asaas_paid_one),
  'CHECKOUT_PAID processa e conclui o pagamento'
);
select ok(
  (
    select p.status = 'Pago' and p.forma_pagamento is null and p.parcelas is null
    from public.pagamento p where p.id = (select pagamento_id from asaas_start_one)
  ),
  'pagamento pago preserva método e parcelas indefinidos quando não conciliados'
);
select ok(
  (
    select i.status_inscricao = 'Confirmada'
      and i.status_pagamento = 'Pago'
      and i.valor_pago = 297
    from public.inscricao i where i.id = (select inscricao_id from asaas_start_one)
  ),
  'somente evento pago confirma a inscrição'
);

create temporary table asaas_paid_one_duplicate as
select * from public.processar_evento_checkout_asaas(
  'evt-asaas-paid-one', 'CHECKOUT_PAID', 'checkout-asaas-one',
  (select pagamento_id from asaas_start_one), repeat('a', 64), now(), 297, null, null
);
select ok(
  (select processed and duplicate from asaas_paid_one_duplicate),
  'evento PROCESSED duplicado retorna sucesso idempotente'
);

select ok(
  (
    select processed
    from public.processar_evento_checkout_asaas(
      'evt-asaas-cancel-after-paid', 'CHECKOUT_CANCELED', 'checkout-asaas-one',
      (select pagamento_id from asaas_start_one), repeat('b', 64), now(), null, null, null
    )
  ),
  'cancelamento tardio é consumido sem regredir PAID'
);
select is(
  (select gateway_status from public.pagamento where id = (select pagamento_id from asaas_start_one)),
  'PAID',
  'estado PAID é terminal absoluto'
);

create temporary table asaas_start_failed as
select * from public.iniciar_checkout_asaas_dp_zero(
  '20000000-0000-0000-0000-000000000002',
  'Pessoa Asaas Falha', 'falha@example.com', '22222222222', '61999990002', 30
);
select is(
  public.marcar_checkout_asaas_failed((select pagamento_id from asaas_start_failed)),
  'FAILED',
  'falha determinística termina o checkout'
);
select is(
  (select status_inscricao::text from public.inscricao where id = (select inscricao_id from asaas_start_failed)),
  'Cancelada',
  'falha determinística cancela inscrição ainda aguardando'
);
select is(
  (select vagas_preenchidas from public.turma where id = 'asaas-dp-zero-first'),
  1,
  'falha determinística libera exatamente uma vaga'
);
select is(
  public.marcar_checkout_asaas_failed((select pagamento_id from asaas_start_failed)),
  'FAILED',
  'compensação repetida é idempotente'
);
select is(
  (select vagas_preenchidas from public.turma where id = 'asaas-dp-zero-first'),
  1,
  'compensação repetida não libera vaga duas vezes'
);

create temporary table asaas_start_late as
select * from public.iniciar_checkout_asaas_dp_zero(
  '30000000-0000-0000-0000-000000000003',
  'Pessoa Asaas Tardia', 'tardia@example.com', '33333333333', '61999990003', 30
);
select is(
  public.vincular_checkout_asaas(
    (select pagamento_id from asaas_start_late), 'checkout-asaas-late', now() + interval '30 minutes'
  ),
  'ACTIVE',
  'segundo checkout é vinculado'
);
select ok(
  (
    select processed
    from public.processar_evento_checkout_asaas(
      'evt-asaas-cancel-late', 'CHECKOUT_CANCELED', 'checkout-asaas-late',
      (select pagamento_id from asaas_start_late), repeat('c', 64), now(), null, null, null
    )
  ),
  'cancelamento ativo é processado'
);
select is(
  (select vagas_preenchidas from public.turma where id = 'asaas-dp-zero-first'),
  1,
  'cancelamento libera uma vaga'
);
select is(
  (
    select payment_gateway_status
    from public.processar_evento_checkout_asaas(
      'evt-asaas-paid-late', 'CHECKOUT_PAID', 'checkout-asaas-late',
      (select pagamento_id from asaas_start_late), repeat('d', 64), now(), 297, 'Cartao', 12
    )
  ),
  'PAID',
  'pagamento tardio readquire vaga antes de confirmar'
);
select is(
  (select vagas_preenchidas from public.turma where id = 'asaas-dp-zero-first'),
  2,
  'pagamento tardio incrementa uma vaga exatamente uma vez'
);
select ok(
  (
    select forma_pagamento = 'Cartao' and parcelas = 12
    from public.pagamento where id = (select pagamento_id from asaas_start_late)
  ),
  'conciliação validada aceita cartão em até 12 parcelas'
);

create temporary table asaas_start_retry_event as
select * from public.iniciar_checkout_asaas_dp_zero(
  '40000000-0000-0000-0000-000000000004',
  'Pessoa Asaas Retry', 'retry@example.com', '44444444444', '61999990004', 30
);
select is(
  (
    select event_status
    from public.processar_evento_checkout_asaas(
      'evt-asaas-retry', 'CHECKOUT_PAID', 'checkout-asaas-retry',
      (select pagamento_id from asaas_start_retry_event), repeat('e', 64), now(), 297, 'Pix', 1
    )
  ),
  'RETRYABLE_ERROR',
  'transição CREATING para PAID não listada falha sem confirmação'
);
select is(
  public.vincular_checkout_asaas(
    (select pagamento_id from asaas_start_retry_event),
    'checkout-asaas-retry', now() + interval '30 minutes'
  ),
  'ACTIVE',
  'checkout em retry pode ser vinculado corretamente'
);
select is(
  (
    select event_status
    from public.processar_evento_checkout_asaas(
      'evt-asaas-retry', 'CHECKOUT_PAID', 'checkout-asaas-retry',
      (select pagamento_id from asaas_start_retry_event), repeat('e', 64), now(), 297, 'Pix', 1
    )
  ),
  'PROCESSED',
  'evento RETRYABLE_ERROR é reprocessado sem efeito parcial'
);

insert into public.aluno (id, nome_completo, email, cpf, telefone, tipo_aluno)
values
  ('asaas-identity-a', 'Identidade A', 'identity-a@example.com', '55555555555', '61999990005', 'PF'),
  ('asaas-identity-b', 'Identidade B', 'identity-b@example.com', '66666666666', '61999990006', 'PF');

select throws_ok(
  $$
    select * from public.iniciar_checkout_asaas_dp_zero(
      '50000000-0000-0000-0000-000000000005',
      'Conflito Email', 'identity-a@example.com', '77777777777', '61999990007', 30
    );
  $$,
  'P0004', 'Conflito entre e-mail e CPF informados.',
  'match somente por e-mail falha sem sobrescrever PII'
);
select throws_ok(
  $$
    select * from public.iniciar_checkout_asaas_dp_zero(
      '60000000-0000-0000-0000-000000000006',
      'Conflito CPF', 'novo@example.com', '55555555555', '61999990008', 30
    );
  $$,
  'P0004', 'Conflito entre e-mail e CPF informados.',
  'match somente por CPF falha'
);
select throws_ok(
  $$
    select * from public.iniciar_checkout_asaas_dp_zero(
      '70000000-0000-0000-0000-000000000007',
      'Conflito Cruzado', 'identity-a@example.com', '66666666666', '61999990009', 30
    );
  $$,
  'P0004', 'Conflito entre e-mail e CPF informados.',
  'e-mail e CPF de alunos diferentes falham'
);
select is(
  (select nome_completo from public.aluno where id = 'asaas-identity-a'),
  'Identidade A',
  'conflitos não alteram PII existente'
);

update public.turma
   set status = 'Encerrada'
 where id in ('asaas-dp-zero-first', 'asaas-dp-zero-later');

select throws_ok(
  $$
    select * from public.iniciar_checkout_asaas_dp_zero(
      '80000000-0000-0000-0000-000000000008',
      'Sem Turma', 'sem-turma@example.com', '88888888888', '61999990010', 30
    );
  $$,
  'P0003',
  'Nenhuma turma gravada de R$ 297 disponível para o produto.',
  'zero turma elegível falha sem persistência parcial'
);
select ok(
  not exists (select 1 from public.aluno where email = 'sem-turma@example.com'),
  'falha de turma reverte criação transitória do aluno'
);

select throws_ok(
  $$
    update public.pagamento
       set forma_pagamento = 'Boleto'
     where id = (select pagamento_id from asaas_start_one);
  $$,
  '23514',
  null,
  'pagamento Asaas rejeita Boleto'
);

select * from finish();
rollback;
