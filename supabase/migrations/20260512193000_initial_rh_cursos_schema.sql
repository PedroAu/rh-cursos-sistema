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
  id uuid primary key default gen_random_uuid(),
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
  id uuid primary key default gen_random_uuid(),
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
  id uuid primary key default gen_random_uuid(),
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
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.curso(id) on delete cascade,
  instrutor_id uuid not null references public.instrutor(id) on delete restrict,
  principal boolean not null default false,
  created_at timestamptz not null default now(),
  unique (curso_id, instrutor_id)
);

create unique index if not exists curso_instrutor_um_principal_idx
  on public.curso_instrutor (curso_id)
  where principal;

create table if not exists public.turma (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.curso(id) on delete restrict,
  instrutor_id uuid references public.instrutor(id) on delete set null,
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
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.aluno(id) on delete restrict,
  turma_id uuid not null references public.turma(id) on delete restrict,
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
  id uuid primary key default gen_random_uuid(),
  nome varchar(180) not null,
  email varchar(180),
  telefone varchar(30),
  tipo public.tipo_lead not null default 'Curso',
  orgao varchar(180),
  num_participantes integer,
  tema_interesse varchar(240),
  curso_id uuid references public.curso(id) on delete set null,
  status_crm public.status_lead not null default 'Novo',
  mensagem text,
  utm_source varchar(120),
  origem varchar(80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lead_num_participantes_chk check (num_participantes is null or num_participantes > 0)
);

create table if not exists public.avaliacao (
  id uuid primary key default gen_random_uuid(),
  inscricao_id uuid not null references public.inscricao(id) on delete cascade,
  turma_id uuid not null references public.turma(id) on delete restrict,
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
  p_turma_id uuid,
  p_tipo_inscricao varchar,
  p_forma_pagamento public.forma_pagamento,
  p_observacoes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_aluno_id uuid;
  v_inscricao_id uuid;
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
  uuid,
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
