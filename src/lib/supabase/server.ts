import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServerKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseServerConfigured = Boolean(supabaseUrl && supabaseServerKey);

/**
 * Cliente SSR privilegiado (REC-104: exclusivo de caminhos administrativos).
 *
 * Prefere `SUPABASE_SERVICE_ROLE_KEY` e, portanto, ignora RLS/grants. Nunca
 * deve ser usado para servir dados a um visitante não autenticado — use
 * `createSupabasePublicServerClient()` para qualquer caminho de leitura
 * pública (catálogo, blog, depoimentos).
 */
export function createSupabaseServerClient() {
  if (!isSupabaseServerConfigured) {
    return null;
  }

  return createClient(supabaseUrl!, supabaseServerKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

const supabasePublicServerKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabasePublicServerConfigured = Boolean(supabaseUrl && supabasePublicServerKey);

/**
 * Cliente SSR público (REC-104 — fecha FND-03).
 *
 * Usa exclusivamente a chave anon/publishable, nunca `service_role`, mesmo
 * quando `SUPABASE_SERVICE_ROLE_KEY` estiver definida no ambiente. É o único
 * cliente que deve servir dados a um visitante não autenticado (catálogo,
 * cursos, turmas, instrutores, blog, depoimentos), garantindo que as
 * projeções e grants públicos criados por REC-103 sejam de fato a barreira
 * ativa (RLS e ACL de coluna passam a se aplicar de verdade a este cliente).
 */
export function createSupabasePublicServerClient() {
  if (!isSupabasePublicServerConfigured) {
    return null;
  }

  return createClient(supabaseUrl!, supabasePublicServerKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
