import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const PAYMENT_STATUS_PURPOSE = "payment-status";
const TOKEN_TTL_SECONDS = 30 * 60;
const CLOCK_SKEW_SECONDS = 30;
const CHARGE_ID_PATTERN = /^pay_[A-Za-z0-9_-]{1,80}$/;

type PaymentStatusTokenPayload = {
  chargeId: string;
  exp: number;
  iat: number;
  purpose: typeof PAYMENT_STATUS_PURPOSE;
};

export type PaymentStatusTokenVerification =
  | { ok: true; payload: PaymentStatusTokenPayload }
  | { ok: false; reason: "expired" | "invalid" | "mismatch" };

function getTokenSecret() {
  const secret = process.env.PAYMENT_STATUS_TOKEN_SECRET;

  if (!secret) {
    throw new Error("Missing payment status token secret");
  }

  return secret;
}

function encodeJson(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeJson<T>(value: string): T | null {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function signPayload(encodedPayload: string, secret = getTokenSecret()) {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

function constantTimeEquals(first: string, second: string) {
  const firstBytes = Buffer.from(first, "base64url");
  const secondBytes = Buffer.from(second, "base64url");

  if (firstBytes.length !== secondBytes.length) {
    return false;
  }

  return timingSafeEqual(firstBytes, secondBytes);
}

function isPaymentStatusPayload(value: unknown): value is PaymentStatusTokenPayload {
  const candidate = value as PaymentStatusTokenPayload;

  return (
    Boolean(candidate) &&
    typeof candidate === "object" &&
    typeof candidate.chargeId === "string" &&
    typeof candidate.iat === "number" &&
    typeof candidate.exp === "number" &&
    Number.isSafeInteger(candidate.iat) &&
    Number.isSafeInteger(candidate.exp) &&
    candidate.exp >= candidate.iat &&
    CHARGE_ID_PATTERN.test(candidate.chargeId) &&
    candidate.purpose === PAYMENT_STATUS_PURPOSE
  );
}

export function createPaymentStatusToken(
  chargeId: string,
  options: { now?: Date; ttlSeconds?: number } = {},
) {
  if (!CHARGE_ID_PATTERN.test(chargeId)) {
    throw new Error("Invalid payment charge id");
  }
  const nowSeconds = Math.floor((options.now ?? new Date()).getTime() / 1000);
  const payload: PaymentStatusTokenPayload = {
    chargeId,
    exp: nowSeconds + (options.ttlSeconds ?? TOKEN_TTL_SECONDS),
    iat: nowSeconds,
    purpose: PAYMENT_STATUS_PURPOSE,
  };
  const encodedPayload = encodeJson(payload);
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function assertPaymentStatusTokenConfigured() {
  getTokenSecret();
}

export function verifyPaymentStatusToken(
  token: string,
  chargeId: string,
  options: { now?: Date } = {},
): PaymentStatusTokenVerification {
  const [encodedPayload, signature, extra] = token.split(".");

  if (!encodedPayload || !signature || extra) {
    return { ok: false, reason: "invalid" };
  }

  const expectedSignature = signPayload(encodedPayload);

  if (!constantTimeEquals(signature, expectedSignature)) {
    return { ok: false, reason: "invalid" };
  }

  const payload = decodeJson<unknown>(encodedPayload);

  if (!isPaymentStatusPayload(payload)) {
    return { ok: false, reason: "invalid" };
  }

  if (payload.chargeId !== chargeId) {
    return { ok: false, reason: "mismatch" };
  }

  const nowSeconds = Math.floor((options.now ?? new Date()).getTime() / 1000);

  if (payload.iat > nowSeconds + CLOCK_SKEW_SECONDS) {
    return { ok: false, reason: "invalid" };
  }

  if (payload.exp + CLOCK_SKEW_SECONDS < nowSeconds) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, payload };
}
