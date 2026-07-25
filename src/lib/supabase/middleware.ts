import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseMiddlewareConfigured = Boolean(supabaseUrl && supabaseKey);

/**
 * Atualiza a sessão Supabase no limite SSR e propaga os cookies renovados para
 * a resposta. O middleware não decide autorização: apenas mantém o refresh
 * token fora do JavaScript e deixa os guards server-side resolverem o papel.
 */
export async function updateSupabaseSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  if (!isSupabaseMiddlewareConfigured) return response;

  try {
    const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });

    await supabase.auth.getUser();
  } catch {
    return response;
  }
  return response;
}
