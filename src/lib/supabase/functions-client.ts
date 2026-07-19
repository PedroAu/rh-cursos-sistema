/**
 * Cliente para as Supabase Edge Functions (arquitetura híbrida).
 *
 * No deploy estático do frontend não existe `/api/*` — as mutações são servidas
 * por Edge Functions hospedadas no Supabase. Este helper centraliza a montagem
 * da URL e dos headers (incluindo a anon key, exigida pelo gateway das functions).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const CLIENT_IP_STORAGE_KEY = "rh_cursos_function_client_ip";

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
  keepalive?: boolean;
};

/**
 * Invoca uma Edge Function pelo nome (ex.: "leads", "enrollments").
 * Retorna a Response crua para o caller decidir o tratamento.
 *
 * REC-204 Fase B: a identidade admin trafega EXCLUSIVAMENTE pela sessão
 * Supabase SSR (cookie httpOnly same-origin, resolvido pelo BFF em
 * `/api/functions/*`). O header HMAC `x-rh-session` foi removido.
 */
export async function invokeFunction(
  name: string,
  { method = "POST", body, keepalive = false }: InvokeOptions = {}
): Promise<Response> {
  const useProxy = typeof window !== "undefined";
  const base = useProxy ? "" : getFunctionsBaseUrl();

  if ((!useProxy && !base) || !anonKey) {
    throw new Error("Supabase Functions não configurado (URL ou anon key ausente).");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${anonKey}`,
    apikey: anonKey,
  };

  if (useProxy) {
    headers["x-rh-client-ip"] = getStableClientIp();
  }

  // No proxy same-origin (`/api/functions/*`), a sessão admin SSR (cookie
  // httpOnly) é enviada automaticamente pelo browser (credentials same-origin
  // por padrão) e resolvida no servidor. Na chamada direta cross-origin ao
  // Supabase, nenhum cookie é enviado — evita a fricção de CORS com credenciais.
  const url = useProxy ? `/api/functions/${name}` : `${base}/${name}`;

  return fetch(url, {
    method,
    headers,
    keepalive,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function getStableClientIp(): string {
  const storage = window.localStorage;
  const existing = storage.getItem(CLIENT_IP_STORAGE_KEY);
  if (existing) return existing;

  const value = `session-${crypto.randomUUID()}`;
  storage.setItem(CLIENT_IP_STORAGE_KEY, value);
  return value;
}
