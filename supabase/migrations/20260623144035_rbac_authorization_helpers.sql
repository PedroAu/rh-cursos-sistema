-- ═══════════════════════════════════════════════════════════════════════════
-- RBAC Authorization Helpers — is_instructor() / is_student()
-- ═══════════════════════════════════════════════════════════════════════════
--   AC2: RBAC (Admin/Instructor/Student) enforced — camada de autorização.
--   profiles.role já suporta 'student' | 'instructor' | 'admin' desde a
--   migration 20260604164120_content_access_alignment.sql.
--   Segue o mesmo padrão de public.is_admin() (sprint1_security.sql):
--   SECURITY DEFINER + SET search_path = public para prevenir hijacking.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.is_instructor()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select role = 'instructor' from public.profiles where id = auth.uid()),
    false
  )
$$;

create or replace function public.is_student()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select role = 'student' from public.profiles where id = auth.uid()),
    false
  )
$$;

revoke execute on function public.is_instructor() from public, anon, authenticated;
revoke execute on function public.is_student() from public, anon, authenticated;

grant execute on function public.is_instructor() to authenticated;
grant execute on function public.is_student() to authenticated;

comment on function public.is_instructor() is 'Retorna true se auth.uid() tem role=instructor em profiles.';
comment on function public.is_student()    is 'Retorna true se auth.uid() tem role=student em profiles.';
