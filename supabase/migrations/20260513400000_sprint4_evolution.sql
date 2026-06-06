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
