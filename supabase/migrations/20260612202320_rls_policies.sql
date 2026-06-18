-- =============================================================
-- RH Cursos — Row Level Security
-- Regra geral:
--   Catálogo (courses/turmas/instructors): SELECT público; escrita só admin.
--   leads/enrollments: INSERT público (forms); leitura/edição só admin.
--   profiles: usuário lê o próprio; admin lê/edita todos.
--   settings: só admin.
-- =============================================================

alter table profiles    enable row level security;
alter table instructors enable row level security;
alter table courses     enable row level security;
alter table turmas      enable row level security;
alter table enrollments enable row level security;
alter table leads       enable row level security;
alter table settings    enable row level security;

-- ---------- PROFILES ----------
create policy "profiles: self read"
  on profiles for select
  using ( id = auth.uid() or public.is_admin() );

create policy "profiles: self update (sem trocar role)"
  on profiles for update
  using ( id = auth.uid() )
  with check ( id = auth.uid() and role = (select role from profiles where id = auth.uid()) );

create policy "profiles: admin full"
  on profiles for all
  using ( public.is_admin() )
  with check ( public.is_admin() );

-- ---------- INSTRUCTORS (catálogo público) ----------
create policy "instructors: public read"
  on instructors for select using ( true );
create policy "instructors: admin write"
  on instructors for all
  using ( public.is_admin() ) with check ( public.is_admin() );

-- ---------- COURSES ----------
create policy "courses: public read"
  on courses for select using ( true );
create policy "courses: admin write"
  on courses for all
  using ( public.is_admin() ) with check ( public.is_admin() );

-- ---------- TURMAS ----------
create policy "turmas: public read"
  on turmas for select using ( true );
create policy "turmas: admin write"
  on turmas for all
  using ( public.is_admin() ) with check ( public.is_admin() );

-- ---------- ENROLLMENTS (inscrição pública; gestão só admin) ----------
create policy "enrollments: public insert"
  on enrollments for insert with check ( true );
create policy "enrollments: admin read/manage"
  on enrollments for select using ( public.is_admin() );
create policy "enrollments: admin update"
  on enrollments for update using ( public.is_admin() ) with check ( public.is_admin() );
create policy "enrollments: admin delete"
  on enrollments for delete using ( public.is_admin() );

-- ---------- LEADS (forms públicos; gestão só admin) ----------
create policy "leads: public insert"
  on leads for insert with check ( true );
create policy "leads: admin read/manage"
  on leads for select using ( public.is_admin() );
create policy "leads: admin update"
  on leads for update using ( public.is_admin() ) with check ( public.is_admin() );
create policy "leads: admin delete"
  on leads for delete using ( public.is_admin() );

-- ---------- SETTINGS (só admin) ----------
create policy "settings: admin all"
  on settings for all
  using ( public.is_admin() ) with check ( public.is_admin() );
