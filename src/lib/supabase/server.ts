import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseServerConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export function createSupabaseServerClient() {
  if (!isSupabaseServerConfigured) {
    return null;
  }

  return createClient(supabaseUrl!, supabasePublishableKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
