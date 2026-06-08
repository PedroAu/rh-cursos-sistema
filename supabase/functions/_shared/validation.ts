// Schema de validação de inscrição para Edge Functions.
// Portado de src/lib/validation.ts (enrollmentSchema).
import { z } from "https://esm.sh/zod@4.4.3";

const emailSchema = z.string().email("Email inválido").toLowerCase();

const cpfSchema = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato XXX.XXX.XXX-XX")
  .transform((val) => val.replace(/\D/g, ""));

const phoneSchema = z
  .string()
  .regex(
    /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    "Telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX"
  )
  .transform((val) => val.replace(/\D/g, ""));

export const enrollmentSchema = z.object({
  studentName: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome não pode ter mais de 100 caracteres")
    .transform((val) => val.trim()),
  email: emailSchema,
  cpf: cpfSchema,
  phone: phoneSchema,
  courseId: z.string().uuid("ID do curso inválido"),
  classId: z.string().uuid("ID da turma inválido"),
  organization: z
    .string()
    .max(100, "Organização não pode ter mais de 100 caracteres")
    .default("")
    .transform((val) => val.trim()),
  jobTitle: z
    .string()
    .max(100, "Cargo não pode ter mais de 100 caracteres")
    .default("")
    .transform((val) => val.trim()),
  enrollmentType: z
    .enum(["Pessoa física", "Empresa", "Órgão público"])
    .default("Pessoa física"),
  paymentMethod: z.enum(["Pix", "Cartão", "Boleto", "Empenho"]).default("Pix"),
  notes: z
    .string()
    .max(500, "Notas não podem ter mais de 500 caracteres")
    .default("")
    .transform((val) => val.trim()),
});

export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
