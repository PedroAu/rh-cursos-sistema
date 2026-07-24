import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { type DashboardRole, getCookieOptions, normalizeDashboardRole } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { applyNoStore } from "@/lib/security-headers";
import { checkRateLimit, clientIp, rateLimitConfigs } from "@/lib/rate-limit";
import { getDefaultDashboardPath } from "@/lib/session-routing";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  createSupabaseSSRClient,
  isSupabaseSsrConfigured,
  readSSRSession,
  signInSSR,
  signOutSSR,
  type SsrCookieAdapter,
} from "@/lib/supabase/session";

const GLOBAL_SIGNOUT_TIMEOUT_MS = 1_500;

/**
 * REC-204 Fase B (cutover total, forward-only):
 * O login é EXCLUSIVAMENTE Supabase SSR. A emissão de sessão HMAC própria
 * (`encodeSession`) e a allowlist de rollout foram removidas. Um cookie HMAC
 * legado (`rh_cursos_demo_session`) não é mais decodificado nem aceito — a
 * ausência de sessão SSR válida resulta em 401. O cookie legado é limpo de
 * forma defensiva para que não possa ser reapresentado.
 */
const LEGACY_SESSION_COOKIE = "rh_cursos_demo_session";

async function getSsrCookieAdapter(): Promise<SsrCookieAdapter> {
  const cookieStore = await cookies();
  return {
    getAll: () => cookieStore.getAll().map(({ name, value }) => ({ name, value })),
    setAll: (toSet) => {
      for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
    },
  };
}

function toSessionPayload(session: {
  role: DashboardRole;
  email: string;
  name: string;
}) {
  return {
    role: session.role,
    email: session.email,
    name: session.name,
  } as const;
}

function clearLegacySessionCookie(response: NextResponse) {
  response.cookies.set(LEGACY_SESSION_COOKIE, "", { ...getCookieOptions(), maxAge: 0 });
  return response;
}

// REC-408: todo retorno das rotas de sessão é `no-store` (AC3). Os handlers
// exportados delegam à implementação e aplicam o contrato de cache no único
// ponto de saída, cobrindo sucesso, erro, logout, MFA e rate limit sem alterar
// payload, status ou o fluxo de autorização (REC-204 Fase B intocado — AC7).
export async function GET() {
  return applyNoStore(await handleGet());
}

export async function POST(request: Request) {
  return applyNoStore(await handlePost(request));
}

export async function DELETE(request: Request) {
  return applyNoStore(await handleDelete(request));
}

async function handleGet() {
  if (isSupabaseSsrConfigured) {
    const ssrClient = createSupabaseSSRClient(await getSsrCookieAdapter());
    if (ssrClient) {
      const ssrSession = await readSSRSession(ssrClient);
      if (ssrSession.status === "active" && ssrSession.role) {
        return NextResponse.json({
          ok: true,
          authMode: "ssr",
          session: toSessionPayload({
            role: ssrSession.role,
            email: ssrSession.email,
            name: ssrSession.name,
          }),
          token: null,
          rotated: false,
          supabaseSession: null,
        });
      }
    }
  }

  // Sem sessão SSR válida: token HMAC legado não é honrado (AC6). 401 fail-closed.
  return clearLegacySessionCookie(
    NextResponse.json({ ok: false, error: "Sessao invalida ou expirada." }, { status: 401 })
  );
}

async function handlePost(request: Request) {
  const body = await readLoginBody(request);

  const role = typeof body?.role === "string" ? normalizeDashboardRole(body.role) : undefined;
  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";
  const mfaCode = typeof body?.mfaCode === "string" ? body.mfaCode.trim() : undefined;

  if ((body?.role && !role) || !email || !password) {
    return NextResponse.json({ ok: false, error: "Dados de login invalidos." }, { status: 400 });
  }

  const rate = await checkRateLimit(`auth:${clientIp(request)}`, rateLimitConfigs.auth);
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas. Tente novamente mais tarde." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfter)
        }
      }
    );
  }

  if (!isSupabaseSsrConfigured) {
    return NextResponse.json({ ok: false, error: "Auth indisponivel." }, { status: 503 });
  }
  const ssrClient = createSupabaseSSRClient(await getSsrCookieAdapter());
  if (!ssrClient) {
    return NextResponse.json({ ok: false, error: "Auth indisponivel." }, { status: 503 });
  }

  const result = await signInSSR(ssrClient, { email, password, role: role ?? null, mfaCode });
  if (result.status === "mfa_required" || result.status === "mfa_failed") {
    return clearLegacySessionCookie(NextResponse.json(
      {
        ok: false,
        authMode: "ssr",
        mfaRequired: true,
        error:
          result.status === "mfa_required"
            ? "Verificacao MFA obrigatoria."
            : "Codigo MFA invalido ou expirado.",
      },
      { status: 401 }
    ));
  }
  if (result.status !== "authenticated") {
    const status = result.status === "unauthorized" ? 403 : result.status === "unconfigured" ? 503 : 401;
    return NextResponse.json(
      { ok: false, authMode: "ssr", error: status === 403 ? "Acesso nao autorizado." : "Credenciais invalidas." },
      { status }
    );
  }

  const response = NextResponse.json({
    ok: true,
    authMode: "ssr",
    session: toSessionPayload(result),
    token: null,
    rotated: false,
    supabaseSession: null,
    aal: result.aal,
  });
  response.headers.set("x-rh-dashboard-path", getDefaultDashboardPath(result.role));
  return clearLegacySessionCookie(response);
}

async function handleDelete(request: Request) {
  const body = (await request.json().catch(() => null)) as { accessToken?: string } | null;
  const accessToken = body?.accessToken;
  let mode: "global" | "local-only" = "local-only";
  let revoked = false;

  if (isSupabaseSsrConfigured) {
    const ssrClient = createSupabaseSSRClient(await getSsrCookieAdapter());
    if (ssrClient) {
      // A sessão SSR já contém o refresh token no servidor; não é necessário
      // expor access_token ao browser para solicitar logout global.
      revoked = (await signOutSSR(ssrClient)) === true;
      if (revoked) mode = "global";
    }
  }

  if (!revoked && accessToken && supabaseAdmin) {
    const rate = await checkRateLimit(
      `auth-logout-global:${clientIp(request)}`,
      rateLimitConfigs.authGlobalLogout
    );

    if (!rate.allowed) {
      logger.warn("Revogacao global ignorada por rate limit; seguindo com logout local-only.", {
        route: "api/auth/session"
      });
    } else {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      try {
        const { error } = await Promise.race([
          supabaseAdmin.auth.admin.signOut(accessToken, "global"),
          new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
              reject(new Error(`Timeout na revogacao global apos ${GLOBAL_SIGNOUT_TIMEOUT_MS}ms.`));
            }, GLOBAL_SIGNOUT_TIMEOUT_MS);
          })
        ]);

        if (error) {
          logger.error("Falha ao revogar sessoes globais", {
            err: error,
            route: "api/auth/session"
          });
          // Fallback: segue para limpar apenas o cookie local (logout nao deve falhar).
        } else {
          mode = "global";
          revoked = true;
        }
      } catch (error) {
        logger.error("Erro ao revogar sessoes globais", {
          err: error,
          route: "api/auth/session"
        });
        // Fallback: segue para limpar apenas o cookie local (logout nao deve falhar).
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    }
  }

  const response = NextResponse.json({ ok: true, mode, revoked });
  return clearLegacySessionCookie(response);
}

async function readLoginBody(request: Request): Promise<{
  role?: string;
  email?: string;
  password?: string;
  mfaCode?: string;
} | null> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    try {
      const form = await request.formData();
      if (Array.from(form.keys()).length > 0) {
        const readTextField = (name: string) => {
          const value = form.get(name);
          return typeof value === "string" ? value : undefined;
        };

        return {
          role: readTextField("role"),
          email: readTextField("email"),
          password: readTextField("password"),
          mfaCode: readTextField("mfaCode"),
        };
      }
    } catch {
      // Continua para o fallback de texto.
    }
  }

  const rawBody = await request.text().catch(() => "");
  if (!rawBody) return null;

  try {
    return JSON.parse(rawBody) as {
      role?: string;
      email?: string;
      password?: string;
      mfaCode?: string;
    };
  } catch {
    const params = new URLSearchParams(rawBody);
    if (Array.from(params.keys()).length === 0) {
      return null;
    }

    return {
      role: params.get("role") ?? undefined,
      email: params.get("email") ?? undefined,
      password: params.get("password") ?? undefined,
      mfaCode: params.get("mfaCode") ?? undefined,
    };
  }
}
