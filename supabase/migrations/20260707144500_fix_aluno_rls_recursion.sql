-- Fix aluno SELECT RLS recursion by moving instructor/admin ownership checks
-- into a SECURITY DEFINER helper that does not recurse through aluno policies.

create or replace function public.can_read_aluno(p_aluno_id varchar)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.aluno a
    where a.id = p_aluno_id
      and (
        (a.user_id is not null and a.user_id = auth.uid())
        or public.is_admin()
        or exists (
          select 1
          from public.inscricao ins
          join public.turma t on t.id = ins.turma_id
          join public.instrutor i on i.id = t.instrutor_id
          where ins.aluno_id = a.id
            and i.user_id = auth.uid()
        )
      )
  );
$$;

revoke execute on function public.can_read_aluno(varchar) from public, anon;
grant execute on function public.can_read_aluno(varchar) to authenticated;

drop policy if exists "aluno_owner_or_admin_select" on public.aluno;
create policy "aluno_owner_or_admin_select" on public.aluno for select
  to authenticated
  using (public.can_read_aluno(id));

drop policy if exists "aluno_instructor_assigned_select" on public.aluno;
create policy "aluno_instructor_assigned_select" on public.aluno for select
  to authenticated
  using (public.can_read_aluno(id));
