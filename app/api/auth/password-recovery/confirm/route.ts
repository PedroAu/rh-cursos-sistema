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

  const rate = await checkRateLimit(`password-recovery-confirm:${clientIp(request)}`, rateLimitConfigs.auth);
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    code?: unknown;
    tokenHash?: unknown;
  } | null;
  const code = typeof body?.code === "string" ? body.code : "";
  const tokenHash = typeof body?.tokenHash === "string" ? body.tokenHash : "";
  if (!code && !tokenHash) {
    return NextResponse.json({ ok: false, error: "Link de recuperação inválido." }, { status: 400 });
  }

  const supabase = createSupabaseSSRClient(await getCookieAdapter());
  if (!supabase) return NextResponse.json({ ok: false, error: "Auth indisponível." }, { status: 503 });

  const result = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
  if (result.error) return NextResponse.json({ ok: false, error: "Link inválido ou expirado." }, { status: 401 });

  return NextResponse.json({ ok: true });
}
