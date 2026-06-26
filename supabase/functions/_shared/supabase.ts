// Clientes Supabase para as Edge Functions.
// - anon: respeita RLS (usado em operações públicas / RPC com SECURITY DEFINER)
// - admin: service-role, ignora RLS (usado SOMENTE após validar sessão admin)

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.106.2";

// SUPABASE_URL e SUPABASE_ANON_KEY são injetadas automaticamente pelo runtime
// das Edge Functions. SUPABASE_SERVICE_ROLE_KEY precisa ser definida via secret.
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

export const isSupabaseConfigured = Boolean(supabaseUrl && anonKey);
export function anonClient(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error("SUPABASE_URL e SUPABASE_ANON_KEY não configuradas na Edge Function.");
  }

  return createClient(supabaseUrl!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function adminClient(): SupabaseClient {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas na Edge Function.");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const isAdminConfigured = Boolean(supabaseUrl && serviceRoleKey);
