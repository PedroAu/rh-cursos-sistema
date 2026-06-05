import { NextRequest, NextResponse } from "next/server";

import { createEnrollmentInSupabase } from "@/lib/supabase/rh-cursos-api";
import type { Enrollment } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json().catch(() => null)) as
      | Omit<Enrollment, "id" | "createdAt" | "status">
      | null;

    if (!payload?.studentName || !payload.email || !payload.courseId || !payload.classId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const enrollment = await createEnrollmentInSupabase(payload);
    return NextResponse.json({ ok: true, enrollment });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
