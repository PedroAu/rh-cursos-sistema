import { SESSION_TTL_MS } from "@/lib/auth-session";
import type { Database } from "@/lib/supabase/database.types";

export type DashboardRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];

export type DemoSession = {
  role: DashboardRole;
  email: string;
  name: string;
  /** Epoch ms de expiração da sessão assinada. */
  exp?: number;
};

export function getCookieOptions(ttlMs = SESSION_TTL_MS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(ttlMs / 1000)
  };
}

export function isDashboardRole(value: unknown): value is DashboardRole {
  return value === "admin" || value === "instructor" || value === "student";
}

export function normalizeDashboardRole(value: unknown): DashboardRole | null {
  return isDashboardRole(value) ? value : null;
}
