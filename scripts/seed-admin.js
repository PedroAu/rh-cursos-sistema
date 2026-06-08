#!/usr/bin/env node
/**
 * Seed do usuário admin via API admin oficial do Supabase (robusto).
 *
 * Cria (ou atualiza) o admin em auth.users com:
 *   - email_confirm: true        → login imediato, sem confirmação por e-mail
 *   - user_metadata.role: admin  → libera o login na Edge Function auth-session
 *   - user_metadata.name
 *
 * A consistência com as policies RLS (public.profiles.role = 'admin') é
 * garantida pela migration 20260608000000_seed_admin_user.sql.
 *
 * Uso:
 *   ADMIN_EMAIL=admin@rhcursos.com.br ADMIN_PASSWORD='SenhaForte#2026' \
 *     node scripts/seed-admin.js
 *
 * Requer no ambiente (.env):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const email = process.env.ADMIN_EMAIL ?? "admin@rhcursos.com.br";
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME ?? "Administrador RH Cursos";

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

if (!supabaseUrl || !serviceKey) {
  fail("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente (.env).");
}

if (!password) {
  fail("Defina ADMIN_PASSWORD (senha do admin) no ambiente.");
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserByEmail(targetEmail) {
  // Pagina a lista de usuários até encontrar o e-mail (API admin não tem filtro direto).
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (found) return found;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function main() {
  console.log(`🌱 Seed admin: ${email}\n`);

  const existing = await findUserByEmail(email);

  if (existing) {
    console.log("ℹ️  Usuário já existe. Atualizando senha e metadados...");
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { ...existing.user_metadata, role: "admin", name },
    });
    if (error) fail(`Falha ao atualizar admin: ${error.message}`);
    console.log(`✅ Admin atualizado (id: ${existing.id}).`);
  } else {
    console.log("ℹ️  Criando novo usuário admin...");
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "admin", name },
    });
    if (error) fail(`Falha ao criar admin: ${error.message}`);
    console.log(`✅ Admin criado (id: ${data.user.id}).`);
  }

  console.log(
    "\n📌 Próximo passo: aplique a migration para garantir profiles.role=admin:\n" +
      "   supabase db push   (ou rode a migration 20260608000000_seed_admin_user.sql)\n" +
      "   E confirme o login em /login."
  );
}

main().catch((error) => fail(error.message));
