-- =============================================================
-- RH Cursos — Base operacional de producao
--
-- Versiona as tabelas legadas que o app em producao ja usa por meio de
-- createAdminClient: curso, turma, instrutor, lead e aluno.
-- A migration e idempotente para poder ser aplicada sobre ambientes onde
-- parte do schema ja exista.
-- =============================================================

alter table if exists public.profiles
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.instrutor (
  id text primary key,
  nome text not null,
  email text,
  telefone text,
  bio text,
  foto_url text,
  formacao text,
  especialidade text not null default '',
  areas_atuacao jsonb not null default '[]'::jsonb,
  rating numeric(3,2) not null default 0,
  status text not null default 'Ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.instrutor
  add column if not exists nome text not null default '',
  add column if not exists email text,
  add column if not exists telefone text,
  add column if not exists bio text,
  add column if not exists foto_url text,
  add column if not exists formacao text,
  add column if not exists especialidade text not null default '',
  add column if not exists areas_atuacao jsonb not null default '[]'::jsonb,
  add column if not exists rating numeric(3,2) not null default 0,
  add column if not exists status text not null default 'Ativo',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

create table if not exists public.curso (
  id text primary key,
  titulo text not null,
  slug text not null unique,
  descricao_curta text,
  descricao text,
  ementa jsonb not null default '[]'::jsonb,
  objetivos jsonb not null default '[]'::jsonb,
  beneficios jsonb not null default '[]'::jsonb,
  publico_alvo jsonb not null default '[]'::jsonb,
  categoria text,
  modalidade text not null default 'Online',
  nivel text not null default 'Básico',
  trilha_id text,
  trilha_nome text,
  tipo_publico text,
  carga_horaria integer not null default 0,
  preco_base numeric(10,2) not null default 0,
  status text not null default 'Ativo',
  destaque boolean not null default false,
  imagem_capa text,
  rating numeric(3,2) not null default 0,
  total_alunos integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.curso
  add column if not exists titulo text not null default '',
  add column if not exists slug text not null default '',
  add column if not exists descricao_curta text,
  add column if not exists descricao text,
  add column if not exists ementa jsonb not null default '[]'::jsonb,
  add column if not exists objetivos jsonb not null default '[]'::jsonb,
  add column if not exists beneficios jsonb not null default '[]'::jsonb,
  add column if not exists publico_alvo jsonb not null default '[]'::jsonb,
  add column if not exists categoria text,
  add column if not exists modalidade text not null default 'Online',
  add column if not exists nivel text not null default 'Básico',
  add column if not exists trilha_id text,
  add column if not exists trilha_nome text,
  add column if not exists tipo_publico text,
  add column if not exists carga_horaria integer not null default 0,
  add column if not exists preco_base numeric(10,2) not null default 0,
  add column if not exists status text not null default 'Ativo',
  add column if not exists destaque boolean not null default false,
  add column if not exists imagem_capa text,
  add column if not exists rating numeric(3,2) not null default 0,
  add column if not exists total_alunos integer not null default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

create table if not exists public.turma (
  id text primary key,
  curso_id text not null references public.curso(id) on delete restrict,
  instrutor_id text references public.instrutor(id) on delete set null,
  data_inicio date not null,
  data_fim date,
  horario text,
  local text,
  vagas_total integer not null default 0,
  vagas_preenchidas integer not null default 0,
  vagas_restantes integer generated always as (
    greatest(vagas_total - vagas_preenchidas, 0)
  ) stored,
  preco_turma numeric(10,2) not null default 0,
  modalidade text not null default 'Online',
  status text not null default 'Planejamento',
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.turma
  add column if not exists curso_id text references public.curso(id) on delete restrict,
  add column if not exists instrutor_id text references public.instrutor(id) on delete set null,
  add column if not exists data_inicio date not null default current_date,
  add column if not exists data_fim date,
  add column if not exists horario text,
  add column if not exists local text,
  add column if not exists vagas_total integer not null default 0,
  add column if not exists vagas_preenchidas integer not null default 0,
  add column if not exists preco_turma numeric(10,2) not null default 0,
  add column if not exists modalidade text not null default 'Online',
  add column if not exists status text not null default 'Planejamento',
  add column if not exists observacoes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'turma'
      and column_name = 'vagas_restantes'
  ) then
    alter table public.turma
      add column vagas_restantes integer generated always as (
        greatest(vagas_total - vagas_preenchidas, 0)
      ) stored;
  end if;
end $$;

create table if not exists public.lead (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text,
  telefone text,
  tipo text not null default 'Contato',
  orgao text,
  num_participantes integer,
  tema_interesse text,
  curso_id text references public.curso(id) on delete set null,
  origem text not null default 'Site RH Cursos',
  status_crm text not null default 'Novo',
  mensagem text,
  modalidade_preferida text,
  objetivo_treinamento text,
  tema_treinamento text,
  desafios_principais text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.lead
  add column if not exists nome text not null default '',
  add column if not exists email text,
  add column if not exists telefone text,
  add column if not exists tipo text not null default 'Contato',
  add column if not exists orgao text,
  add column if not exists num_participantes integer,
  add column if not exists tema_interesse text,
  add column if not exists curso_id text references public.curso(id) on delete set null,
  add column if not exists origem text not null default 'Site RH Cursos',
  add column if not exists status_crm text not null default 'Novo',
  add column if not exists mensagem text,
  add column if not exists modalidade_preferida text,
  add column if not exists objetivo_treinamento text,
  add column if not exists tema_treinamento text,
  add column if not exists desafios_principais text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_term text,
  add column if not exists utm_content text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

create table if not exists public.aluno (
  id uuid primary key default gen_random_uuid(),
  nome_completo text not null,
  email text not null,
  cpf text,
  telefone text,
  cargo text,
  orgao text,
  tipo_aluno text not null default 'PF',
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.aluno
  add column if not exists nome_completo text not null default '',
  add column if not exists email text not null default '',
  add column if not exists cpf text,
  add column if not exists telefone text,
  add column if not exists cargo text,
  add column if not exists orgao text,
  add column if not exists tipo_aluno text not null default 'PF',
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

alter table if exists public.admin_settings
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.course_enrollments
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_instrutor_status_active
  on public.instrutor (status)
  where deleted_at is null;

create index if not exists idx_instrutor_area_gin
  on public.instrutor using gin (areas_atuacao);

create index if not exists idx_curso_slug_active
  on public.curso (slug)
  where deleted_at is null;

create index if not exists idx_curso_filters_active
  on public.curso (status, modalidade, categoria)
  where deleted_at is null;

create index if not exists idx_turma_curso_active
  on public.turma (curso_id, data_inicio)
  where deleted_at is null;

create index if not exists idx_turma_instrutor_active
  on public.turma (instrutor_id)
  where deleted_at is null;

create index if not exists idx_turma_filters_active
  on public.turma (status, modalidade, data_inicio)
  where deleted_at is null;

create index if not exists idx_lead_filters_active
  on public.lead (status_crm, tipo, origem, created_at)
  where deleted_at is null;

create index if not exists idx_lead_course_active
  on public.lead (curso_id)
  where deleted_at is null;

create index if not exists idx_aluno_filters_active
  on public.aluno (tipo_aluno, user_id, updated_at)
  where deleted_at is null;

create unique index if not exists idx_aluno_email_unique_active
  on public.aluno (lower(email))
  where deleted_at is null and email <> '';

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_profiles_touch') then
    create trigger trg_profiles_touch
      before update on public.profiles
      for each row execute function public.touch_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_instrutor_touch') then
    create trigger trg_instrutor_touch
      before update on public.instrutor
      for each row execute function public.touch_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_curso_touch') then
    create trigger trg_curso_touch
      before update on public.curso
      for each row execute function public.touch_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_turma_touch') then
    create trigger trg_turma_touch
      before update on public.turma
      for each row execute function public.touch_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_lead_touch') then
    create trigger trg_lead_touch
      before update on public.lead
      for each row execute function public.touch_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_aluno_touch') then
    create trigger trg_aluno_touch
      before update on public.aluno
      for each row execute function public.touch_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_admin_settings_touch') then
    create trigger trg_admin_settings_touch
      before update on public.admin_settings
      for each row execute function public.touch_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_course_enrollments_touch') then
    create trigger trg_course_enrollments_touch
      before update on public.course_enrollments
      for each row execute function public.touch_updated_at();
  end if;
end $$;

alter table public.instrutor enable row level security;
alter table public.curso enable row level security;
alter table public.turma enable row level security;
alter table public.lead enable row level security;
alter table public.aluno enable row level security;
alter table public.admin_settings enable row level security;
alter table public.course_enrollments enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'instrutor' and policyname = 'instrutor: public read') then
    create policy "instrutor: public read" on public.instrutor
      for select using (deleted_at is null);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'instrutor' and policyname = 'instrutor: admin write') then
    create policy "instrutor: admin write" on public.instrutor
      for all using (public.is_admin()) with check (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'curso' and policyname = 'curso: public read') then
    create policy "curso: public read" on public.curso
      for select using (deleted_at is null);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'curso' and policyname = 'curso: admin write') then
    create policy "curso: admin write" on public.curso
      for all using (public.is_admin()) with check (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'turma' and policyname = 'turma: public read') then
    create policy "turma: public read" on public.turma
      for select using (deleted_at is null);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'turma' and policyname = 'turma: admin write') then
    create policy "turma: admin write" on public.turma
      for all using (public.is_admin()) with check (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'lead' and policyname = 'lead: public insert') then
    create policy "lead: public insert" on public.lead
      for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'lead' and policyname = 'lead: admin manage') then
    create policy "lead: admin manage" on public.lead
      for all using (public.is_admin()) with check (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'aluno' and policyname = 'aluno: self read') then
    create policy "aluno: self read" on public.aluno
      for select using (user_id = auth.uid() or public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'aluno' and policyname = 'aluno: admin manage') then
    create policy "aluno: admin manage" on public.aluno
      for all using (public.is_admin()) with check (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'admin_settings' and policyname = 'admin_settings: admin all') then
    create policy "admin_settings: admin all" on public.admin_settings
      for all using (public.is_admin()) with check (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'course_enrollments' and policyname = 'course_enrollments: public insert') then
    create policy "course_enrollments: public insert" on public.course_enrollments
      for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'course_enrollments' and policyname = 'course_enrollments: admin manage') then
    create policy "course_enrollments: admin manage" on public.course_enrollments
      for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;
