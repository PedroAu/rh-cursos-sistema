import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { applyNoStore } from "@/lib/security-headers";
import { checkRateLimit, clientIp, rateLimitConfigs } from "@/lib/rate-limit";
import {
  createSupabaseSSRClient,
  isSupabaseSsrConfigured,
  type SsrCookieAdapter,
} from "@/lib/supabase/session";

async function getCookieAdapter(): Promise<SsrCookieAdapter> {
  const cookieStore = await cookies();
  return {
    getAll: () => cookieStore.getAll().map(({ name, value }) => ({ name, value })),
    setAll: (toSet) => {
      for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
    },
  };
}

export async function POST(request: Request) {
  return applyNoStore(await handlePost(request));
}

async function handlePost(request: Request) {
  if (!isSupabaseSsrConfigured) {
    return NextResponse.json({ ok: false, error: "Auth indisponível." }, { status: 503 });
  }

  const rate = await checkRateLimit(`password-recovery-session:${clientIp(request)}`, rateLimitConfigs.auth);
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    accessToken?: unknown;
    refreshToken?: unknown;
  } | null;
  if (typeof body?.accessToken !== "string" || typeof body.refreshToken !== "string") {
    return NextResponse.json({ ok: false, error: "Sessão de recuperação inválida." }, { status: 400 });
  }

  const supabase = createSupabaseSSRClient(await getCookieAdapter());
  if (!supabase) return NextResponse.json({ ok: false, error: "Auth indisponível." }, { status: 503 });

  const { error } = await supabase.auth.setSession({
    access_token: body.accessToken,
    refresh_token: body.refreshToken,
  });
  if (error) return NextResponse.json({ ok: false, error: "Link inválido ou expirado." }, { status: 401 });

  return NextResponse.json({ ok: true });
}
