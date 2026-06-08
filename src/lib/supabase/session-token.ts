/**
 * Gestão do token de sessão admin no frontend estático.
 *
 * No modelo híbrido, a Edge Function `auth-session` devolve um token HMAC no
 * corpo (não em cookie httpOnly, que não cruzaria o domínio). Guardamos esse
 * token e o reenviamos via header `x-rh-session` nas chamadas administrativas.
 */

const SESSION_TOKEN_KEY = "rh_cursos_admin_token";

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
 * Formato do token: `base64url(payload).base64url(signature)`. Em export estático
 * não há como validar o HMAC (o secret é server-side), então apenas reidratamos a
 * sessão a partir do payload. A validação real continua na Edge Function
 * `admin-resources`. Retorna `null` se o token estiver ausente ou malformado.
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
