import { NextRequest, NextResponse } from "next/server";

import { createLeadInSupabase } from "@/lib/supabase/rh-cursos-api";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { Lead } from "@/types";

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      console.error("Supabase not configured");
      return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 500 });
    }

    const payload = (await request.json().catch(() => null)) as
      | Omit<Lead, "id" | "createdAt" | "status">
      | null;

    if (!payload?.name || !payload.email || !payload.courseInterest || !payload.origin) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const lead = await createLeadInSupabase(payload);
    return NextResponse.json({ ok: true, lead });
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error creating lead:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
