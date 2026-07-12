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
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const GLOBAL_SIGNOUT_TIMEOUT_MS = 1_500;

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

  if (!session) {
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
  if (!isSupabaseServerConfigured) {
    return NextResponse.json({ ok: false, error: "Auth indisponivel." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string; remember?: boolean }
    | null;

  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";
  const remember = body?.remember === true;

  if (!email || !password) {
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
  response.cookies.set(SESSION_COOKIE, "", {
    ...getCookieOptions(),
    maxAge: 0
  });
  return response;
}
