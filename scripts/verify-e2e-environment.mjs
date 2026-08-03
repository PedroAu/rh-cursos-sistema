import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

function projectRefFromUrl(value) {
  try {
    const match = new URL(value).hostname.match(/^([a-z0-9]{20})\.supabase\.co$/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function isPlaceholder(value) {
  return !value || /example\.supabase\.co|placeholder/i.test(value);
}

export function validateE2EEnvironment(environment = process.env) {
  const targetRef = environment.E2E_SUPABASE_PROJECT_REF?.trim() ?? "";
  const productionRef = environment.E2E_PRODUCTION_PROJECT_REF?.trim() ?? "";
  const supabaseUrl = environment.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const functionsUrl = environment.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL?.trim() ?? "";
  const publishableKey = environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

  if (environment.E2E_ALLOW_DATABASE_WRITES !== "1") {
    throw new Error("E2E_ALLOW_DATABASE_WRITES must be explicitly set to 1.");
  }

  if (environment.E2E_TARGET_KIND !== "isolated-test") {
    throw new Error("E2E_TARGET_KIND must be isolated-test.");
  }

  if (!/^[a-z0-9]{20}$/i.test(targetRef)) {
    throw new Error("E2E_SUPABASE_PROJECT_REF must be a valid Supabase project ref.");
  }

  if (!/^[a-z0-9]{20}$/i.test(productionRef)) {
    throw new Error("E2E_PRODUCTION_PROJECT_REF must be a valid Supabase project ref.");
  }

  if (targetRef === productionRef) {
    throw new Error("the E2E project ref must differ from the production project ref.");
  }

  if (projectRefFromUrl(supabaseUrl) !== targetRef) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must target E2E_SUPABASE_PROJECT_REF.");
  }

  if (projectRefFromUrl(functionsUrl) !== targetRef) {
    throw new Error("NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL must target E2E_SUPABASE_PROJECT_REF.");
  }

  if ([supabaseUrl, functionsUrl, publishableKey, serviceRoleKey].some(isPlaceholder)) {
    throw new Error("Supabase URLs and keys must be real E2E credentials, not placeholders.");
  }

  return { targetRef, supabaseUrl, serviceRoleKey };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const { targetRef } = validateE2EEnvironment();
    console.log(`E2E environment validated for isolated project ${targetRef}.`);
  } catch (error) {
    console.error(`E2E environment validation failed: ${error.message}`);
    process.exit(1);
  }
}
