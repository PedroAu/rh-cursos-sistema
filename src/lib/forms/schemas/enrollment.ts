"use server";

import { z } from "zod";

/**
 * Schema para inscrição pública (public-enrollment-form).
 * Severidade: presença + não-vazio (replicando src/app/actions/public.ts:191-211).
 * SEM validação de CPF real ou formato de email (escopo Fase separada).
 */
export const enrollmentSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome completo.").max(120, "Nome muito longo."),
  email: z.string().trim().email("E-mail inválido.").max(254, "E-mail muito longo."),
  cpf: z.string().trim().min(1, "Informe o CPF.").max(18, "CPF inválido."),
  telefone: z.string().trim().min(1, "Informe o telefone.").max(30, "Telefone inválido."),
  turma_id: z.string().trim().min(1, "Selecione uma turma.").max(120, "Turma inválida."),
  pagamento_metodo: z
    .string()
    .min(1, "Selecione a forma de pagamento.")
    .refine(
      (v) => ["cartao", "pix", "boleto", "empenho"].includes(v.toLowerCase()),
      "Forma de pagamento inválida.",
    ),
  observacoes: z.string().max(2000, "Observações muito longas.").optional(),
  // Checkbox Radix: "on" ou ausente (undefined). Nunca boolean.
  aceite_lgpd: z.literal("on", { message: "Você deve aceitar os termos." }),
}).passthrough();

export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
