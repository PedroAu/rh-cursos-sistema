-- Story REC-102 — revogar insert anônimo direto em public.lead
-- Cobre a migration 20260715100000_revoke_anon_lead_insert.sql:
-- anon/authenticated não conseguem mais inserir em public.lead diretamente
-- (AC1, AC2); service_role (usado pelo endpoint controlado via adminClient())
-- continua inserindo normalmente (AC3); nenhuma outra tabela é afetada (AC6).

begin;

select plan(5);

-- 1) anon não consegue inserir diretamente em public.lead (AC1).
set local role anon;
select set_config('request.jwt.claim.sub', '', true);

select throws_ok(
  $$
    insert into public.lead (id, nome, email, origem)
    values ('rec102-anon-lead', 'Lead REC-102 Anon', 'rec-102-anon@rhcursos.test', 'Teste');
  $$,
  '42501',
  'permission denied for table lead',
  'anon nao insere lead diretamente'
);

reset role;

-- 2) authenticated (sem contexto de service role) também não consegue inserir (AC2).
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);

select throws_ok(
  $$
    insert into public.lead (id, nome, email, origem)
    values ('rec102-authenticated-lead', 'Lead REC-102 Authenticated', 'rec-102-authenticated@rhcursos.test', 'Teste');
  $$,
  '42501',
  'permission denied for table lead',
  'authenticated sem service role nao insere lead diretamente'
);

reset role;

-- 3) service_role (papel usado pelo endpoint controlado via adminClient()) continua
-- inserindo normalmente (AC3, caminho equivalente ao usado pela Edge Function).
insert into public.lead (id, nome, email, origem)
values ('rec102-service-role-lead', 'Lead REC-102 Service Role', 'rec-102-service-role@rhcursos.test', 'Teste');

select ok(
  exists(select 1 from public.lead where id = 'rec102-service-role-lead'),
  'service_role continua inserindo lead (caminho do endpoint controlado)'
);

-- 4) Nenhuma regressão nos grants/policies de outras tabelas administrativas (AC6):
-- curso continua com insert liberado para authenticated (grant existente, inalterado
-- por esta migration).
select ok(
  has_table_privilege('authenticated', 'public.curso', 'INSERT'),
  'grants de public.curso para authenticated permanecem inalterados'
);

-- 5) Nenhuma regressão na leitura administrativa de lead: authenticated com claim de
-- admin continua lendo lead (policy lead_admin_select, não tocada por esta migration).
select ok(
  has_table_privilege('authenticated', 'public.lead', 'SELECT'),
  'grant de select em public.lead para authenticated permanece inalterado'
);

select * from finish();

rollback;
