/**
 * Kill-switch operacional de indisponibilidade fail-closed (REC-003).
 *
 * Quando `INCIDENT_LOCKDOWN` está ativo, rotas administrativas autenticadas
 * e endpoints públicos de escrita devem rejeitar a requisição com 503 em vez
 * de processá-la. Isso permite ao incident commander bloquear um ambiente
 * onde a rotação de credenciais (REC-002) não foi comprovada, sem depender
 * de deploy de código nem de exceções acidentais de configuração.
 *
 * Contrato:
 * - Não é um segredo: é um controle operacional (string/booleano), lido em
 *   runtime, sem valor hardcoded.
 * - Fail-closed por padrão: qualquer erro ao ler a variável de ambiente
 *   resulta em lockdown ATIVO (bloqueia), nunca em liberação silenciosa.
 * - Valores que ativam o lockdown: "true" ou "1" (case-insensitive, com
 *   espaços ao redor tolerados). Qualquer outro valor, incluindo variável
 *   ausente, mantém o comportamento normal (lockdown inativo).
 */

const LOCKDOWN_ENV_VAR = "INCIDENT_LOCKDOWN";

const ACTIVE_VALUES = new Set(["true", "1"]);

export function isLockdownActive(): boolean {
  try {
    const raw = process.env[LOCKDOWN_ENV_VAR];
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
  reason: "lockdown"
} as const;
