export const PASSWORD_MIN_LENGTH = 12;

export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    return `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (!/[a-z]/.test(password)) return "A senha deve conter uma letra minúscula.";
  if (!/[A-Z]/.test(password)) return "A senha deve conter uma letra maiúscula.";
  if (!/\d/.test(password)) return "A senha deve conter um número.";
  if (!/[^A-Za-z0-9]/.test(password)) return "A senha deve conter um caractere especial.";
  return null;
}

export function getRecoveryRedirectUrl(origin?: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const base = configured || origin || "http://localhost:3000";
  return `${base}/auth/confirm?next=/recuperar-senha`;
}

export function safeRecoveryNext(value: string | null | undefined): string {
  return value === "/recuperar-senha?mode=update" ? value : "/recuperar-senha?mode=update";
}
