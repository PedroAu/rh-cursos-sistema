import { NextRequest, NextResponse } from "next/server";

import { createEnrollmentInSupabase } from "@/lib/supabase/rh-cursos-api";
import { enrollmentSchema, validateInput, type EnrollmentInput } from "@/lib/validation";
import type { Enrollment } from "@/types";
import { checkRateLimit, rateLimitConfigs } from "@/lib/rate-limiter";
import { withCors, isOriginAllowed } from "@/lib/cors";
import { getCsrfTokenFromRequest, validateCsrfToken } from "@/lib/csrf";
import { getSessionSecret } from "@/lib/auth";

async function handlePost(request: NextRequest) {
  try {
    // Rate limiting check by IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimit = checkRateLimit(ip, rateLimitConfigs.enrollment);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false, error: "Muitas tentativas. Tente novamente mais tarde." },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.retryAfter.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // CORS validation
    const origin = request.headers.get("origin");
    if (!isOriginAllowed(origin)) {
      return NextResponse.json({ ok: false, error: "Origin not allowed" }, { status: 403 });
    }

    // CSRF token validation
    const csrfToken = getCsrfTokenFromRequest(request);
    if (!csrfToken || !validateCsrfToken(csrfToken, getSessionSecret())) {
      return NextResponse.json(
        { ok: false, error: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    // Parse and validate payload
    const payload = (await request.json().catch(() => null)) as unknown;

    if (!payload) {
      return NextResponse.json(
        { ok: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate input using Zod schema
    const validation = validateInput(enrollmentSchema, payload);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", errors: validation.errors },
        { status: 400 }
      );
    }

    const enrollment = await createEnrollmentInSupabase(validation.data as Omit<Enrollment, "id" | "createdAt" | "status">);

    const response = NextResponse.json(
      { ok: true, enrollment },
      { status: 201 }
    );

    // Add rate limit info to headers
    response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());

    return response;
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      {
        ok: false,
        error: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : "Unknown error") : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return withCors(request, handlePost);
}
