-- RH Cursos & Solucoes - schema completo para Supabase
-- Gerado a partir das migrations locais em ordem cronologica.
-- Use no SQL Editor do Supabase ou via psql em um projeto vazio/novo.


-- =====================================================================
-- Migration: supabase/migrations/20260512193000_initial_rh_cursos_schema.sql
-- =====================================================================
-- RH Cursos & Solucoes - initial Supabase schema
-- Safe to run once through Supabase migrations.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.tipo_aluno as enum ('PF', 'PJ', 'Servidor');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.modalidade_curso as enum ('Presencial', 'Online', 'Hibrido', 'InCompany', 'Gravado');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.nivel_curso as enum ('Basico', 'Intermediario', 'Avancado', 'Misto');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.status_curso as enum ('Ativo', 'Inativo', 'Destaque', 'EmBreve', 'Rascunho', 'Arquivado');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.status_turma as enum ('Aberta', 'PoucasVagas', 'Encerrada', 'Cancelada', 'Realizada', 'EmBreve');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.status_inscricao as enum ('Pendente', 'AguardandoPagamento', 'Confirmada', 'Cancelada', 'Concluida', 'ListaEspera');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.status_pagamento as enum ('Pendente', 'Pago', 'Estornado', 'Isento');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.forma_pagamento as enum ('Pix', 'Cartao', 'Boleto', 'Empenho');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.tipo_lead as enum ('Curso', 'InCompany', 'Mentoria', 'Newsletter', 'Orcamento', 'Contato');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.status_lead as enum ('Novo', 'Contatado', 'EmAtendimento', 'PropostaEnviada', 'Convertido', 'Perdido');
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.aluno (
  id varchar(80) primary key default gen_random_uuid()::text,
  nome_completo varchar(180) not null,
  email varchar(180) not null,
  cpf varchar(20),
  telefone varchar(30),
  cargo varchar(120),
  orgao varchar(180),
  tipo_aluno public.tipo_aluno not null default 'PF',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint aluno_email_format_chk check (position('@' in email) > 1)
);

create unique index if not exists aluno_email_unique_idx
  on public.aluno (lower(email))
  where deleted_at is null;

create unique index if not exists aluno_cpf_unique_idx
  on public.aluno (cpf)
  where cpf is not null and deleted_at is null;

create table if not exists public.instrutor (
  id varchar(80) primary key default gen_random_uuid()::text,
  nome varchar(180) not null,
  email varchar(180),
  telefone varchar(30),
  bio text,
  foto_url varchar(500),
  formacao text,
  especialidade varchar(160),
  areas_atuacao jsonb not null default '[]'::jsonb,
  rating numeric(3,2) not null default 0,
  status public.status_curso not null default 'Ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint instrutor_rating_chk check (rating >= 0 and rating <= 5)
);

create table if not exists public.curso (
  id varchar(80) primary key default gen_random_uuid()::text,
  titulo varchar(240) not null,
  slug varchar(260) not null,
  descricao_curta text,
  descricao text,
  ementa jsonb not null default '[]'::jsonb,
  objetivos jsonb not null default '[]'::jsonb,
  beneficios jsonb not null default '[]'::jsonb,
  publico_alvo jsonb not null default '[]'::jsonb,
  carga_horaria integer not null default 0,
  modalidade public.modalidade_curso not null default 'Online',
  nivel public.nivel_curso not null default 'Basico',
  categoria varchar(120),
  trilha_id varchar(80),
  trilha_nome varchar(180),
  tipo_publico varchar(80),
  preco_base numeric(10,2) not null default 0,
  status public.status_curso not null default 'Ativo',
  destaque boolean not null default false,
  imagem_capa varchar(500),
  rating numeric(3,2) not null default 0,
  total_alunos integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint curso_slug_unique unique (slug),
  constraint curso_carga_horaria_chk check (carga_horaria >= 0),
  constraint curso_preco_base_chk check (preco_base >= 0),
  constraint curso_rating_chk check (rating >= 0 and rating <= 5),
  constraint curso_total_alunos_chk check (total_alunos >= 0)
);

-- A course may have several instructors. This resolves the mismatch between
-- the proposed 1:N text and the current site, which already stores courseIds.
create table if not exists public.curso_instrutor (
  id varchar(80) primary key default gen_random_uuid()::text,
  curso_id varchar(80) not null references public.curso(id) on delete cascade,
  instrutor_id varchar(80) not null references public.instrutor(id) on delete restrict,
  principal boolean not null default false,
  created_at timestamptz not null default now(),
  unique (curso_id, instrutor_id)
);

create unique index if not exists curso_instrutor_um_principal_idx
  on public.curso_instrutor (curso_id)
  where principal;

create table if not exists public.turma (
  id varchar(80) primary key default gen_random_uuid()::text,
  curso_id varchar(80) not null references public.curso(id) on delete restrict,
  instrutor_id varchar(80) references public.instrutor(id) on delete set null,
  data_inicio date not null,
  data_fim date,
  horario varchar(80),
  local varchar(180),
  vagas_total integer not null default 0,
  vagas_preenchidas integer not null default 0,
  vagas_restantes integer generated always as (greatest(vagas_total - vagas_preenchidas, 0)) stored,
  preco_turma numeric(10,2) not null default 0,
  modalidade public.modalidade_curso not null default 'Online',
  status public.status_turma not null default 'Aberta',
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint turma_datas_chk check (data_fim is null or data_fim >= data_inicio),
  constraint turma_vagas_chk check (vagas_total >= 0 and vagas_preenchidas >= 0 and vagas_preenchidas <= vagas_total),
  constraint turma_preco_chk check (preco_turma >= 0)
);

create table if not exists public.inscricao (
  id varchar(80) primary key default gen_random_uuid()::text,
  aluno_id varchar(80) not null references public.aluno(id) on delete restrict,
  turma_id varchar(80) not null references public.turma(id) on delete restrict,
  status_inscricao public.status_inscricao not null default 'Pendente',
  status_pagamento public.status_pagamento not null default 'Pendente',
  valor_pago numeric(10,2) not null default 0,
  forma_pagamento public.forma_pagamento,
  codigo_confirmacao varchar(80) not null default encode(gen_random_bytes(8), 'hex'),
  tipo_inscricao varchar(40),
  observacoes text,
  certificado_emitido boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  constraint inscricao_codigo_confirmacao_unique unique (codigo_confirmacao),
  constraint inscricao_valor_pago_chk check (valor_pago >= 0)
);

create unique index if not exists inscricao_aluno_turma_active_idx
  on public.inscricao (aluno_id, turma_id)
  where status_inscricao not in ('Cancelada');

create table if not exists public.lead (
  id varchar(80) primary key default gen_random_uuid()::text,
  nome varchar(180) not null,
  email varchar(180),
  telefone varchar(30),
  tipo public.tipo_lead not null default 'Curso',
  orgao varchar(180),
  num_participantes integer,
  tema_interesse varchar(240),
  curso_id varchar(80) references public.curso(id) on delete set null,
  status_crm public.status_lead not null default 'Novo',
  mensagem text,
  utm_source varchar(120),
  origem varchar(80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lead_num_participantes_chk check (num_participantes is null or num_participantes > 0)
);

create table if not exists public.avaliacao (
  id varchar(80) primary key default gen_random_uuid()::text,
  inscricao_id varchar(80) not null references public.inscricao(id) on delete cascade,
  turma_id varchar(80) not null references public.turma(id) on delete restrict,
  nota integer not null,
  comentario text,
  publicar boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint avaliacao_nota_chk check (nota between 1 and 5),
  constraint avaliacao_inscricao_unique unique (inscricao_id)
);

create index if not exists curso_status_idx on public.curso (status) where deleted_at is null;
create index if not exists curso_trilha_idx on public.curso (trilha_id) where deleted_at is null;
create index if not exists curso_instrutor_curso_idx on public.curso_instrutor (curso_id);
create index if not exists curso_instrutor_instrutor_idx on public.curso_instrutor (instrutor_id);
create index if not exists turma_curso_idx on public.turma (curso_id) where deleted_at is null;
create index if not exists turma_status_data_idx on public.turma (status, data_inicio) where deleted_at is null;
create index if not exists inscricao_aluno_idx on public.inscricao (aluno_id);
create index if not exists inscricao_turma_idx on public.inscricao (turma_id);
create index if not exists lead_status_created_idx on public.lead (status_crm, created_at desc);
create index if not exists avaliacao_turma_idx on public.avaliacao (turma_id) where publicar;

drop trigger if exists aluno_set_updated_at on public.aluno;
create trigger aluno_set_updated_at before update on public.aluno
for each row execute function public.set_updated_at();

drop trigger if exists instrutor_set_updated_at on public.instrutor;
create trigger instrutor_set_updated_at before update on public.instrutor
for each row execute function public.set_updated_at();

drop trigger if exists curso_set_updated_at on public.curso;
create trigger curso_set_updated_at before update on public.curso
for each row execute function public.set_updated_at();

drop trigger if exists turma_set_updated_at on public.turma;
create trigger turma_set_updated_at before update on public.turma
for each row execute function public.set_updated_at();

drop trigger if exists inscricao_set_updated_at on public.inscricao;
create trigger inscricao_set_updated_at before update on public.inscricao
for each row execute function public.set_updated_at();

drop trigger if exists lead_set_updated_at on public.lead;
create trigger lead_set_updated_at before update on public.lead
for each row execute function public.set_updated_at();

drop trigger if exists avaliacao_set_updated_at on public.avaliacao;
create trigger avaliacao_set_updated_at before update on public.avaliacao
for each row execute function public.set_updated_at();

alter table public.aluno enable row level security;
alter table public.instrutor enable row level security;
alter table public.curso enable row level security;
alter table public.curso_instrutor enable row level security;
alter table public.turma enable row level security;
alter table public.inscricao enable row level security;
alter table public.lead enable row level security;
alter table public.avaliacao enable row level security;

drop policy if exists "catalogo_publico_curso_select" on public.curso;
create policy "catalogo_publico_curso_select"
  on public.curso for select
  to anon, authenticated
  using (deleted_at is null and status in ('Ativo', 'Destaque', 'EmBreve'));

drop policy if exists "catalogo_publico_turma_select" on public.turma;
create policy "catalogo_publico_turma_select"
  on public.turma for select
  to anon, authenticated
  using (deleted_at is null);

drop policy if exists "catalogo_publico_instrutor_select" on public.instrutor;
create policy "catalogo_publico_instrutor_select"
  on public.instrutor for select
  to anon, authenticated
  using (deleted_at is null and status = 'Ativo');

drop policy if exists "catalogo_publico_curso_instrutor_select" on public.curso_instrutor;
create policy "catalogo_publico_curso_instrutor_select"
  on public.curso_instrutor for select
  to anon, authenticated
  using (true);

drop policy if exists "lead_public_insert" on public.lead;
create policy "lead_public_insert"
  on public.lead for insert
  to anon, authenticated
  with check (true);

drop policy if exists "avaliacao_public_insert" on public.avaliacao;
create policy "avaliacao_public_insert"
  on public.avaliacao for insert
  to authenticated
  with check (true);

-- Administrative reads/writes are intentionally limited to authenticated users.
-- Add role-specific policies after Supabase Auth roles are defined.
drop policy if exists "authenticated_read_aluno" on public.aluno;
create policy "authenticated_read_aluno"
  on public.aluno for select
  to authenticated
  using (deleted_at is null);

drop policy if exists "authenticated_read_inscricao" on public.inscricao;
create policy "authenticated_read_inscricao"
  on public.inscricao for select
  to authenticated
  using (true);

drop policy if exists "authenticated_read_lead" on public.lead;
create policy "authenticated_read_lead"
  on public.lead for select
  to authenticated
  using (true);

create or replace function public.registrar_inscricao_publica(
  p_nome_completo varchar,
  p_email varchar,
  p_cpf varchar,
  p_telefone varchar,
  p_cargo varchar,
  p_orgao varchar,
  p_tipo_aluno public.tipo_aluno,
  p_turma_id varchar(80),
  p_tipo_inscricao varchar,
  p_forma_pagamento public.forma_pagamento,
  p_observacoes text default null
)
returns varchar(80)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_aluno_id varchar(80);
  v_inscricao_id varchar(80);
begin
  select id
    into v_aluno_id
    from public.aluno
   where lower(email) = lower(p_email)
     and deleted_at is null
   limit 1;

  if v_aluno_id is null then
    insert into public.aluno (
      nome_completo,
      email,
      cpf,
      telefone,
      cargo,
      orgao,
      tipo_aluno
    )
    values (
      p_nome_completo,
      p_email,
      nullif(p_cpf, ''),
      nullif(p_telefone, ''),
      nullif(p_cargo, ''),
      nullif(p_orgao, ''),
      p_tipo_aluno
    )
    returning id into v_aluno_id;
  else
    update public.aluno
       set nome_completo = coalesce(nullif(p_nome_completo, ''), nome_completo),
           cpf = coalesce(nullif(p_cpf, ''), cpf),
           telefone = coalesce(nullif(p_telefone, ''), telefone),
           cargo = coalesce(nullif(p_cargo, ''), cargo),
           orgao = coalesce(nullif(p_orgao, ''), orgao),
           tipo_aluno = coalesce(p_tipo_aluno, tipo_aluno)
     where id = v_aluno_id;
  end if;

  insert into public.inscricao (
    aluno_id,
    turma_id,
    status_inscricao,
    status_pagamento,
    forma_pagamento,
    tipo_inscricao,
    observacoes
  )
  values (
    v_aluno_id,
    p_turma_id,
    'Confirmada',
    'Pendente',
    p_forma_pagamento,
    p_tipo_inscricao,
    p_observacoes
  )
  returning id into v_inscricao_id;

  update public.turma
     set vagas_preenchidas = least(vagas_total, vagas_preenchidas + 1)
   where id = p_turma_id;

  return v_inscricao_id;
end;
$$;

grant execute on function public.registrar_inscricao_publica(
  varchar,
  varchar,
  varchar,
  varchar,
  varchar,
  varchar,
  public.tipo_aluno,
  varchar,
  varchar,
  public.forma_pagamento,
  text
) to anon, authenticated;

comment on table public.aluno is 'Dados básicos dos alunos que realizam inscrição.';
comment on table public.curso is 'Catálogo de cursos, incluindo conteúdo comercial e campos usados pelo site.';
comment on table public.curso_instrutor is 'Relação N:N entre cursos e instrutores.';
comment on table public.turma is 'Turmas agendadas para cada curso.';
comment on table public.inscricao is 'Inscrição de um aluno em uma turma.';
comment on table public.instrutor is 'Instrutores responsáveis pelos cursos e turmas.';
comment on table public.lead is 'Interesse comercial ou solicitação de contato.';
comment on table public.avaliacao is 'Avaliação de aluno vinculada a uma inscrição e turma.';

-- =====================================================================
-- Migration: supabase/migrations/20260513100000_sprint1_security.sql
-- =====================================================================
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

drop policy if exists "catalogo_publico_instrutor_select" on public.instrutor;

alter table public.instrutor
  alter column status drop default;

alter table public.instrutor
  alter column status type public.status_instrutor
  using case status::text
    when 'Ativo'    then 'Ativo'
    when 'Destaque' then 'Ativo'
    else                 'Inativo'
  end::public.status_instrutor;

alter table public.instrutor
  alter column status set default 'Ativo'::public.status_instrutor;

create policy "catalogo_publico_instrutor_select"
  on public.instrutor for select
  to anon, authenticated
  using (deleted_at is null and status = 'Ativo');

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

-- =====================================================================
-- Migration: supabase/migrations/20260513200000_sprint2_integrity.sql
-- =====================================================================
-- ═══════════════════════════════════════════════════════════════════════════
-- Sprint 2 — Integridade de Dados
-- ═══════════════════════════════════════════════════════════════════════════
--   I2.1  deleted_at em avaliacao e lead (padroniza soft delete)
--   I2.2  registrar_inscricao_publica: validação de turma + erro amigável
--   I2.3  Trigger sync_turma_status: atualiza status ao preencher vagas
--   I2.4  Trigger validate_avaliacao_turma: garante turma_id consistente
-- ═══════════════════════════════════════════════════════════════════════════

-- ── I2.1  deleted_at em avaliacao e lead ────────────────────────────────────
alter table public.avaliacao
  add column if not exists deleted_at timestamptz;

alter table public.lead
  add column if not exists deleted_at timestamptz;

-- ── I2.2  registrar_inscricao_publica com validação ─────────────────────────
create or replace function public.registrar_inscricao_publica(
  p_nome_completo   varchar,
  p_email           varchar,
  p_cpf             varchar,
  p_telefone        varchar,
  p_cargo           varchar,
  p_orgao           varchar,
  p_tipo_aluno      public.tipo_aluno,
  p_turma_id        varchar(80),
  p_tipo_inscricao  varchar,
  p_forma_pagamento public.forma_pagamento,
  p_observacoes     text default null
)
returns varchar(80)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_aluno_id varchar(80);
  v_inscricao_id varchar(80);
  v_turma        record;
begin
  -- Validar disponibilidade da turma
  select id, status, vagas_total, vagas_preenchidas, vagas_restantes, deleted_at
    into v_turma
    from public.turma
   where id = p_turma_id
   limit 1;

  if not found or v_turma.deleted_at is not null then
    raise exception 'Turma não encontrada.' using errcode = 'P0001';
  end if;

  if v_turma.status not in ('Aberta', 'PoucasVagas') then
    raise exception 'Turma não está disponível para inscrição (status: %).', v_turma.status
      using errcode = 'P0002';
  end if;

  if v_turma.vagas_restantes <= 0 then
    raise exception 'Turma sem vagas disponíveis.' using errcode = 'P0003';
  end if;

  -- Upsert aluno por email (case-insensitive)
  select id into v_aluno_id
    from public.aluno
   where lower(email) = lower(p_email)
     and deleted_at is null
   limit 1;

  if v_aluno_id is null then
    insert into public.aluno (nome_completo, email, cpf, telefone, cargo, orgao, tipo_aluno)
    values (
      p_nome_completo,
      p_email,
      nullif(p_cpf, ''),
      nullif(p_telefone, ''),
      nullif(p_cargo, ''),
      nullif(p_orgao, ''),
      p_tipo_aluno
    )
    returning id into v_aluno_id;
  else
    update public.aluno
       set nome_completo = coalesce(nullif(p_nome_completo, ''), nome_completo),
           cpf           = coalesce(nullif(p_cpf, ''), cpf),
           telefone      = coalesce(nullif(p_telefone, ''), telefone),
           cargo         = coalesce(nullif(p_cargo, ''), cargo),
           orgao         = coalesce(nullif(p_orgao, ''), orgao),
           tipo_aluno    = coalesce(p_tipo_aluno, tipo_aluno)
     where id = v_aluno_id;
  end if;

  -- Verificar inscrição duplicada
  if exists (
    select 1 from public.inscricao
     where aluno_id = v_aluno_id
       and turma_id = p_turma_id
       and status_inscricao not in ('Cancelada')
  ) then
    raise exception 'Aluno já possui inscrição ativa nesta turma.' using errcode = 'P0004';
  end if;

  -- Inserir inscrição
  insert into public.inscricao (
    aluno_id, turma_id, status_inscricao, status_pagamento,
    forma_pagamento, tipo_inscricao, observacoes
  )
  values (
    v_aluno_id, p_turma_id, 'Confirmada', 'Pendente',
    p_forma_pagamento, p_tipo_inscricao, p_observacoes
  )
  returning id into v_inscricao_id;

  -- Incrementar vagas (o trigger sync_turma_status atualiza o status automaticamente)
  update public.turma
     set vagas_preenchidas = least(vagas_total, vagas_preenchidas + 1)
   where id = p_turma_id;

  return v_inscricao_id;
end;
$$;

-- ── I2.3  Trigger sync_turma_status ─────────────────────────────────────────
create or replace function public.sync_turma_status()
returns trigger
language plpgsql
as $$
begin
  -- Não altera status fixado manualmente (Cancelada, Realizada, EmBreve)
  if new.status in ('Cancelada', 'Realizada', 'EmBreve') then
    return new;
  end if;

  new.status := case
    when new.vagas_preenchidas >= new.vagas_total
      then 'Encerrada'::public.status_turma
    when new.vagas_total > 0
         and (new.vagas_total - new.vagas_preenchidas) <= greatest(5, new.vagas_total / 5)
      then 'PoucasVagas'::public.status_turma
    else 'Aberta'::public.status_turma
  end;

  return new;
end;
$$;

drop trigger if exists turma_sync_status on public.turma;
create trigger turma_sync_status
  before update of vagas_preenchidas on public.turma
  for each row execute function public.sync_turma_status();

-- ── I2.4  Trigger validate_avaliacao_turma ──────────────────────────────────
create or replace function public.validate_avaliacao_turma()
returns trigger
language plpgsql
as $$
declare
  v_turma_id varchar(80);
begin
  select turma_id into v_turma_id
    from public.inscricao
   where id = new.inscricao_id;

  if v_turma_id is null or v_turma_id != new.turma_id then
    raise exception
      'avaliacao.turma_id (%) diverge de inscricao.turma_id (%).',
      new.turma_id, v_turma_id
      using errcode = 'P0010';
  end if;

  return new;
end;
$$;

drop trigger if exists avaliacao_validate_turma on public.avaliacao;
create trigger avaliacao_validate_turma
  before insert or update on public.avaliacao
  for each row execute function public.validate_avaliacao_turma();

comment on function public.sync_turma_status()
  is 'Atualiza turma.status automaticamente ao alterar vagas_preenchidas.';
comment on function public.validate_avaliacao_turma()
  is 'Garante que avaliacao.turma_id coincide com inscricao.turma_id.';
comment on function public.registrar_inscricao_publica(varchar,varchar,varchar,varchar,varchar,varchar,public.tipo_aluno,varchar,varchar,public.forma_pagamento,text)
  is 'Inscreve aluno em turma validando disponibilidade. Callable por anon/authenticated via RPC.';

-- =====================================================================
-- Migration: supabase/migrations/20260513300000_sprint3_performance.sql
-- =====================================================================
-- ═══════════════════════════════════════════════════════════════════════════
-- Sprint 3 — Performance
-- ═══════════════════════════════════════════════════════════════════════════
--   P3.1  Índices complementares (categoria, status inscricao, lead email)
--   P3.2  Trigger sync_curso_rating: recalcula media ao inserir/alterar avaliacao
--   P3.3  Trigger sync_curso_total_alunos: mantém contador ao confirmar inscrição
-- ═══════════════════════════════════════════════════════════════════════════

-- ── P3.1  Índices ────────────────────────────────────────────────────────────
create index if not exists curso_categoria_idx
  on public.curso (categoria)
  where deleted_at is null and categoria is not null;

create index if not exists inscricao_status_idx
  on public.inscricao (status_inscricao);

create index if not exists lead_email_idx
  on public.lead (lower(email))
  where email is not null;

-- ── P3.2  Trigger sync_curso_rating ─────────────────────────────────────────
create or replace function public.sync_curso_rating()
returns trigger
language plpgsql
as $$
declare
  v_curso_id varchar(80);
  v_avg_rating numeric(3,2);
begin
  select t.curso_id into v_curso_id
    from public.turma t
   where t.id = coalesce(new.turma_id, old.turma_id);

  if v_curso_id is null then
    return coalesce(new, old);
  end if;

  select coalesce(round(avg(a.nota)::numeric, 2), 0)
    into v_avg_rating
    from public.avaliacao a
    join public.turma t on t.id = a.turma_id
   where t.curso_id  = v_curso_id
     and a.publicar  = true
     and (a.deleted_at is null);

  update public.curso
     set rating = v_avg_rating
   where id = v_curso_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists avaliacao_sync_curso_rating on public.avaliacao;
create trigger avaliacao_sync_curso_rating
  after insert or update of nota, publicar or delete on public.avaliacao
  for each row execute function public.sync_curso_rating();

-- ── P3.3  Trigger sync_curso_total_alunos ───────────────────────────────────
create or replace function public.sync_curso_total_alunos()
returns trigger
language plpgsql
as $$
declare
  v_curso_id varchar(80);
  v_delta    integer := 0;
begin
  if tg_op = 'INSERT' and new.status_inscricao = 'Confirmada' then
    v_delta := 1;
  elsif tg_op = 'UPDATE' then
    if old.status_inscricao != 'Confirmada' and new.status_inscricao = 'Confirmada' then
      v_delta := 1;
    elsif old.status_inscricao = 'Confirmada' and new.status_inscricao = 'Cancelada' then
      v_delta := -1;
    end if;
  end if;

  if v_delta = 0 then
    return coalesce(new, old);
  end if;

  select curso_id into v_curso_id
    from public.turma
   where id = new.turma_id;

  if v_curso_id is not null then
    update public.curso
       set total_alunos = greatest(0, total_alunos + v_delta)
     where id = v_curso_id;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists inscricao_sync_curso_total_alunos on public.inscricao;
create trigger inscricao_sync_curso_total_alunos
  after insert or update of status_inscricao on public.inscricao
  for each row execute function public.sync_curso_total_alunos();

comment on function public.sync_curso_rating()
  is 'Recalcula curso.rating ao inserir, atualizar ou deletar avaliacao.';
comment on function public.sync_curso_total_alunos()
  is 'Mantém curso.total_alunos sincronizado ao confirmar ou cancelar inscrição.';

-- =====================================================================
-- Migration: supabase/migrations/20260513400000_sprint4_evolution.sql
-- =====================================================================
-- ═══════════════════════════════════════════════════════════════════════════
-- Sprint 4 — Evolução de Schema
-- ═══════════════════════════════════════════════════════════════════════════
--   E4.1  Expansão UTM em lead (medium, campaign, term, content)
--   E4.2  Tabela certificado (substitui booleano inscricao.certificado_emitido)
--   E4.3  Tabela pagamento (histórico financeiro desacoplado de inscricao)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── E4.1  UTM completo em lead ───────────────────────────────────────────────
alter table public.lead
  add column if not exists utm_medium   varchar(120),
  add column if not exists utm_campaign varchar(120),
  add column if not exists utm_term     varchar(120),
  add column if not exists utm_content  varchar(120);

-- ── E4.2  Tabela certificado ─────────────────────────────────────────────────
create table if not exists public.certificado (
  id                 uuid primary key default gen_random_uuid(),
  inscricao_id       varchar(80) not null references public.inscricao(id) on delete restrict,
  numero_certificado varchar(80) not null,
  data_emissao       date not null default current_date,
  pdf_url            varchar(500),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint certificado_numero_unique unique (numero_certificado)
);

drop trigger if exists certificado_set_updated_at on public.certificado;
create trigger certificado_set_updated_at
  before update on public.certificado
  for each row execute function public.set_updated_at();

create index if not exists certificado_inscricao_idx
  on public.certificado (inscricao_id);

alter table public.certificado enable row level security;

drop policy if exists "certificado_owner_or_admin_select" on public.certificado;
create policy "certificado_owner_or_admin_select" on public.certificado for select
  to authenticated
  using (
    inscricao_id in (
      select i.id from public.inscricao i
        join public.aluno a on a.id = i.aluno_id
       where a.user_id = auth.uid()
    )
    or public.is_admin()
  );

drop policy if exists "certificado_admin_insert" on public.certificado;
create policy "certificado_admin_insert" on public.certificado for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "certificado_admin_update" on public.certificado;
create policy "certificado_admin_update" on public.certificado for update
  to authenticated
  using  (public.is_admin())
  with check (public.is_admin());

-- ── E4.3  Tabela pagamento ───────────────────────────────────────────────────
create table if not exists public.pagamento (
  id              uuid primary key default gen_random_uuid(),
  inscricao_id       varchar(80) not null references public.inscricao(id) on delete restrict,
  valor           numeric(10,2) not null,
  forma_pagamento public.forma_pagamento not null,
  status          public.status_pagamento not null default 'Pendente',
  data_pagamento  timestamptz,
  gateway_ref     varchar(120),
  parcelas        integer not null default 1,
  observacoes     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint pagamento_valor_chk    check (valor > 0),
  constraint pagamento_parcelas_chk check (parcelas >= 1)
);

drop trigger if exists pagamento_set_updated_at on public.pagamento;
create trigger pagamento_set_updated_at
  before update on public.pagamento
  for each row execute function public.set_updated_at();

create index if not exists pagamento_inscricao_idx
  on public.pagamento (inscricao_id);

create index if not exists pagamento_status_idx
  on public.pagamento (status);

alter table public.pagamento enable row level security;

drop policy if exists "pagamento_owner_or_admin_select" on public.pagamento;
create policy "pagamento_owner_or_admin_select" on public.pagamento for select
  to authenticated
  using (
    inscricao_id in (
      select i.id from public.inscricao i
        join public.aluno a on a.id = i.aluno_id
       where a.user_id = auth.uid()
    )
    or public.is_admin()
  );

drop policy if exists "pagamento_admin_insert" on public.pagamento;
create policy "pagamento_admin_insert" on public.pagamento for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "pagamento_admin_update" on public.pagamento;
create policy "pagamento_admin_update" on public.pagamento for update
  to authenticated
  using  (public.is_admin())
  with check (public.is_admin());

comment on table public.certificado is 'Certificados emitidos por inscrição concluída.';
comment on table public.pagamento   is 'Histórico de pagamentos vinculados a uma inscrição.';

-- =====================================================================
-- Migration: supabase/migrations/20260604164120_content_access_alignment.sql
-- =====================================================================
-- RH Cursos & Solucoes - content and access alignment
-- Covers gaps documented in docs/database/rh-cursos-schema-analysis.md.

do $$ begin
  create type public.status_post_blog as enum ('Rascunho', 'Publicado', 'Arquivado');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.trilha (
  id varchar(80) primary key,
  codigo varchar(20) not null,
  nome varchar(180) not null,
  nome_curto varchar(120) not null,
  slug varchar(180) not null,
  descricao text not null,
  icone varchar(80) not null,
  ordem integer not null default 0,
  ativa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trilha_codigo_unique unique (codigo),
  constraint trilha_slug_unique unique (slug)
);

insert into public.trilha (id, codigo, nome, nome_curto, slug, descricao, icone, ordem)
values
  ('path-dp', 'T01', 'Departamento Pessoal, Folha de Pagamento & eSocial', 'DP, Folha & eSocial', 'departamento-pessoal-folha-de-pagamento-esocial', 'Capacitação completa do DP público, da legislação trabalhista à conformidade digital com eSocial, FGTS Digital e LGPD.', 'Calculator', 1),
  ('path-licitacoes', 'T02', 'Licitações, Compras Públicas & Contratos Administrativos', 'Licitações & Contratos', 'licitacoes-compras-publicas-contratos-administrativos', 'Da legislação básica à fiscalização avançada de contratos, com cobertura da Lei nº 14.133/2021 e melhores práticas de contratação pública.', 'Scale', 2),
  ('path-pessoas', 'T03', 'Gestão de Pessoas, Liderança & Desenvolvimento Humano', 'Pessoas & Liderança', 'gestao-de-pessoas-lideranca-desenvolvimento-humano', 'Formação humanizada para líderes e equipes, com inteligência emocional, cultura organizacional, saúde mental e gestão por resultados.', 'Users', 3),
  ('path-comunicacao', 'T04', 'Comunicação Institucional, Redação & Atendimento ao Cidadão', 'Comunicação & Atendimento', 'comunicacao-institucional-redacao-atendimento-ao-cidadao', 'Comunicação clara e eficiente, do atendimento ao cidadão à redação oficial, oratória, mídias digitais e conformidade com LAI/LGPD.', 'MessageSquareText', 4),
  ('path-auditoria', 'T05', 'Auditoria, Contabilidade Pública & Gestão Tributária', 'Auditoria & Tributária', 'auditoria-contabilidade-publica-gestao-tributaria', 'Domínio técnico em contabilidade pública, obrigações acessórias, Tesouro Gerencial, SIAFI e auditoria governamental.', 'ClipboardCheck', 5),
  ('path-tech', 'T06', 'Tecnologia, Dados, Processos & Inovação', 'Tecnologia & Inovação', 'tecnologia-dados-processos-inovacao', 'Ferramentas digitais, análise de dados, modelagem de processos, inteligência artificial e governança para transformação digital.', 'BarChart3', 6)
on conflict (id) do update set
  codigo = excluded.codigo,
  nome = excluded.nome,
  nome_curto = excluded.nome_curto,
  slug = excluded.slug,
  descricao = excluded.descricao,
  icone = excluded.icone,
  ordem = excluded.ordem,
  ativa = true;

do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conname = 'curso_trilha_id_fk'
       and conrelid = 'public.curso'::regclass
  ) then
    alter table public.curso
      add constraint curso_trilha_id_fk
      foreign key (trilha_id)
      references public.trilha(id)
      on update cascade
      on delete set null
      not valid;
  end if;
end $$;

alter table public.curso validate constraint curso_trilha_id_fk;

create table if not exists public.post_blog (
  id varchar(80) primary key default gen_random_uuid()::text,
  titulo varchar(240) not null,
  slug varchar(260) not null,
  resumo text not null,
  conteudo text not null,
  categoria varchar(120) not null,
  tags jsonb not null default '[]'::jsonb,
  autor varchar(160) not null,
  publicado_em timestamptz,
  tempo_leitura varchar(40),
  status public.status_post_blog not null default 'Rascunho',
  imagem_url varchar(500),
  curso_id varchar(80) references public.curso(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint post_blog_slug_unique unique (slug)
);

create index if not exists post_blog_status_publicado_idx
  on public.post_blog (status, publicado_em desc)
  where deleted_at is null;

create index if not exists post_blog_curso_idx
  on public.post_blog (curso_id)
  where curso_id is not null;

alter table public.lead
  add column if not exists modalidade_preferida varchar(80),
  add column if not exists objetivo_treinamento text,
  add column if not exists tema_treinamento varchar(240),
  add column if not exists desafios_principais text;

alter table public.profiles
  drop constraint if exists profiles_role_check;

update public.profiles
   set role = 'student'
 where role = 'user';

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student', 'instructor', 'admin'));

alter table public.profiles
  alter column role set default 'student';

drop trigger if exists trilha_set_updated_at on public.trilha;
create trigger trilha_set_updated_at
  before update on public.trilha
  for each row execute function public.set_updated_at();

drop trigger if exists post_blog_set_updated_at on public.post_blog;
create trigger post_blog_set_updated_at
  before update on public.post_blog
  for each row execute function public.set_updated_at();

alter table public.trilha enable row level security;
alter table public.post_blog enable row level security;

drop policy if exists "trilha_public_select" on public.trilha;
create policy "trilha_public_select" on public.trilha for select
  to anon, authenticated
  using (ativa = true);

drop policy if exists "trilha_admin_write" on public.trilha;
create policy "trilha_admin_write" on public.trilha for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "post_blog_public_select" on public.post_blog;
create policy "post_blog_public_select" on public.post_blog for select
  to anon, authenticated
  using (deleted_at is null and status = 'Publicado');

drop policy if exists "post_blog_admin_select" on public.post_blog;
create policy "post_blog_admin_select" on public.post_blog for select
  to authenticated
  using (public.is_admin());

drop policy if exists "post_blog_admin_insert" on public.post_blog;
create policy "post_blog_admin_insert" on public.post_blog for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "post_blog_admin_update" on public.post_blog;
create policy "post_blog_admin_update" on public.post_blog for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "catalogo_publico_turma_select" on public.turma;
create policy "catalogo_publico_turma_select" on public.turma for select
  to anon, authenticated
  using (
    deleted_at is null
    and exists (
      select 1
        from public.curso c
       where c.id = turma.curso_id
         and c.deleted_at is null
         and c.status in ('Ativo', 'Destaque', 'EmBreve')
    )
    and (
      instrutor_id is null
      or exists (
        select 1
          from public.instrutor i
         where i.id = turma.instrutor_id
           and i.deleted_at is null
           and i.status = 'Ativo'
      )
    )
  );

drop policy if exists "catalogo_publico_curso_instrutor_select" on public.curso_instrutor;
create policy "catalogo_publico_curso_instrutor_select" on public.curso_instrutor for select
  to anon, authenticated
  using (
    exists (
      select 1
        from public.curso c
       where c.id = curso_instrutor.curso_id
         and c.deleted_at is null
         and c.status in ('Ativo', 'Destaque', 'EmBreve')
    )
    and exists (
      select 1
        from public.instrutor i
       where i.id = curso_instrutor.instrutor_id
         and i.deleted_at is null
         and i.status = 'Ativo'
    )
  );

drop policy if exists "curso_admin_write" on public.curso;
create policy "curso_admin_write" on public.curso for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "turma_admin_write" on public.turma;
create policy "turma_admin_write" on public.turma for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "instrutor_admin_write" on public.instrutor;
create policy "instrutor_admin_write" on public.instrutor for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "curso_instrutor_admin_write" on public.curso_instrutor;
create policy "curso_instrutor_admin_write" on public.curso_instrutor for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke execute on all functions in schema public from public, anon, authenticated;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.curso to anon, authenticated;
grant select on public.turma to anon, authenticated;
grant select on public.instrutor to anon, authenticated;
grant select on public.curso_instrutor to anon, authenticated;
grant select on public.trilha to anon, authenticated;
grant select on public.post_blog to anon, authenticated;
grant insert on public.lead to anon, authenticated;
grant select, update, insert on public.lead to authenticated;
grant select, insert, update on public.curso to authenticated;
grant select, insert, update on public.turma to authenticated;
grant select, insert, update on public.instrutor to authenticated;
grant select, insert, update on public.curso_instrutor to authenticated;
grant select, insert, update on public.trilha to authenticated;
grant select, insert, update on public.post_blog to authenticated;
grant select, insert, update on public.aluno to authenticated;
grant select, insert, update on public.inscricao to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant execute on all functions in schema public to service_role;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.registrar_inscricao_publica(
  varchar,
  varchar,
  varchar,
  varchar,
  varchar,
  varchar,
  public.tipo_aluno,
  varchar,
  varchar,
  public.forma_pagamento,
  text
) to anon, authenticated;

comment on table public.trilha is 'Trilhas comerciais exibidas na Home, catálogo e agenda.';
comment on table public.post_blog is 'Posts do blog institucional e conteúdo editorial do site.';
comment on column public.lead.modalidade_preferida is 'Modalidade solicitada em propostas In Company.';
comment on column public.lead.objetivo_treinamento is 'Objetivo informado no formulário In Company.';
comment on column public.lead.tema_treinamento is 'Tema desejado para treinamento In Company.';
comment on column public.lead.desafios_principais is 'Desafios principais informados no formulário In Company.';
