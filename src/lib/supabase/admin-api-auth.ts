import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { isLockdownActive, LOCKDOWN_RESPONSE_BODY } from "@/lib/lockdown";
import { requireServerRole } from "@/lib/supabase/authorize";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import {
  createSupabaseSSRClient,
  isSupabaseSsrConfigured,
  type SsrCookieAdapter,
} from "@/lib/supabase/session";

/**
 * Guarda de autorização das rotas administrativas de read model (REC-303).
 *
 * PRIMEIRA ativação real de `requireServerRole()` (REC-203) em rota concreta.
 * Segura porque estas rotas são NET-NEW (REC-206 confirmou que não havia leitura
 * server-side de alunos/inscrições): não há comportamento de produção para
 * quebrar nem risco de lockout. NÃO é o cutover de REC-204 (que trocaria a
 * autoridade de rotas HMAC já em produção) — o HMAC permanece intocado.
 *
 * Fail-closed: sem configuração → 503; lockdown → 503; sem sessão SSR válida →
 * 401; papel abaixo de `admin` → 403. Só em caso autorizado devolve o cliente
 * privilegiado (service-role) para a leitura server-side.
 *
 * LIMITAÇÃO CONHECIDA E ACEITÁVEL (documentada em REC-303): a sessão SSR só é
 * populada por `signInSSR` (REC-202). O login administrativo de produção ainda
 * usa o fluxo HMAC (`src/lib/auth.ts`), que NÃO emite sessão SSR. Logo, um admin
 * logado apenas via HMAC não possui os cookies do Supabase e recebe 401 aqui. A
 * integração com o login de produção é escopo de uma story futura (REC-305 /
 * ajuste dedicado) — popular a sessão SSR a partir do HMAC seria pisar em
 * REC-204/305 e está fora do escopo desta story.
 */

async function getReadWriteCookieAdapter(): Promise<SsrCookieAdapter> {
  const cookieStore = await cookies();
  return {
    getAll: () => cookieStore.getAll().map((c) => ({ name: c.name, value: c.value })),
    setAll: (toSet) => {
      for (const { name, value, options } of toSet) {
        cookieStore.set(name, value, options);
      }
    },
  };
}

export type AdminApiGuardResult =
  | { ok: true; adminClient: SupabaseClient }
  | { ok: false; response: NextResponse };

/**
 * Resolve a autorização administrativa da requisição. Retorna o cliente
 * privilegiado quando autorizado, ou uma resposta de erro pronta (fail-closed).
 */
export async function requireAdminApi(): Promise<AdminApiGuardResult> {
  if (isLockdownActive()) {
    return { ok: false, response: NextResponse.json(LOCKDOWN_RESPONSE_BODY, { status: 503 }) };
  }

  if (!isSupabaseSsrConfigured || !isSupabaseServerConfigured) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: "Recurso indisponível." }, { status: 503 }),
    };
  }

  const ssrClient = createSupabaseSSRClient(await getReadWriteCookieAdapter());
  if (!ssrClient) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: "Recurso indisponível." }, { status: 503 }),
    };
  }

  const authorization = await requireServerRole(ssrClient, "admin");
  if (!authorization.authorized) {
    const status = authorization.reason === "unauthenticated" ? 401 : 403;
    const error =
      authorization.reason === "unauthenticated" ? "Sessão inválida ou expirada." : "Acesso não autorizado.";
    return { ok: false, response: NextResponse.json({ ok: false, error }, { status }) };
  }

  const adminClient = createSupabaseServerClient();
  if (!adminClient) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: "Recurso indisponível." }, { status: 503 }),
    };
  }

  return { ok: true, adminClient };
}
