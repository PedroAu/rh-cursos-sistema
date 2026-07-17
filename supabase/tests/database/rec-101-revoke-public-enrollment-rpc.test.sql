-- Story REC-101 — revogar execução pública/anônima da RPC de inscrição
-- Cobre a migration 20260715100000_revoke_public_enrollment_rpc.sql:
-- `revoke execute` de `public.registrar_inscricao_publica` para
-- `anon`/`authenticated`/`public`, sem afetar `service_role` nem os grants
-- de leitura do catálogo público.
--
-- Nota de ambiente: o runner local (`npm run test:db`) inicia `supabase
-- start` excluindo `postgrest`/`kong` (ver scripts/test-db.mjs), então uma
-- chamada HTTP real via PostgREST com a chave `anon` não é exercitada por
-- este arquivo. `has_function_privilege(...)` consulta o mesmo catálogo de
-- permissões (`pg_proc`/ACL) que o PostgREST usa para autorizar a chamada,
-- portanto é o equivalente correto a nível de banco para AC1/AC2/AC3/AC4.
-- A validação end-to-end via PostgREST/curl fica documentada como pendente
-- no relatório desta story.

begin;

select plan(8);

-- 1) `anon` não tem mais `execute` na RPC pública de inscrição.
select is(
  has_function_privilege(
    'anon',
    'public.registrar_inscricao_publica(varchar,varchar,varchar,varchar,varchar,varchar,public.tipo_aluno,varchar,varchar,public.forma_pagamento,text)',
    'execute'
  ),
  false,
  'anon não pode executar registrar_inscricao_publica após a revogação'
);

-- 2) `authenticated` (sem contexto de service role) também não tem `execute`.
select is(
  has_function_privilege(
    'authenticated',
    'public.registrar_inscricao_publica(varchar,varchar,varchar,varchar,varchar,varchar,public.tipo_aluno,varchar,varchar,public.forma_pagamento,text)',
    'execute'
  ),
  false,
  'authenticated não pode executar registrar_inscricao_publica após a revogação'
);

-- 3) `public` (pseudo-role herdado por qualquer role) também não tem `execute`,
--    confirmando ausência de brecha por herança de role.
select is(
  has_function_privilege(
    'public',
    'public.registrar_inscricao_publica(varchar,varchar,varchar,varchar,varchar,varchar,public.tipo_aluno,varchar,varchar,public.forma_pagamento,text)',
    'execute'
  ),
  false,
  'public não tem execute residual sobre registrar_inscricao_publica'
);

-- 4) `service_role` mantém `execute` (concedido via "grant execute on all
--    functions in schema public to service_role" em
--    20260604164120_content_access_alignment.sql) — a revogação não deve
--    atingir o caminho de service role.
select is(
  has_function_privilege(
    'service_role',
    'public.registrar_inscricao_publica(varchar,varchar,varchar,varchar,varchar,varchar,public.tipo_aluno,varchar,varchar,public.forma_pagamento,text)',
    'execute'
  ),
  true,
  'service_role continua podendo executar registrar_inscricao_publica'
);

-- 5) Idempotência: reaplicar o `revoke` não gera erro nem muda o resultado.
revoke execute on function public.registrar_inscricao_publica(
  varchar, varchar, varchar, varchar, varchar, varchar,
  public.tipo_aluno, varchar, varchar, public.forma_pagamento, text
) from anon, authenticated;

revoke execute on function public.registrar_inscricao_publica(
  varchar, varchar, varchar, varchar, varchar, varchar,
  public.tipo_aluno, varchar, varchar, public.forma_pagamento, text
) from public;

select is(
  has_function_privilege(
    'anon',
    'public.registrar_inscricao_publica(varchar,varchar,varchar,varchar,varchar,varchar,public.tipo_aluno,varchar,varchar,public.forma_pagamento,text)',
    'execute'
  ),
  false,
  'revoke reaplicado é idempotente: anon continua sem execute'
);

-- 6) Nenhuma outra função é afetada: `is_admin()` continua executável por
--    `authenticated` (grant concedido em 20260604164120_content_access_alignment.sql,
--    não tocado por esta migration).
select is(
  has_function_privilege('authenticated', 'public.is_admin()', 'execute'),
  true,
  'is_admin() permanece executável por authenticated (sem regressão)'
);

-- 7) Sem regressão de leitura pública: `anon` continua com `select` sobre o
--    catálogo público de cursos.
select is(
  has_table_privilege('anon', 'public.curso', 'select'),
  true,
  'anon mantém select em public.curso (catálogo público não afetado)'
);

-- 8) Sem regressão de leitura pública: `authenticated` continua com `select`
--    sobre turmas.
select is(
  has_table_privilege('authenticated', 'public.turma', 'select'),
  true,
  'authenticated mantém select em public.turma (catálogo público não afetado)'
);

-- Nota: uma asserção originalmente prevista aqui checava que `anon` mantém
-- `insert` em `public.lead` (fluxo distinto, fora do escopo de REC-101).
-- Removida porque a migration da REC-102 (aplicada na mesma sequência de
-- `supabase db reset`, timestamp posterior) revoga esse insert como parte do
-- seu próprio escopo — checar isso aqui duplicaria e colidiria com a
-- asserção equivalente em rec-102-revoke-anon-lead-insert.test.sql.

select * from finish();

rollback;
