import { z } from "zod";

// Email validation
const emailSchema = z.string().email("Email inválido").toLowerCase();

// CPF validation (format: XXX.XXX.XXX-XX)
const cpfSchema = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato XXX.XXX.XXX-XX")
  .transform((val) => val.replace(/\D/g, ""));

// Phone validation (format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX)
const phoneSchema = z
  .string()
  .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX")
  .transform((val) => val.replace(/\D/g, ""));

// Course enrollment validation
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
  enrollmentType: z.enum(["Pessoa física", "Empresa", "Órgão público"]).default("Pessoa física"),
  paymentMethod: z.enum(["Pix", "Cartão", "Boleto", "Empenho"]).default("Pix"),
  notes: z
    .string()
    .max(500, "Notas não podem ter mais de 500 caracteres")
    .default("")
    .transform((val) => val.trim()),
});

export type EnrollmentInput = z.infer<typeof enrollmentSchema>;

// User profile validation
export const userProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome não pode ter mais de 50 caracteres")
    .transform((val) => val.trim()),
  lastName: z
    .string()
    .min(2, "Sobrenome deve ter pelo menos 2 caracteres")
    .max(50, "Sobrenome não pode ter mais de 50 caracteres")
    .transform((val) => val.trim()),
  email: emailSchema,
  phone: phoneSchema.optional(),
  company: z.string().max(100).optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// Login validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Course filter validation
export const courseFilterSchema = z.object({
  category: z.string().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
  instructor: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export type CourseFilter = z.infer<typeof courseFilterSchema>;

// Admin resource creation validation
export const adminResourceSchema = z.object({
  title: z
    .string()
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(200, "Título não pode ter mais de 200 caracteres")
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(1000, "Descrição não pode ter mais de 1000 caracteres")
    .optional()
    .transform((val) => (val ? val.trim() : undefined)),
  type: z.enum(["document", "video", "link", "other"]),
  url: z.string().url("URL inválida").optional(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: z.record(z.string(), z.any()).optional(),
});

export type AdminResource = z.infer<typeof adminResourceSchema>;

// Validation helper function
export function validateInput<T>(schema: z.ZodType<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _global: "Erro na validação" } };
  }
}
