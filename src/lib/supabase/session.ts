import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { type DashboardRole, normalizeDashboardRole } from "@/lib/auth";

/**
 * Sessão SSR do Supabase (REC-202 — implementa D2 e D3 do ADR-016).
 *
 * Este módulo é o NOVO caminho de identidade: sessão do Supabase Auth mantida
 * em cookies `httpOnly`/`secure`/`SameSite=Lax` (D2) e login que exige AAL2,
 * fail-closed, quando a conta possui fator MFA ativo (D3, fecha SEC-104).
 *
 * IMPORTANTE (D5 / anti-lockout): durante REC-202 esta sessão SSR COEXISTE com
 * a sessão HMAC própria (`src/lib/auth.ts`), que continua sendo a autoridade de
 * autorização até REC-203/REC-204. Nada aqui remove, altera ou desabilita o
 * fluxo HMAC. A remoção do HMAC é escopo de REC-204.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseSsrConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Atributos de cookie da sessão SSR. Espelham `getCookieOptions`
 * (`src/lib/auth.ts:18-26`) conforme D2: `httpOnly`, `secure` em produção,
 * `SameSite=Lax`, `path=/`. O tempo de vida da sessão SSR é gerido pelo próprio
 * Supabase (expiração do JWT + refresh token), não por um TTL assinado local.
 */
export function buildSsrCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  };
}

export type SsrCookie = { name: string; value: string; options?: CookieOptions };

/**
 * Adaptador de cookies desacoplado do framework, para que a lógica de sessão
 * SSR seja testável sem depender de `next/headers`. A rota fornece a
 * implementação concreta ligada ao `cookies()` do Next.
 */
export type SsrCookieAdapter = {
  getAll: () => { name: string; value: string }[];
  setAll: (cookies: SsrCookie[]) => void;
};

/**
 * Cria o cliente SSR do Supabase (chave anon/publishable, nunca service_role)
 * ligado ao armazenamento de cookies fornecido. O `@supabase/ssr` grava e lê a
 * sessão exclusivamente pelos cookies via `getAll`/`setAll`.
 */
export function createSupabaseSSRClient(cookies: SsrCookieAdapter): SupabaseClient | null {
  if (!isSupabaseSsrConfigured) {
    return null;
  }

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookieOptions: buildSsrCookieOptions(),
    cookies: {
      getAll: () => cookies.getAll(),
      setAll: (toSet) => cookies.setAll(toSet)
    }
  });
}

export type AuthenticatorAssuranceLevel = "aal1" | "aal2";

export type SsrLoginResult =
  | { status: "unconfigured" }
  | { status: "invalid_credentials" }
  | { status: "unauthorized" }
  | { status: "mfa_required"; factorId: string }
  | { status: "mfa_failed" }
  | {
      status: "authenticated";
      aal: AuthenticatorAssuranceLevel;
      role: DashboardRole;
      email: string;
      name: string;
    };

type MinimalFactor = { id: string; factor_type?: string; status?: string };

function resolveVerifiedTotpFactor(data: {
  all?: MinimalFactor[] | null;
  totp?: MinimalFactor[] | null;
} | null): MinimalFactor | null {
  if (!data) return null;
  const candidates = data.all ?? data.totp ?? [];
  return (
    candidates.find(
      (factor) =>
        (factor.factor_type ? factor.factor_type === "totp" : true) && factor.status === "verified"
    ) ?? null
  );
}

function resolveName(user: { email?: string | null; user_metadata?: Record<string, unknown> | null }, fallbackEmail: string): string {
  const metaName = user.user_metadata?.name;
  if (typeof metaName === "string" && metaName.trim()) {
    return metaName;
  }
  const email = user.email ?? fallbackEmail;
  return email.split("@")[0];
}

/**
 * Login via sessão SSR do Supabase com AAL2 fail-closed (D3).
 *
 * Contrato:
 * - Conta SEM fator MFA verificado → sessão emitida em AAL1.
 * - Conta COM fator MFA e SEM `mfaCode` → `mfa_required`; a sessão AAL1 recém
 *   criada é encerrada (`signOut`) para NÃO deixar uma sessão administrativa
 *   aberta só com senha (fail-closed).
 * - Conta COM fator MFA e com `mfaCode` válido → challenge + verify; só emite
 *   sessão se `getAuthenticatorAssuranceLevel().currentLevel === "aal2"`.
 * - Falha do challenge/verify → `mfa_failed` e a sessão é encerrada (fail-closed).
 *
 * A verificação é feita sobre o `client` fornecido (injetável em testes). Em
 * produção, o `client` é o SSR client — logo, encerrar a sessão limpa os
 * cookies httpOnly, garantindo que nenhum caminho deixe senha sozinha (AAL1)
 * abrir sessão admin quando há MFA ativo.
 */
export async function signInSSR(
  client: SupabaseClient,
  params: { email: string; password: string; role?: DashboardRole | null; mfaCode?: string }
): Promise<SsrLoginResult> {
  const { data, error } = await client.auth.signInWithPassword({
    email: params.email,
    password: params.password
  });

  if (error || !data?.user) {
    return { status: "invalid_credentials" };
  }

  const role = normalizeDashboardRole(data.user.app_metadata?.role);
  if (!role || (params.role && params.role !== role)) {
    // Sem papel autorizado: não deixa a sessão de senha aberta.
    await client.auth.signOut();
    return { status: "unauthorized" };
  }

  const email = data.user.email ?? params.email;
  const name = resolveName(data.user, params.email);

  const factorsResult = await client.auth.mfa.listFactors();
  const factor = resolveVerifiedTotpFactor(factorsResult.data ?? null);

  if (!factor) {
    // Sem MFA ativo: AAL1 é o nível máximo alcançável para esta conta.
    return { status: "authenticated", aal: "aal1", role, email, name };
  }

  // Há fator MFA ativo: AAL2 é obrigatório (D3, fail-closed).
  if (!params.mfaCode) {
    await client.auth.signOut();
    return { status: "mfa_required", factorId: factor.id };
  }

  const challenge = await client.auth.mfa.challenge({ factorId: factor.id });
  if (challenge.error || !challenge.data?.id) {
    await client.auth.signOut();
    return { status: "mfa_failed" };
  }

  const verify = await client.auth.mfa.verify({
    factorId: factor.id,
    challengeId: challenge.data.id,
    code: params.mfaCode
  });
  if (verify.error) {
    await client.auth.signOut();
    return { status: "mfa_failed" };
  }

  const aal = await client.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal.data?.currentLevel !== "aal2") {
    await client.auth.signOut();
    return { status: "mfa_failed" };
  }

  return { status: "authenticated", aal: "aal2", role, email, name };
}

export type SsrSessionRead =
  | { status: "none" }
  | {
      status: "active";
      aal: AuthenticatorAssuranceLevel;
      role: DashboardRole | null;
      email: string;
      name: string;
    };

/**
 * Lê a sessão SSR atual a partir dos cookies (via `client`), resolvendo papel e
 * nível de garantia (AAL). Usado pelo GET da rota SSR. A resolução de
 * autorização por papel no servidor a cada operação é escopo de REC-203; aqui
 * apenas expomos a leitura da identidade SSR.
 */
export async function readSSRSession(client: SupabaseClient): Promise<SsrSessionRead> {
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) {
    return { status: "none" };
  }

  const role = normalizeDashboardRole(data.user.app_metadata?.role);
  const email = data.user.email ?? "";
  const name = resolveName(data.user, email);

  const aalResult = await client.auth.mfa.getAuthenticatorAssuranceLevel();
  const aal: AuthenticatorAssuranceLevel = aalResult.data?.currentLevel === "aal2" ? "aal2" : "aal1";

  return { status: "active", aal, role, email, name };
}

/** Encerra a sessão SSR, limpando os cookies httpOnly do Supabase. */
export async function signOutSSR(client: SupabaseClient): Promise<void> {
  await client.auth.signOut();
}
