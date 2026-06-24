import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  type DashboardRole,
  encodeSession,
  getCookieOptions,
  normalizeDashboardRole,
  SESSION_COOKIE
} from "@/lib/auth";
import { SESSION_TTL_MS, shouldRotateSession } from "@/lib/auth-session";
import { checkRateLimit, clientIp, rateLimitConfigs } from "@/lib/rate-limit";
import { getServerSession } from "@/lib/server-session";
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
  session: { role: DashboardRole; email: string; name: string },
  options?: {
    supabaseSession?: { access_token: string; refresh_token: string } | null;
    rotated?: boolean;
  }
) {
  const token = await encodeSession(session, SESSION_TTL_MS);
  const response = NextResponse.json({
    ok: true,
    session,
    token,
    rotated: options?.rotated ?? false,
    supabaseSession: options?.supabaseSession ?? null
  });

  response.cookies.set(SESSION_COOKIE, token, getCookieOptions());
  return response;
}

export async function GET() {
  const cookieStore = await cookies();
  const currentToken = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  const session = await getServerSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Sessao invalida ou expirada." }, { status: 401 });
  }

  if (shouldRotateSession(session)) {
    return buildSessionResponse(toSessionPayload(session), { rotated: true });
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

  const body = (await request.json().catch(() => null)) as
    | { role?: string; email?: string; password?: string }
    | null;

  const role = normalizeDashboardRole(body?.role);
  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";

  if (role !== "admin" || !email || !password) {
    return NextResponse.json({ ok: false, error: "Dados de login invalidos." }, { status: 400 });
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
  if (metadataRole !== "admin" || metadataRole !== role) {
    return NextResponse.json({ ok: false, error: "Acesso nao autorizado." }, { status: 403 });
  }

  const session = {
    role: metadataRole,
    email: result.data.user.email ?? email,
    name:
      typeof result.data.user.user_metadata?.name === "string"
        ? result.data.user.user_metadata.name
        : email.split("@")[0]
  } as const;

  return buildSessionResponse(session, {
    supabaseSession: result.data.session
      ? {
          access_token: result.data.session.access_token,
          refresh_token: result.data.session.refresh_token
        }
      : null
  });
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
      console.warn("Revogacao global ignorada por rate limit; seguindo com logout local-only.");
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
          console.error("Falha ao revogar sessoes globais:", error.message);
          // Fallback: segue para limpar apenas o cookie local (logout nao deve falhar).
        } else {
          mode = "global";
          revoked = true;
        }
      } catch (error) {
        console.error(
          "Erro ao revogar sessoes globais:",
          error instanceof Error ? error.message : error
        );
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
