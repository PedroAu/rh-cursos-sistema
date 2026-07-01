-- Portal do instrutor: vínculo explícito com auth.users + RLS mínimo
-- para leitura do próprio perfil, turmas atribuídas e alunos inscritos nessas turmas.

alter table public.instrutor
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create unique index if not exists instrutor_user_id_idx
  on public.instrutor (user_id)
  where user_id is not null;

drop policy if exists "instrutor_owner_or_admin_select" on public.instrutor;
create policy "instrutor_owner_or_admin_select" on public.instrutor for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "inscricao_instructor_assigned_select" on public.inscricao;
create policy "inscricao_instructor_assigned_select" on public.inscricao for select
  to authenticated
  using (
    exists (
      select 1
        from public.turma t
        join public.instrutor i on i.id = t.instrutor_id
       where t.id = inscricao.turma_id
         and i.user_id = auth.uid()
    )
  );

drop policy if exists "aluno_instructor_assigned_select" on public.aluno;
create policy "aluno_instructor_assigned_select" on public.aluno for select
  to authenticated
  using (
    exists (
      select 1
        from public.inscricao ins
        join public.turma t on t.id = ins.turma_id
        join public.instrutor i on i.id = t.instrutor_id
       where ins.aluno_id = aluno.id
         and i.user_id = auth.uid()
    )
  );
