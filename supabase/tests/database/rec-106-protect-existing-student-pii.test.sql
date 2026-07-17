-- Story REC-106 — proteger PII de aluno existente em registrar_inscricao_publica
-- Cobre a migration 20260716130000_rec106_protect_existing_student_pii.sql.
--
-- FND-02/FR-04: "Dados de aluno existente não podem ser alterados apenas
-- pela coincidência de e-mail." Este arquivo valida dois caminhos:
--
--   1) Aluno NOVO (e-mail ainda não cadastrado) continua sendo criado
--      normalmente com todos os dados do payload — caminho inalterado.
--   2) Aluno EXISTENTE (mesmo e-mail, case-insensitive) é reutilizado
--      (mesmo aluno_id) para a nova inscrição, mas nenhum campo de PII
--      (nome_completo, cpf, telefone, cargo, orgao, tipo_aluno) é
--      sobrescrito pelo payload da segunda chamada, mesmo que o payload
--      traga valores diferentes dos já cadastrados.
--
-- Roda em uma única conexão/transação (begin ... rollback ao final), então
-- não exercita concorrência real — isso já foi coberto para a reserva de
-- vaga por scripts/test-db-rec105-concurrency.mjs (REC-105); esta story não
-- introduz nenhum novo cenário de concorrência, apenas remove um UPDATE
-- incondicional de PII.

begin;

select plan(9);

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
  'rec106-course',
  'REC-106 Curso de Teste',
  'rec-106-curso-de-teste',
  'Curso sintético para validar proteção de PII de aluno existente.',
  'Curso sintético para validar proteção de PII de aluno existente.',
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

-- Turma com vagas suficientes para duas inscrições distintas nesta suíte.
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
  'rec106-class',
  'rec106-course',
  '2026-09-01',
  '2026-09-01',
  '09:00 às 17:00',
  'Online ao vivo',
  10,
  0,
  100,
  'Online',
  'Aberta',
  'Turma sintética REC-106 com vagas amplas.'
)
on conflict (id) do update set
  curso_id = excluded.curso_id,
  vagas_total = excluded.vagas_total,
  vagas_preenchidas = excluded.vagas_preenchidas,
  status = 'Aberta',
  deleted_at = null;

-- Segunda turma, para a segunda inscrição do mesmo aluno (evita colidir com
-- a checagem de duplicidade P0004, que não é o alvo deste teste).
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
  'rec106-class-2',
  'rec106-course',
  '2026-10-01',
  '2026-10-01',
  '09:00 às 17:00',
  'Online ao vivo',
  10,
  0,
  100,
  'Online',
  'Aberta',
  'Segunda turma sintética REC-106.'
)
on conflict (id) do update set
  curso_id = excluded.curso_id,
  vagas_total = excluded.vagas_total,
  vagas_preenchidas = excluded.vagas_preenchidas,
  status = 'Aberta',
  deleted_at = null;

-- 1) Aluno NOVO continua sendo criado normalmente com sucesso (código opaco).
select matches(
  public.registrar_inscricao_publica(
      'Pessoa REC-106 Original',
      'rec-106-aluno@rhcursos.test',
      '11122233301',
      '61988880001',
      'Analista',
      'Orgao Original',
      'PF',
      'rec106-class',
      'Pessoa física',
      'Pix',
      'Primeira inscricao, aluno novo'
    ),
  '^[0-9a-f]{16}$',
  'primeira inscricao cria aluno novo e retorna codigo opaco'
);

-- 2) Dados do aluno novo foram persistidos exatamente como enviados.
select results_eq(
  $$
    select nome_completo, cpf, telefone, cargo, orgao, tipo_aluno::text
      from public.aluno
     where lower(email) = 'rec-106-aluno@rhcursos.test'
  $$,
  $$
    values (
      'Pessoa REC-106 Original'::varchar,
      '11122233301'::varchar,
      '61988880001'::varchar,
      'Analista'::varchar,
      'Orgao Original'::varchar,
      'PF'::text
    )
  $$,
  'aluno novo persiste todos os campos de PII do payload'
);

-- 3) Segunda chamada com o MESMO e-mail (case diferente, para validar a
-- comparação case-insensitive) e PII completamente diferente, para uma
-- turma diferente (evita P0004) — deve ter sucesso reutilizando o aluno.
select matches(
  public.registrar_inscricao_publica(
      'Pessoa REC-106 Divergente',
      'REC-106-ALUNO@rhcursos.test',
      '99988877702',
      '61977770002',
      'Gerente',
      'Orgao Divergente',
      'PJ',
      'rec106-class-2',
      'Pessoa física',
      'Pix',
      'Segunda inscricao, mesmo aluno, payload divergente'
    ),
  '^[0-9a-f]{16}$',
  'segunda inscricao com mesmo e-mail (case diferente) tem sucesso'
);

-- 4) FND-02/FR-04: os campos de PII do aluno NÃO foram alterados pela
-- segunda chamada, mesmo com payload divergente em todos os campos.
select results_eq(
  $$
    select nome_completo, cpf, telefone, cargo, orgao, tipo_aluno::text
      from public.aluno
     where lower(email) = 'rec-106-aluno@rhcursos.test'
  $$,
  $$
    values (
      'Pessoa REC-106 Original'::varchar,
      '11122233301'::varchar,
      '61988880001'::varchar,
      'Analista'::varchar,
      'Orgao Original'::varchar,
      'PF'::text
    )
  $$,
  'aluno existente mantem PII original apos payload divergente na segunda chamada'
);

-- 5) Continua existindo exatamente 1 registro de aluno para este e-mail
-- (nenhuma duplicata criada pela comparação case-insensitive).
select is(
  (
    select count(*)::int
      from public.aluno
     where lower(email) = 'rec-106-aluno@rhcursos.test'
  ),
  1,
  'nenhum aluno duplicado e criado para o mesmo e-mail (case-insensitive)'
);

-- 6) O mesmo aluno_id foi reutilizado nas duas inscrições.
select is(
  (
    select count(distinct i.aluno_id)::int
      from public.inscricao i
      join public.aluno a on a.id = i.aluno_id
     where lower(a.email) = 'rec-106-aluno@rhcursos.test'
       and i.turma_id in ('rec106-class', 'rec106-class-2')
  ),
  1,
  'as duas inscricoes referenciam o mesmo aluno_id (reuso, nao duplicacao)'
);

-- 7) Ambas as inscrições foram de fato persistidas (uma por turma).
select is(
  (
    select count(*)::int
      from public.inscricao i
      join public.aluno a on a.id = i.aluno_id
     where lower(a.email) = 'rec-106-aluno@rhcursos.test'
       and i.turma_id in ('rec106-class', 'rec106-class-2')
  ),
  2,
  'as duas inscricoes (turmas distintas) foram persistidas para o aluno reutilizado'
);

-- 8) Regressão: duplicidade continua protegida (P0004) para o MESMO aluno e
-- a MESMA turma, mesmo após a reutilização sem sobrescrita de PII.
select throws_ok(
  $$
    select public.registrar_inscricao_publica(
      'Pessoa REC-106 Terceira Tentativa',
      'rec-106-aluno@rhcursos.test',
      '00000000000',
      '61900000000',
      '',
      '',
      'PF',
      'rec106-class',
      'Pessoa física',
      'Pix',
      'Tentativa duplicada na mesma turma'
    );
  $$,
  'P0004',
  'Aluno já possui inscrição ativa nesta turma.',
  'duplicidade na mesma turma continua rejeitada apos reuso de aluno sem sobrescrita de PII'
);

-- 9) A tentativa duplicada rejeitada (P0004) também não alterou a PII do
-- aluno (regressão adicional: nenhum ramo de falha deve escrever PII).
select results_eq(
  $$
    select nome_completo, cpf, telefone, cargo, orgao, tipo_aluno::text
      from public.aluno
     where lower(email) = 'rec-106-aluno@rhcursos.test'
  $$,
  $$
    values (
      'Pessoa REC-106 Original'::varchar,
      '11122233301'::varchar,
      '61988880001'::varchar,
      'Analista'::varchar,
      'Orgao Original'::varchar,
      'PF'::text
    )
  $$,
  'tentativa duplicada rejeitada tambem nao altera PII do aluno existente'
);

select * from finish();
rollback;
