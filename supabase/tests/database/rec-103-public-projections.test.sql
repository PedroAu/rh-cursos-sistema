-- Story REC-103 — projeções públicas seguras
-- Cobre a migration 20260716090000_rec103_public_projections.sql:
-- criação de `public.instrutor_publico` e `public.turma_publica` (allowlist
-- explícita de colunas, sem email/telefone/observacoes) e a revogação de
-- `select` dessas colunas privadas especificamente do papel `anon` nas
-- tabelas base (defesa em profundidade).

begin;

select plan(18);

-- ── Views de projeção pública existem ────────────────────────────────────

select ok(
  exists(
    select 1 from information_schema.views
     where table_schema = 'public' and table_name = 'instrutor_publico'
  ),
  'view public.instrutor_publico existe'
);

select ok(
  exists(
    select 1 from information_schema.views
     where table_schema = 'public' and table_name = 'turma_publica'
  ),
  'view public.turma_publica existe'
);

-- ── Allowlist de colunas: email/telefone/observacoes NÃO aparecem nas views ──

select ok(
  not exists(
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'instrutor_publico'
       and column_name in ('email', 'telefone')
  ),
  'instrutor_publico não expõe as colunas email/telefone (PII de contato)'
);

select ok(
  not exists(
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'turma_publica'
       and column_name = 'observacoes'
  ),
  'turma_publica não expõe a coluna observacoes (nota interna)'
);

-- Regressão: as colunas públicas legítimas continuam presentes nas views.
select ok(
  exists(
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'instrutor_publico'
       and column_name in ('id', 'nome', 'bio', 'foto_url', 'formacao', 'especialidade', 'rating', 'status')
    having count(*) = 8
  ),
  'instrutor_publico expõe as 8 colunas públicas esperadas'
);

select ok(
  exists(
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'turma_publica'
       and column_name in ('id', 'curso_id', 'instrutor_id', 'data_inicio', 'data_fim', 'horario', 'local', 'vagas_total', 'vagas_preenchidas', 'vagas_restantes', 'preco_turma', 'modalidade', 'status')
    having count(*) = 13
  ),
  'turma_publica expõe as 13 colunas públicas esperadas'
);

-- ── Grants das views para anon/authenticated ─────────────────────────────

select is(
  has_table_privilege('anon', 'public.instrutor_publico', 'select'),
  true,
  'anon pode ler public.instrutor_publico'
);

select is(
  has_table_privilege('authenticated', 'public.instrutor_publico', 'select'),
  true,
  'authenticated pode ler public.instrutor_publico'
);

select is(
  has_table_privilege('anon', 'public.turma_publica', 'select'),
  true,
  'anon pode ler public.turma_publica'
);

select is(
  has_table_privilege('authenticated', 'public.turma_publica', 'select'),
  true,
  'authenticated pode ler public.turma_publica'
);

-- ── Defesa em profundidade: `anon` só tem select nas colunas da allowlist (tabela base) ──

select is(
  has_column_privilege('anon', 'public.instrutor', 'email', 'select'),
  false,
  'anon não pode selecionar instrutor.email diretamente na tabela base'
);

select is(
  has_column_privilege('anon', 'public.instrutor', 'telefone', 'select'),
  false,
  'anon não pode selecionar instrutor.telefone diretamente na tabela base'
);

select is(
  has_column_privilege('anon', 'public.turma', 'observacoes', 'select'),
  false,
  'anon não pode selecionar turma.observacoes diretamente na tabela base'
);

-- Regressão: `anon` continua podendo ler as demais colunas públicas da tabela base.
select is(
  has_column_privilege('anon', 'public.instrutor', 'nome', 'select'),
  true,
  'anon mantém select em instrutor.nome (coluna pública, sem regressão)'
);

select is(
  has_column_privilege('anon', 'public.turma', 'local', 'select'),
  true,
  'anon mantém select em turma.local (coluna pública, sem regressão)'
);

-- Regressão: `authenticated` NÃO é atingido pela revogação de coluna — o
-- portal do instrutor (20260701090000_instructor_portal_rls.sql) e a área
-- administrativa continuam lendo o próprio contato/observações internas.
select is(
  has_column_privilege('authenticated', 'public.instrutor', 'email', 'select'),
  true,
  'authenticated mantém select em instrutor.email (portal/admin não afetados)'
);

select is(
  has_column_privilege('authenticated', 'public.turma', 'observacoes', 'select'),
  true,
  'authenticated mantém select em turma.observacoes (portal/admin não afetados)'
);

-- ── Idempotência: reaplicar o revoke de tabela + grant de coluna não gera erro ──

revoke select on public.instrutor from anon;
grant select (id, nome, bio, foto_url, formacao, especialidade, rating, status, deleted_at)
  on public.instrutor to anon;

revoke select on public.turma from anon;
grant select (id, curso_id, instrutor_id, data_inicio, data_fim, horario, local, vagas_total, vagas_preenchidas, vagas_restantes, preco_turma, modalidade, status, deleted_at)
  on public.turma to anon;

select is(
  has_column_privilege('anon', 'public.instrutor', 'email', 'select'),
  false,
  'revoke/grant de coluna reaplicado é idempotente: anon continua sem select em email'
);

select * from finish();

rollback;
