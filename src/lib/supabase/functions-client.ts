/**
 * Cliente para as Supabase Edge Functions (arquitetura híbrida).
 *
 * No deploy estático (Locaweb) não existe `/api/*` — as mutações são servidas
 * por Edge Functions hospedadas no Supabase. Este helper centraliza a montagem
 * da URL e dos headers (incluindo a anon key, exigida pelo gateway das functions).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Base das Edge Functions. Permite override explícito via
 * NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL (útil para domínio custom/local),
 * caindo para o padrão `${url}/functions/v1`.
 */
export function getFunctionsBaseUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (!supabaseUrl) return null;
  return `${supabaseUrl.replace(/\/$/, "")}/functions/v1`;
}

export const isFunctionsConfigured = Boolean(getFunctionsBaseUrl() && anonKey);

type InvokeOptions = {
  method?: "POST" | "DELETE" | "GET";
  body?: unknown;
  /** Header opcional de sessão (cookie HMAC) repassado para functions de admin. */
  sessionToken?: string;
};

/**
 * Invoca uma Edge Function pelo nome (ex.: "leads", "enrollments").
 * Retorna a Response crua para o caller decidir o tratamento.
 */
export async function invokeFunction(
  name: string,
  { method = "POST", body, sessionToken }: InvokeOptions = {}
): Promise<Response> {
  const base = getFunctionsBaseUrl();

  if (!base || !anonKey) {
    throw new Error("Supabase Functions não configurado (URL ou anon key ausente).");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${anonKey}`,
    apikey: anonKey,
  };

  if (sessionToken) {
    headers["x-rh-session"] = sessionToken;
  }

  return fetch(`${base}/${name}`, {
    method,
    headers,
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
