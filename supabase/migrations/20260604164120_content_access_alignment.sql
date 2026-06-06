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
