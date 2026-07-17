import "server-only";

import { cookies } from "next/headers";

import { decodeSession, SESSION_COOKIE } from "@/lib/auth";
import { isSsrAuthRolloutAccount } from "@/lib/supabase/auth-rollout";
import { createSupabaseSSRClient, readSSRSession } from "@/lib/supabase/session";

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const legacySession = await decodeSession(token);

  if (legacySession && !isSsrAuthRolloutAccount(legacySession.email)) {
    return legacySession;
  }

  const ssrClient = createSupabaseSSRClient({
    getAll: () => cookieStore.getAll().map(({ name, value }) => ({ name, value })),
    setAll: () => {
      // Server Components nao podem gravar cookies; refresh ocorre nas rotas.
    },
  });
  if (!ssrClient) return null;

  const session = await readSSRSession(ssrClient);
  if (session.status !== "active" || !session.role || !isSsrAuthRolloutAccount(session.email)) {
    return null;
  }

  return {
    role: session.role,
    email: session.email,
    name: session.name,
  };
}
