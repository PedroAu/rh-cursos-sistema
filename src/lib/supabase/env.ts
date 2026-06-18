type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

type SupabaseServerEnv = SupabasePublicEnv & {
  serviceRoleKey: string;
};

function requireEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? (fallback ? process.env[fallback] : undefined);

  if (!value) {
    const tried = fallback ? `${name} or ${fallback}` : name;
    throw new Error(`Missing Supabase environment variable: ${tried}`);
  }

  return value;
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  return {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: requireEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ),
  };
}

export function getSupabaseServerEnv(): SupabaseServerEnv {
  const publicEnv = getSupabasePublicEnv();

  return {
    ...publicEnv,
    serviceRoleKey: requireEnv(
      "SUPABASE_SERVICE_ROLE_KEY",
      "SUPABASE_SECRET_KEY",
    ),
  };
}
