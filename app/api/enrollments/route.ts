import { NextRequest, NextResponse } from "next/server";

import { createEnrollmentInSupabase } from "@/lib/supabase/rh-cursos-api";
import { enrollmentSchema, validateInput, type EnrollmentInput } from "@/lib/validation";
import type { Enrollment } from "@/types";
import { checkRateLimit, rateLimitConfigs } from "@/lib/rate-limiter";
import { withCors, isOriginAllowed } from "@/lib/cors";
import { getCsrfTokenFromRequest, validateCsrfToken } from "@/lib/csrf";
import { getSessionSecret } from "@/lib/auth";
import { handleApiError, RateLimitError, ForbiddenError, ValidationError } from "@/lib/error-handler";
import { logEnrollmentEvent, logSecurityEvent } from "@/lib/audit-logger";
import { applyApiSecurityHeaders } from "@/lib/security-headers";

async function handlePost(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  try {
    // Rate limiting check by IP
    const rateLimit = checkRateLimit(ip, rateLimitConfigs.enrollment);

    if (!rateLimit.allowed) {
      logSecurityEvent("security.rate_limit_exceeded", ip);

      const response = NextResponse.json(
        { ok: false, error: "Muitas tentativas. Tente novamente mais tarde." },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.retryAfter.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
      return applyApiSecurityHeaders(response);
    }

    // CORS validation
    const origin = request.headers.get("origin");
    if (!isOriginAllowed(origin)) {
      logSecurityEvent("security.suspicious_activity", ip, undefined, {
        reason: "invalid_origin",
        origin,
      });

      const response = NextResponse.json(
        { ok: false, error: "Origin not allowed" },
        { status: 403 }
      );
      return applyApiSecurityHeaders(response);
    }

    // CSRF token validation
    const csrfToken = getCsrfTokenFromRequest(request);
    if (!csrfToken || !validateCsrfToken(csrfToken, getSessionSecret())) {
      logSecurityEvent("security.csrf_failed", ip, undefined, {
        hasCsrfToken: !!csrfToken,
      });

      throw new ForbiddenError("Invalid CSRF token");
    }

    // Parse and validate payload
    const payload = (await request.json().catch(() => null)) as unknown;

    if (!payload) {
      throw new ValidationError("Invalid request body");
    }

    // Validate input using Zod schema
    const validation = validateInput(enrollmentSchema, payload);

    if (!validation.success) {
      throw new ValidationError("Validation failed", validation.errors);
    }

    // Create enrollment
    const enrollment = await createEnrollmentInSupabase(
      validation.data as Omit<Enrollment, "id" | "createdAt" | "status">
    );

    // Log successful enrollment
    logEnrollmentEvent("create", enrollment.id, validation.data.email, ip, {
      courseId: validation.data.courseId,
      classId: validation.data.classId,
    });

    const response = NextResponse.json(
      { ok: true, enrollment },
      { status: 201 }
    );

    // Add rate limit info to headers
    response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());

    // Apply API security headers
    return applyApiSecurityHeaders(response);
  } catch (error) {
    return handleApiError(error, {
      context: "enrollment.create",
      ipAddress: ip,
    });
  }
}

export async function POST(request: NextRequest) {
  return withCors(request, handlePost);
}
