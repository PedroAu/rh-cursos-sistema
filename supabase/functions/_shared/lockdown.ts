// Kill-switch operacional de indisponibilidade fail-closed (REC-003).
// Portado de src/lib/lockdown.ts para o runtime Deno das Edge Functions.
//
// Quando `INCIDENT_LOCKDOWN` está ativo, rotas administrativas autenticadas
// e endpoints públicos de escrita devem rejeitar a requisição com 503 em vez
// de processá-la. Fail-closed por padrão: qualquer erro ao ler a variável de
// ambiente resulta em lockdown ATIVO (bloqueia), nunca em liberação silenciosa.
// Não é um segredo — é um controle operacional lido em runtime.

const LOCKDOWN_ENV_VAR = "INCIDENT_LOCKDOWN";

const ACTIVE_VALUES = new Set(["true", "1"]);

export function isLockdownActive(): boolean {
  try {
    const raw = Deno.env.get(LOCKDOWN_ENV_VAR);
    if (raw === undefined || raw === null) return false;

    return ACTIVE_VALUES.has(raw.trim().toLowerCase());
  } catch {
    // Fail-closed: erro ao ler a configuração de lockdown bloqueia, nunca libera.
    return true;
  }
}

export const LOCKDOWN_RESPONSE_BODY = {
  ok: false,
  error: "service_unavailable",
  reason: "lockdown",
} as const;
