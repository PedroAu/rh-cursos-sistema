import { NextRequest, NextResponse } from "next/server";
import { isOriginAllowed, setupCorsHeaders } from "@/lib/cors";
import { applySecurityHeaders, applyApiSecurityHeaders } from "@/lib/security-headers";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Apply security headers globally
  applySecurityHeaders(response);

  // Setup CORS headers for API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    const origin = request.headers.get("origin");
    setupCorsHeaders(response, origin);

    // Additional security headers for API responses
    applyApiSecurityHeaders(response);
  }

  return response;
}

export const config = {
  matcher: [
    // Protect all routes with security headers
    "/:path*",
  ],
};
