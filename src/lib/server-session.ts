import "server-only";

import { cookies } from "next/headers";

import { createSupabaseSSRClient, readSSRSession } from "@/lib/supabase/session";

/**
 * Sessão administrativa server-side.
 *
 * REC-204 Fase B (cutover total): a autoridade é EXCLUSIVAMENTE a sessão
 * Supabase SSR. O verificador HMAC legado (`decodeSession` do cookie
 * `rh_cursos_demo_session`) e a allowlist de rollout foram removidos — não há
 * mais fallback para HMAC.
 */
export async function getServerSession() {
  const cookieStore = await cookies();

  const ssrClient = createSupabaseSSRClient({
    getAll: () => cookieStore.getAll().map(({ name, value }) => ({ name, value })),
    setAll: () => {
      // Server Components nao podem gravar cookies; refresh ocorre nas rotas.
    },
  });
  if (!ssrClient) return null;

  const session = await readSSRSession(ssrClient);
  if (session.status !== "active" || !session.role) {
    return null;
  }

  return {
    role: session.role,
    email: session.email,
    name: session.name,
  };
}
