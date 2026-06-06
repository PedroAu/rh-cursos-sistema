import { NextRequest, NextResponse } from "next/server";

import { decodeSession, SESSION_COOKIE } from "@/lib/auth";
import { mutateAdminResource } from "@/lib/supabase/admin-resources";

async function requireAdmin(request: NextRequest) {
  const session = await decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
  return session?.role === "admin";
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const mutation = await request.json().catch(() => null);
  if (!mutation?.resource || !mutation?.action) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const result = await mutateAdminResource(mutation);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erro ao persistir recurso." },
      { status: 500 }
    );
  }
}
