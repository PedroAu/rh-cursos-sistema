-- ADR-015 Fase 3 (Story ADR015-F3) — persistência de múltiplas categorias por curso
-- Adiciona public.curso.categorias (text[]), com backfill a partir de
-- public.curso.categoria. A partir desta migration, `categorias` é o campo
-- autoritativo; `categoria` passa a ser derivado por trigger e mantido
-- apenas por compatibilidade com o índice parcial curso_categoria_idx e com
-- leitores legados que ainda esperam uma única categoria.
--
-- Decisão travada (@po, story ADR015-F3, AC1): a sincronização
-- categoria = categorias[1] é feita por trigger de banco (não pela
-- aplicação), mesmo raciocínio da Story 17.4 — nenhum caminho de escrita
-- futuro (incluindo seeds e clients ainda não escritos) deve poder
-- reintroduzir a inconsistência entre os dois campos.

alter table public.curso
  add column if not exists categorias text[] not null default '{}'::text[];

update public.curso
  set categorias = array[categoria]
  where categorias = '{}'::text[]
    and categoria is not null;

create or replace function public.curso_sync_categoria()
returns trigger
language plpgsql
as $$
begin
  if new.categorias is null then
    new.categorias := '{}'::text[];
  end if;

  if tg_op = 'UPDATE'
    and new.categoria is distinct from old.categoria
    and new.categorias is not distinct from old.categorias then
    -- update legado que só altera `categoria` -> vira a única categoria
    new.categorias := case
      when new.categoria is null then '{}'::text[]
      else array[new.categoria]
    end;
  end if;

  if array_length(new.categorias, 1) is null and new.categoria is not null then
    -- insert/update legado sem `categorias` -> deriva de `categoria`
    new.categorias := array[new.categoria];
  end if;

  -- `categorias` é autoritativo a partir daqui: `categoria` sempre reflete
  -- o primeiro elemento, nunca o inverso.
  if array_length(new.categorias, 1) is not null then
    new.categoria := new.categorias[1];
  else
    new.categoria := null;
  end if;

  return new;
end;
$$;

drop trigger if exists curso_sync_categoria_trg on public.curso;
create trigger curso_sync_categoria_trg
before insert or update on public.curso
for each row execute function public.curso_sync_categoria();

comment on column public.curso.categorias is
  'Categorias do curso (multi-valor, autoritativo). public.curso.categoria permanece populado como categorias[1] para compatibilidade com curso_categoria_idx e leitores legados (ADR-015 Fase 3); o trigger curso_sync_categoria_trg mantém os dois campos coerentes, inclusive para writes legados que só tocam categoria.';

-- curso_categoria_idx (sprint3_performance) permanece válido: `categoria`
-- continua populado pelo trigger. Índice complementar para busca/filtro
-- por qualquer categoria do array (valor de negócio da story: catálogo
-- público/filtro deixam de sub-representar cursos multi-categoria).
create index if not exists curso_categorias_gin_idx
  on public.curso using gin (categorias);

-- Sem alteração de RLS/GRANT: a única policy de `curso`
-- (catalogo_publico_curso_select) é filtrada por linha (deleted_at/status),
-- não por coluna, e os GRANTs em public.curso são table-level
-- (20260604164120_content_access_alignment.sql) — `categorias` fica
-- automaticamente coberta pelo mesmo acesso já concedido às demais colunas,
-- sem exposição adicional.
