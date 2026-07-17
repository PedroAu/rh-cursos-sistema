-- Story REC-107 — endurecer endpoints públicos (inscrição).
--
-- Esta story NÃO altera nenhum grant/policy: a decisão adotada (documentada
-- em docs/stories/2026-07-16-rec-107-endurecer-endpoints-publicos.md) é
-- restaurar o acesso funcional trocando o cliente do endpoint para
-- `adminClient()` (service_role), no mesmo padrão já aplicado por REC-102 a
-- `leads/index.ts` — não reconceder `execute` a `anon`/`authenticated`
-- (mantendo a contenção de REC-101 em vigor). Este arquivo é um teste de
-- regressão que trava as duas pontas dessa decisão a nível de banco:
--
-- 1) `service_role` já detinha `execute` sobre a RPC antes desta story
--    (via "grant execute on all functions in schema public to service_role"
--    em 20260604164120_content_access_alignment.sql) — é essa a razão pela
--    qual nenhuma migration nova de grant foi necessária aqui.
-- 2) `anon`/`authenticated` continuam sem `execute` (REC-101 permanece em
--    vigor sem qualquer alteração desta story).
--
-- Nota de ambiente: mesmo limite do runner local documentado em
-- rec-101-revoke-public-enrollment-rpc.test.sql — `has_function_privilege`
-- consulta o mesmo catálogo de ACL que o PostgREST usa para autorizar a
-- chamada, portanto é o equivalente correto a nível de banco.

begin;

select plan(4);

-- 1) service_role pode executar a RPC — pré-condição que torna
--    `adminClient()` funcional em enrollments/index.ts e em
--    app/api/enrollments/route.ts sem nenhuma migration de grant nova.
select is(
  has_function_privilege(
    'service_role',
    'public.registrar_inscricao_publica(varchar,varchar,varchar,varchar,varchar,varchar,public.tipo_aluno,varchar,varchar,public.forma_pagamento,text)',
    'execute'
  ),
  true,
  'service_role pode executar registrar_inscricao_publica (restaura o endpoint via adminClient(), sem grant novo)'
);

-- 2) anon continua sem execute — REC-101 não foi revertida por esta story.
select is(
  has_function_privilege(
    'anon',
    'public.registrar_inscricao_publica(varchar,varchar,varchar,varchar,varchar,varchar,public.tipo_aluno,varchar,varchar,public.forma_pagamento,text)',
    'execute'
  ),
  false,
  'anon continua sem execute em registrar_inscricao_publica (REC-101 preservada por REC-107)'
);

-- 3) authenticated (sem contexto de service role) continua sem execute.
select is(
  has_function_privilege(
    'authenticated',
    'public.registrar_inscricao_publica(varchar,varchar,varchar,varchar,varchar,varchar,public.tipo_aluno,varchar,varchar,public.forma_pagamento,text)',
    'execute'
  ),
  false,
  'authenticated continua sem execute em registrar_inscricao_publica (REC-101 preservada por REC-107)'
);

-- 4) anon mantém select nas colunas de turma usadas na resolução de
--    disponibilidade do endpoint (id, curso_id, status, vagas_restantes) —
--    as leituras continuam via cliente público (least privilege), não via
--    adminClient(); REC-107 não amplia o escopo de leitura pública. Grant é
--    column-scoped desde REC-103 (20260716090000_rec103_public_projections.sql),
--    por isso a checagem usa has_column_privilege, não has_table_privilege.
select is(
  has_column_privilege('anon', 'public.turma', 'status', 'select')
    and has_column_privilege('anon', 'public.turma', 'vagas_restantes', 'select'),
  true,
  'anon mantém select nas colunas de turma usadas pelo endpoint (leituras continuam via cliente público, least privilege)'
);

select * from finish();

rollback;
