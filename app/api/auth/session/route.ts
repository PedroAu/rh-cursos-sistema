import { NextResponse } from "next/server";

import { encodeSession, getCookieOptions, SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/auth";
import { checkRateLimit, clientIp, rateLimitConfigs } from "@/lib/rate-limit";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function normalizeRole(value: unknown) {
  return value === "admin" ? "admin" : null;
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

  const role = normalizeRole(body?.role);
  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";

  if (!role || !email || !password) {
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

  const metadataRole = normalizeRole(result.data.user.app_metadata?.role);
  if (!metadataRole) {
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

  const token = await encodeSession(session, SESSION_TTL_MS);

  const response = NextResponse.json({
    ok: true,
    session,
    token,
    supabaseSession: result.data.session
      ? {
          access_token: result.data.session.access_token,
          refresh_token: result.data.session.refresh_token
        }
      : null
  });

  response.cookies.set(SESSION_COOKIE, token, getCookieOptions());

  return response;
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as { accessToken?: string } | null;
  const accessToken = body?.accessToken;

  if (accessToken && supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin.auth.admin.signOut(accessToken, "global");
      if (error) {
        console.error("Falha ao revogar sessoes globais:", error.message);
        // Fallback: segue para limpar apenas o cookie local (logout nao deve falhar).
      }
    } catch (error) {
      console.error(
        "Erro ao revogar sessoes globais:",
        error instanceof Error ? error.message : error
      );
      // Fallback: segue para limpar apenas o cookie local (logout nao deve falhar).
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    ...getCookieOptions(),
    maxAge: 0
  });
  return response;
}
