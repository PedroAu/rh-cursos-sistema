-- Story REC-104 — implementar cliente público anon (fecha FND-03)
--
-- Cobre a migration 20260716100000_rec104_grant_avaliacao_select.sql e a
-- troca de `src/lib/supabase/rh-cursos-api.ts` para usar
-- `createSupabasePublicServerClient()` (chave anon) no caminho público.
--
-- Como o caminho público agora executa sob o papel `anon` de verdade (e não
-- mais sob `service_role`), esta suíte valida, com `set local role anon`,
-- que: (a) o catálogo público continua funcionando com dados reais visíveis
-- (curso publicado, turma, instrutor ativo, avaliação publicada); (b) um
-- recurso rascunho/arquivado/excluído/não publicado deixa de vazar, porque
-- as RLS policies existentes passam a ser a barreira ativa (antes eram
-- bypassadas pelo service_role); (c) as colunas privadas de REC-103
-- continuam inacessíveis a `anon`.

begin;

select plan(14);

-- ── Fixtures ──────────────────────────────────────────────────────────────

insert into public.instrutor (id, nome, email, telefone, bio, status)
values
  ('rec104-instrutor-ativo', 'Instrutor REC-104 Ativo', 'rec104-instrutor@rhcursos.test', '61999990010', 'Bio sintética.', 'Ativo'),
  ('rec104-instrutor-inativo', 'Instrutor REC-104 Inativo', 'rec104-instrutor-inativo@rhcursos.test', '61999990011', 'Bio sintética.', 'Inativo')
on conflict (id) do update set status = excluded.status, deleted_at = null;

insert into public.curso (
  id, titulo, slug, descricao_curta, descricao, ementa, objetivos, beneficios,
  publico_alvo, carga_horaria, modalidade, nivel, preco_base, status, destaque
)
values
  ('rec104-curso-publico', 'REC-104 Curso Público', 'rec-104-curso-publico', 'Curso sintético.', 'Curso sintético.', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 8, 'Online', 'Basico', 100, 'Ativo', false),
  ('rec104-curso-rascunho', 'REC-104 Curso Rascunho', 'rec-104-curso-rascunho', 'Curso sintético.', 'Curso sintético.', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 8, 'Online', 'Basico', 100, 'Rascunho', false)
on conflict (id) do update set status = excluded.status, deleted_at = null;

insert into public.turma (
  id, curso_id, instrutor_id, data_inicio, data_fim, horario, local,
  vagas_total, vagas_preenchidas, preco_turma, modalidade, status, observacoes
)
values
  ('rec104-turma-aberta', 'rec104-curso-publico', 'rec104-instrutor-ativo', '2026-09-01', '2026-09-01', '09:00 às 17:00', 'Online ao vivo', 10, 0, 100, 'Online', 'Aberta', 'Nota interna REC-104.'),
  ('rec104-turma-excluida', 'rec104-curso-publico', 'rec104-instrutor-ativo', '2026-09-01', '2026-09-01', '09:00 às 17:00', 'Online ao vivo', 10, 0, 100, 'Online', 'Aberta', 'Nota interna REC-104 (soft-deleted).')
on conflict (id) do update set
  curso_id = excluded.curso_id,
  status = excluded.status,
  deleted_at = null;

update public.turma set deleted_at = now() where id = 'rec104-turma-excluida';

-- Dois alunos/inscrições distintos porque `avaliacao_inscricao_unique` exige
-- uma inscrição própria por avaliação (não é possível ligar duas avaliações
-- à mesma inscrição).
insert into public.aluno (id, nome_completo, email, tipo_aluno)
values
  ('rec104-aluno', 'Aluno REC-104', 'rec-104-aluno@rhcursos.test', 'PF'),
  ('rec104-aluno-2', 'Aluno REC-104 Dois', 'rec-104-aluno-2@rhcursos.test', 'PF')
on conflict (id) do update set deleted_at = null;

insert into public.inscricao (id, aluno_id, turma_id, status_inscricao, status_pagamento)
values
  ('rec104-inscricao', 'rec104-aluno', 'rec104-turma-aberta', 'Confirmada', 'Pago'),
  ('rec104-inscricao-2', 'rec104-aluno-2', 'rec104-turma-aberta', 'Confirmada', 'Pago')
on conflict (id) do update set aluno_id = excluded.aluno_id, turma_id = excluded.turma_id;

insert into public.avaliacao (id, inscricao_id, turma_id, nota, comentario, publicar)
values ('rec104-avaliacao-publicada', 'rec104-inscricao', 'rec104-turma-aberta', 5, 'Depoimento sintético REC-104 publicado.', true)
on conflict (id) do update set publicar = excluded.publicar;

insert into public.avaliacao (id, inscricao_id, turma_id, nota, comentario, publicar)
values ('rec104-avaliacao-nao-publicada', 'rec104-inscricao-2', 'rec104-turma-aberta', 3, 'Depoimento sintético REC-104 não publicado.', false)
on conflict (id) do update set publicar = excluded.publicar;

-- ── (a) Catálogo público continua funcionando com dados reais sob `anon` ──

set local role anon;
select set_config('request.jwt.claim.sub', '', true);

select ok(
  exists(select 1 from public.curso where id = 'rec104-curso-publico'),
  'anon enxerga curso publicado (status Ativo) via RLS real'
);

select ok(
  exists(select 1 from public.turma_publica where id = 'rec104-turma-aberta'),
  'anon enxerga turma aberta via turma_publica'
);

select ok(
  exists(select 1 from public.instrutor_publico where id = 'rec104-instrutor-ativo'),
  'anon enxerga instrutor ativo via instrutor_publico'
);

select ok(
  exists(select 1 from public.avaliacao where id = 'rec104-avaliacao-publicada'),
  'anon enxerga avaliação publicada (grant de REC-104 aplicado)'
);

-- ── (b) Rascunho/arquivado/excluído/não publicado não vazam sob `anon` ────

select ok(
  not exists(select 1 from public.curso where id = 'rec104-curso-rascunho'),
  'anon NAO enxerga curso em Rascunho (RLS catalogo_publico_curso_select agora ativa)'
);

select ok(
  not exists(select 1 from public.turma_publica where id = 'rec104-turma-excluida'),
  'anon NAO enxerga turma soft-deleted via turma_publica'
);

select ok(
  not exists(select 1 from public.instrutor_publico where id = 'rec104-instrutor-inativo'),
  'anon NAO enxerga instrutor Inativo via instrutor_publico'
);

select ok(
  not exists(select 1 from public.avaliacao where id = 'rec104-avaliacao-nao-publicada'),
  'anon NAO enxerga avaliação não publicada (RLS avaliacao_public_or_owner_select ativa)'
);

-- ── Regressão: colunas privadas de REC-103 continuam bloqueadas ──────────

reset role;

select ok(
  not has_column_privilege('anon', 'public.instrutor', 'email', 'select'),
  'regressão REC-103: anon continua sem select de instrutor.email'
);

select ok(
  not has_column_privilege('anon', 'public.turma', 'observacoes', 'select'),
  'regressão REC-103: anon continua sem select de turma.observacoes'
);

-- ── Grants: novo privilégio concedido apenas onde declarado ──────────────

select ok(
  has_table_privilege('anon', 'public.avaliacao', 'SELECT'),
  'REC-104: anon recebe select de tabela em public.avaliacao'
);

select ok(
  has_table_privilege('authenticated', 'public.avaliacao', 'SELECT'),
  'REC-104: authenticated recebe select de tabela em public.avaliacao (mesmo papel da RLS existente)'
);

-- ── Regressão: catálogo/blog/conteúdo público inalterados ────────────────

select ok(
  has_table_privilege('anon', 'public.post_blog', 'SELECT')
    and has_table_privilege('anon', 'public.trilha', 'SELECT')
    and has_table_privilege('anon', 'public.curso_public_content', 'SELECT'),
  'regressão: grants públicos de post_blog/trilha/curso_public_content permanecem inalterados'
);

-- ── Regressão: caminho admin (service_role) não é afetado ────────────────

select ok(
  exists(select 1 from public.curso where id = 'rec104-curso-rascunho'),
  'service_role (admin) continua enxergando curso em Rascunho, sem alteração de RLS/grants'
);

select * from finish();

rollback;
