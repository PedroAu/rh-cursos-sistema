function isPlaceholderValue(value: string) {
  return !value || value.includes("example.supabase.co") || value.includes("placeholder");
}

function isLocalSupabaseUrl(url: URL) {
  return (
    url.protocol === "http:" &&
    ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) &&
    url.port === "54321"
  );
}

export function assertSafeWritableIntegrationEnv(env: NodeJS.ProcessEnv) {
  const targetProjectRef = env.E2E_SUPABASE_PROJECT_REF?.trim() ?? "";
  const productionProjectRef = env.E2E_PRODUCTION_PROJECT_REF?.trim() ?? "";
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL ?? "";
  const localTargetEnabled = env.E2E_LOCAL_SUPABASE === "1";
  const functionsUrls = [
    ["NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL", env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL],
    ["SUPABASE_FUNCTIONS_URL", env.SUPABASE_FUNCTIONS_URL],
  ] as const;
  const approvedFunctionsOrigin = env.E2E_APPROVED_FUNCTIONS_ORIGIN?.replace(/\/$/, "") ?? "";
  const publishableKey =
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const missingOrInvalid = [
    env.E2E_ALLOW_DATABASE_WRITES !== "1" && "E2E_ALLOW_DATABASE_WRITES=1",
    env.E2E_TARGET_KIND !== "isolated-test" && "E2E_TARGET_KIND=isolated-test",
    !targetProjectRef && "E2E_SUPABASE_PROJECT_REF",
    localTargetEnabled && targetProjectRef !== "local" && "E2E_SUPABASE_PROJECT_REF=local",
    !productionProjectRef && "E2E_PRODUCTION_PROJECT_REF",
    targetProjectRef && productionProjectRef && targetProjectRef === productionProjectRef
      ? "E2E_SUPABASE_PROJECT_REF diferente de E2E_PRODUCTION_PROJECT_REF"
      : false,
  ].filter(Boolean);

  let targetMatchesUrl = false;
  let targetOrigin = "";
  try {
    const url = new URL(supabaseUrl);
    targetOrigin = url.origin;
    targetMatchesUrl = localTargetEnabled
      ? isLocalSupabaseUrl(url)
      : url.hostname === `${targetProjectRef}.supabase.co`;
  } catch {
    targetMatchesUrl = false;
  }

  if (!targetMatchesUrl) {
    missingOrInvalid.push("NEXT_PUBLIC_SUPABASE_URL correspondente a E2E_SUPABASE_PROJECT_REF");
  }

  for (const [variableName, functionsUrl] of functionsUrls) {
    if (!functionsUrl) continue;

    let functionsTargetMatches = false;
    try {
      const url = new URL(functionsUrl);
      functionsTargetMatches = localTargetEnabled
        ? isLocalSupabaseUrl(url) && url.origin === targetOrigin
        : url.hostname === `${targetProjectRef}.supabase.co` ||
          url.hostname === `${targetProjectRef}.functions.supabase.co` ||
          (approvedFunctionsOrigin !== "" && url.origin === approvedFunctionsOrigin);
    } catch {
      functionsTargetMatches = false;
    }

    if (!functionsTargetMatches) {
      missingOrInvalid.push(
        `${variableName} correspondente ao projeto isolado ou E2E_APPROVED_FUNCTIONS_ORIGIN`
      );
    }
  }

  if ([supabaseUrl, publishableKey, serviceRoleKey].some(isPlaceholderValue)) {
    missingOrInvalid.push("credenciais Supabase de integração completas");
  }

  if (missingOrInvalid.length > 0) {
    throw new Error(
      `Mutações E2E bloqueadas: configure ambiente Supabase isolado (${missingOrInvalid.join(", ")}).`
    );
  }
}
