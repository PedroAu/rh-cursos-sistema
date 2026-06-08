// Validação server-side dos payloads de mutação admin.
// Espelha src/lib/admin-form-validation.ts mas usa Zod para rejeitar
// requests malformados antes de tocar o banco.
import { z } from "https://esm.sh/zod@4.4.3";

const emailSchema = z.string().min(1, "Email é obrigatório").email("Email inválido");

const modalityEnum = z.enum([
  "Ao vivo online",
  "Presencial",
  "In company",
  "Híbrido",
  "Gravado",
]);

const courseLevelEnum = z.enum([
  "Básico",
  "Intermediário",
  "Avançado",
  "Básico / Intermediário",
]);

export const courseSchema = z.object({
  title: z.string().min(1, "Nome do curso é obrigatório"),
  pathId: z.string().min(1, "Trilha é obrigatória"),
  modality: modalityEnum,
  level: courseLevelEnum,
  status: z.enum(["Ativo", "Inativo", "Destaque", "Em breve"]),
  durationLabel: z.string().min(1, "Carga horária é obrigatória"),
  price: z.number({ invalid_type_error: "Preço deve ser um número" }).min(0, "Preço deve ser >= 0"),
  shortDescription: z.string().min(1, "Descrição curta é obrigatória"),
  fullDescription: z.string().min(1, "Descrição completa é obrigatória"),
  image: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  modules: z
    .array(
      z.object({
        title: z.string().min(1, "Título do módulo é obrigatório"),
        description: z.string().min(1, "Descrição do módulo é obrigatória"),
        duration: z.string().min(1, "Duração do módulo é obrigatória"),
        topics: z.array(z.string()).min(1, "Módulo deve ter pelo menos um tópico"),
      })
    )
    .optional(),
});

export const classSchema = z.object({
  courseId: z.string().min(1, "Curso é obrigatório"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  modality: modalityEnum,
  status: z.enum(["Inscrições abertas", "Poucas vagas", "Encerrada", "Em breve"]),
  instructorId: z.string().optional(),
  location: z.string().optional(),
});

export const studentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: emailSchema,
  organization: z.string().min(1, "Empresa/órgão é obrigatório"),
});

export const leadSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: emailSchema,
  phone: z.string().optional(),
  courseInterest: z.string().min(1, "Curso de interesse é obrigatório"),
  origin: z.enum(["Site", "WhatsApp", "Blog", "Indicação", "LinkedIn"]),
  status: z.enum(["Novo", "Em atendimento", "Proposta enviada", "Convertido", "Perdido"]),
  organization: z.string().optional(),
  teamSize: z.number().int().positive().optional(),
  preferredModality: z.string().optional(),
  trainingObjective: z.string().optional(),
  mainChallenges: z.string().optional(),
});

const enrollmentStatusEnum = z.enum([
  "Pendente",
  "Aguardando pagamento",
  "Confirmada",
  "Cancelada",
  "Concluída",
]);

export const enrollmentStatusSchema = z.object({
  status: enrollmentStatusEnum,
});

export const instructorSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: emailSchema,
  phone: z.string().optional(),
  specialty: z.string().min(1, "Especialidade é obrigatória"),
  bio: z.string().optional(),
  status: z.enum(["Ativo", "Inativo"]),
  courseIds: z.array(z.string()).optional(),
});

export const blogPostSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  category: z.enum([
    "Departamento Pessoal",
    "eSocial",
    "Gestão Pública",
    "Liderança",
    "Tecnologia",
    "Assédio e Compliance",
  ]),
  author: z.string().min(1, "Autor é obrigatório"),
  status: z.enum(["Rascunho", "Publicado", "Arquivado"]),
  summary: z.string().min(20, "Resumo deve ter pelo menos 20 caracteres"),
  content: z.string().min(100, "Conteúdo deve ter pelo menos 100 caracteres"),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  readingTime: z.string().optional(),
  relatedCourseId: z.string().optional(),
});

export const leadStatusUpdateSchema = z.object({
  status: z.enum(["Novo", "Em atendimento", "Proposta enviada", "Convertido", "Perdido"]),
});

export const deleteIdSchema = z.object({
  id: z.string().uuid("ID inválido"),
});
