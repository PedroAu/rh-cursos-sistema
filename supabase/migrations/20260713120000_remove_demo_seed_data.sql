-- Remove os dados de DEMO carregados por 20260605000000_seed_initial_data.sql
-- Motivo: o seed populou o projeto de produção com um catálogo fictício
-- (trilhas, instrutores, cursos, turmas e posts) que aparecia nas páginas
-- públicas e no admin. Esta migration remove exatamente esses registros,
-- escopada pelos IDs fixos do seed — não afeta cadastros reais.
--
-- Ordem de exclusão respeita as FKs (RESTRICT):
--   avaliacao/inscricao -> turma -> curso/curso_instrutor -> instrutor -> trilha
-- post_blog é removido explicitamente (curso_id era ON DELETE SET NULL).
--
-- Idempotente: DELETE ... WHERE id IN (...) é seguro para reexecução e,
-- em um `db reset`, roda após o seed, garantindo estado final limpo.

begin;

create temporary table tmp_demo_turma_ids (id varchar(80) primary key) on commit drop;
insert into tmp_demo_turma_ids (id) values
  ('class-1-1'),('class-1-2'),('class-1-3'),('class-1-4'),('class-1-5'),
  ('class-2-1'),('class-2-2'),('class-2-3'),('class-2-4'),('class-2-5'),
  ('class-3-1'),('class-3-2');

create temporary table tmp_demo_curso_ids (id varchar(80) primary key) on commit drop;
insert into tmp_demo_curso_ids (id) values
  ('course-dp-1'),('course-dp-2'),('course-licitacoes-1'),('course-licitacoes-2'),
  ('course-pessoas-1'),('course-pessoas-2'),('course-comunicacao-1'),('course-comunicacao-2'),
  ('course-auditoria-1'),('course-auditoria-2'),('course-tech-1'),('course-tech-2');

create temporary table tmp_demo_instrutor_ids (id varchar(80) primary key) on commit drop;
insert into tmp_demo_instrutor_ids (id) values
  ('inst-1'),('inst-2'),('inst-3'),('inst-4'),('inst-5'),('inst-6'),('inst-7'),('inst-8');

do $$
declare
  reused_course_links integer;
  reused_class_links integer;
begin
  select count(*)
    into reused_course_links
    from public.curso_instrutor ci
   where ci.instrutor_id in (select id from tmp_demo_instrutor_ids)
     and ci.curso_id not in (select id from tmp_demo_curso_ids);

  select count(*)
    into reused_class_links
    from public.turma t
   where t.instrutor_id in (select id from tmp_demo_instrutor_ids)
     and t.id not in (select id from tmp_demo_turma_ids);

  if reused_course_links > 0 or reused_class_links > 0 then
    raise exception
      'remove_demo_seed_data abortada: instrutores demo foram reutilizados por dados reais (curso_instrutor=% links, turma=% links). Reassocie os registros antes de aplicar a migration.',
      reused_course_links,
      reused_class_links;
  end if;
end $$;

-- IDs demo do seed
-- trilhas:   path-dp, path-licitacoes, path-pessoas, path-comunicacao, path-auditoria, path-tech
-- instrutor: inst-1 .. inst-8
-- cursos:    course-dp-1/2, course-licitacoes-1/2, course-pessoas-1/2,
--            course-comunicacao-1/2, course-auditoria-1/2, course-tech-1/2
-- turmas:    class-1-1..5, class-2-1..5, class-3-1, class-3-2
-- posts:     post-1 .. post-8

-- 1. Avaliações e inscrições vinculadas às turmas demo (RESTRICT em turma)
delete from public.avaliacao
where turma_id in (select id from tmp_demo_turma_ids);

delete from public.inscricao
where turma_id in (select id from tmp_demo_turma_ids);

-- 2. Turmas demo (RESTRICT em curso — precisa sair antes dos cursos)
delete from public.turma
where id in (select id from tmp_demo_turma_ids);

-- 3. Posts de blog demo (curso_id era SET NULL, remover explicitamente)
delete from public.post_blog
where id in (
  'post-1','post-2','post-3','post-4','post-5','post-6','post-7','post-8'
);

-- 4. Vínculos curso-instrutor demo (CASCADE em curso, mas explícito por clareza)
delete from public.curso_instrutor
where curso_id in (select id from tmp_demo_curso_ids);

-- 5. Cursos demo (curso_public_content tem CASCADE; lead.curso_id vira NULL)
delete from public.curso
where id in (select id from tmp_demo_curso_ids);

-- 6. Instrutores demo (RESTRICT em curso_instrutor/turma — já removidos acima)
delete from public.instrutor
where id in (select id from tmp_demo_instrutor_ids);

-- 7. Trilhas demo (curso.trilha_id era SET NULL)
delete from public.trilha
where id in (
  'path-dp','path-licitacoes','path-pessoas','path-comunicacao','path-auditoria','path-tech'
);

commit;
