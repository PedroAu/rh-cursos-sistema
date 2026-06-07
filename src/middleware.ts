import { NextRequest, NextResponse } from "next/server";
import { isOriginAllowed, setupCorsHeaders } from "@/lib/cors";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // HTTPS enforcement in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  // Setup CORS headers for API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    const origin = request.headers.get("origin");
    return setupCorsHeaders(response, origin);
  }

  return response;
}

export const config = {
  matcher: [
    // API routes
    "/api/:path*",
  ],
};
