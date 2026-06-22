/**
 * Demo Authentication Module
 *
 * Security: Demo credentials are extracted to this module and controlled by feature flag.
 *
 * IMPORTANT: This module is for LOCAL DEVELOPMENT ONLY.
 * Demo auth is DISABLED BY DEFAULT via NEXT_PUBLIC_ENABLE_DEMO_AUTH=false
 *
 * To enable demo auth during development:
 *   1. Set NEXT_PUBLIC_ENABLE_DEMO_AUTH=true in .env.local
 *   2. Optionally override DEMO_ADMIN_PASSWORD (default: hardcoded below)
 *   3. Run `npm run dev` and use demo credentials to login
 *
 * In production: NEVER set NEXT_PUBLIC_ENABLE_DEMO_AUTH=true
 */

export type DemoUser = {
  role: "admin";
  email: string;
  password: string;
  name: string;
};

/**
 * Check if demo auth is enabled via feature flag
 * Returns true only if explicitly enabled AND in development environment
 */
export function isDemoAuthEnabled(): boolean {
  // Feature flag check
  const isEnabledViaFlag = process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true";

  // Only allow in development - never in production
  const isDevelopment = process.env.NODE_ENV === "development";

  return isEnabledViaFlag && isDevelopment;
}

/**
 * Get demo credentials (only if demo auth is enabled)
 *
 * SECURITY IMPLICATIONS:
 * - Demo credentials are HARDCODED in this file (visible in source)
 * - This is ONLY acceptable for local development with feature flag disabled by default
 * - In production, NEXT_PUBLIC_ENABLE_DEMO_AUTH will always be false
 * - If enabled in production, this is a SECURITY BREACH
 */
export function getDemoUsers(): DemoUser[] {
  if (!isDemoAuthEnabled()) {
    return [];
  }

  // Default demo password can be overridden via DEMO_ADMIN_PASSWORD
  const demoPassword = process.env.DEMO_ADMIN_PASSWORD || "admin123";

  return [
    {
      role: "admin",
      email: "admin@rhcursos.demo",
      password: demoPassword,
      name: "Admin RH Cursos"
    }
  ];
}

/**
 * Find a demo user by role, email, and password
 * Only callable if demo auth is enabled
 */
export function findDemoUser(
  role: string,
  email: string,
  password: string
): DemoUser | undefined {
  if (!isDemoAuthEnabled()) {
    return undefined;
  }

  const demoUsers = getDemoUsers();
  return demoUsers.find(
    (user) =>
      user.role === role &&
      user.email.toLowerCase() === email.trim().toLowerCase() &&
      user.password === password
  );
}

/**
 * List all demo credentials (for dev reference only)
 * SECURITY: This is only safe because demo auth is disabled by default
 */
export function listDemoCredentials(): DemoUser[] {
  if (!isDemoAuthEnabled()) {
    console.info("Demo auth is disabled. Enable via NEXT_PUBLIC_ENABLE_DEMO_AUTH=true");
    return [];
  }

  return getDemoUsers();
}

/**
 * Validate demo auth configuration
 * Called during environment validation (see src/lib/env-validation.ts)
 */
export function validateDemoAuthConfig(): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  const isProduction = process.env.NODE_ENV === "production";
  const flagEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true";

  // CRITICAL: Demo auth must never be enabled in production
  if (isProduction && flagEnabled) {
    warnings.push(
      "🔴 CRITICAL: NEXT_PUBLIC_ENABLE_DEMO_AUTH is true in production - this is a SECURITY BREACH"
    );
  }

  // WARNING: Demo credentials in production environment variables
  if (isProduction && process.env.DEMO_ADMIN_PASSWORD) {
    warnings.push(
      "⚠️ WARNING: DEMO_ADMIN_PASSWORD is set in production - should be empty"
    );
  }

  return {
    isValid: warnings.length === 0 || !isProduction,
    warnings
  };
}
