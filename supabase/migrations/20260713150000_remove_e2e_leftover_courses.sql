-- Remove cursos de teste e2e que ficaram órfãos no catálogo de produção.
-- Motivo: tests/admin-crud.spec.ts cria cursos via UI com título
-- "[E2E] <timestamp> curso" (slug "e2e-<timestamp>-curso") e os apaga ao
-- final do teste; quando o teste falha antes da etapa de exclusão, o
-- registro permanece no banco e passa a aparecer nas páginas públicas e
-- no build estático (generateStaticParams). Esta migration limpa esses
-- resíduos pelo padrão de slug, sem afetar cadastros reais.
--
-- Ordem de exclusão respeita as FKs (RESTRICT):
--   avaliacao/inscricao -> turma -> curso_instrutor -> curso
-- lead.curso_id e post_blog.curso_id são ON DELETE SET NULL e
-- curso_public_content.curso_id é ON DELETE CASCADE — nenhuma ação extra.
--
-- Idempotente: escopado por slug like 'e2e-%-curso', seguro para reexecução.

-- 1. Avaliações vinculadas às turmas dos cursos e2e (RESTRICT em turma)
delete from public.avaliacao
where turma_id in (
  select t.id
  from public.turma t
  join public.curso c on c.id = t.curso_id
  where c.slug like 'e2e-%-curso'
);

-- 2. Inscrições vinculadas às turmas dos cursos e2e (RESTRICT em turma)
delete from public.inscricao
where turma_id in (
  select t.id
  from public.turma t
  join public.curso c on c.id = t.curso_id
  where c.slug like 'e2e-%-curso'
);

-- 3. Turmas dos cursos e2e (RESTRICT em curso)
delete from public.turma
where curso_id in (
  select id from public.curso where slug like 'e2e-%-curso'
);

-- 4. Vínculos curso-instrutor dos cursos e2e (CASCADE em curso, explícito por clareza)
delete from public.curso_instrutor
where curso_id in (
  select id from public.curso where slug like 'e2e-%-curso'
);

-- 5. Cursos e2e
delete from public.curso
where slug like 'e2e-%-curso';
