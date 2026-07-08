// Edge Function: auth-session
// Substitui app/api/auth/session/route.ts no deploy estático.
// Autentica via Supabase Auth e devolve um token de sessão admin assinado (HMAC)
// no corpo da resposta. Como o site estático roda em domínio distinto das
// functions, o cookie httpOnly não cruzaria a fronteira — por isso o token é
// devolvido no corpo e reenviado pelo frontend via header `x-rh-session`.

import { handleOptions, jsonResponse, isOriginAllowed } from "../_shared/cors.ts";
import {
  anonClient,
  adminClient,
  isAdminConfigured,
  isSupabaseConfigured,
} from "../_shared/supabase.ts";
import {
  encodeSession,
  SESSION_TTL_MS,
  type AdminSession,
  type DashboardRole,
} from "../_shared/auth.ts";
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

  // DELETE = logout. Se vier accessToken, tenta revogar TODAS as sessões do
  // usuário (global signout) via admin API. Sem token ou sem service role
  // configurada, cai no comportamento stateless de hoje (logout local-only).
  if (request.method === "DELETE") {
    const body = (await request.json().catch(() => null)) as { accessToken?: string } | null;
    const accessToken = body?.accessToken;
    let mode: "global" | "local-only" = "local-only";
    let revoked = false;

    if (accessToken && isAdminConfigured) {
      try {
        const admin = adminClient();
        const { error } = await admin.auth.admin.signOut(accessToken, "global");
        if (error) {
          console.error("Falha ao revogar sessões globais:", error.message);
        } else {
          mode = "global";
          revoked = true;
        }
      } catch (error) {
        console.error(
          "Erro ao revogar sessões globais:",
          error instanceof Error ? error.message : error
        );
        // Fallback gracioso: logout local-only ainda funciona no frontend.
      }
    }

    return jsonResponse({ ok: true, mode, revoked }, 200, request);
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405, request);
  }

  if (!isSupabaseConfigured) {
    return jsonResponse({ ok: false, error: "Auth indisponivel." }, 503, request);
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

  const rate = await checkRateLimit(`auth:${clientIp(request)}`, rateLimitConfigs.auth);
  if (!rate.allowed) {
    return jsonResponse(
      { ok: false, error: "Muitas tentativas. Tente novamente mais tarde." },
      429,
      request,
      { "Retry-After": rate.retryAfter.toString() }
    );
  }

  try {
    const supabase = anonClient();
    const result = await supabase.auth.signInWithPassword({ email, password });

    if (result.error || !result.data.user) {
      return jsonResponse({ ok: false, error: "Credenciais invalidas." }, 401, request);
    }

    const metadataRole = normalizeRole(result.data.user.app_metadata?.role);
    // Sem role admin nos metadados → acesso negado (não confiar no role pedido).
    if (!metadataRole) {
      return jsonResponse({ ok: false, error: "Acesso nao autorizado." }, 403, request);
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

    const token = await encodeSession(session, SESSION_TTL_MS);

    // Além do token HMAC (usado pelo header x-rh-session nas Edge Functions),
    // devolvemos o par de tokens do Supabase Auth. O frontend reidrata a sessão
    // no cliente JS via supabase.auth.setSession(), passando a operar como role
    // `authenticated` — assim as policies RLS (is_admin) liberam leitura direta.
    const supabaseSession = result.data.session
      ? {
          access_token: result.data.session.access_token,
          refresh_token: result.data.session.refresh_token,
        }
      : null;

    return jsonResponse(
      { ok: true, session, token, supabaseSession },
      200,
      request
    );
  } catch (error) {
    console.error("auth-session error:", error instanceof Error ? error.message : error);
    return jsonResponse({ ok: false, error: "Erro na autenticacao." }, 500, request);
  }
});
