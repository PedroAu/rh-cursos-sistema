-- REC-103: criar projeções públicas seguras (allowlist explícita de colunas)
--
-- FND-10 (Épica 17): "Respostas públicas expõem contato de instrutor e
-- observações internas de turma". `src/lib/supabase/rh-cursos-api.ts`
-- seleciona hoje, para o catálogo público, `instrutor.email`,
-- `instrutor.telefone` e `turma.observacoes` — nenhum desses campos é
-- renderizado por qualquer view pública (verificado por busca no código),
-- mas eles trafegam integralmente na resposta JSON de `fetchPublicCatalog`
-- e `fetchPublicClassesFromSupabase`, disponíveis a qualquer cliente que
-- inspecione a rede ou o HTML.
--
-- Esta migration cria duas views de projeção pública com allowlist explícita
-- de colunas (sem email/telefone/observacoes) e reforça a defesa em
-- profundidade trocando o `select` de tabela inteira do papel `anon` nas
-- tabelas base por um `select` restrito à mesma allowlist de colunas
-- públicas. `authenticated` não é afetado: o portal do instrutor
-- (`20260701090000_instructor_portal_rls.sql`) e a área administrativa
-- legitimamente precisam ler esses campos para o próprio perfil/gestão,
-- protegidos pelas RLS policies existentes (`instrutor_owner_or_admin_select`,
-- `is_admin()`).
--
-- Roll-forward only: nenhuma migration futura deve reintroduzir email,
-- telefone ou observacoes numa projeção consumida por rota pública.

-- ── Views de projeção pública ────────────────────────────────────────────

create or replace view public.instrutor_publico
with (security_invoker = true) as
select
  id,
  nome,
  bio,
  foto_url,
  formacao,
  especialidade,
  rating,
  status
from public.instrutor
where deleted_at is null
  and status = 'Ativo';

comment on view public.instrutor_publico is
  'Projeção pública de public.instrutor (REC-103): allowlist explícita sem email/telefone (PII de contato). Usada pelo catálogo público em src/lib/supabase/rh-cursos-api.ts.';

create or replace view public.turma_publica
with (security_invoker = true) as
select
  id,
  curso_id,
  instrutor_id,
  data_inicio,
  data_fim,
  horario,
  local,
  vagas_total,
  vagas_preenchidas,
  vagas_restantes,
  preco_turma,
  modalidade,
  status
from public.turma
where deleted_at is null;

comment on view public.turma_publica is
  'Projeção pública de public.turma (REC-103): allowlist explícita sem observacoes (nota interna de operação). Usada pelo catálogo público em src/lib/supabase/rh-cursos-api.ts.';

-- ── Grants das views (mesmo papel que já lia as tabelas base) ───────────

grant select on public.instrutor_publico to anon, authenticated;
grant select on public.turma_publica to anon, authenticated;

-- service_role já possui "grant select ... on all tables in schema public"
-- (20260604164120_content_access_alignment.sql, linha 244); views herdam
-- esse privilégio amplo, sem necessidade de grant adicional aqui.

-- ── Defesa em profundidade: allowlist de colunas de `anon` na tabela base ──
--
-- O grant original de `20260604164120_content_access_alignment.sql`
-- ("grant select on public.instrutor to anon") é um privilégio de tabela
-- inteira: no modelo de ACL do PostgreSQL, um `revoke select (coluna)`
-- posterior NÃO restringe um `grant select` já concedido no nível da
-- tabela — a permissão de tabela inteira continua valendo para todas as
-- colunas. Por isso a correção real é revogar o `select` de tabela inteira
-- de `anon` e conceder de volta apenas as colunas explicitamente públicas
-- (allowlist), nunca email/telefone/observacoes.
--
-- `authenticated` não é afetado: mantém o `select` de tabela inteira
-- concedido em `20260604164120_content_access_alignment.sql`, necessário
-- para o portal do instrutor (`20260701090000_instructor_portal_rls.sql`)
-- e para a área administrativa, ambos protegidos por RLS
-- (`instrutor_owner_or_admin_select`, `is_admin()`).
--
-- `deleted_at`/`status` continuam concedidos a `anon` porque são
-- referenciados diretamente pelas policies RLS `catalogo_publico_*_select`
-- (avaliadas com o privilégio de coluna do papel que consulta), mesmo não
-- aparecendo nas views de projeção pública.

revoke select on public.instrutor from anon;
grant select (id, nome, bio, foto_url, formacao, especialidade, rating, status, deleted_at)
  on public.instrutor to anon;

revoke select on public.turma from anon;
grant select (id, curso_id, instrutor_id, data_inicio, data_fim, horario, local, vagas_total, vagas_preenchidas, vagas_restantes, preco_turma, modalidade, status, deleted_at)
  on public.turma to anon;
