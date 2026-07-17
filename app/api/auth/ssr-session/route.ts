import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { normalizeDashboardRole } from "@/lib/auth";
import { checkRateLimit, clientIp, rateLimitConfigs } from "@/lib/rate-limit";
import { getDefaultDashboardPath } from "@/lib/session-routing";
import {
  createSupabaseSSRClient,
  isSupabaseSsrConfigured,
  readSSRSession,
  signInSSR,
  signOutSSR,
  type SsrCookieAdapter
} from "@/lib/supabase/session";

/**
 * Rota SSR de sessão (REC-202 — implementa D2 e D3 do ADR-016).
 *
 * É ADITIVA e independente de `app/api/auth/session/route.ts` (fluxo HMAC), que
 * permanece intacto e continua sendo a autoridade de autorização até
 * REC-203/REC-204. Objetivo: introduzir o novo caminho de identidade (sessão do
 * Supabase em cookies httpOnly + AAL2 fail-closed) sem tocar no caminho antigo,
 * eliminando risco de lockout (a rota antiga não muda).
 *
 * Nenhum token do Supabase é devolvido no corpo (D2): a sessão vive apenas nos
 * cookies httpOnly gerenciados pelo `@supabase/ssr`.
 */

async function getCookieAdapter(): Promise<SsrCookieAdapter> {
  const cookieStore = await cookies();
  return {
    getAll: () => cookieStore.getAll().map((c) => ({ name: c.name, value: c.value })),
    setAll: (toSet) => {
      for (const { name, value, options } of toSet) {
        cookieStore.set(name, value, options);
      }
    }
  };
}

export async function POST(request: Request) {
  if (!isSupabaseSsrConfigured) {
    return NextResponse.json({ ok: false, error: "Auth indisponivel." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
    role?: string;
    mfaCode?: string;
  } | null;

  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";
  const requestedRole = typeof body?.role === "string" ? normalizeDashboardRole(body.role) : undefined;
  const mfaCode = typeof body?.mfaCode === "string" ? body.mfaCode.trim() : undefined;

  if ((body?.role && !requestedRole) || !email || !password) {
    return NextResponse.json({ ok: false, error: "Dados de login invalidos." }, { status: 400 });
  }

  const rate = await checkRateLimit(`auth-ssr:${clientIp(request)}`, rateLimitConfigs.auth);
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  const supabase = createSupabaseSSRClient(await getCookieAdapter());
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Auth indisponivel." }, { status: 503 });
  }

  const result = await signInSSR(supabase, {
    email,
    password,
    role: requestedRole ?? null,
    mfaCode
  });

  switch (result.status) {
    case "unconfigured":
      return NextResponse.json({ ok: false, error: "Auth indisponivel." }, { status: 503 });
    case "invalid_credentials":
      return NextResponse.json({ ok: false, error: "Credenciais invalidas." }, { status: 401 });
    case "unauthorized":
      return NextResponse.json({ ok: false, error: "Acesso nao autorizado." }, { status: 403 });
    case "mfa_required":
      // Fail-closed: nenhuma sessão administrativa emitida sem AAL2.
      return NextResponse.json(
        { ok: false, mfaRequired: true, factorId: result.factorId, error: "Verificacao MFA obrigatoria." },
        { status: 401 }
      );
    case "mfa_failed":
      return NextResponse.json(
        { ok: false, mfaRequired: true, error: "Codigo MFA invalido ou expirado." },
        { status: 401 }
      );
    case "authenticated": {
      const response = NextResponse.json({
        ok: true,
        session: { role: result.role, email: result.email, name: result.name },
        aal: result.aal
      });
      response.headers.set("x-rh-dashboard-path", getDefaultDashboardPath(result.role));
      return response;
    }
  }
}

export async function GET() {
  if (!isSupabaseSsrConfigured) {
    return NextResponse.json({ ok: false, error: "Auth indisponivel." }, { status: 503 });
  }

  const supabase = createSupabaseSSRClient(await getCookieAdapter());
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Auth indisponivel." }, { status: 503 });
  }

  const read = await readSSRSession(supabase);
  if (read.status === "none") {
    return NextResponse.json({ ok: false, error: "Sessao invalida ou expirada." }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    session: { role: read.role, email: read.email, name: read.name },
    aal: read.aal
  });
}

export async function DELETE() {
  if (!isSupabaseSsrConfigured) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createSupabaseSSRClient(await getCookieAdapter());
  if (supabase) {
    await signOutSSR(supabase);
  }

  return NextResponse.json({ ok: true });
}
