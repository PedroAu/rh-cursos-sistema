begin;

select no_plan();

insert into public.curso (
  id, titulo, slug, descricao_curta, descricao, ementa, objetivos, beneficios,
  publico_alvo, carga_horaria, modalidade, nivel, preco_base, status, destaque
) values (
  'asaas-retention-course', 'Curso retenção Asaas', 'departamento-pessoal-do-zero',
  'Teste', 'Teste', '[]', '[]', '[]', '[]', 1, 'Gravado', 'Basico', 297, 'Ativo', false
) on conflict (id) do nothing;

insert into public.turma (
  id, curso_id, data_inicio, vagas_total, vagas_preenchidas, preco_turma, modalidade, status
) values (
  'asaas-retention-class', 'asaas-retention-course', '2026-12-01', 20, 0, 297, 'Gravado', 'Aberta'
) on conflict (id) do nothing;

-- The production RPC uses independent INSERT statements. This verifies that
-- its newly created aluno is marked as a temporary checkout identity.
create temporary table asaas_retention_new as
select * from public.iniciar_checkout_asaas_dp_zero(
  '90000000-0000-4000-8000-000000000001',
  'Pessoa Abandonada',
  'abandonada@example.com',
  '12345678901',
  '61999990001',
  30
);

update public.pagamento
   set gateway_status = 'EXPIRED', status = 'Cancelado', created_at = now() - interval '31 days'
 where id = (select pagamento_id from asaas_retention_new);
update public.inscricao
   set status_inscricao = 'Cancelada', status_pagamento = 'Cancelado'
 where id = (select inscricao_id from asaas_retention_new);

insert into public.aluno (id, nome_completo, email, cpf, telefone, tipo_aluno, created_at)
values ('asaas-retention-existing', 'Pessoa Existente', 'existente@example.com', '10987654321', '61999990002', 'PF', now() - interval '1 day')
on conflict (id) do nothing;
insert into public.inscricao (
  id, aluno_id, turma_id, status_inscricao, status_pagamento, valor_pago, tipo_inscricao
) values ('asaas-retention-existing-enrollment', 'asaas-retention-existing', 'asaas-retention-class', 'Cancelada', 'Cancelado', 0, 'Pessoa física')
on conflict (id) do nothing;
insert into public.pagamento (
  inscricao_id, valor, status, gateway, gateway_status, checkout_expires_at,
  idempotency_key, request_hash
) values (
  'asaas-retention-existing-enrollment', 297, 'Cancelado', 'ASAAS', 'EXPIRED', now() - interval '31 days',
  '90000000-0000-4000-8000-000000000002', repeat('b', 64)
);

update public.pagamento
   set created_at = now() - interval '31 days'
 where inscricao_id = 'asaas-retention-existing-enrollment';

select ok(
  (select checkout_criou_aluno from public.pagamento where id = (select pagamento_id from asaas_retention_new)),
  'marca aluno criado na transação do checkout'
);
select ok(
  not (select checkout_criou_aluno from public.pagamento where inscricao_id = 'asaas-retention-existing-enrollment'),
  'não marca aluno preexistente como temporário'
);

select is(
  public.anonimizar_checkouts_asaas_abandonados(interval '30 days'),
  1,
  'anonimiza exatamente o cadastro temporário abandonado'
);
select ok(
  (
    select deleted_at is not null
      and nome_completo = 'Cadastro abandonado'
      and cpf is null
      and telefone is null
      and email like 'anonimizado+%@checkout.invalid'
    from public.aluno where id = (select aluno_id from asaas_retention_new)
  ),
  'remove PII do checkout abandonado e mantém trilha de auditoria'
);
select ok(
  (
    select deleted_at is null
      and nome_completo = 'Pessoa Existente'
      and cpf = '10987654321'
    from public.aluno where id = 'asaas-retention-existing'
  ),
  'preserva dados do aluno preexistente'
);
select ok(
  not has_function_privilege('anon', 'public.anonimizar_checkouts_asaas_abandonados(interval)', 'EXECUTE')
    and has_function_privilege('service_role', 'public.anonimizar_checkouts_asaas_abandonados(interval)', 'EXECUTE'),
  'função de retenção é exclusiva de service_role'
);

select * from finish();
rollback;
