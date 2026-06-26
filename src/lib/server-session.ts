import "server-only";

import { cookies } from "next/headers";

import { decodeSession, SESSION_COOKIE } from "@/lib/auth";

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  return decodeSession(token);
}
