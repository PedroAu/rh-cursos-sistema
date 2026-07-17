-- REC-102: revogar insert anônimo direto em public.lead
--
-- A policy "lead_public_insert" (for insert to anon, authenticated with check (true)),
-- criada em 20260512193000_initial_rh_cursos_schema.sql (linhas 315-318), combinada com
-- o grant insert on public.lead to anon, authenticated de
-- 20260604164120_content_access_alignment.sql (linha 234), permite que qualquer chamador
-- com a chave pública anon insira uma linha em public.lead diretamente via PostgREST,
-- sem os campos obrigatórios, o rate limit ou a checagem de origem que
-- supabase/functions/leads/index.ts já aplica.
--
-- Esta migration revoga o grant de insert de anon/authenticated e remove a policy
-- permissiva. A partir daqui, somente service_role (usado exclusivamente pelo endpoint
-- controlado via adminClient(), código server-only) pode inserir em public.lead.
-- Roll-forward only: nenhum rollback deve restaurar insert anônimo direto.

drop policy if exists "lead_public_insert" on public.lead;

revoke insert on public.lead from anon, authenticated;

-- service_role já possui "grant select, insert, update, delete on all tables in schema
-- public to service_role" (20260604164120_content_access_alignment.sql, linha 244) e
-- bypassa RLS por padrão no Supabase. Grant explícito abaixo apenas para deixar o
-- privilégio de insert em public.lead documentado e à prova de mudanças futuras no
-- grant amplo.
grant insert on public.lead to service_role;
