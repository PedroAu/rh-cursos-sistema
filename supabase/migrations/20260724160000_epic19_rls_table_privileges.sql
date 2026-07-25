-- Epic 19: RLS deve decidir o acesso; os papéis ainda precisam de privilégio
-- de tabela para que as policies possam avaliar a consulta. Sem estes GRANTs,
-- o PostgreSQL falha antes da RLS com "permission denied".
grant select on table public.aluno, public.inscricao to anon, authenticated;
grant select on table public.profiles to authenticated;
grant select on table public.admin_audit_log to authenticated;
