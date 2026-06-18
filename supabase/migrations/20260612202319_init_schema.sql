-- =============================================================
-- RH Cursos — Schema inicial
-- Tabelas: profiles, instructors, courses, turmas, enrollments, leads, settings
-- Auth: Supabase Auth (email+senha). Acesso /admin = role 'admin'.
-- =============================================================

-- ---------- ENUMS ----------
create type user_role     as enum ('admin', 'professor', 'aluno');
create type user_status   as enum ('ativo', 'pendente', 'inativo');
create type course_categoria as enum (
  'departamento-pessoal', 'licitacoes', 'gestao-pessoas',
  'juridico', 'auditoria', 'tecnologia'
);
create type modalidade    as enum ('presencial', 'online', 'ao-vivo');
create type turma_status   as enum ('planejado', 'matriculas-abertas', 'em-andamento', 'lotado', 'encerrado');
create type pagamento_metodo as enum ('cartao', 'pix', 'boleto', 'empenho');
create type lead_tipo      as enum ('contato', 'especialista', 'in-company');

-- ---------- PROFILES (espelha auth.users) ----------
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nome       text not null default '',
  -- Snapshot do email no cadastro inicial; alteracoes futuras vivem em auth.users.
  email      text not null,
  role       user_role   not null default 'aluno',
  status     user_status not null default 'ativo',
  created_at timestamptz not null default now()
);

-- Cria profile automaticamente quando um usuário é criado no Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, nome)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: o usuário atual é admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- INSTRUCTORS (professores) ----------
create table instructors (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,
  titulo       text,
  especialidade text,
  bio          text,
  email        text,
  foto_url     text,
  status       user_status not null default 'ativo',
  created_at   timestamptz not null default now()
);

-- ---------- COURSES ----------
create table courses (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  titulo        text not null,
  categoria     course_categoria not null,
  resumo        text not null default '',
  descricao     text not null default '',
  carga_horaria int  not null default 0,
  preco         numeric(10,2) not null default 0,
  preco_de      numeric(10,2),
  aprende       text[] not null default '{}',
  publico_alvo  text[] not null default '{}',
  certificacao  text,
  thumb_url     text,
  destaque      text,
  instructor_id uuid references instructors(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ---------- TURMAS ----------
create table turmas (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references courses(id) on delete cascade,
  modalidade    modalidade not null default 'ao-vivo',
  inicio        date not null,
  fim           date,
  inscritos     int  not null default 0,
  vagas         int  not null default 0,
  status        turma_status not null default 'planejado',
  instructor_id uuid references instructors(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ---------- ENROLLMENTS (inscrições — sem pagamento real) ----------
create table enrollments (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references courses(id) on delete cascade,
  turma_id      uuid references turmas(id) on delete set null,
  aluno_nome    text not null,
  aluno_email   text not null,
  aluno_cpf     text not null,
  empresa_razao text,
  empresa_cnpj  text,
  empresa_telefone text,
  pagamento     pagamento_metodo not null,
  empenho_orgao text,
  empenho_numero text,
  aceite_lgpd   boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ---------- LEADS (formulários públicos) ----------
create table leads (
  id               uuid primary key default gen_random_uuid(),
  tipo             lead_tipo not null,
  nome             text not null,
  email            text not null,
  whatsapp         text,
  empresa          text,
  area_interesse   text,
  mensagem         text,
  consentimento_lgpd boolean not null default false,
  created_at       timestamptz not null default now()
);

-- ---------- SETTINGS ----------
create table settings (
  key        text primary key,
  value      jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger settings_touch_updated_at
  before update on settings
  for each row execute function public.touch_updated_at();

-- ---------- ÍNDICES ----------
create index idx_courses_categoria on courses(categoria);
create index idx_turmas_course on turmas(course_id);
create index idx_turmas_status on turmas(status);
create index idx_enrollments_course on enrollments(course_id);
create index idx_leads_tipo on leads(tipo);
