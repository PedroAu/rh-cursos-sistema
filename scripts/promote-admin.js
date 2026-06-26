#!/usr/bin/env node
/**
 * Promove o usuário admin na 2ª camada de autorização: public.profiles.role='admin'.
 *
 * Usa a service-role (ignora RLS) para fazer upsert no profiles do usuário cujo
 * e-mail corresponde ao admin. Complementa scripts/seed-admin.js (que cuida da
 * 1ª camada, auth.users.user_metadata.role).
 *
 * Uso:
 *   ADMIN_EMAIL=admin@rhcursos.com.br node --env-file=.env.local scripts/promote-admin.js
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL ?? "admin@rhcursos.com.br";

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

if (!supabaseUrl || !serviceKey) {
  fail(
    "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente (.env.local ou variaveis exportadas)."
  );
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserId(targetEmail) {
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (found) return found.id;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function main() {
  console.log(`🔐 Promovendo admin em profiles: ${email}\n`);

  const userId = await findUserId(email);
  if (!userId) fail(`Usuário ${email} não encontrado em auth.users. Rode seed:admin primeiro.`);

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, role: "admin" }, { onConflict: "id" });

  if (error) fail(`Falha ao atualizar profiles: ${error.message}`);

  console.log(`✅ profiles.role='admin' garantido para ${email} (id: ${userId}).`);
  console.log("\n🎉 Admin completo nas duas camadas. Teste o login em /login.");
}

main().catch((error) => fail(error.message));
