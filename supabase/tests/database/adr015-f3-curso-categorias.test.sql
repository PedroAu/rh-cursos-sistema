-- Story ADR015-F3 — persistência de múltiplas categorias por curso
-- Cobre a migration 20260715090000_curso_categorias_array.sql:
-- coluna `categorias`, trigger de sincronização com `categoria` e
-- compatibilidade com escritas legadas que só tocam `categoria`.

begin;

select plan(9);

-- 1) Insert só com `categoria` (caller legado) -> trigger deriva `categorias`.
insert into public.curso (
  id, titulo, slug, descricao_curta, descricao, ementa, objetivos, beneficios,
  publico_alvo, carga_horaria, modalidade, nivel, categoria, preco_base, status, destaque
)
values (
  'adr015f3-course-legacy', 'ADR015-F3 Curso Legado', 'adr015-f3-curso-legado',
  'Curso sintético.', 'Curso sintético.', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  8, 'Online', 'Basico', 'Tecnologia', 100, 'Ativo', false
)
on conflict (id) do update set titulo = excluded.titulo, deleted_at = null;

select is(
  (select categorias from public.curso where id = 'adr015f3-course-legacy'),
  array['Tecnologia'],
  'insert legado (só categoria) deriva categorias = [categoria]'
);

select is(
  (select categoria from public.curso where id = 'adr015f3-course-legacy'),
  'Tecnologia',
  'insert legado mantém categoria original'
);

-- 2) Insert com `categorias` completo (caller multi-categoria) -> categoria = categorias[1].
insert into public.curso (
  id, titulo, slug, descricao_curta, descricao, ementa, objetivos, beneficios,
  publico_alvo, carga_horaria, modalidade, nivel, categorias, preco_base, status, destaque
)
values (
  'adr015f3-course-multi', 'ADR015-F3 Curso Multi', 'adr015-f3-curso-multi',
  'Curso sintético.', 'Curso sintético.', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  8, 'Online', 'Basico', array['Gestão Pública', 'Tecnologia', 'Saúde'], 100, 'Ativo', false
)
on conflict (id) do update set titulo = excluded.titulo, deleted_at = null;

select is(
  (select categorias from public.curso where id = 'adr015f3-course-multi'),
  array['Gestão Pública', 'Tecnologia', 'Saúde'],
  'insert multi-categoria preserva o array completo'
);

select is(
  (select categoria from public.curso where id = 'adr015f3-course-multi'),
  'Gestão Pública',
  'trigger deriva categoria = categorias[1] para o array completo'
);

-- 3) Round-trip: update que substitui `categorias` por um novo array (ex.: admin
-- re-salvando o form com N categorias) -> categoria acompanha a nova primeira entrada.
update public.curso
  set categorias = array['Auditoria', 'Compliance']
  where id = 'adr015f3-course-multi';

select is(
  (select categorias from public.curso where id = 'adr015f3-course-multi'),
  array['Auditoria', 'Compliance'],
  'round-trip: update de categorias preserva as N categorias'
);

select is(
  (select categoria from public.curso where id = 'adr015f3-course-multi'),
  'Auditoria',
  'round-trip: categoria acompanha a nova categorias[1]'
);

-- 4) Update legado que só toca `categoria` (caller antigo, sem categorias) ->
-- trigger reduz categorias para a categoria única, sem preservar as demais.
update public.curso
  set categoria = 'Only'
  where id = 'adr015f3-course-multi';

select is(
  (select categorias from public.curso where id = 'adr015f3-course-multi'),
  array['Only'],
  'update legado (só categoria) reseta categorias para [categoria]'
);

-- 5) `categoria = null` limpa `categorias`.
update public.curso
  set categoria = null
  where id = 'adr015f3-course-legacy';

select is(
  (select categorias from public.curso where id = 'adr015f3-course-legacy'),
  array[]::text[],
  'categoria = null esvazia categorias'
);

select is(
  (select categoria from public.curso where id = 'adr015f3-course-legacy'),
  null,
  'categoria permanece null'
);

select * from finish();

rollback;
