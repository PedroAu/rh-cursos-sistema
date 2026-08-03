function fail(message) {
  console.error(`E2E environment validation failed: ${message}`);
  process.exit(1);
}

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

const targetRef = process.env.E2E_SUPABASE_PROJECT_REF?.trim() ?? "";
const productionRef = process.env.E2E_PRODUCTION_PROJECT_REF?.trim() ?? "";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL?.trim() ?? "";
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

if (process.env.E2E_ALLOW_DATABASE_WRITES !== "1") {
  fail("E2E_ALLOW_DATABASE_WRITES must be explicitly set to 1.");
}

if (process.env.E2E_TARGET_KIND !== "isolated-test") {
  fail("E2E_TARGET_KIND must be isolated-test.");
}

if (!/^[a-z0-9]{20}$/i.test(targetRef)) {
  fail("E2E_SUPABASE_PROJECT_REF must be a valid Supabase project ref.");
}

if (!/^[a-z0-9]{20}$/i.test(productionRef)) {
  fail("E2E_PRODUCTION_PROJECT_REF must be a valid Supabase project ref.");
}

if (targetRef === productionRef) {
  fail("the E2E project ref must differ from the production project ref.");
}

if (projectRefFromUrl(supabaseUrl) !== targetRef) {
  fail("NEXT_PUBLIC_SUPABASE_URL must target E2E_SUPABASE_PROJECT_REF.");
}

if (projectRefFromUrl(functionsUrl) !== targetRef) {
  fail("NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL must target E2E_SUPABASE_PROJECT_REF.");
}

if ([supabaseUrl, functionsUrl, publishableKey, serviceRoleKey].some(isPlaceholder)) {
  fail("Supabase URLs and keys must be real E2E credentials, not placeholders.");
}

console.log(`E2E environment validated for isolated project ${targetRef}.`);
