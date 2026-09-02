import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

export function isValidAsaasWebhookToken(
  providedToken: string | null,
  expectedToken: string,
): boolean {
  if (!providedToken) return false;
  const providedDigest = createHash("sha256").update(providedToken).digest();
  const expectedDigest = createHash("sha256").update(expectedToken).digest();
  return timingSafeEqual(providedDigest, expectedDigest);
}
