begin;

select plan(11);

insert into public.curso (
  id,
  titulo,
  slug,
  descricao_curta,
  descricao,
  ementa,
  objetivos,
  beneficios,
  publico_alvo,
  carga_horaria,
  modalidade,
  nivel,
  preco_base,
  status,
  destaque
)
values (
  'rec301-course',
  'REC-301 Curso de Teste',
  'rec-301-curso-de-teste',
  'Curso sintético para validar pré-inscrição.',
  'Curso sintético para validar pré-inscrição.',
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  8,
  'Online',
  'Basico',
  100,
  'Ativo',
  false
)
on conflict (id) do update set
  titulo = excluded.titulo,
  slug = excluded.slug,
  deleted_at = null;

insert into public.turma (
  id,
  curso_id,
  data_inicio,
  data_fim,
  horario,
  local,
  vagas_total,
  vagas_preenchidas,
  preco_turma,
  modalidade,
  status,
  observacoes
)
values (
  'rec301-class',
  'rec301-course',
  '2026-09-01',
  '2026-09-01',
  '09:00 às 17:00',
  'Online ao vivo',
  10,
  0,
  100,
  'Online',
  'Aberta',
  'Turma sintética REC-301.'
)
on conflict (id) do update set
  curso_id = excluded.curso_id,
  vagas_total = excluded.vagas_total,
  vagas_preenchidas = 0,
  status = 'Aberta',
  deleted_at = null;

select matches(
  public.registrar_inscricao_publica(
      'Pessoa REC-301',
      'rec-301-pre-enrollment@rhcursos.test',
      '12345678901',
      '61999990001',
      '',
      '',
      'PF',
      'rec301-class',
      'Pessoa física',
      'Pix',
      'Pré-inscrição sintética REC-301'
    ),
  '^[0-9a-f]{16}$',
  'pré-inscrição ignora forma financeira legada enviada diretamente à RPC'
);

select ok(
  exists(
    select 1
    from public.inscricao i
    join public.aluno a on a.id = i.aluno_id
    where lower(a.email) = 'rec-301-pre-enrollment@rhcursos.test'
      and i.turma_id = 'rec301-class'
  ),
  'pré-inscrição retorna e persiste referência opaca'
);

select is(
  (
    select i.status_inscricao::text
    from public.inscricao i
    join public.aluno a on a.id = i.aluno_id
    where lower(a.email) = 'rec-301-pre-enrollment@rhcursos.test'
  ),
  'Pendente',
  'pré-inscrição permanece pendente de análise'
);

select is(
  (
    select i.status_pagamento::text
    from public.inscricao i
    join public.aluno a on a.id = i.aluno_id
    where lower(a.email) = 'rec-301-pre-enrollment@rhcursos.test'
  ),
  'Pendente',
  'estado financeiro permanece pendente sem alegar liquidação'
);

select ok(
  (
    select i.forma_pagamento is null
    from public.inscricao i
    join public.aluno a on a.id = i.aluno_id
    where lower(a.email) = 'rec-301-pre-enrollment@rhcursos.test'
  ),
  'nenhuma forma financeira é inventada'
);

select matches(
  (
    select i.codigo_confirmacao
    from public.inscricao i
    join public.aluno a on a.id = i.aluno_id
    where lower(a.email) = 'rec-301-pre-enrollment@rhcursos.test'
  ),
  '^[0-9a-f]{16}$',
  'recibo persistido mantém código opaco'
);

select ok(
  not exists (
    select 1
    from public.curso_public_content
    where deleted_at is null
      and faq_items::text like '%conclua o checkout guiado%'
  ),
  'conteúdo editorial persistido não anuncia checkout simulado'
);

select ok(
  not exists (
    select 1
    from public.curso_public_content
    where deleted_at is null
      and (
        sidebar->>'installmentText' like '%6x sem juros%'
        or sidebar->>'guaranteeTitle' = 'Garantia de satisfação.'
        or sidebar->>'guaranteeText' like '%receba 100% do valor de volta%'
      )
  ),
  'sidebar persistida não promete parcelamento nem garantia financeira'
);

select throws_ok(
  $$
    select public.registrar_inscricao_publica(
      'Pessoa Sem Turma',
      'rec-301-no-class@rhcursos.test',
      '12345678902',
      '61999990002',
      '',
      '',
      'PF',
      'rec301-class-inexistente',
      'Pessoa física',
      null,
      null
    );
  $$,
  'P0001',
  'Turma não encontrada.',
  'turma inexistente continua rejeitada'
);

update public.turma set status = 'Encerrada' where id = 'rec301-class';

select throws_ok(
  $$
    select public.registrar_inscricao_publica(
      'Pessoa Turma Fechada',
      'rec-301-closed-class@rhcursos.test',
      '12345678903',
      '61999990003',
      '',
      '',
      'PF',
      'rec301-class',
      'Pessoa física',
      null,
      null
    );
  $$,
  'P0002',
  'Turma não está disponível para inscrição (status: Encerrada).',
  'turma encerrada continua rejeitada'
);

update public.turma set status = 'Aberta' where id = 'rec301-class';

select throws_ok(
  $$
    select public.registrar_inscricao_publica(
      'Pessoa REC-301 Duplicada',
      'rec-301-pre-enrollment@rhcursos.test',
      '12345678901',
      '61999990001',
      '',
      '',
      'PF',
      'rec301-class',
      'Pessoa física',
      null,
      'Tentativa duplicada REC-301'
    );
  $$,
  'P0004',
  'Aluno já possui inscrição ativa nesta turma.',
  'duplicidade continua rejeitada'
);

select * from finish();
rollback;
