import "server-only";

import { z } from "zod";

const asaasEnvironmentSchema = z.enum(["sandbox", "production"]);

const asaasConfigSchema = z
  .object({
    ASAAS_API_KEY: z.string().min(1).refine((value) => !/\s/.test(value), {
      message: "ASAAS_API_KEY não pode conter espaços.",
    }),
    ASAAS_WEBHOOK_TOKEN: z
      .string()
      .min(32)
      .max(255)
      .refine((value) => !/\s/.test(value), {
        message: "ASAAS_WEBHOOK_TOKEN não pode conter espaços.",
      }),
    ASAAS_ENVIRONMENT: asaasEnvironmentSchema,
    ASAAS_12X_INTEREST_FREE_CONFIRMED: z.enum(["true", "false"]).default("false"),
    ASAAS_CHECKOUT_EXPIRES_MINUTES: z.coerce.number().int().min(10).max(1440),
    NEXT_PUBLIC_APP_URL: z.string().url(),
  })
  .superRefine((value, context) => {
    if (value.ASAAS_API_KEY === value.ASAAS_WEBHOOK_TOKEN) {
      context.addIssue({
        code: "custom",
        path: ["ASAAS_WEBHOOK_TOKEN"],
        message: "ASAAS_WEBHOOK_TOKEN deve ser diferente de ASAAS_API_KEY.",
      });
    }

    const appUrl = new URL(value.NEXT_PUBLIC_APP_URL);
    const isLocalHttp =
      value.ASAAS_ENVIRONMENT === "sandbox" &&
      appUrl.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(appUrl.hostname);
    if (appUrl.protocol !== "https:" && !isLocalHttp) {
      context.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_APP_URL"],
        message: "NEXT_PUBLIC_APP_URL deve usar HTTPS fora do desenvolvimento local.",
      });
    }
    if (
      appUrl.username ||
      appUrl.password ||
      appUrl.pathname !== "/" ||
      appUrl.search ||
      appUrl.hash
    ) {
      context.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_APP_URL"],
        message: "NEXT_PUBLIC_APP_URL deve conter apenas a origem da aplicação.",
      });
    }
  });

export type AsaasEnvironment = z.infer<typeof asaasEnvironmentSchema>;

export interface AsaasConfig {
  apiKey: string;
  webhookToken: string;
  environment: AsaasEnvironment;
  apiBaseUrl: "https://api-sandbox.asaas.com" | "https://api.asaas.com";
  appOrigin: string;
  checkoutExpiresMinutes: number;
  interestFreeInstallmentsConfirmed: boolean;
  maxInstallments: 1 | 12;
}

export class AsaasConfigError extends Error {
  constructor() {
    super("Configuração do checkout Asaas inválida.");
    this.name = "AsaasConfigError";
  }
}

export function getAsaasConfig(
  environment: NodeJS.ProcessEnv = process.env,
): AsaasConfig {
  const parsed = asaasConfigSchema.safeParse(environment);
  if (!parsed.success) throw new AsaasConfigError();

  const value = parsed.data;
  const interestFreeInstallmentsConfirmed =
    value.ASAAS_12X_INTEREST_FREE_CONFIRMED === "true";

  return {
    apiKey: value.ASAAS_API_KEY,
    webhookToken: value.ASAAS_WEBHOOK_TOKEN,
    environment: value.ASAAS_ENVIRONMENT,
    apiBaseUrl:
      value.ASAAS_ENVIRONMENT === "sandbox"
        ? "https://api-sandbox.asaas.com"
        : "https://api.asaas.com",
    appOrigin: new URL(value.NEXT_PUBLIC_APP_URL).origin,
    checkoutExpiresMinutes: value.ASAAS_CHECKOUT_EXPIRES_MINUTES,
    interestFreeInstallmentsConfirmed,
    maxInstallments: interestFreeInstallmentsConfirmed ? 12 : 1,
  };
}

export function isAsaasInterestFreeInstallmentsEnabled(
  environment: NodeJS.ProcessEnv = process.env,
): boolean {
  return environment.ASAAS_12X_INTEREST_FREE_CONFIRMED === "true";
}
