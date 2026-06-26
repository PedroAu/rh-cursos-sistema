-- Rate limit global via Postgres.
-- Substitui o Map in-memory per-isolate das Edge Functions por um contador
-- atômico compartilhado entre todos os isolates do Deno Deploy.
-- A Edge Function usa service_role para fazer upsert nesta tabela.

create table if not exists rate_limit_store (
  identifier  text        not null,
  window_start bigint     not null,  -- epoch ms truncado ao início da janela
  count       integer     not null default 0,
  expires_at  timestamptz not null,
  primary key (identifier, window_start)
);

-- Índice para limpeza eficiente de entradas expiradas
create index if not exists idx_rate_limit_expires on rate_limit_store (expires_at);

-- Apenas service_role pode ler/escrever (Edge Functions usam service_role key)
alter table rate_limit_store enable row level security;

-- Nenhum acesso via anon/authenticated — somente service_role (bypassa RLS)
-- Não criar policy para anon/authenticated é suficiente: default-deny com RLS ativado.

-- Função para incrementar contador atomicamente e retornar o valor atual.
-- Retorna o count APÓS o incremento. A Edge Function compara com maxRequests.
create or replace function rate_limit_increment(
  p_identifier  text,
  p_window_ms   bigint,   -- duração da janela em ms
  p_max_requests integer  -- limite (usado apenas para cálculo de expires_at)
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start bigint;
  v_expires_at   timestamptz;
  v_count        integer;
begin
  -- Truncar timestamp atual ao início da janela
  v_window_start := (floor(extract(epoch from now()) * 1000 / p_window_ms) * p_window_ms)::bigint;
  v_expires_at   := to_timestamp((v_window_start + p_window_ms) / 1000.0);

  insert into rate_limit_store (identifier, window_start, count, expires_at)
  values (p_identifier, v_window_start, 1, v_expires_at)
  on conflict (identifier, window_start)
  do update set count = rate_limit_store.count + 1
  returning count into v_count;

  return v_count;
end;
$$;

-- Revogar execute público (principle of least privilege — apenas service_role usa)
revoke execute on function rate_limit_increment(text, bigint, integer) from public, anon, authenticated;

-- Limpeza periódica de entradas expiradas via pg_cron (se disponível).
-- Em projetos Supabase Pro, pg_cron está habilitado no schema cron.
-- Executar a cada hora; se pg_cron não estiver disponível, a limpeza
-- acontece on-demand na próxima migration ou manualmente.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'cleanup-rate-limit-store',
      '0 * * * *',  -- a cada hora
      'delete from rate_limit_store where expires_at < now()'
    );
  end if;
exception when others then
  -- pg_cron não disponível neste plano — ignorar silenciosamente
  null;
end;
$$;
