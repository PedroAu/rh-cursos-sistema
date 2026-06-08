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
