-- ═══════════════════════════════════════════════════════════════════════════
-- Sprint 3 — Performance
-- ═══════════════════════════════════════════════════════════════════════════
--   P3.1  Índices complementares (categoria, status inscricao, lead email)
--   P3.2  Trigger sync_curso_rating: recalcula media ao inserir/alterar avaliacao
--   P3.3  Trigger sync_curso_total_alunos: mantém contador ao confirmar inscrição
-- ═══════════════════════════════════════════════════════════════════════════

-- ── P3.1  Índices ────────────────────────────────────────────────────────────
create index if not exists curso_categoria_idx
  on public.curso (categoria)
  where deleted_at is null and categoria is not null;

create index if not exists inscricao_status_idx
  on public.inscricao (status_inscricao);

create index if not exists lead_email_idx
  on public.lead (lower(email))
  where email is not null;

-- ── P3.2  Trigger sync_curso_rating ─────────────────────────────────────────
create or replace function public.sync_curso_rating()
returns trigger
language plpgsql
as $$
declare
  v_curso_id   uuid;
  v_avg_rating numeric(3,2);
begin
  select t.curso_id into v_curso_id
    from public.turma t
   where t.id = coalesce(new.turma_id, old.turma_id);

  if v_curso_id is null then
    return coalesce(new, old);
  end if;

  select coalesce(round(avg(a.nota)::numeric, 2), 0)
    into v_avg_rating
    from public.avaliacao a
    join public.turma t on t.id = a.turma_id
   where t.curso_id  = v_curso_id
     and a.publicar  = true
     and (a.deleted_at is null);

  update public.curso
     set rating = v_avg_rating
   where id = v_curso_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists avaliacao_sync_curso_rating on public.avaliacao;
create trigger avaliacao_sync_curso_rating
  after insert or update of nota, publicar or delete on public.avaliacao
  for each row execute function public.sync_curso_rating();

-- ── P3.3  Trigger sync_curso_total_alunos ───────────────────────────────────
create or replace function public.sync_curso_total_alunos()
returns trigger
language plpgsql
as $$
declare
  v_curso_id uuid;
  v_delta    integer := 0;
begin
  if tg_op = 'INSERT' and new.status_inscricao = 'Confirmada' then
    v_delta := 1;
  elsif tg_op = 'UPDATE' then
    if old.status_inscricao != 'Confirmada' and new.status_inscricao = 'Confirmada' then
      v_delta := 1;
    elsif old.status_inscricao = 'Confirmada' and new.status_inscricao = 'Cancelada' then
      v_delta := -1;
    end if;
  end if;

  if v_delta = 0 then
    return coalesce(new, old);
  end if;

  select curso_id into v_curso_id
    from public.turma
   where id = new.turma_id;

  if v_curso_id is not null then
    update public.curso
       set total_alunos = greatest(0, total_alunos + v_delta)
     where id = v_curso_id;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists inscricao_sync_curso_total_alunos on public.inscricao;
create trigger inscricao_sync_curso_total_alunos
  after insert or update of status_inscricao on public.inscricao
  for each row execute function public.sync_curso_total_alunos();

comment on function public.sync_curso_rating()
  is 'Recalcula curso.rating ao inserir, atualizar ou deletar avaliacao.';
comment on function public.sync_curso_total_alunos()
  is 'Mantém curso.total_alunos sincronizado ao confirmar ou cancelar inscrição.';
