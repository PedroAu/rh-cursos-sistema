/**
 * Environment Variable Validation
 * Ensures all required security variables are configured correctly
 */

function validateEnvironment(): void {
  // Este app é um SITE ESTÁTICO (`output: 'export'`): não há servidor Node em
  // produção. Só as variáveis `NEXT_PUBLIC_*` são embutidas no bundle e chegam
  // ao navegador. Segredos de servidor (SUPABASE_DB_URL, SERVICE_ROLE_KEY)
  // vivem nas Edge Functions do Supabase, NÃO aqui — exigi-los no build do
  // site estático estava errado e quebrava o build local e o CI.
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

  // ============================================
  // AVISOS DE SEGURANÇA (não bloqueiam o build estático)
  // ============================================

  if (isProduction) {
    if (process.env.DEMO_AUTH_ENABLED === "true") {
      warnings.push(
        "⚠️ WARNING: DEMO_AUTH_ENABLED is true in production - this should be false"
      );
    }

    if (process.env.DEMO_ADMIN_PASSWORD) {
      warnings.push(
        "⚠️ WARNING: DEMO_ADMIN_PASSWORD is set in production - should be empty"
      );
    }
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

    if (process.env.DEMO_AUTH_ENABLED === "true" && !process.env.DEMO_ADMIN_PASSWORD) {
      warnings.push(
        "ℹ️ INFO: DEMO_AUTH_ENABLED is true but DEMO_ADMIN_PASSWORD not set - demo login disabled"
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
