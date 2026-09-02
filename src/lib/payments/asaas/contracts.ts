import { z } from "zod";
import { isValidCpf } from "@/lib/validation";

export const DP_ZERO_PRODUCT = {
  slug: "departamento-pessoal-do-zero",
  name: "Departamento Pessoal do Zero",
  description: "Formação prática gravada e online",
  price: 297,
} as const;

export const asaasCheckoutInputSchema = z
  .object({
    productSlug: z.literal(DP_ZERO_PRODUCT.slug),
    idempotencyKey: z.string().uuid(),
    name: z.string().trim().min(3).max(100),
    email: z.string().trim().email().toLowerCase(),
    cpf: z
      .string()
      .transform((value) => value.replace(/\D/g, ""))
      .pipe(z.string().regex(/^\d{11}$/, "CPF inválido.")).refine(isValidCpf, "CPF inválido."),
    phone: z
      .string()
      .transform((value) => value.replace(/\D/g, ""))
      .pipe(z.string().regex(/^\d{10,11}$/, "Telefone inválido.")),
  })
  .strict();

export type AsaasCheckoutInput = z.infer<typeof asaasCheckoutInputSchema>;

export interface AsaasCheckoutPayload {
  billingTypes: ["PIX", "CREDIT_CARD"];
  chargeTypes: ["DETACHED"] | ["DETACHED", "INSTALLMENT"];
  externalReference: string;
  items: Array<{
    externalReference: typeof DP_ZERO_PRODUCT.slug;
    name: typeof DP_ZERO_PRODUCT.name;
    description: typeof DP_ZERO_PRODUCT.description;
    quantity: 1;
    value: typeof DP_ZERO_PRODUCT.price;
  }>;
  installment?: { maxInstallmentCount: 12 };
  minutesToExpire: number;
  callback: {
    successUrl: string;
    cancelUrl: string;
    expiredUrl: string;
  };
  customerData?: {
    name: string;
    cpfCnpj: string;
    email: string;
    phone: string;
  };
}

export const asaasCheckoutResponseSchema = z
  .object({
    id: z.string().min(1),
    link: z.string().url(),
  })
  .passthrough();

export const asaasWebhookSchema = z
  .object({
    id: z.string().min(1).max(255),
    event: z.enum([
      "CHECKOUT_CREATED",
      "CHECKOUT_PAID",
      "CHECKOUT_CANCELED",
      "CHECKOUT_EXPIRED",
    ]),
    dateCreated: z.string().min(1).max(80).optional(),
    checkout: z
      .object({
        id: z.string().min(1).max(255),
        externalReference: z.string().uuid().optional(),
        status: z.string().min(1).max(80).optional(),
        billingTypes: z.array(z.enum(["PIX", "CREDIT_CARD"])).max(2).optional(),
        items: z.array(z.object({
          externalReference: z.string().max(120).optional(),
          name: z.string().max(255).optional(),
          quantity: z.number().positive().max(1_000).optional(),
          value: z.number().nonnegative().max(100_000).optional(),
        }).passthrough()).max(20).optional(),
      })
      .passthrough(),
  })
  .passthrough()
  .superRefine((payload, context) => {
    if (payload.event !== "CHECKOUT_PAID") return;
    if (payload.checkout.status && payload.checkout.status !== "PAID") {
      context.addIssue({ code: "custom", path: ["checkout", "status"], message: "Status de checkout incompatível." });
    }
    if (!payload.checkout.externalReference) {
      context.addIssue({ code: "custom", path: ["checkout", "externalReference"], message: "Referência externa ausente." });
    }
    if (!payload.checkout.items?.some((item) => item.externalReference === DP_ZERO_PRODUCT.slug && item.quantity === 1 && item.value === DP_ZERO_PRODUCT.price)) {
      context.addIssue({ code: "custom", path: ["checkout", "items"], message: "Itens do checkout incompatíveis." });
    }
  });

export type AsaasWebhook = z.infer<typeof asaasWebhookSchema>;
