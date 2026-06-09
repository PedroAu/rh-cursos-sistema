-- Garante profiles.role = 'admin' para o usuário admin (modelo híbrido)
-- ─────────────────────────────────────────────────────────────────────────────
-- O usuário admin é criado pela API admin oficial (scripts/seed-admin.js), que
-- define email_confirm + app_metadata.role='admin' (usado pela autenticação)
-- auth-session). Esta migration apenas alinha a SEGUNDA camada de autorização:
-- public.profiles.role = 'admin', consumida pelas policies RLS via is_admin().
--
-- Idempotente. Não mexe em auth.users (o Supabase desencoraja seeds nesse schema).
--
-- ⚠️ Ajuste o e-mail abaixo se usar outro endereço no seed-admin.js.

begin;

do $$
declare
  v_email   text := 'admin@rhcursos.com.br';
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where lower(email) = lower(v_email);

  if v_user_id is null then
    raise notice 'Usuário admin (%) ainda não existe em auth.users. Rode scripts/seed-admin.js primeiro.', v_email;
  else
    insert into public.profiles (id, role)
    values (v_user_id, 'admin')
    on conflict (id) do update set role = 'admin', updated_at = now();

    raise notice 'profiles.role=admin garantido para % (id %).', v_email, v_user_id;
  end if;
end $$;

commit;
