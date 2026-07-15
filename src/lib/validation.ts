import { z } from "zod";

/**
 * Schemas Zod de entrada do app (formulários e payloads de API).
 *
 * Intenção geral:
 * - Validam dados vindos do usuário/cliente ANTES de chegarem ao banco —
 *   complementam (não substituem) as RLS policies e as constraints do Postgres.
 * - Campos mascarados (CPF, telefone) seguem o padrão "valida a máscara que o
 *   usuário digita, mas persiste apenas dígitos": o `.regex` garante o formato
 *   visual e o `.transform` normaliza para armazenamento canônico.
 * - `.transform((val) => val.trim())` remove espaços de borda para evitar
 *   duplicatas sutis e dados sujos.
 */

// E-mail normalizado para minúsculas — garante unicidade case-insensitive.
const emailSchema = z.string().email("Email inválido").toLowerCase();

// CPF: valida a máscara XXX.XXX.XXX-XX, mas persiste só os 11 dígitos.
const cpfSchema = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato XXX.XXX.XXX-XX")
  .transform((val) => val.replace(/\D/g, ""));

// Telefone: aceita celular (5 dígitos) ou fixo (4); persiste só os dígitos.
const phoneSchema = z
  .string()
  .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX")
  .transform((val) => val.replace(/\D/g, ""));

// IDs de recurso (curso/turma): allowlist estrita de caracteres — defesa em
// profundidade contra injeção em paths/queries antes de chegar ao Supabase.
const resourceIdSchema = z
  .string()
  .trim()
  .min(1, "ID é obrigatório")
  .max(80, "ID excede o tamanho permitido")
  .regex(/^[A-Za-z0-9_-]+$/, "ID inválido");

// Matrícula em curso — payload do checkout público. Campos opcionais usam
// `.default("")` para que o registro nunca chegue ao banco com `undefined`.
export const enrollmentSchema = z.object({
  studentName: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome não pode ter mais de 100 caracteres")
    .transform((val) => val.trim()),
  email: emailSchema,
  cpf: cpfSchema,
  phone: phoneSchema,
  courseId: resourceIdSchema,
  classId: resourceIdSchema,
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
  notes: z
    .string()
    .max(500, "Notas não podem ter mais de 500 caracteres")
    .default("")
    .transform((val) => val.trim()),
}).strict();

export type EnrollmentInput = z.infer<typeof enrollmentSchema>;

export const enrollmentReceiptSchema = z.object({
  ok: z.literal(true),
  enrollmentId: resourceIdSchema,
  classId: resourceIdSchema,
}).strict();

export const preEnrollmentReceiptStateSchema = z.object({
  enrollmentId: resourceIdSchema,
  courseId: resourceIdSchema,
  classId: resourceIdSchema,
}).strict();

export type PreEnrollmentReceiptState = z.infer<typeof preEnrollmentReceiptStateSchema>;

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
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type AdminResource = z.infer<typeof adminResourceSchema>;

/**
 * Valida `data` contra `schema` e devolve um resultado discriminado.
 *
 * Em caso de falha, achata `ZodError.issues` num mapa `campo → mensagem` com a
 * chave no formato dot-path (ex.: `address.zip`), pronto para alimentar o estado
 * de erros dos formulários. Erros não-Zod (inesperados) caem em `_global`.
 */
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
