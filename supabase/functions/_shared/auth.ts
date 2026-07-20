// Identidade admin das Edge Functions.
//
// REC-204 Fase B (cutover total): a autoridade de sessão admin é a sessão
// Supabase SSR encaminhada pelo BFF same-origin via `requireTrustedSsrAdmin`.
// O verificador HMAC gêmeo (`decodeSession`/`requireAdmin`/`getSessionToken` +
// leitura de `x-rh-session`) foi REMOVIDO — token HMAC legado não é mais aceito
// em nenhuma rota de produção (retorna 401 em `admin-resources`).
//
// SEC-204a (2026-07-19): o emissor HMAC (`encodeSession` e helpers correlatos)
// foi REMOVIDO junto com a Edge Function `auth-session`, seu último consumidor.
// Não há mais nenhum caminho que assine ou aceite tokens HMAC.

export type DashboardRole = "admin";

export type AdminSession = {
  role: DashboardRole;
  email: string;
  name: string;
  userId?: string;
  /** Epoch ms de expiração da sessão assinada. */
  exp?: number;
};

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
