import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { checkRateLimit, clientIp, rateLimitConfigs } from "@/lib/rate-limit";
import { validatePassword } from "@/lib/password-recovery";
import { applyNoStore } from "@/lib/security-headers";
import {
  createSupabaseSSRClient,
  isSupabaseSsrConfigured,
  type SsrCookieAdapter
} from "@/lib/supabase/session";

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
  if (!isSupabaseSsrConfigured) return NextResponse.json({ ok: false, error: "Auth indisponível." }, { status: 503 });
  const rate = await checkRateLimit(`password-update:${clientIp(request)}`, rateLimitConfigs.auth);
  if (!rate.allowed) return NextResponse.json({ ok: false, error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });

  const body = (await request.json().catch(() => null)) as { password?: unknown; confirmation?: unknown } | null;
  const password = body?.password;
  const confirmation = body?.confirmation;
  const passwordError = validatePassword(password);
  if (passwordError) return NextResponse.json({ ok: false, error: passwordError }, { status: 400 });
  if (password !== confirmation) return NextResponse.json({ ok: false, error: "As senhas não coincidem." }, { status: 400 });

  const supabase = createSupabaseSSRClient(await getCookieAdapter());
  if (!supabase) return NextResponse.json({ ok: false, error: "Auth indisponível." }, { status: 503 });
  const user = await supabase.auth.getUser();
  if (user.error || !user.data.user) return NextResponse.json({ ok: false, error: "Link inválido ou expirado." }, { status: 401 });

  const result = await supabase.auth.updateUser({ password: password as string });
  if (result.error) return NextResponse.json({ ok: false, error: "Não foi possível atualizar a senha." }, { status: 400 });

  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.json({ ok: true });
}
