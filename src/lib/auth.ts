export type DashboardRole = "admin";

export type DemoSession = {
  role: DashboardRole;
  email: string;
  name: string;
  /** Epoch ms de expiração. Presente apenas quando a sessão foi emitida com TTL. */
  exp?: number;
};

export const SESSION_COOKIE = "rh_cursos_demo_session";

/** TTL padrão (ms) usado para emitir sessões assinadas com expiração. */
export const SESSION_TTL_MS = 30 * 60 * 1000;

export function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/"
  };
}

export function getSessionSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SESSION_SECRET environment variable is required in production"
      );
    }
    console.warn(
      "⚠️ AUTH_SESSION_SECRET not set. Using insecure fallback for development only."
    );
    return "dev-insecure-fallback-change-in-production";
  }

  if (secret.length < 32) {
    throw new Error(
      "AUTH_SESSION_SECRET must be at least 32 characters for security"
    );
  }

  return secret;
}

export const SESSION_SECRET = getSessionSecret();

function getDemoUsers(): Array<DemoSession & { password: string }> {
  if (process.env.NODE_ENV === "production") {
    return [];
  }

  const demoPassword = process.env.DEMO_ADMIN_PASSWORD;
  if (!demoPassword) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH !== "true") {
      return [];
    }
    console.warn(
      "⚠️ DEMO_ADMIN_PASSWORD not set. Demo authentication disabled."
    );
    return [];
  }

  return [
    {
      role: "admin",
      email: "admin@rhcursos.demo",
      password: demoPassword,
      name: "Admin RH Cursos"
    }
  ];
}

export const demoUsers = getDemoUsers();

function toBase64Url(value: ArrayBuffer | string) {
  const binary =
    typeof value === "string"
      ? value
      : String.fromCharCode(...new Uint8Array(value));

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
}

async function signPayload(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function isDashboardRole(value: unknown): value is DashboardRole {
  return value === "admin";
}

export async function encodeSession(session: DemoSession, ttlMs?: number) {
  const payload = toBase64Url(
    JSON.stringify(ttlMs ? { ...session, exp: Date.now() + ttlMs } : session)
  );
  const signature = await signPayload(payload);
  return `${payload}.${signature}`;
}

export async function decodeSession(value?: string): Promise<DemoSession | null> {
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = await signPayload(payload);
  if (!timingSafeEqual(signature, expectedSignature)) return null;

  const parsed = JSON.parse(fromBase64Url(payload)) as Partial<DemoSession>;
  if (!isDashboardRole(parsed.role) || !parsed.email || !parsed.name) return null;
  if (typeof parsed.exp === "number" && parsed.exp < Date.now()) return null;

  return {
    role: parsed.role,
    email: parsed.email,
    name: parsed.name,
    ...(typeof parsed.exp === "number" ? { exp: parsed.exp } : {})
  };
}

export function findDemoUser(role: string, email: string, password: string) {
  return demoUsers.find(
    (user) =>
      user.role === role &&
      user.email.toLowerCase() === email.trim().toLowerCase() &&
      user.password === password
  );
}
