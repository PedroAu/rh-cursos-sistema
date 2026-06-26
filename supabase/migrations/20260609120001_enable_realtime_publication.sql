-- Habilita Supabase Realtime (postgres_changes) para as tabelas core do domínio.
-- O front-end (AppStore) assina mudanças via canal Supabase Realtime para refletir
-- inserts/updates/deletes em tempo real sem polling. Para isso, cada tabela precisa
-- estar adicionada à publication `supabase_realtime`.
--
-- Bloco idempotente: verifica se a tabela já está na publication antes de adicionar,
-- evitando erro "relation is already member of publication" em reruns.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where tablename = 'curso' and pubname = 'supabase_realtime'
  ) then
    alter publication supabase_realtime add table curso;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where tablename = 'turma' and pubname = 'supabase_realtime'
  ) then
    alter publication supabase_realtime add table turma;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where tablename = 'instrutor' and pubname = 'supabase_realtime'
  ) then
    alter publication supabase_realtime add table instrutor;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where tablename = 'post_blog' and pubname = 'supabase_realtime'
  ) then
    alter publication supabase_realtime add table post_blog;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where tablename = 'lead' and pubname = 'supabase_realtime'
  ) then
    alter publication supabase_realtime add table lead;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where tablename = 'inscricao' and pubname = 'supabase_realtime'
  ) then
    alter publication supabase_realtime add table inscricao;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where tablename = 'aluno' and pubname = 'supabase_realtime'
  ) then
    alter publication supabase_realtime add table aluno;
  end if;
end;
$$;
