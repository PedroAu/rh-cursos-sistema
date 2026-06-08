// Sessão admin assinada via HMAC-SHA256 (WebCrypto).
// Portado de src/lib/auth.ts para o runtime Deno das Edge Functions.
// Em vez de cookie httpOnly (que não cruza o domínio Locaweb → supabase.co),
// o token é devolvido no corpo e reenviado pelo header `x-rh-session`.

export type DashboardRole = "admin";

export type AdminSession = {
  role: DashboardRole;
  email: string;
  name: string;
};

export function getSessionSecret(): string {
  const secret = Deno.env.get("AUTH_SESSION_SECRET");

  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET é obrigatório nas Edge Functions.");
  }

  if (secret.length < 32) {
    throw new Error("AUTH_SESSION_SECRET deve ter ao menos 32 caracteres.");
  }

  return secret;
}

function toBase64Url(value: ArrayBuffer | string): string {
  const binary =
    typeof value === "string" ? value : String.fromCharCode(...new Uint8Array(value));

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string): string {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  return atob(padded);
}

async function signPayload(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return toBase64Url(signature);
}

function isDashboardRole(value: unknown): value is DashboardRole {
  return value === "admin";
}

export async function encodeSession(session: AdminSession): Promise<string> {
  const payload = toBase64Url(JSON.stringify(session));
  const signature = await signPayload(payload);
  return `${payload}.${signature}`;
}

export async function decodeSession(value?: string | null): Promise<AdminSession | null> {
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = await signPayload(payload);
  // Comparação em tempo constante para evitar timing attacks.
  if (!timingSafeEqual(signature, expectedSignature)) return null;

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as Partial<AdminSession>;
    if (!isDashboardRole(parsed.role) || !parsed.email || !parsed.name) return null;

    return { role: parsed.role, email: parsed.email, name: parsed.name };
  } catch {
    return null;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/** Lê o token de sessão do header `x-rh-session`. */
export function getSessionToken(request: Request): string | null {
  return request.headers.get("x-rh-session");
}

export async function requireAdmin(request: Request): Promise<AdminSession | null> {
  const session = await decodeSession(getSessionToken(request));
  return session?.role === "admin" ? session : null;
}
