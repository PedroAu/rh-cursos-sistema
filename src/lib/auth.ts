import { isSessionExpired, SESSION_TTL_MS } from "@/lib/auth-session";
import type { Database } from "@/lib/supabase/database.types";

export type DashboardRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];

export type DemoSession = {
  role: DashboardRole;
  email: string;
  name: string;
  /** Epoch ms de expiração da sessão assinada. */
  exp?: number;
};

export const SESSION_COOKIE = "rh_cursos_demo_session";

export function getCookieOptions(ttlMs = SESSION_TTL_MS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(ttlMs / 1000)
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

export function isDashboardRole(value: unknown): value is DashboardRole {
  return value === "admin" || value === "instructor" || value === "student";
}

export function normalizeDashboardRole(value: unknown): DashboardRole | null {
  return isDashboardRole(value) ? value : null;
}

export async function encodeSession(session: DemoSession, ttlMs = SESSION_TTL_MS) {
  const payload = toBase64Url(JSON.stringify({ ...session, exp: Date.now() + ttlMs }));
  const signature = await signPayload(payload);
  return `${payload}.${signature}`;
}

export async function decodeSession(value?: string): Promise<DemoSession | null> {
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = await signPayload(payload);
  if (!timingSafeEqual(signature, expectedSignature)) return null;

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as Partial<DemoSession>;
    if (!isDashboardRole(parsed.role) || !parsed.email || !parsed.name) return null;
    if (typeof parsed.exp !== "number" || isSessionExpired(parsed)) return null;

    return {
      role: parsed.role,
      email: parsed.email,
      name: parsed.name,
      exp: parsed.exp
    };
  } catch {
    return null;
  }
}
