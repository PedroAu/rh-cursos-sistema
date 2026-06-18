create table if not exists public.admin_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.course_enrollments (
  id text primary key,
  course_id text not null,
  turma_id text,
  aluno_nome text not null,
  aluno_email text not null,
  aluno_telefone text,
  aluno_cpf text,
  empresa_razao text,
  empresa_cnpj text,
  orgao text,
  pagamento_metodo text not null,
  aceite_lgpd boolean not null default false,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_course_enrollments_course_id
  on public.course_enrollments (course_id);

create index if not exists idx_course_enrollments_turma_id
  on public.course_enrollments (turma_id);
