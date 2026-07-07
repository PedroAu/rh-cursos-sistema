begin;
select plan(5);

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000441',
    'authenticated',
    'authenticated',
    'instrutor-ep14@rhcursos.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Instrutor EP14"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000442',
    'authenticated',
    'authenticated',
    'admin-ep14@rhcursos.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Admin EP14"}'::jsonb,
    now(),
    now()
  );

update public.profiles
set role = 'instructor'
where id = '00000000-0000-0000-0000-000000000441';

update public.profiles
set role = 'admin'
where id = '00000000-0000-0000-0000-000000000442';

insert into public.instrutor (id, nome, status, user_id)
values ('ep14-instrutor', 'Instrutor EP14', 'Ativo', '00000000-0000-0000-0000-000000000441');

insert into public.aluno (id, nome_completo, email, tipo_aluno)
values ('ep14-aluno', 'Aluno EP14', 'aluno-ep14@rhcursos.test', 'PF');

insert into public.curso (id, titulo, slug, status)
values ('ep14-course', 'Curso EP14', 'curso-ep14', 'Ativo');

insert into public.turma (
  id, curso_id, instrutor_id, data_inicio, vagas_total, vagas_preenchidas, preco_turma, modalidade, status
)
values (
  'ep14-turma',
  'ep14-course',
  'ep14-instrutor',
  now()::date + interval '7 days',
  30,
  1,
  0,
  'Online',
  'Aberta'
);

insert into public.inscricao (
  id, aluno_id, turma_id, status_inscricao, status_pagamento, forma_pagamento, tipo_inscricao
)
values (
  'ep14-inscricao',
  'ep14-aluno',
  'ep14-turma',
  'Confirmada',
  'Pendente',
  'Pix',
  'PF'
);

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select is(
  (select count(*)::int from public.aluno where id = 'ep14-aluno'),
  0,
  'anon nao le aluno de turma privada'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000441', true);

select is(
  (select count(*)::int from public.instrutor where id = 'ep14-instrutor'),
  1,
  'instrutor autenticado le o proprio perfil'
);

select is(
  (select count(*)::int from public.inscricao where id = 'ep14-inscricao'),
  1,
  'instrutor autenticado le inscricao da propria turma'
);

select is(
  (select count(*)::int from public.aluno where id = 'ep14-aluno'),
  1,
  'instrutor autenticado le aluno inscrito na propria turma'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000442', true);
select is(
  (select count(*)::int from public.aluno where id = 'ep14-aluno'),
  1,
  'admin continua lendo aluno protegido'
);

reset role;

select * from finish();
rollback;
