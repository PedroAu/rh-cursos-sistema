import { NextRequest, NextResponse } from "next/server";

import {
  encodeSession,
  findDemoUser,
  SESSION_COOKIE,
  type DashboardRole,
  type DemoSession
} from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

function normalizeRole(value: unknown): DashboardRole | null {
  return value === "student" || value === "admin" || value === "instructor" ? value : null;
}

async function authenticateWithSupabase(email: string, password: string, requestedRole: DashboardRole) {
  if (!supabaseServer) return null;

  const result = await supabaseServer.auth.signInWithPassword({ email, password });
  if (result.error || !result.data.user) return null;

  const metadataRole = normalizeRole(result.data.user.user_metadata?.role);
  const role = metadataRole ?? requestedRole;
  const name =
    typeof result.data.user.user_metadata?.name === "string"
      ? result.data.user.user_metadata.name
      : email.split("@")[0];

  return {
    role,
    email: result.data.user.email ?? email,
    name
  } satisfies DemoSession;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { role?: string; email?: string; password?: string }
    | null;

  const role = normalizeRole(body?.role);
  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";

  if (!role || !email || !password) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabaseSession = await authenticateWithSupabase(email, password, role);
  const demoUser = supabaseSession ? null : findDemoUser(role, email, password);
  const session =
    supabaseSession ??
    (demoUser
      ? {
          role: demoUser.role,
          email: demoUser.email,
          name: demoUser.name
        }
      : null);

  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, session });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: await encodeSession(session),
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
