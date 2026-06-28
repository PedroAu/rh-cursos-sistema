import { z } from "zod";

/**
 * Zod schemas que descrevem o formato das respostas do Supabase consumidas em
 * `rh-cursos-api.ts`. Cada schema cobre exatamente as colunas selecionadas pela
 * query correspondente, servindo como contrato de validação na borda de dados.
 *
 * Campos numéricos usam `dbNumber` porque colunas `numeric`/`decimal` podem ser
 * serializadas como string pelo PostgREST; a coerção mantém o comportamento dos
 * mappers (que já aplicam `Number(...)`) sem falsos negativos de validação.
 */
const dbNumber = z.coerce.number();

const modalidadeEnum = z.enum(["Presencial", "Online", "Hibrido", "InCompany", "Gravado"]);

// --- fetchPublicCatalog ---------------------------------------------------

export const publicCourseSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  slug: z.string(),
  descricao_curta: z.string().nullable(),
  descricao: z.string().nullable(),
  ementa: z.unknown(),
  objetivos: z.unknown(),
  beneficios: z.unknown(),
  publico_alvo: z.unknown(),
  carga_horaria: dbNumber,
  modalidade: modalidadeEnum,
  nivel: z.enum(["Basico", "Intermediario", "Avancado", "Misto"]),
  categoria: z.string().nullable(),
  trilha_id: z.string().nullable(),
  trilha_nome: z.string().nullable(),
  preco_base: dbNumber,
  status: z.enum(["Ativo", "Inativo", "Destaque", "EmBreve", "Rascunho", "Arquivado"]),
  destaque: z.boolean(),
  imagem_capa: z.string().nullable(),
  rating: dbNumber,
  total_alunos: dbNumber
});

export const publicClassSchema = z.object({
  id: z.string(),
  curso_id: z.string(),
  instrutor_id: z.string().nullable(),
  data_inicio: z.string(),
  data_fim: z.string().nullable(),
  horario: z.string().nullable(),
  local: z.string().nullable(),
  vagas_total: dbNumber,
  vagas_preenchidas: dbNumber,
  vagas_restantes: dbNumber,
  preco_turma: dbNumber,
  modalidade: modalidadeEnum,
  status: z.enum(["Aberta", "PoucasVagas", "Encerrada", "Cancelada", "Realizada", "EmBreve"]),
  observacoes: z.string().nullable()
});

export const publicInstructorSchema = z.object({
  id: z.string(),
  nome: z.string(),
  email: z.string().nullable(),
  telefone: z.string().nullable(),
  bio: z.string().nullable(),
  foto_url: z.string().nullable(),
  formacao: z.string().nullable(),
  especialidade: z.string().nullable(),
  rating: dbNumber,
  status: z.enum(["Ativo", "Inativo"])
});

export const courseInstructorSchema = z.object({
  id: z.string(),
  curso_id: z.string(),
  instrutor_id: z.string(),
  principal: z.boolean()
});

export const trainingPathSchema = z.object({
  id: z.string(),
  codigo: z.string(),
  nome: z.string(),
  nome_curto: z.string(),
  slug: z.string(),
  descricao: z.string(),
  icone: z.string(),
  ordem: dbNumber,
  ativa: z.boolean()
});

export const publicCourseListSchema = z.array(publicCourseSchema);
export const publicClassListSchema = z.array(publicClassSchema);
export const publicInstructorListSchema = z.array(publicInstructorSchema);
export const courseInstructorListSchema = z.array(courseInstructorSchema);
export const trainingPathListSchema = z.array(trainingPathSchema);

// --- fetchPublicBlogPosts -------------------------------------------------

export const blogPostSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  slug: z.string(),
  resumo: z.string(),
  conteudo: z.string(),
  categoria: z.string(),
  tags: z.unknown(),
  autor: z.string(),
  publicado_em: z.string().nullable(),
  tempo_leitura: z.string().nullable(),
  status: z.enum(["Rascunho", "Publicado", "Arquivado"]),
  imagem_url: z.string().nullable(),
  curso_id: z.string().nullable(),
  created_at: z.string()
});

export const blogPostListSchema = z.array(blogPostSchema);

// --- fetchPublicTestimonials ----------------------------------------------

export const assessmentWithCourseSchema = z.object({
  id: z.string(),
  inscricao_id: z.string(),
  turma_id: z.string(),
  nota: dbNumber,
  comentario: z.string().nullable(),
  publicar: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
  turma: z
    .object({
      curso: z
        .object({ titulo: z.string().nullable() })
        .nullable()
        .optional()
    })
    .nullable()
    .optional()
});

export const assessmentWithCourseListSchema = z.array(assessmentWithCourseSchema);

// --- fetchLeads / createLead ----------------------------------------------

export const leadSchema = z.object({
  id: z.string(),
  nome: z.string(),
  email: z.string().nullable(),
  telefone: z.string().nullable(),
  tipo: z.enum(["Curso", "InCompany", "Mentoria", "Newsletter", "Orcamento", "Contato"]),
  orgao: z.string().nullable(),
  num_participantes: dbNumber.nullable(),
  tema_interesse: z.string().nullable(),
  curso_id: z.string().nullable(),
  status_crm: z.enum(["Novo", "Contatado", "EmAtendimento", "PropostaEnviada", "Convertido", "Perdido"]),
  mensagem: z.string().nullable(),
  utm_source: z.string().nullable(),
  utm_medium: z.string().nullable(),
  utm_campaign: z.string().nullable(),
  utm_term: z.string().nullable(),
  utm_content: z.string().nullable(),
  origem: z.string().nullable(),
  modalidade_preferida: z.string().nullable(),
  objetivo_treinamento: z.string().nullable(),
  tema_treinamento: z.string().nullable(),
  desafios_principais: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable()
});

export const leadListSchema = z.array(leadSchema);

// --- createEnrollment (RPC) -----------------------------------------------

/** `registrar_inscricao_publica` retorna o ID da inscrição criada. */
export const enrollmentIdSchema = z.string();
