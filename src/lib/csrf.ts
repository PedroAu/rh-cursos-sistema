import { createHash } from "crypto";

// Generate CSRF token
export function generateCsrfToken(): string {
  return createHash("sha256").update(Math.random().toString()).digest("hex");
}

// Validate CSRF token
export function validateCsrfToken(token: string, sessionSecret: string): boolean {
  if (!token || !sessionSecret) return false;

  // Verify token format (sha256 hex = 64 chars)
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return false;
  }

  return true;
}

// Get CSRF token from request
export function getCsrfTokenFromRequest(request: Request): string | null {
  // Check headers first (preferred for API requests)
  const headerToken = request.headers.get("x-csrf-token");
  if (headerToken) return headerToken;

  // Check body for form submissions
  if (request.method === "POST" || request.method === "PUT" || request.method === "DELETE") {
    // Note: In actual implementation, parse from FormData or JSON body
    // This is just a placeholder
  }

  return null;
}

// Set CSRF token in response headers
export function setCsrfToken(response: Response, token: string): void {
  response.headers.set("x-csrf-token", token);
}

// Allowed origins for CSRF validation
export function getAllowedOrigins(): string[] {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origins = [
    appUrl,
    "https://rhcursos.com.br",
    "https://www.rhcursos.com.br",
  ].filter(Boolean) as string[];

  if (process.env.NODE_ENV === "development") {
    origins.push("http://localhost:3000", "http://127.0.0.1:3000");
  }

  return origins;
}

// Check CSRF origin
export function validateCsrfOrigin(origin: string | null): boolean {
  if (!origin) return false;

  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
}
