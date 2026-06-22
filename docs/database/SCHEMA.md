# Database Schema — site-rh-cursos

**Database:** Supabase PostgreSQL  
**Generated:** 2026-06-22  
**Schema Version:** 11 migrations (v1.0 stable)

---

## Table of Contents

1. [Entity-Relationship Diagram](#entity-relationship-diagram)
2. [Enums](#enums)
3. [Tables](#tables)
4. [Indexes](#indexes)
5. [Functions & Triggers](#functions--triggers)
6. [RLS Policies](#rls-policies)
7. [Access Patterns](#access-patterns)

---

## Entity-Relationship Diagram

```
┌─────────────────┐
│     auth.users  │
└────────┬────────┘
         │ id (FK)
         │
    ┌────▼────────────┐
    │    profiles     │ ◄─── User roles (user, admin)
    └────────────────┘
         │ (id = auth.uid)
         │
    ┌────▼──────────────┐
    │     aluno         │ ◄─── Students (PF, PJ, Servidor)
    └────────┬──────────┘
             │
    ┌────────▼──────────┐
    │   inscricao       │ ◄─── Enrollments (status, payment)
    └────────┬──────────┘
             │
    ┌────────▼──────────┐
    │   avaliacao       │ ◄─── Ratings (1-5, publicavel)
    └───────────────────┘


    ┌──────────────────┐
    │     instrutor    │ ◄─── Instructors (Ativo/Inativo)
    └────────┬─────────┘
             │
    ┌────────▼──────────────┐
    │ curso_instrutor       │ ◄─── Course-Instructor relationship
    └────────┬──────────────┘
             │
    ┌────────▼──────────┐
    │     curso         │ ◄─── Courses (Online, Presencial, etc)
    └────────┬──────────┘
             │
    ┌────────▼──────────┐
    │     turma         │ ◄─── Classes (data_inicio, vagas)
    └───────────────────┘


    ┌──────────────────────┐
    │       lead           │ ◄─── Sales leads (CRM)
    └──────────────────────┘

    ┌──────────────────────┐
    │  rate_limit_store    │ ◄─── Global rate limiting
    └──────────────────────┘
```

---

## Enums

### Student Type
```sql
CREATE TYPE public.tipo_aluno AS ENUM ('PF', 'PJ', 'Servidor');
```
- `PF` — Pessoa Física (Individual)
- `PJ` — Pessoa Jurídica (Company)
- `Servidor` — Government official

### Course Modality
```sql
CREATE TYPE public.modalidade_curso AS ENUM ('Presencial', 'Online', 'Hibrido', 'InCompany', 'Gravado');
```
- `Presencial` — In-person
- `Online` — Fully online
- `Hibrido` — Hybrid (some sessions in-person, some online)
- `InCompany` — Corporate training at client site
- `Gravado` — Pre-recorded course

### Course Level
```sql
CREATE TYPE public.nivel_curso AS ENUM ('Basico', 'Intermediario', 'Avancado', 'Misto');
```

### Course Status
```sql
CREATE TYPE public.status_curso AS ENUM ('Ativo', 'Inativo', 'Destaque', 'EmBreve', 'Rascunho', 'Arquivado');
```
- `Ativo` — Published, visible in catalog
- `Inativo` — Unpublished
- `Destaque` — Featured/highlighted
- `EmBreve` — Coming soon (visible but not enrollable)
- `Rascunho` — Draft
- `Arquivado` — Archived

### Instructor Status
```sql
CREATE TYPE public.status_instrutor AS ENUM ('Ativo', 'Inativo');
```

### Class Status
```sql
CREATE TYPE public.status_turma AS ENUM ('Aberta', 'PoucasVagas', 'Encerrada', 'Cancelada', 'Realizada', 'EmBreve');
```
- `Aberta` — Open for enrollment
- `PoucasVagas` — Few spots left (≤20% capacity)
- `Encerrada` — Full
- `Cancelada` — Cancelled
- `Realizada` — Completed
- `EmBreve` — Coming soon

### Enrollment Status
```sql
CREATE TYPE public.status_inscricao AS ENUM ('Pendente', 'AguardandoPagamento', 'Confirmada', 'Cancelada', 'Concluida', 'ListaEspera');
```

### Payment Status
```sql
CREATE TYPE public.status_pagamento AS ENUM ('Pendente', 'Pago', 'Estornado', 'Isento');
```
- `Pendente` — Awaiting payment
- `Pago` — Paid
- `Estornado` — Refunded
- `Isento` — Exempt (free course, scholarship, etc.)

### Payment Method
```sql
CREATE TYPE public.forma_pagamento AS ENUM ('Pix', 'Cartao', 'Boleto', 'Empenho');
```
- `Pix` — Instant payment
- `Cartao` — Credit/debit card
- `Boleto` — Boleto bancário (Brazilian bill)
- `Empenho` — Government commitment

### Lead Type
```sql
CREATE TYPE public.tipo_lead AS ENUM ('Curso', 'InCompany', 'Mentoria', 'Newsletter', 'Orcamento', 'Contato');
```

### Lead Status
```sql
CREATE TYPE public.status_lead AS ENUM ('Novo', 'Contatado', 'EmAtendimento', 'PropostaEnviada', 'Convertido', 'Perdido');
```

---

## Tables

### 1. aluno — Students

```sql
CREATE TABLE public.aluno (
  id              VARCHAR(80) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id         UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  nome_completo   VARCHAR(180) NOT NULL,
  email           VARCHAR(180) NOT NULL,
  cpf             VARCHAR(20),
  telefone        VARCHAR(30),
  cargo           VARCHAR(120),
  orgao           VARCHAR(180),
  tipo_aluno      public.tipo_aluno NOT NULL DEFAULT 'PF',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  
  CONSTRAINT aluno_email_format_chk CHECK (position('@' in email) > 1)
);
```

**Indexes:**
- `aluno_email_unique_idx` — Unique email (case-insensitive, soft-delete aware)
- `aluno_cpf_unique_idx` — Unique CPF (soft-delete aware)
- `aluno_user_id_idx` — FK to auth.users (nullable, for future user linking)

**Notes:**
- Soft delete via `deleted_at`
- Email is case-insensitive (uses `lower(email)`)
- CPF is optional but unique when present
- `user_id` optionally links to Supabase Auth for account owners

---

### 2. profiles — User Roles

```sql
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       VARCHAR(20) NOT NULL DEFAULT 'user'
               CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Triggers:**
- `profiles_set_updated_at` — Auto-update timestamp

**RLS:**
- Users can only read their own profile
- Users cannot promote themselves to admin

**Notes:**
- Auto-created when new auth.user is registered
- Replaces hardcoded role in profiles table with database-enforced values

---

### 3. instrutor — Instructors

```sql
CREATE TABLE public.instrutor (
  id              VARCHAR(80) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nome            VARCHAR(180) NOT NULL,
  email           VARCHAR(180),
  telefone        VARCHAR(30),
  bio             TEXT,
  foto_url        VARCHAR(500),
  formacao        TEXT,
  especialidade   VARCHAR(160),
  areas_atuacao   JSONB NOT NULL DEFAULT '[]'::jsonb,
  rating          NUMERIC(3,2) NOT NULL DEFAULT 0,
  status          public.status_instrutor NOT NULL DEFAULT 'Ativo',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  
  CONSTRAINT instrutor_rating_chk CHECK (rating >= 0 AND rating <= 5)
);
```

**Notes:**
- `rating` is calculated from `avaliacao` table (see trigger `avaliacao_sync_curso_rating`)
- `areas_atuacao` is JSONB array of expertise areas
- Soft delete via `deleted_at`
- Public catalog shows only active instructors

---

### 4. curso — Courses

```sql
CREATE TABLE public.curso (
  id              VARCHAR(80) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  titulo          VARCHAR(240) NOT NULL,
  slug            VARCHAR(260) NOT NULL UNIQUE,
  descricao_curta TEXT,
  descricao       TEXT,
  ementa          JSONB NOT NULL DEFAULT '[]'::jsonb,
  objetivos       JSONB NOT NULL DEFAULT '[]'::jsonb,
  beneficios      JSONB NOT NULL DEFAULT '[]'::jsonb,
  publico_alvo    JSONB NOT NULL DEFAULT '[]'::jsonb,
  carga_horaria   INTEGER NOT NULL DEFAULT 0,
  modalidade      public.modalidade_curso NOT NULL DEFAULT 'Online',
  nivel           public.nivel_curso NOT NULL DEFAULT 'Basico',
  categoria       VARCHAR(120),
  trilha_id       VARCHAR(80),
  trilha_nome     VARCHAR(180),
  tipo_publico    VARCHAR(80),
  preco_base      NUMERIC(10,2) NOT NULL DEFAULT 0,
  status          public.status_curso NOT NULL DEFAULT 'Ativo',
  destaque        BOOLEAN NOT NULL DEFAULT false,
  imagem_capa     VARCHAR(500),
  rating          NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_alunos    INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  
  CONSTRAINT curso_carga_horaria_chk CHECK (carga_horaria >= 0),
  CONSTRAINT curso_preco_base_chk CHECK (preco_base >= 0),
  CONSTRAINT curso_rating_chk CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT curso_total_alunos_chk CHECK (total_alunos >= 0)
);
```

**Indexes:**
- `curso_status_idx` — Query published courses
- `curso_categoria_idx` — Filter by category
- `curso_trilha_idx` — Find courses in training path

**Denormalized Fields:**
- `rating` — Recalculated from `avaliacao` table
- `total_alunos` — Maintained via trigger on `inscricao`
- `trilha_id` / `trilha_nome` — Denormalized for performance

**Notes:**
- JSONB fields store list content (ementa, objetivos, beneficios, publico_alvo)
- `preco_base` is the standard price; individual classes can override with `turma.preco_turma`

---

### 5. curso_instrutor — Course-Instructor Relationship

```sql
CREATE TABLE public.curso_instrutor (
  id           VARCHAR(80) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  curso_id     VARCHAR(80) NOT NULL REFERENCES public.curso(id) ON DELETE CASCADE,
  instrutor_id VARCHAR(80) NOT NULL REFERENCES public.instrutor(id) ON DELETE RESTRICT,
  principal    BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE (curso_id, instrutor_id)
);
```

**Indexes:**
- `curso_instrutor_um_principal_idx` — Ensure only one principal instructor per course

**Notes:**
- Many-to-many relationship: a course can have multiple instructors
- `principal` flag marks the primary instructor for display purposes

---

### 6. turma — Classes/Sections

```sql
CREATE TABLE public.turma (
  id                VARCHAR(80) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  curso_id          VARCHAR(80) NOT NULL REFERENCES public.curso(id) ON DELETE RESTRICT,
  instrutor_id      VARCHAR(80) REFERENCES public.instrutor(id) ON DELETE SET NULL,
  data_inicio       DATE NOT NULL,
  data_fim          DATE,
  horario           VARCHAR(80),
  local             VARCHAR(180),
  vagas_total       INTEGER NOT NULL DEFAULT 0,
  vagas_preenchidas INTEGER NOT NULL DEFAULT 0,
  vagas_restantes   INTEGER GENERATED ALWAYS AS (GREATEST(vagas_total - vagas_preenchidas, 0)) STORED,
  preco_turma       NUMERIC(10,2) NOT NULL DEFAULT 0,
  modalidade        public.modalidade_curso NOT NULL DEFAULT 'Online',
  status            public.status_turma NOT NULL DEFAULT 'Aberta',
  observacoes       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ,
  
  CONSTRAINT turma_datas_chk CHECK (data_fim IS NULL OR data_fim >= data_inicio),
  CONSTRAINT turma_vagas_chk CHECK (vagas_total >= 0 AND vagas_preenchidas >= 0 AND vagas_preenchidas <= vagas_total),
  CONSTRAINT turma_preco_chk CHECK (preco_turma >= 0)
);
```

**Indexes:**
- `turma_curso_idx` — Find classes for a course
- `turma_status_data_idx` — Query available classes by date

**Computed Fields:**
- `vagas_restantes` — Stored generated column for easy querying

**Triggers:**
- `turma_sync_status` — Auto-update status when vagas_preenchidas changes
  - If `vagas_preenchidas >= vagas_total` → `Encerrada`
  - If remaining ≤ 20% → `PoucasVagas`
  - Otherwise → `Aberta`

**Notes:**
- `modalidade` can override course modality (rare, but supported)
- Status changes only apply to `Aberta`, `PoucasVagas` states; manually set statuses (`Cancelada`, `Realizada`, `EmBreve`) are locked

---

### 7. inscricao — Enrollments

```sql
CREATE TABLE public.inscricao (
  id                   VARCHAR(80) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  aluno_id             VARCHAR(80) NOT NULL REFERENCES public.aluno(id) ON DELETE RESTRICT,
  turma_id             VARCHAR(80) NOT NULL REFERENCES public.turma(id) ON DELETE RESTRICT,
  status_inscricao     public.status_inscricao NOT NULL DEFAULT 'Pendente',
  status_pagamento     public.status_pagamento NOT NULL DEFAULT 'Pendente',
  valor_pago           NUMERIC(10,2) NOT NULL DEFAULT 0,
  forma_pagamento      public.forma_pagamento,
  codigo_confirmacao   VARCHAR(80) NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  tipo_inscricao       VARCHAR(40),
  observacoes          TEXT,
  certificado_emitido  BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at         TIMESTAMPTZ,
  
  CONSTRAINT inscricao_valor_pago_chk CHECK (valor_pago >= 0)
);
```

**Indexes:**
- `inscricao_aluno_idx` — Find enrollments for a student
- `inscricao_turma_idx` — Find enrollments in a class
- `inscricao_status_idx` — Query by enrollment status
- `inscricao_aluno_turma_active_idx` — Prevent duplicate active enrollments

**Triggers:**
- `inscricao_sync_curso_total_alunos` — Maintain `curso.total_alunos` counter
- `inscricao_set_updated_at` — Auto-update timestamp

**Notes:**
- `codigo_confirmacao` is a random hex string used for email confirmations
- RLS ensures users only see their own enrollments (except admin)

---

### 8. avaliacao — Course Evaluations/Ratings

```sql
CREATE TABLE public.avaliacao (
  id           VARCHAR(80) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  inscricao_id VARCHAR(80) NOT NULL UNIQUE REFERENCES public.inscricao(id) ON DELETE CASCADE,
  turma_id     VARCHAR(80) NOT NULL REFERENCES public.turma(id) ON DELETE RESTRICT,
  nota         INTEGER NOT NULL,
  comentario   TEXT,
  publicar     BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMPTZ,
  
  CONSTRAINT avaliacao_nota_chk CHECK (nota BETWEEN 1 AND 5),
  CONSTRAINT avaliacao_inscricao_unique UNIQUE (inscricao_id)
);
```

**Indexes:**
- `avaliacao_turma_idx` — Find public ratings for a class

**Triggers:**
- `avaliacao_sync_curso_rating` — Recalculate `curso.rating` from average of public evaluations
- `avaliacao_validate_turma` — Ensure `turma_id` matches `inscricao.turma_id`
- `avaliacao_set_updated_at` — Auto-update timestamp

**RLS:**
- Public can see ratings where `publicar = true`
- Students can see/submit their own evaluations
- Admin can see all and manage

**Notes:**
- Soft delete via `deleted_at`
- One evaluation per enrollment (unique constraint)

---

### 9. lead — Sales Leads / CRM

```sql
CREATE TABLE public.lead (
  id              VARCHAR(80) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nome            VARCHAR(180) NOT NULL,
  email           VARCHAR(180),
  telefone        VARCHAR(30),
  tipo            public.tipo_lead NOT NULL DEFAULT 'Curso',
  orgao           VARCHAR(180),
  num_participantes INTEGER,
  tema_interesse  VARCHAR(240),
  curso_id        VARCHAR(80) REFERENCES public.curso(id) ON DELETE SET NULL,
  status_crm      public.status_lead NOT NULL DEFAULT 'Novo',
  mensagem        TEXT,
  utm_source      VARCHAR(120),
  origem          VARCHAR(80),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  
  CONSTRAINT lead_num_participantes_chk CHECK (num_participantes IS NULL OR num_participantes > 0)
);
```

**Indexes:**
- `lead_status_created_idx` — Query leads by status and creation date
- `lead_email_idx` — Find by email (case-insensitive)

**RLS:**
- Public/authenticated can insert (form submissions)
- Only admin can read/update

**Notes:**
- Tracks multiple lead sources (contact forms, newsletter, etc.)
- Soft delete via `deleted_at`

---

### 10. rate_limit_store — Global Rate Limiting

```sql
CREATE TABLE public.rate_limit_store (
  identifier  TEXT NOT NULL,
  window_start BIGINT NOT NULL,
  count       INTEGER NOT NULL DEFAULT 0,
  expires_at  TIMESTAMPTZ NOT NULL,
  
  PRIMARY KEY (identifier, window_start)
);
```

**Indexes:**
- `idx_rate_limit_expires` — Cleanup of expired entries

**RLS:**
- Only `service_role` can access (via Edge Functions)
- Accessible via `rate_limit_increment()` function

**Notes:**
- Atomic counter for distributed rate limiting across Deno Deploy isolates
- Replaces in-memory Map approach

---

## Indexes

### Performance Indexes

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| aluno | aluno_email_unique_idx | UNIQUE | Prevent duplicate emails |
| aluno | aluno_cpf_unique_idx | UNIQUE | Prevent duplicate CPF |
| aluno | aluno_user_id_idx | B-TREE | FK to auth.users |
| curso | curso_status_idx | B-TREE | Query by status |
| curso | curso_categoria_idx | B-TREE | Filter by category |
| curso | curso_trilha_idx | B-TREE | Find by training path |
| curso_instrutor | curso_instrutor_curso_idx | B-TREE | Find instructors for course |
| curso_instrutor | curso_instrutor_instrutor_idx | B-TREE | Find courses for instructor |
| curso_instrutor | curso_instrutor_um_principal_idx | UNIQUE | Unique principal per course |
| turma | turma_curso_idx | B-TREE | Find classes for course |
| turma | turma_status_data_idx | B-TREE | Query by status + date |
| inscricao | inscricao_aluno_idx | B-TREE | Find enrollments for student |
| inscricao | inscricao_turma_idx | B-TREE | Find enrollments in class |
| inscricao | inscricao_status_idx | B-TREE | Query by status |
| inscricao | inscricao_aluno_turma_active_idx | UNIQUE | Prevent duplicates |
| avaliacao | avaliacao_turma_idx | B-TREE | Find public ratings |
| lead | lead_status_created_idx | B-TREE | CRM queries |
| lead | lead_email_idx | B-TREE | Find by email |
| rate_limit_store | idx_rate_limit_expires | B-TREE | Cleanup task |

---

## Functions & Triggers

### Public Functions

#### 1. `set_updated_at()` — Update Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

**Used by:** All tables with `updated_at` column.

---

#### 2. `handle_new_user()` — Auto-create Profile

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
```

**Trigger:** `on_auth_user_created` — Runs after `INSERT` on `auth.users`.

**Purpose:** Auto-create profile with `user` role when new Supabase user is registered.

---

#### 3. `is_admin()` — Check Admin Role

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  )
$$;
```

**Purpose:** Helper for RLS policies. Used in all admin-gated policies.

---

#### 4. `registrar_inscricao_publica()` — Public Enrollment

```sql
CREATE OR REPLACE FUNCTION public.registrar_inscricao_publica(
  p_nome_completo VARCHAR,
  p_email VARCHAR,
  p_cpf VARCHAR,
  p_telefone VARCHAR,
  p_cargo VARCHAR,
  p_orgao VARCHAR,
  p_tipo_aluno public.tipo_aluno,
  p_turma_id VARCHAR(80),
  p_tipo_inscricao VARCHAR,
  p_forma_pagamento public.forma_pagamento,
  p_observacoes TEXT DEFAULT NULL
) RETURNS VARCHAR(80) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Validation: turma exists, has spots, is open
  -- Upsert: create student if new, update if exists
  -- Check: no duplicate enrollment in class
  -- Insert: new enrollment
  -- Update: increment turma.vagas_preenchidas
  -- Return: inscricao_id
END;
$$;
```

**Callable by:** `anon`, `authenticated` (form submissions).

**Validations:**
- Turma exists and is not deleted
- Turma status is `Aberta` or `PoucasVagas`
- Turma has available spots
- No duplicate enrollment for student + class combo

---

#### 5. `sync_turma_status()` — Auto-update Class Status

```sql
CREATE OR REPLACE FUNCTION public.sync_turma_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Don't alter manually-set statuses (Cancelada, Realizada, EmBreve)
  IF NEW.status IN ('Cancelada', 'Realizada', 'EmBreve') THEN
    RETURN NEW;
  END IF;

  NEW.status := CASE
    WHEN NEW.vagas_preenchidas >= NEW.vagas_total THEN 'Encerrada'::status_turma
    WHEN (NEW.vagas_total - NEW.vagas_preenchidas) <= GREATEST(5, NEW.vagas_total / 5)
      THEN 'PoucasVagas'::status_turma
    ELSE 'Aberta'::status_turma
  END;

  RETURN NEW;
END;
$$;
```

**Trigger:** `turma_sync_status` — Runs `BEFORE UPDATE OF vagas_preenchidas`.

---

#### 6. `validate_avaliacao_turma()` — Consistency Check

```sql
CREATE OR REPLACE FUNCTION public.validate_avaliacao_turma()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Ensure avaliacao.turma_id matches inscricao.turma_id
  -- Raise exception if mismatch
  RETURN NEW;
END;
$$;
```

**Trigger:** `avaliacao_validate_turma` — Runs `BEFORE INSERT OR UPDATE`.

---

#### 7. `sync_curso_rating()` — Recalculate Course Rating

```sql
CREATE OR REPLACE FUNCTION public.sync_curso_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Find turma.curso_id from avaliacao.turma_id
  -- Recalculate average rating from public evaluations
  -- Update curso.rating
  RETURN COALESCE(NEW, OLD);
END;
$$;
```

**Trigger:** `avaliacao_sync_curso_rating` — Runs `AFTER INSERT/UPDATE/DELETE` on `avaliacao`.

---

#### 8. `sync_curso_total_alunos()` — Maintain Student Counter

```sql
CREATE OR REPLACE FUNCTION public.sync_curso_total_alunos()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Track enrollment state changes
  -- +1 if status_inscricao changes to Confirmada
  -- -1 if status_inscricao changes from Confirmada to Cancelada
  -- Update curso.total_alunos
  RETURN COALESCE(NEW, OLD);
END;
$$;
```

**Trigger:** `inscricao_sync_curso_total_alunos` — Runs `AFTER INSERT/UPDATE`.

---

#### 9. `rate_limit_increment()` — Atomic Counter

```sql
CREATE OR REPLACE FUNCTION public.rate_limit_increment(
  p_identifier TEXT,
  p_window_ms BIGINT,
  p_max_requests INTEGER
) RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Truncate current time to window boundary
  -- Upsert: increment count or initialize to 1
  -- Return count after increment
  -- Edge Function compares against p_max_requests
END;
$$;
```

**Callable by:** Only `service_role` (revoked from `public`, `anon`, `authenticated`).

**Used by:** Deno Deploy Edge Functions for distributed rate limiting.

---

## RLS Policies

### Table: `profiles`

| Policy | Operation | Target | Condition |
|--------|-----------|--------|-----------|
| `profiles_owner_select` | SELECT | authenticated | `id = auth.uid()` |
| `profiles_owner_update_role_locked` | UPDATE | authenticated | `id = auth.uid() AND role unchanged` |

---

### Table: `aluno`

| Policy | Operation | Target | Condition |
|--------|-----------|--------|-----------|
| `aluno_owner_or_admin_select` | SELECT | authenticated | `user_id = auth.uid() OR is_admin()` |
| `aluno_owner_update` | UPDATE | authenticated | `user_id = auth.uid() OR is_admin()` |
| `aluno_admin_insert` | INSERT | authenticated | `is_admin()` |

---

### Table: `curso`

| Policy | Operation | Target | Condition |
|--------|-----------|--------|-----------|
| `catalogo_publico_curso_select` | SELECT | anon, authenticated | `deleted_at IS NULL AND status IN ('Ativo', 'Destaque', 'EmBreve')` |

---

### Table: `instrutor`

| Policy | Operation | Target | Condition |
|--------|-----------|--------|-----------|
| `catalogo_publico_instrutor_select` | SELECT | anon, authenticated | `deleted_at IS NULL AND status = 'Ativo'` |

---

### Table: `curso_instrutor`

| Policy | Operation | Target | Condition |
|--------|-----------|--------|-----------|
| `catalogo_publico_curso_instrutor_select` | SELECT | anon, authenticated | `true` (always visible) |

---

### Table: `turma`

| Policy | Operation | Target | Condition |
|--------|-----------|--------|-----------|
| `catalogo_publico_turma_select` | SELECT | anon, authenticated | `deleted_at IS NULL` |

---

### Table: `inscricao`

| Policy | Operation | Target | Condition |
|--------|-----------|--------|-----------|
| `inscricao_owner_or_admin_select` | SELECT | authenticated | `aluno_id IN (SELECT id FROM aluno WHERE user_id = auth.uid()) OR is_admin()` |
| `inscricao_admin_insert` | INSERT | authenticated | `is_admin()` |
| `inscricao_admin_update` | UPDATE | authenticated | `is_admin()` |
| Public insert | INSERT | anon, authenticated | Via `registrar_inscricao_publica()` function |

---

### Table: `lead`

| Policy | Operation | Target | Condition |
|--------|-----------|--------|-----------|
| `lead_public_insert` | INSERT | anon, authenticated | `true` (always allow) |
| `lead_admin_select` | SELECT | authenticated | `is_admin()` |
| `lead_admin_update` | UPDATE | authenticated | `is_admin()` |

---

### Table: `avaliacao`

| Policy | Operation | Target | Condition |
|--------|-----------|--------|-----------|
| `avaliacao_public_or_owner_select` | SELECT | anon, authenticated | `publicar = true OR owner OR is_admin()` |
| `avaliacao_owner_insert` | INSERT | authenticated | Student owns enrollment |
| `avaliacao_admin_update` | UPDATE | authenticated | `is_admin()` |

---

### Table: `rate_limit_store`

| Policy | Operation | Target | Condition |
|--------|-----------|--------|-----------|
| (none) | ALL | service_role only | RLS blocks all; accessed via function |

---

## Access Patterns

### Public Catalog (anon, authenticated)

**Query:** Get available courses with instructors

```sql
SELECT 
  c.id, c.titulo, c.descricao_curta, c.modalidade, c.rating,
  array_agg(i.nome) AS instrutores
FROM curso c
LEFT JOIN curso_instrutor ci ON ci.curso_id = c.id
LEFT JOIN instrutor i ON i.id = ci.instrutor_id
WHERE c.deleted_at IS NULL
  AND c.status IN ('Ativo', 'Destaque', 'EmBreve')
GROUP BY c.id
ORDER BY c.destaque DESC, c.updated_at DESC;
```

**RLS Impact:** Rows filtered by `catalogo_publico_curso_select` policy.

---

### Student Dashboard (authenticated)

**Query:** Get student's enrollments with progress

```sql
SELECT 
  i.id, t.data_inicio, c.titulo, i.status_inscricao, i.status_pagamento
FROM inscricao i
JOIN turma t ON t.id = i.turma_id
JOIN curso c ON c.id = t.curso_id
JOIN aluno a ON a.id = i.aluno_id
WHERE a.user_id = auth.uid()
ORDER BY t.data_inicio DESC;
```

**RLS Impact:** Only enrollments where student's `aluno.user_id = auth.uid()`.

---

### Admin CRM (authenticated + is_admin)

**Query:** Get new leads for follow-up

```sql
SELECT * FROM lead
WHERE status_crm = 'Novo'
  AND created_at > now() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

**RLS Impact:** Only admins can see any leads.

---

## Performance Notes

- **Denormalized fields** (`curso.rating`, `curso.total_alunos`) are maintained via triggers — cheap reads, slightly more expensive writes
- **Soft deletes** add WHERE clauses to most queries; indexed on `deleted_at` is not necessary
- **JSONB fields** (ementa, objetivos) are not indexed; queries full-text search are not optimal
- **Generated stored column** `vagas_restantes` is computed at write time, fast for reads
- **RLS policies** use `auth.uid()` and `is_admin()` lookups — minimal overhead

---

**Last Updated:** 2026-06-22  
**Stability:** ✅ Stable (v1.0)

---

*Generated by @data-engineer during Brownfield Discovery Phase 2*
