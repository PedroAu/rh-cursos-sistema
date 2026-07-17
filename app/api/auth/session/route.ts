import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  type DashboardRole,
  decodeSession,
  encodeSession,
  getCookieOptions,
  normalizeDashboardRole,
  SESSION_COOKIE
} from "@/lib/auth";
import { REMEMBER_SESSION_TTL_MS, SESSION_TTL_MS, shouldRotateSession } from "@/lib/auth-session";
import { logger } from "@/lib/logger";
import { checkRateLimit, clientIp, rateLimitConfigs } from "@/lib/rate-limit";
import { getDefaultDashboardPath } from "@/lib/session-routing";
import { isSsrAuthRolloutAccount } from "@/lib/supabase/auth-rollout";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
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
  exp?: number;
}) {
  return {
    role: session.role,
    email: session.email,
    name: session.name
  } as const;
}

function clearLegacySessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", { ...getCookieOptions(), maxAge: 0 });
  return response;
}

async function buildSessionResponse(
  session: { role: DashboardRole; email: string; name: string; remember?: boolean },
  options?: {
    supabaseSession?: { access_token: string; refresh_token: string } | null;
    rotated?: boolean;
  }
) {
  const ttlMs = session.remember ? REMEMBER_SESSION_TTL_MS : SESSION_TTL_MS;
  const token = await encodeSession(session, ttlMs);
  const response = NextResponse.json({
    ok: true,
    session: toSessionPayload(session),
    token,
    rotated: options?.rotated ?? false,
    supabaseSession: options?.supabaseSession ?? null
  });

  response.cookies.set(SESSION_COOKIE, token, getCookieOptions(ttlMs));
  return response;
}

function readSessionTokenFromCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return null;

  const pair = cookieHeader
    .split(";")
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.startsWith(`${SESSION_COOKIE}=`))
    .at(-1);

  return pair ? decodeURIComponent(pair.slice(SESSION_COOKIE.length + 1)) : null;
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const currentToken =
    cookieStore.get(SESSION_COOKIE)?.value ??
    readSessionTokenFromCookieHeader(request.headers.get("cookie")) ??
    null;
  const session = await decodeSession(currentToken ?? undefined);

  if (!session || isSsrAuthRolloutAccount(session.email)) {
    if (isSupabaseSsrConfigured) {
      const ssrClient = createSupabaseSSRClient(await getSsrCookieAdapter());
      if (ssrClient) {
        const ssrSession = await readSSRSession(ssrClient);
        if (
          ssrSession.status === "active" &&
          ssrSession.role &&
          isSsrAuthRolloutAccount(ssrSession.email)
        ) {
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
    return NextResponse.json({ ok: false, error: "Sessao invalida ou expirada." }, { status: 401 });
  }

  if (shouldRotateSession(session)) {
    return buildSessionResponse({ ...toSessionPayload(session), remember: session.remember }, { rotated: true });
  }

  return NextResponse.json({
    ok: true,
    session: toSessionPayload(session),
    token: currentToken,
    rotated: false,
    supabaseSession: null
  });
}

export async function POST(request: Request) {
  const body = await readLoginBody(request);

  const role = typeof body?.role === "string" ? normalizeDashboardRole(body.role) : undefined;
  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";
  const remember = body?.remember === true;
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

  if (isSsrAuthRolloutAccount(email)) {
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

  if (!isSupabaseServerConfigured) {
    return NextResponse.json({ ok: false, error: "Auth indisponivel." }, { status: 503 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Auth indisponivel." }, { status: 503 });
  }

  const result = await supabase.auth.signInWithPassword({ email, password });

  if (result.error || !result.data.user) {
    return NextResponse.json({ ok: false, error: "Credenciais invalidas." }, { status: 401 });
  }

  const metadataRole = normalizeDashboardRole(result.data.user.app_metadata?.role);
  if (!metadataRole) {
    return NextResponse.json({ ok: false, error: "Acesso nao autorizado." }, { status: 403 });
  }

  if (role && metadataRole !== role) {
    return NextResponse.json({ ok: false, error: "Acesso nao autorizado." }, { status: 403 });
  }

  const session = {
    role: metadataRole,
    email: result.data.user.email ?? email,
    name:
      typeof result.data.user.user_metadata?.name === "string"
        ? result.data.user.user_metadata.name
        : email.split("@")[0],
    remember
  } as const;

  const response = await buildSessionResponse(session, {
    supabaseSession: result.data.session
      ? {
          access_token: result.data.session.access_token,
          refresh_token: result.data.session.refresh_token
        }
      : null
  });

  response.headers.set("x-rh-dashboard-path", getDefaultDashboardPath(metadataRole));
  return response;
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as { accessToken?: string } | null;
  const accessToken = body?.accessToken;
  let mode: "global" | "local-only" = "local-only";
  let revoked = false;

  if (accessToken && supabaseAdmin) {
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
  if (isSupabaseSsrConfigured) {
    const ssrClient = createSupabaseSSRClient(await getSsrCookieAdapter());
    if (ssrClient) await signOutSSR(ssrClient);
  }
  response.cookies.set(SESSION_COOKIE, "", {
    ...getCookieOptions(),
    maxAge: 0
  });
  return response;
}

async function readLoginBody(request: Request): Promise<{
  role?: string;
  email?: string;
  password?: string;
  remember?: boolean;
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
          remember: readTextField("remember") === "true",
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
      remember?: boolean;
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
      remember: params.get("remember") === "true",
      mfaCode: params.get("mfaCode") ?? undefined,
    };
  }
}
