// Edge Function: auth-session
// Substitui app/api/auth/session/route.ts no deploy estático.
// Autentica via Supabase Auth e devolve um token de sessão admin assinado (HMAC)
// no corpo da resposta. Como o site estático roda em domínio distinto das
// functions, o cookie httpOnly não cruzaria a fronteira — por isso o token é
// devolvido no corpo e reenviado pelo frontend via header `x-rh-session`.

import { handleOptions, jsonResponse, isOriginAllowed } from "../_shared/cors.ts";
import { anonClient } from "../_shared/supabase.ts";
import { encodeSession, type AdminSession, type DashboardRole } from "../_shared/auth.ts";
import { checkRateLimit, clientIp, rateLimitConfigs } from "../_shared/rate-limit.ts";

function normalizeRole(value: unknown): DashboardRole | null {
  return value === "admin" ? "admin" : null;
}

Deno.serve(async (request) => {
  const preflight = handleOptions(request);
  if (preflight) return preflight;

  const origin = request.headers.get("origin");
  if (!isOriginAllowed(origin)) {
    return jsonResponse({ ok: false, error: "Origin not allowed" }, 403, request);
  }

  // DELETE = logout (stateless: o frontend descarta o token).
  if (request.method === "DELETE") {
    return jsonResponse({ ok: true }, 200, request);
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405, request);
  }

  const ip = clientIp(request);
  const rate = checkRateLimit(`auth:${ip}`, rateLimitConfigs.auth);
  if (!rate.allowed) {
    return jsonResponse(
      { ok: false, error: "Muitas tentativas de login. Aguarde alguns minutos." },
      429,
      request,
      { "Retry-After": rate.retryAfter.toString() }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { role?: string; email?: string; password?: string }
    | null;

  const role = normalizeRole(body?.role);
  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";

  if (!role || !email || !password) {
    return jsonResponse({ ok: false, error: "Dados de login inválidos." }, 400, request);
  }

  try {
    const supabase = anonClient();
    const result = await supabase.auth.signInWithPassword({ email, password });

    if (result.error || !result.data.user) {
      return jsonResponse({ ok: false, error: "Credenciais inválidas." }, 401, request);
    }

    const metadataRole = normalizeRole(result.data.user.user_metadata?.role);
    // Sem role admin nos metadados → acesso negado (não confiar no role pedido).
    if (!metadataRole) {
      return jsonResponse({ ok: false, error: "Acesso não autorizado." }, 403, request);
    }

    const name =
      typeof result.data.user.user_metadata?.name === "string"
        ? result.data.user.user_metadata.name
        : email.split("@")[0];

    const session: AdminSession = {
      role: metadataRole,
      email: result.data.user.email ?? email,
      name,
    };

    const token = await encodeSession(session);

    return jsonResponse({ ok: true, session, token }, 200, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro na autenticação.";
    console.error("auth-session error:", message);
    return jsonResponse({ ok: false, error: message }, 500, request);
  }
});
