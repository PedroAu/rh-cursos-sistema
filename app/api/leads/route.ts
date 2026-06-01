import { NextRequest, NextResponse } from "next/server";

import { createLeadInSupabase } from "@/lib/supabase/rh-cursos-api";
import type { Lead } from "@/types";

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as
    | Omit<Lead, "id" | "createdAt" | "status">
    | null;

  if (!payload?.name || !payload.email || !payload.courseInterest || !payload.origin) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const lead = await createLeadInSupabase(payload);
  return NextResponse.json({ ok: true, lead });
}
