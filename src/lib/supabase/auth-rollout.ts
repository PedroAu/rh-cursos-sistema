const ROLLOUT_ENV_NAME = "SSR_AUTH_ROLLOUT_ACCOUNTS";

function normalizeAccount(value: string): string {
  return value.trim().toLowerCase();
}
/**
 * Allowlist server-only da Fase A de REC-204.
 *
 * Aceita uma lista separada por virgulas. Valores vazios sao ignorados e a
 * ausencia da variavel mantem o caminho legado integralmente inalterado.
 */
export function getSsrAuthRolloutAccounts(
  rawValue = process.env[ROLLOUT_ENV_NAME]
): ReadonlySet<string> {
  return new Set(
    (rawValue ?? "")
      .split(",")
      .map(normalizeAccount)
      .filter(Boolean)
  );
}

export function isSsrAuthRolloutAccount(
  email: string | null | undefined,
  accounts = getSsrAuthRolloutAccounts()
): boolean {
  return Boolean(email && accounts.has(normalizeAccount(email)));
}
