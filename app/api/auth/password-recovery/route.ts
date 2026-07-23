import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { logger } from "@/lib/logger";
import { checkRateLimit, clientIp, rateLimitConfigs } from "@/lib/rate-limit";
import { applyNoStore } from "@/lib/security-headers";
import {
  createSupabaseSSRClient,
  isSupabaseSsrConfigured,
  type SsrCookieAdapter
} from "@/lib/supabase/session";
import { getRecoveryRedirectUrl } from "@/lib/password-recovery";

async function getCookieAdapter(): Promise<SsrCookieAdapter> {
  const cookieStore = await cookies();
  return {
    getAll: () => cookieStore.getAll().map(({ name, value }) => ({ name, value })),
    setAll: (toSet) => {
      for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
    }
  };
}

export async function POST(request: Request) {
  return applyNoStore(await handlePost(request));
}

async function handlePost(request: Request) {
  if (!isSupabaseSsrConfigured) {
    return NextResponse.json({ ok: false, error: "Auth indisponível." }, { status: 503 });
  }

  const rate = await checkRateLimit(`password-recovery:${clientIp(request)}`, rateLimitConfigs.auth);
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Informe um e-mail válido." }, { status: 400 });
  }

  const supabase = createSupabaseSSRClient(await getCookieAdapter());
  if (!supabase) return NextResponse.json({ ok: false, error: "Auth indisponível." }, { status: 503 });

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getRecoveryRedirectUrl(new URL(request.url).origin)
  });
  if (error) {
    logger.error("password recovery request failed", { err: error });
    return NextResponse.json({ ok: false, error: "Não foi possível solicitar a recuperação agora." }, { status: 503 });
  }

  // Resposta uniforme: não revela se o e-mail existe no sistema.
  return NextResponse.json({ ok: true, message: "Se o e-mail estiver cadastrado, enviaremos as instruções." });
}
