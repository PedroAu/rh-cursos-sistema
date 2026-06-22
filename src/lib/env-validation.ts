/**
 * Environment Variable Validation
 * Ensures all required security variables are configured correctly
 */

import { validateDemoAuthConfig } from "./demo-auth";

function validateEnvironment(): void {
  // O app agora roda em modelo híbrido (SSG para páginas públicas e SSR para
  // rotas protegidas do admin). Variáveis NEXT_PUBLIC_* continuam sendo
  // necessárias no cliente; segredos de servidor ficam restritos ao runtime do
  // Next e às Edge Functions do Supabase.
  const isProduction = process.env.NODE_ENV === "production";
  const isDevelopment = process.env.NODE_ENV === "development";

  const errors: string[] = [];
  const warnings: string[] = [];

  // ============================================
  // VARIÁVEIS PÚBLICAS — embutidas no bundle estático (sempre exigidas)
  // ============================================

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push("🔴 CRITICAL: NEXT_PUBLIC_SUPABASE_URL must be set");
  }

  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!publishableKey) {
    errors.push(
      "🔴 CRITICAL: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ou _ANON_KEY) must be set"
    );
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    errors.push("🔴 CRITICAL: NEXT_PUBLIC_APP_URL must be set");
  } else {
    // HTTPS só é exigido para URLs reais de produção — localhost em dev é ok.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const isLocalUrl = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(appUrl);
    if (isProduction && !isLocalUrl && !appUrl.startsWith("https://")) {
      errors.push("🔴 CRITICAL: NEXT_PUBLIC_APP_URL must use HTTPS in production");
    }
  }

  if (isProduction && !process.env.AUTH_SESSION_SECRET) {
    errors.push("🔴 CRITICAL: AUTH_SESSION_SECRET must be set in production");
  }

  // ============================================
  // DEMO AUTH VALIDATION (feature flag: NEXT_PUBLIC_ENABLE_DEMO_AUTH)
  // ============================================

  const demoAuthValidation = validateDemoAuthConfig();
  if (demoAuthValidation.warnings.length > 0) {
    warnings.push(...demoAuthValidation.warnings);
  }

  // ============================================
  // DEVELOPMENT RECOMMENDATIONS
  // ============================================

  if (isDevelopment) {
    if (!process.env.AUTH_SESSION_SECRET) {
      warnings.push(
        "ℹ️ INFO: AUTH_SESSION_SECRET not set - using insecure development default"
      );
    }

    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH !== "true") {
      warnings.push(
        "ℹ️ INFO: Demo auth is disabled. Set NEXT_PUBLIC_ENABLE_DEMO_AUTH=true to enable it."
      );
    }
  }

  // ============================================
  // PRINT VALIDATION RESULTS
  // ============================================

  if (errors.length > 0) {
    console.error("\n❌ ENVIRONMENT VALIDATION FAILED:\n");
    errors.forEach(err => console.error(err));
    console.error(
      "\nPlease fix the above errors before starting the application.\n"
    );

    if (isProduction) {
      throw new Error(
        "Critical environment variables are missing or invalid in production"
      );
    }
  }

  if (warnings.length > 0) {
    console.warn("\n⚠️ ENVIRONMENT VALIDATION WARNINGS:\n");
    warnings.forEach(warn => console.warn(warn));
    console.warn("");
  }

  if (errors.length === 0 && warnings.length === 0) {
    if (isDevelopment) {
      console.log("✅ Environment validation passed (development)");
    } else {
      console.log("✅ Environment validation passed (production)");
    }
  }
}

// Run validation when module is imported
validateEnvironment();

export { validateEnvironment };
