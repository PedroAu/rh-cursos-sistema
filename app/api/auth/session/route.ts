import { NextResponse } from "next/server";

import { encodeSession, SESSION_COOKIE } from "@/lib/auth";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

function normalizeRole(value: unknown) {
  return value === "admin" ? "admin" : null;
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/"
  };
}

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured) {
    return NextResponse.json({ ok: false, error: "Auth indisponivel." }, { status: 503 });
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

  const token = await encodeSession(session);

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

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    ...getCookieOptions(),
    maxAge: 0
  });
  return response;
}
