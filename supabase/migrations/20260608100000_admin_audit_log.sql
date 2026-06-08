-- Trilha de auditoria para ações admin (LGPD / rastreabilidade).
-- Registra quem, o quê, em qual recurso e quando — via Edge Function admin-resources.
-- Tabela append-only: sem UPDATE, sem DELETE. RLS bloqueia leitura por usuários comuns.

begin;

create table if not exists public.admin_audit_log (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  admin_email  text        not null,
  action       text        not null,   -- 'upsert' | 'delete' | 'update-status'
  resource     text        not null,   -- 'courses' | 'classes' | ...
  resource_id  text,                   -- id do registro afetado (quando disponível)
  payload      jsonb                   -- snapshot do payload (sem dados sensíveis)
);

-- Índices para consultas de auditoria por admin e por período
create index if not exists admin_audit_log_admin_email_idx on public.admin_audit_log (admin_email);
create index if not exists admin_audit_log_created_at_idx  on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_resource_idx    on public.admin_audit_log (resource, resource_id);

-- RLS: apenas service-role (Edge Function) pode inserir; admins autenticados podem ler
alter table public.admin_audit_log enable row level security;

create policy "service_role_insert_audit"
  on public.admin_audit_log
  for insert
  to service_role
  with check (true);

create policy "admin_read_audit"
  on public.admin_audit_log
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

commit;
