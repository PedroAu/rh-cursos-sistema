begin;

select plan(17);

create temporary table ep12_ctx as
select vagas_preenchidas::int as vagas_antes
from public.turma
where id = 'class-3-1';

select ok(
  exists(
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'inscricao'
      and indexname = 'inscricao_aluno_turma_active_idx'
  ),
  'indice parcial de inscricao ativa existe'
);

select lives_ok(
  $$
    select public.registrar_inscricao_publica(
      'EP12 Primeira Inscricao',
      'ep12-rollback@rhcursos.test',
      '12345678901',
      '61999990001',
      'Analista',
      'Orgao de Teste',
      'PF',
      'class-3-1',
      'PF',
      'Pix',
      'primeira tentativa'
    );
  $$,
  'primeira inscricao valida passa'
);

select is(
  (select count(*)::int from public.aluno where lower(email) = 'ep12-rollback@rhcursos.test'),
  1,
  'aluno criado uma unica vez'
);

select is(
  (
    select count(*)::int
    from public.inscricao i
    join public.aluno a on a.id = i.aluno_id
    where lower(a.email) = 'ep12-rollback@rhcursos.test'
      and i.turma_id = 'class-3-1'
      and i.status_inscricao <> 'Cancelada'
  ),
  1,
  'primeira inscricao ativa persistida'
);

select is(
  (select nome_completo from public.aluno where lower(email) = 'ep12-rollback@rhcursos.test'),
  'EP12 Primeira Inscricao',
  'nome inicial do aluno persistido'
);

select throws_ok(
  $$
    select public.registrar_inscricao_publica(
      'EP12 Nome Nao Deve Persistir',
      'ep12-rollback@rhcursos.test',
      '99999999999',
      '61999990002',
      'Gerente',
      'Outro Orgao',
      'PF',
      'class-3-1',
      'PF',
      'Pix',
      'segunda tentativa duplicada'
    );
  $$,
  'P0004',
  'Aluno já possui inscrição ativa nesta turma.',
  'duplicidade ativa e rejeitada pela rpc'
);

select is(
  (select count(*)::int from public.aluno where lower(email) = 'ep12-rollback@rhcursos.test'),
  1,
  'falha duplicada nao cria segundo aluno'
);

select is(
  (
    select count(*)::int
    from public.inscricao i
    join public.aluno a on a.id = i.aluno_id
    where lower(a.email) = 'ep12-rollback@rhcursos.test'
      and i.turma_id = 'class-3-1'
      and i.status_inscricao <> 'Cancelada'
  ),
  1,
  'falha duplicada nao cria segunda inscricao ativa'
);

select is(
  (select nome_completo from public.aluno where lower(email) = 'ep12-rollback@rhcursos.test'),
  'EP12 Primeira Inscricao',
  'rollback preserva dados anteriores do aluno'
);

select is(
  (select vagas_preenchidas::int from public.turma where id = 'class-3-1'),
  (select vagas_antes + 1 from ep12_ctx),
  'vagas da turma incrementam apenas uma vez'
);

insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000111',
    'authenticated',
    'authenticated',
    'ep12-rls-student-user@rhcursos.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Aluno RLS EP12"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000222',
    'authenticated',
    'authenticated',
    'ep12-rls-admin-user@rhcursos.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Admin RLS EP12"}'::jsonb,
    now(),
    now()
  );

update public.profiles
set role = 'admin'
where id = '00000000-0000-0000-0000-000000000222';

insert into public.aluno (id, nome_completo, email, user_id, tipo_aluno)
values (
  'ep12-rls-student',
  'Aluno RLS EP12',
  'ep12-rls-student@rhcursos.test',
  '00000000-0000-0000-0000-000000000111',
  'PF'
);

insert into public.inscricao (
  id,
  aluno_id,
  turma_id,
  status_inscricao,
  status_pagamento,
  forma_pagamento,
  tipo_inscricao
)
values (
  'ep12-rls-enrollment',
  'ep12-rls-student',
  'class-1-1',
  'Confirmada',
  'Pendente',
  'Pix',
  'PF'
);

create temporary table ep12_delete_ctx as
select
  t.vagas_preenchidas::int as vagas_antes,
  c.total_alunos::int as total_alunos_antes
from public.turma t
join public.curso c on c.id = t.curso_id
where t.id = 'class-1-1';

delete from public.inscricao
where id = 'ep12-rls-enrollment';

select is(
  (select count(*)::int from public.inscricao where id = 'ep12-rls-enrollment'),
  0,
  'delete da inscricao remove a linha'
);

select is(
  (select vagas_preenchidas::int from public.turma where id = 'class-1-1'),
  (select vagas_antes - 1 from ep12_delete_ctx),
  'delete da inscricao libera exatamente uma vaga'
);

select is(
  (
    select total_alunos::int
    from public.curso
    where id = (select curso_id from public.turma where id = 'class-1-1')
  ),
  (select total_alunos_antes - 1 from ep12_delete_ctx),
  'delete da inscricao reduz total_alunos apenas uma vez'
);

insert into public.lead (id, nome, email, origem)
values ('ep12-rls-lead', 'Lead RLS EP12', 'ep12-rls-lead@rhcursos.test', 'Teste');

insert into public.admin_audit_log (id, admin_email, action, resource, resource_id, payload)
values (
  '00000000-0000-0000-0000-000000000333',
  'admin-ep12@rhcursos.test',
  'upsert',
  'leads',
  'ep12-rls-lead',
  '{"source":"ep12"}'::jsonb
);

set local role anon;
select set_config('request.jwt.claim.sub', '', true);

select is(
  (select count(*)::int from public.aluno where id = 'ep12-rls-student'),
  0,
  'anon nao le aluno privado'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000111', true);

select is(
  (select count(*)::int from public.aluno where id = 'ep12-rls-student'),
  1,
  'aluno autenticado le o proprio registro'
);

select is(
  (select count(*)::int from public.inscricao where id = 'ep12-rls-enrollment'),
  1,
  'aluno autenticado le a propria inscricao'
);

select is(
  (select count(*)::int from public.lead where id = 'ep12-rls-lead'),
  0,
  'aluno autenticado nao le lead alheio'
);

select is(
  (select count(*)::int from public.admin_audit_log where id = '00000000-0000-0000-0000-000000000333'),
  0,
  'aluno autenticado nao le audit log admin'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000222', true);

select is(
  (select count(*)::int from public.lead where id = 'ep12-rls-lead'),
  1,
  'admin autenticado le lead protegido'
);

select is(
  (select count(*)::int from public.admin_audit_log where id = '00000000-0000-0000-0000-000000000333'),
  1,
  'admin autenticado le audit log'
);

reset role;

select * from finish();
rollback;
