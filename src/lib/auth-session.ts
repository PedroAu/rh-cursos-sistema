export const SESSION_TTL_MS = 30 * 60 * 1000;
export const REMEMBER_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const SESSION_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

type ExpiringSession = {
  exp?: number;
};

export function isSessionExpired(session: ExpiringSession, now = Date.now()): boolean {
  return typeof session.exp === "number" && session.exp < now;
}

export function shouldRotateSession(session: ExpiringSession, now = Date.now()): boolean {
  if (typeof session.exp !== "number") {
    return true;
  }

  return session.exp - now <= SESSION_REFRESH_THRESHOLD_MS;
}
