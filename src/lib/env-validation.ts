/**
 * Environment Variable Validation
 * Ensures all required security variables are configured correctly
 */

function validateEnvironment(): void {
  const isProduction = process.env.NODE_ENV === "production";
  const isDevelopment = process.env.NODE_ENV === "development";

  const errors: string[] = [];
  const warnings: string[] = [];

  // ============================================
  // PRODUCTION REQUIREMENTS (CRITICAL)
  // ============================================

  if (isProduction) {
    // AUTH_SESSION_SECRET is mandatory in production
    if (!process.env.AUTH_SESSION_SECRET) {
      errors.push(
        "🔴 CRITICAL: AUTH_SESSION_SECRET must be set in production"
      );
    } else if (process.env.AUTH_SESSION_SECRET.length < 32) {
      errors.push(
        "🔴 CRITICAL: AUTH_SESSION_SECRET must be at least 32 characters"
      );
    }

    // Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      errors.push(
        "🔴 CRITICAL: NEXT_PUBLIC_SUPABASE_URL must be set in production"
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      errors.push(
        "🔴 CRITICAL: SUPABASE_SERVICE_ROLE_KEY must be set in production"
      );
    }

    // Database URL
    if (!process.env.SUPABASE_DB_URL) {
      errors.push("🔴 CRITICAL: SUPABASE_DB_URL must be set in production");
    }

    // App URL for CORS
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      errors.push(
        "🔴 CRITICAL: NEXT_PUBLIC_APP_URL must be set in production"
      );
    } else if (!process.env.NEXT_PUBLIC_APP_URL.startsWith("https://")) {
      errors.push(
        "🔴 CRITICAL: NEXT_PUBLIC_APP_URL must use HTTPS in production"
      );
    }

    // Demo auth should be disabled in production
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
