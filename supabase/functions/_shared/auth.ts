// Identidade admin das Edge Functions.
//
// REC-204 Fase B (cutover total): a autoridade de sessão admin é a sessão
// Supabase SSR encaminhada pelo BFF same-origin via `requireTrustedSsrAdmin`.
// O verificador HMAC gêmeo (`decodeSession`/`requireAdmin`/`getSessionToken` +
// leitura de `x-rh-session`) foi REMOVIDO — token HMAC legado não é mais aceito
// em nenhuma rota de produção (retorna 401 em `admin-resources`).
//
// `encodeSession` permanece apenas porque a Edge Function `auth-session`
// (deploy estático, fora do escopo desta story) ainda a consome; ela não é
// autoridade em nenhum caminho protegido após o cutover.

export type DashboardRole = "admin";

export type AdminSession = {
  role: DashboardRole;
  email: string;
  name: string;
  userId?: string;
  /** Epoch ms de expiração da sessão assinada. */
  exp?: number;
};

export const SESSION_TTL_MS = 30 * 60 * 1000;

export function getSessionSecret(): string {
  const secret = Deno.env.get("AUTH_SESSION_SECRET");

  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET é obrigatório nas Edge Functions.");
  }

  if (secret.length < 32) {
    throw new Error("AUTH_SESSION_SECRET deve ter ao menos 32 caracteres.");
  }

  return secret;
}

function toBase64Url(value: ArrayBuffer | string): string {
  const binary =
    typeof value === "string" ? value : String.fromCharCode(...new Uint8Array(value));

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function signPayload(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return toBase64Url(signature);
}

export async function encodeSession(
  session: AdminSession,
  ttlMs = SESSION_TTL_MS
): Promise<string> {
  const payload = toBase64Url(JSON.stringify({ ...session, exp: Date.now() + ttlMs }));
  const signature = await signPayload(payload);
  return `${payload}.${signature}`;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Identidade SSR encaminhada pelo BFF same-origin — autoridade única após o
 * cutover REC-204 Fase B.
 *
 * O header de identidade sozinho nunca e confiavel: ele so e aceito quando
 * Authorization e apikey carregam a service-role ja existente, que permanece
 * exclusivamente no servidor. Nenhum segredo adicional e introduzido.
 */
export function requireTrustedSsrAdmin(request: Request): AdminSession | null {
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const apiKey = request.headers.get("apikey") ?? "";
  const userId = request.headers.get("x-rh-ssr-admin-id")?.trim() ?? "";
  const email = request.headers.get("x-rh-ssr-admin-email")?.trim() ?? "";

  if (
    !serviceRoleKey ||
    !userId ||
    !email ||
    !timingSafeEqual(authorization, serviceRoleKey) ||
    !timingSafeEqual(apiKey, serviceRoleKey)
  ) {
    return null;
  }

  return { role: "admin", userId, email, name: email.split("@")[0] || "admin" };
}
