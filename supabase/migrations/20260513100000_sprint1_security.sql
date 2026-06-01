-- ═══════════════════════════════════════════════════════════════════════════
-- Sprint 1 — Segurança / RLS
-- ═══════════════════════════════════════════════════════════════════════════
--   S1.1  Enum status_instrutor (corrige uso de status_curso em instrutor)
--   S1.2  aluno.user_id — ownership link para auth.users
--   S1.3  Tabela profiles + função is_admin()
--   S1.4  Policies RLS: ownership + admin gate + avaliacao select ausente
-- ═══════════════════════════════════════════════════════════════════════════

-- ── S1.1  Enum status_instrutor ─────────────────────────────────────────────
do $$ begin
  create type public.status_instrutor as enum ('Ativo', 'Inativo');
exception
  when duplicate_object then null;
end $$;

alter table public.instrutor
  alter column status type public.status_instrutor
  using case status::text
    when 'Ativo'    then 'Ativo'
    when 'Destaque' then 'Ativo'
    else                 'Inativo'
  end::public.status_instrutor;

alter table public.instrutor
  alter column status set default 'Ativo'::public.status_instrutor;

-- ── S1.2  aluno.user_id ─────────────────────────────────────────────────────
alter table public.aluno
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists aluno_user_id_idx
  on public.aluno (user_id)
  where user_id is not null;

-- ── S1.3  Tabela profiles ────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       varchar(20) not null default 'user'
               check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_owner_select" on public.profiles;
create policy "profiles_owner_select" on public.profiles for select
  to authenticated
  using (id = auth.uid());

-- Usuário pode atualizar o próprio perfil, mas não promover a si mesmo para admin
drop policy if exists "profiles_owner_update_role_locked" on public.profiles;
create policy "profiles_owner_update_role_locked" on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
  );

-- Auto-criar profile ao registrar novo usuário
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Função helper is_admin() ─────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  )
$$;

-- ── S1.4  RLS corrigidas ─────────────────────────────────────────────────────

-- aluno: owner lê/edita o próprio registro; admin acessa tudo
drop policy if exists "authenticated_read_aluno" on public.aluno;

drop policy if exists "aluno_owner_or_admin_select" on public.aluno;
create policy "aluno_owner_or_admin_select" on public.aluno for select
  to authenticated
  using (
    (user_id is not null and user_id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "aluno_owner_update" on public.aluno;
create policy "aluno_owner_update" on public.aluno for update
  to authenticated
  using  (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "aluno_admin_insert" on public.aluno;
create policy "aluno_admin_insert" on public.aluno for insert
  to authenticated
  with check (public.is_admin());

-- inscricao: owner vê as próprias; admin vê e gerencia todas
drop policy if exists "authenticated_read_inscricao" on public.inscricao;

drop policy if exists "inscricao_owner_or_admin_select" on public.inscricao;
create policy "inscricao_owner_or_admin_select" on public.inscricao for select
  to authenticated
  using (
    aluno_id in (select id from public.aluno where user_id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "inscricao_admin_insert" on public.inscricao;
create policy "inscricao_admin_insert" on public.inscricao for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "inscricao_admin_update" on public.inscricao;
create policy "inscricao_admin_update" on public.inscricao for update
  to authenticated
  using  (public.is_admin())
  with check (public.is_admin());

-- lead: somente admin lê/atualiza; anon e authenticated podem inserir (formulários públicos)
drop policy if exists "authenticated_read_lead" on public.lead;

drop policy if exists "lead_admin_select" on public.lead;
create policy "lead_admin_select" on public.lead for select
  to authenticated
  using (public.is_admin());

drop policy if exists "lead_admin_update" on public.lead;
create policy "lead_admin_update" on public.lead for update
  to authenticated
  using  (public.is_admin())
  with check (public.is_admin());

-- avaliacao: leitura pública (publicar=true) + owner + admin
-- Correção do gap original: não havia nenhuma policy SELECT em avaliacao
drop policy if exists "avaliacao_public_insert" on public.avaliacao;

drop policy if exists "avaliacao_public_or_owner_select" on public.avaliacao;
create policy "avaliacao_public_or_owner_select" on public.avaliacao for select
  to anon, authenticated
  using (
    publicar = true
    or exists (
      select 1 from public.inscricao i
        join public.aluno a on a.id = i.aluno_id
       where i.id = avaliacao.inscricao_id
         and a.user_id = auth.uid()
    )
    or public.is_admin()
  );

-- Somente o dono da inscrição pode inserir avaliação (owner validation)
drop policy if exists "avaliacao_owner_insert" on public.avaliacao;
create policy "avaliacao_owner_insert" on public.avaliacao for insert
  to authenticated
  with check (
    exists (
      select 1 from public.inscricao i
        join public.aluno a on a.id = i.aluno_id
       where i.id = inscricao_id
         and a.user_id = auth.uid()
    )
  );

drop policy if exists "avaliacao_admin_update" on public.avaliacao;
create policy "avaliacao_admin_update" on public.avaliacao for update
  to authenticated
  using  (public.is_admin())
  with check (public.is_admin());

comment on table  public.profiles         is 'Perfil de usuário com controle de role (user, admin).';
comment on function public.is_admin()     is 'Retorna true se auth.uid() tem role=admin em profiles.';
comment on function public.handle_new_user() is 'Cria registro em profiles automaticamente ao registrar novo usuário.';
