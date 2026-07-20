import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { checkRateLimit, clientIp, rateLimitConfigs } from "@/lib/rate-limit";
import { applyNoStore } from "@/lib/security-headers";
import { requireServerRole } from "@/lib/supabase/authorize";
import {
  createSupabaseSSRClient,
  isSupabaseSsrConfigured,
  type SsrCookieAdapter
} from "@/lib/supabase/session";

/**
 * Token efêmero de realtime (follow-up REC-204 / item 6 do post-mortem REC-502).
 *
 * Desde o cutover REC-204 Fase B a sessão administrativa vive apenas nos cookies
 * httpOnly (ADR-016 D2), inacessíveis ao JS do browser. O cliente Supabase do
 * browser (`@/lib/supabase/client`) fica permanentemente `anon`, e o Supabase
 * Realtime aplica RLS por conexão — logo o dashboard admin nunca recebe eventos
 * de `lead`/`aluno`/`inscricao` (policies `to authenticated`), quebrando o
 * realtime sem reload.
 *
 * Esta rota é o BFF same-origin que lê a sessão SSR httpOnly no servidor e
 * devolve, sob demanda, o `access_token` de curta duração da sessão atual para
 * ser usado SOMENTE em memória JS (`supabase.realtime.setAuth`), nunca
 * persistido em storage. O `refresh_token` NÃO é exposto — só o access token,
 * que o próprio Supabase expira automaticamente. Superfície mínima e temporária,
 * qualitativamente diferente do padrão de sessão em localStorage removido por
 * REC-204.
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

// REC-408: toda resposta desta rota BFF autenticada é `no-store`.
export async function GET(request: Request) {
  return applyNoStore(await handleGet(request));
}

async function handleGet(request: Request) {
  if (!isSupabaseSsrConfigured) {
    return NextResponse.json({ ok: false, error: "Auth indisponivel." }, { status: 503 });
  }

  const rate = await checkRateLimit(`realtime-token:${clientIp(request)}`, rateLimitConfigs.admin);
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

  // Autorização resolvida na FONTE a cada chamada (REC-203). Fail-closed.
  const authorization = await requireServerRole(supabase, "admin");
  if (!authorization.authorized) {
    if (authorization.reason === "unauthenticated") {
      return NextResponse.json({ ok: false, error: "Sessao invalida ou expirada." }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: "Acesso nao autorizado." }, { status: 403 });
  }

  const { data, error } = await supabase.auth.getSession();
  const session = data?.session ?? null;
  if (error || !session?.access_token) {
    return NextResponse.json({ ok: false, error: "Sessao invalida ou expirada." }, { status: 401 });
  }

  // `expires_at` do Supabase é epoch em segundos; expomos em milissegundos para
  // o agendamento de renovação no cliente. Sem TTL inventado — usa o valor real
  // da sessão (fallback para `expires_in` quando `expires_at` não vier).
  const expiresAt =
    typeof session.expires_at === "number"
      ? session.expires_at * 1000
      : Date.now() + (session.expires_in ?? 0) * 1000;

  return NextResponse.json({ accessToken: session.access_token, expiresAt });
}
