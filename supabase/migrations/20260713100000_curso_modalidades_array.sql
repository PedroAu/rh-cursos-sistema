-- ADR-015 Fase 3 — múltiplas modalidades reais por curso
-- Adiciona public.curso.modalidades (array de modalidade_curso), com backfill
-- a partir de public.curso.modalidade. A coluna singular é mantida como
-- "modalidade principal" durante a transição (ver ADR-015).
--
-- Não usamos um DEFAULT estático em modalidades: como o app ainda faz
-- updates legados que só tocam a coluna `modalidade` (ADR-015, problema 2),
-- um default fixo quebraria a check constraint sempre que modalidade != 'Online'.
-- Em vez disso, um trigger mantém os dois campos coerentes durante a transição.

alter table public.curso
  add column if not exists modalidades public.modalidade_curso[];
update public.curso
  set modalidades = array[modalidade]
  where modalidades is null;
alter table public.curso
  alter column modalidades set not null;
create or replace function public.curso_sync_modalidades()
returns trigger
language plpgsql
as $$
begin
  if new.modalidades is null or array_length(new.modalidades, 1) is null then
    -- insert legado sem modalidades -> deriva da modalidade principal
    new.modalidades := array[new.modalidade];
  elsif tg_op = 'UPDATE'
    and new.modalidade is distinct from old.modalidade
    and new.modalidades is not distinct from old.modalidades then
    -- update legado que só altera `modalidade` -> mantém os dois campos coerentes
    new.modalidades := array[new.modalidade];
  end if;
  return new;
end;
$$;
drop trigger if exists curso_sync_modalidades_trg on public.curso;
create trigger curso_sync_modalidades_trg
before insert or update on public.curso
for each row execute function public.curso_sync_modalidades();
-- Defesa em profundidade: garante consistência mesmo em writes diretos via SQL
-- que ignorem o trigger (ex.: `alter table ... disable trigger`, restore parcial).
alter table public.curso
  add constraint curso_modalidades_not_empty_chk check (cardinality(modalidades) > 0);
alter table public.curso
  add constraint curso_modalidade_in_modalidades_chk check (modalidade = any(modalidades));
comment on column public.curso.modalidades is
  'Modalidades oferecidas pelo curso (multi-valor). public.curso.modalidade permanece como modalidade principal/legado durante a transição (ADR-015 Fase 3); o trigger curso_sync_modalidades_trg mantém os dois campos coerentes para writes legados.';
create index if not exists curso_modalidades_gin_idx
  on public.curso using gin (modalidades);
