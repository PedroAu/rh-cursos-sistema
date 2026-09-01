import { getAsaasEnv } from "@/lib/asaas/env";
import type {
  AsaasCharge,
  AsaasChargeRequest,
  AsaasCustomer,
  AsaasCustomerRequest,
  AsaasIdentificationField,
  AsaasPixQrCode,
} from "@/lib/asaas/types";

// Server-only fetch wrapper for the Asaas sandbox v3 API. Every call carries
// access_token + User-Agent (mandatory post-2024-06-11, AC-20) + Content-Type.
// Never logs the response body or request headers (NFR-7 — no card data here
// anyway, but also no api key / token logging).

const ASAAS_ID = /^(?:pay|cus)_[A-Za-z0-9_-]{1,80}$/;
const SAFE_URL = /^https:\/\/(?:[\w-]+\.)*asaas\.com(?:\/|$)/i;

function assertAsaasId(value: string) {
  if (!ASAAS_ID.test(value)) {
    throw new Error("Invalid Asaas resource id");
  }
}

function assertString(value: unknown, field: string, maxLength: number) {
  if (typeof value !== "string" || value.length === 0 || value.length > maxLength) {
    throw new Error(`Invalid Asaas response field: ${field}`);
  }
}

function assertCharge(value: AsaasCharge): AsaasCharge {
  if (!value || typeof value !== "object") throw new Error("Invalid Asaas charge response");
  assertAsaasId(value.id);
  assertString(value.status, "status", 64);
  for (const url of [value.invoiceUrl, value.bankSlipUrl]) {
    if (url !== undefined && url !== null && (!SAFE_URL.test(url) || url.length > 2048)) {
      throw new Error("Invalid Asaas URL response");
    }
  }
  return value;
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const env = getAsaasEnv();

  const response = await fetch(`${env.baseUrl}${path}`, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(15_000),
    headers: {
      access_token: env.apiKey,
      "User-Agent": env.userAgent,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Asaas API error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function createCustomer(
  input: AsaasCustomerRequest,
): Promise<AsaasCustomer> {
  const customer = await asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify(input),
  });
  assertAsaasId(customer.id);
  if (!customer.id.startsWith("cus_")) throw new Error("Invalid Asaas customer response");
  return customer;
}

export async function createCharge(
  input: AsaasChargeRequest,
): Promise<AsaasCharge> {
  const charge = await asaasFetch<AsaasCharge>("/payments", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return assertCharge(charge);
}

export async function getPixQrCode(chargeId: string): Promise<AsaasPixQrCode> {
  assertAsaasId(chargeId);
  const qr = await asaasFetch<AsaasPixQrCode>(`/payments/${chargeId}/pixQrCode`, {
    method: "GET",
  });
  assertString(qr.encodedImage, "encodedImage", 2_000_000);
  assertString(qr.payload, "payload", 10_000);
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(qr.encodedImage)) throw new Error("Invalid Pix image response");
  return qr;
}

export async function getBoletoIdentification(
  chargeId: string,
): Promise<AsaasIdentificationField> {
  assertAsaasId(chargeId);
  const identification = await asaasFetch<AsaasIdentificationField>(
    `/payments/${chargeId}/identificationField`,
    { method: "GET" },
  );
  assertString(identification.identificationField, "identificationField", 256);
  return identification;
}

export async function getCharge(chargeId: string): Promise<AsaasCharge> {
  assertAsaasId(chargeId);
  return assertCharge(await asaasFetch<AsaasCharge>(`/payments/${chargeId}`, { method: "GET" }));
}
