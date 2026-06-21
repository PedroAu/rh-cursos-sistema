"use server";

import { z } from "zod";

/**
 * Schema para inscrição pública (public-enrollment-form).
 * Severidade: presença + não-vazio (replicando src/app/actions/public.ts:191-211).
 * SEM validação de CPF real ou formato de email (escopo Fase separada).
 */
export const enrollmentSchema = z.object({
  nome: z.string().min(1, "Informe o nome completo."),
  email: z.string().email("E-mail inválido."),
  cpf: z.string().min(1, "Informe o CPF."),
  telefone: z.string().min(1, "Informe o telefone."),
  turma_id: z.string().min(1, "Selecione uma turma."),
  pagamento_metodo: z
    .string()
    .min(1, "Selecione a forma de pagamento.")
    .refine(
      (v) => ["cartao", "pix", "boleto", "empenho"].includes(v.toLowerCase()),
      "Forma de pagamento inválida.",
    ),
  observacoes: z.string().optional(),
  // Checkbox Radix: "on" ou ausente (undefined). Nunca boolean.
  aceite_lgpd: z.literal("on", { message: "Você deve aceitar os termos." }),
}).passthrough();

export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
