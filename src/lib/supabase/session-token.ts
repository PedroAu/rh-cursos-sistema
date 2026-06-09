/**
 * Gestão do token de sessão admin no frontend.
 *
 * Mesmo com a sessão server-side do Next para proteger `/admin`, continuamos
 * persistindo um token HMAC no cliente para reenviá-lo via header
 * `x-rh-session` às Edge Functions administrativas já existentes.
 */

const SESSION_TOKEN_KEY = "rh_cursos_admin_token";
const SUPABASE_SESSION_KEY = "rh_cursos_supabase_session";

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_TOKEN_KEY);
}

export function setSessionToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_TOKEN_KEY, token);
}

export function clearSessionToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_TOKEN_KEY);
  window.localStorage.removeItem(SUPABASE_SESSION_KEY);
}

/**
 * Par de tokens do Supabase Auth. Persistimos junto do token HMAC para reidratar
 * a sessão do cliente JS no boot (`supabase.auth.setSession`), o que faz o cliente
 * operar como role `authenticated` e habilita leitura direta sob RLS.
 */
export type SupabaseSessionTokens = {
  access_token: string;
  refresh_token: string;
};

export function getSupabaseSession(): SupabaseSessionTokens | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SUPABASE_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SupabaseSessionTokens>;
    if (!parsed.access_token || !parsed.refresh_token) return null;
    return { access_token: parsed.access_token, refresh_token: parsed.refresh_token };
  } catch {
    return null;
  }
}

export function setSupabaseSession(tokens: SupabaseSessionTokens): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(tokens));
}

type DecodedSession = {
  role: "admin";
  email: string;
  name: string;
};

function fromBase64Url(value: string): string {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
}

/**
 * Decodifica de forma otimista o payload do token HMAC no cliente.
 *
 * Formato do token: `base64url(payload).base64url(signature)`. No browser não
 * há como validar o HMAC (o secret é server-side), então apenas reidratamos a
 * sessão a partir do payload. A validação real continua no servidor Next e na
 * Edge Function `admin-resources`. Retorna `null` se o token estiver ausente ou
 * malformado.
 */
export function decodeSessionToken(token?: string | null): DecodedSession | null {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as Partial<DecodedSession>;
    if (parsed.role !== "admin" || !parsed.email || !parsed.name) return null;

    return { role: parsed.role, email: parsed.email, name: parsed.name };
  } catch {
    return null;
  }
}
