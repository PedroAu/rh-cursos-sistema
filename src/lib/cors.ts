import { NextResponse, NextRequest } from "next/server";

export interface CorsConfig {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

// Default CORS configuration
const defaultConfig: CorsConfig = {
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  exposedHeaders: ["X-CSRF-Token", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
  credentials: true,
  maxAge: 3600, // 1 hour
};

// Get allowed origins
function getAllowedOrigins(): string[] {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origins: string[] = [];

  if (appUrl) {
    origins.push(appUrl);
  }

  // Add production domains
  origins.push("https://rhcursos.com.br", "https://www.rhcursos.com.br");

  // Add development domains
  if (process.env.NODE_ENV === "development") {
    origins.push("http://localhost:3000", "http://127.0.0.1:3000");
  }

  return origins;
}

// Check if origin is allowed
export function isOriginAllowed(origin: string | null, customOrigins?: string[]): boolean {
  if (!origin) return false;

  const allowedOrigins = customOrigins || getAllowedOrigins();
  return allowedOrigins.includes(origin);
}

// Setup CORS headers on response
export function setupCorsHeaders(
  response: NextResponse,
  origin: string | null,
  config: CorsConfig = {}
): NextResponse {
  const finalConfig = { ...defaultConfig, ...config };
  const allowedOrigins = finalConfig.allowedOrigins || getAllowedOrigins();

  // Only set CORS headers if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);

    if (finalConfig.credentials) {
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    if (finalConfig.allowedMethods) {
      response.headers.set("Access-Control-Allow-Methods", finalConfig.allowedMethods.join(", "));
    }

    if (finalConfig.allowedHeaders) {
      response.headers.set("Access-Control-Allow-Headers", finalConfig.allowedHeaders.join(", "));
    }

    if (finalConfig.exposedHeaders) {
      response.headers.set("Access-Control-Expose-Headers", finalConfig.exposedHeaders.join(", "));
    }

    if (finalConfig.maxAge) {
      response.headers.set("Access-Control-Max-Age", finalConfig.maxAge.toString());
    }
  }

  return response;
}

// Handle preflight requests
export function handleCorsPreflightRequest(
  request: NextRequest,
  config: CorsConfig = {}
): NextResponse | null {
  if (request.method !== "OPTIONS") {
    return null;
  }

  const origin = request.headers.get("origin");
  const response = new NextResponse(null, { status: 200 });

  return setupCorsHeaders(response, origin, config);
}

// Middleware helper for CORS
export async function withCors(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: CorsConfig = {}
): Promise<NextResponse> {
  // Handle preflight
  const preflightResponse = handleCorsPreflightRequest(request, config);
  if (preflightResponse) {
    return preflightResponse;
  }

  const origin = request.headers.get("origin");

  // Check origin for non-preflight requests
  if (request.method !== "GET" && !isOriginAllowed(origin, config.allowedOrigins)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Call the handler
  const response = await handler(request);

  // Setup CORS headers on response
  return setupCorsHeaders(response, origin, config);
}
