-- RH Cursos - enrollment delete counters
-- Mantém a exclusão de inscricao atômica: o delete libera a vaga da turma e,
-- quando a inscrição contava como aluno, ajusta curso.total_alunos no mesmo
-- comando transacional.

create or replace function public.sync_inscricao_delete_counters()
returns trigger
language plpgsql
as $$
declare
  v_curso_id varchar(80);
begin
  if old.status_inscricao in ('Confirmada', 'AguardandoPagamento', 'Concluida') then
    update public.turma
       set vagas_preenchidas = greatest(0, vagas_preenchidas - 1)
     where id = old.turma_id;
  end if;

  if old.status_inscricao in ('Confirmada', 'Concluida') then
    select curso_id into v_curso_id
      from public.turma
     where id = old.turma_id;

    if v_curso_id is not null then
      update public.curso
         set total_alunos = greatest(0, total_alunos - 1)
       where id = v_curso_id;
    end if;
  end if;

  return old;
end;
$$;

drop trigger if exists inscricao_sync_delete_counters on public.inscricao;
create trigger inscricao_sync_delete_counters
  after delete on public.inscricao
  for each row execute function public.sync_inscricao_delete_counters();

comment on function public.sync_inscricao_delete_counters()
  is 'Libera vagas da turma e ajusta curso.total_alunos ao excluir inscricao.';
