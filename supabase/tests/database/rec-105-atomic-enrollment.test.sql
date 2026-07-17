-- Story REC-105 — reserva de vaga atômica em registrar_inscricao_publica
-- Cobre a migration 20260716100000_rec105_atomic_enrollment.sql.
--
-- IMPORTANTE — limitação declarada explicitamente (ver story e relatório):
-- este arquivo pgTAP roda em uma única conexão/transação (begin ... rollback
-- ao final), então NÃO exercita concorrência real (duas conexões distintas
-- disputando a mesma vaga ao mesmo tempo). Aqui validamos a lógica de forma
-- SEQUENCIAL: ocupar a última vaga com uma inscrição e confirmar que a
-- tentativa seguinte falha com o erro correto de "sem vaga" (P0003), sem
-- deixar vagas_preenchidas exceder vagas_total. A concorrência real (duas
-- chamadas simultâneas de processos distintos via psql) é exercitada
-- separadamente em scripts/test-db-rec105-concurrency.mjs, documentado no
-- relatório da story.

begin;

select plan(10);

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
  'rec105-course',
  'REC-105 Curso de Teste',
  'rec-105-curso-de-teste',
  'Curso sintético para validar atomicidade de vaga.',
  'Curso sintético para validar atomicidade de vaga.',
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

-- Turma com exatamente 1 vaga restante (vagas_total=5, vagas_preenchidas=4).
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
  'rec105-class',
  'rec105-course',
  '2026-09-01',
  '2026-09-01',
  '09:00 às 17:00',
  'Online ao vivo',
  5,
  4,
  100,
  'Online',
  'PoucasVagas',
  'Turma sintética REC-105 com 1 vaga restante.'
)
on conflict (id) do update set
  curso_id = excluded.curso_id,
  vagas_total = excluded.vagas_total,
  vagas_preenchidas = excluded.vagas_preenchidas,
  status = 'PoucasVagas',
  deleted_at = null;

-- 1) A última vaga é ocupada com sucesso e retorna código opaco.
select matches(
  public.registrar_inscricao_publica(
      'Pessoa REC-105 Primeira',
      'rec-105-primeira@rhcursos.test',
      '12345678901',
      '61999990001',
      '',
      '',
      'PF',
      'rec105-class',
      'Pessoa física',
      'Pix',
      'Ocupa a última vaga'
    ),
  '^[0-9a-f]{16}$',
  'primeira inscrição ocupa a última vaga e retorna código opaco'
);

-- 2) vagas_preenchidas foi incrementada exatamente para o total (4 -> 5).
select is(
  (select vagas_preenchidas from public.turma where id = 'rec105-class'),
  5,
  'vagas_preenchidas reflete exatamente 1 reserva bem-sucedida'
);

-- 3) A turma some da elegibilidade pública ao esgotar (trigger sync_turma_status).
select is(
  (select status::text from public.turma where id = 'rec105-class'),
  'Encerrada',
  'trigger sync_turma_status fecha a turma ao esgotar vagas'
);

-- 4) A próxima tentativa (aluno diferente) é rejeitada com o erro correto de
-- "sem vaga" — não overbooking, não uma exceção genérica. Como a turma já
-- está com status 'Encerrada' após o passo 3, o teste força novamente
-- 'PoucasVagas' com vagas_preenchidas = vagas_total para isolar
-- especificamente o ramo de capacidade (P0003) do ramo de status (P0002).
update public.turma
   set status = 'PoucasVagas'
 where id = 'rec105-class';

select throws_ok(
  $$
    select public.registrar_inscricao_publica(
      'Pessoa REC-105 Segunda',
      'rec-105-segunda@rhcursos.test',
      '12345678902',
      '61999990002',
      '',
      '',
      'PF',
      'rec105-class',
      'Pessoa física',
      'Pix',
      'Tenta ocupar vaga inexistente'
    );
  $$,
  'P0003',
  'Turma sem vagas disponíveis.',
  'segunda tentativa (aluno diferente, sem vaga real) recebe conflito coerente'
);

-- 5) vagas_preenchidas não foi alterada pela tentativa rejeitada (sem overbooking).
select is(
  (select vagas_preenchidas from public.turma where id = 'rec105-class'),
  5,
  'tentativa rejeitada nao incrementa vagas_preenchidas'
);

-- 6) A tentativa rejeitada não criou aluno nem inscrição (reserva e escrita
-- de negócio são atômicas: nada é criado quando a reserva falha).
select ok(
  not exists (
    select 1 from public.aluno where lower(email) = 'rec-105-segunda@rhcursos.test'
  ),
  'tentativa rejeitada nao cria registro de aluno orfao'
);

select ok(
  not exists (
    select 1
    from public.inscricao i
    join public.aluno a on a.id = i.aluno_id
    where lower(a.email) = 'rec-105-segunda@rhcursos.test'
      and i.turma_id = 'rec105-class'
  ),
  'tentativa rejeitada nao cria inscricao'
);

-- 7) Reserva de vaga é desfeita junto com a exceção de duplicidade (P0004):
-- uma segunda tentativa do MESMO aluno já inscrito não deve consumir vaga,
-- mesmo que a reserva atômica tenha sido aplicada antes da checagem de
-- duplicidade. Reabre 1 vaga para o teste.
update public.turma
   set vagas_preenchidas = 4,
       status = 'PoucasVagas'
 where id = 'rec105-class';

select throws_ok(
  $$
    select public.registrar_inscricao_publica(
      'Pessoa REC-105 Primeira',
      'rec-105-primeira@rhcursos.test',
      '12345678901',
      '61999990001',
      '',
      '',
      'PF',
      'rec105-class',
      'Pessoa física',
      'Pix',
      'Tentativa duplicada'
    );
  $$,
  'P0004',
  'Aluno já possui inscrição ativa nesta turma.',
  'duplicidade continua rejeitada mesmo apos reserva atomica de vaga'
);

-- 8) A vaga reservada durante a tentativa duplicada (abortada) foi desfeita
-- junto com o rollback da exceção: vagas_preenchidas volta ao valor anterior
-- à chamada (4), confirmando que a reserva não vaza para fora da transação
-- da chamada que falhou.
select is(
  (select vagas_preenchidas from public.turma where id = 'rec105-class'),
  4,
  'reserva de vaga da tentativa duplicada e desfeita junto com a excecao P0004'
);

-- 9) Turma inexistente continua rejeitada com o erro correto (regressão).
select throws_ok(
  $$
    select public.registrar_inscricao_publica(
      'Pessoa Sem Turma REC-105',
      'rec-105-sem-turma@rhcursos.test',
      '12345678903',
      '61999990003',
      '',
      '',
      'PF',
      'rec105-turma-inexistente',
      'Pessoa física',
      null,
      null
    );
  $$,
  'P0001',
  'Turma não encontrada.',
  'turma inexistente continua rejeitada apos a refatoracao de atomicidade'
);

select * from finish();
rollback;
