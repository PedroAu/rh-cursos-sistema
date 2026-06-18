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

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const env = getAsaasEnv();

  const response = await fetch(`${env.baseUrl}${path}`, {
    ...init,
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
  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createCharge(
  input: AsaasChargeRequest,
): Promise<AsaasCharge> {
  return asaasFetch<AsaasCharge>("/payments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getPixQrCode(chargeId: string): Promise<AsaasPixQrCode> {
  return asaasFetch<AsaasPixQrCode>(`/payments/${chargeId}/pixQrCode`, {
    method: "GET",
  });
}

export async function getBoletoIdentification(
  chargeId: string,
): Promise<AsaasIdentificationField> {
  return asaasFetch<AsaasIdentificationField>(
    `/payments/${chargeId}/identificationField`,
    { method: "GET" },
  );
}

export async function getCharge(chargeId: string): Promise<AsaasCharge> {
  return asaasFetch<AsaasCharge>(`/payments/${chargeId}`, { method: "GET" });
}
