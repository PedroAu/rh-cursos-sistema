import { courseCoverByPath, defaultCourseCover } from "@/lib/course-covers";
import { getInitials } from "@/lib/get-initials";
import type { Database, Json } from "@/lib/supabase/database.types";
import type {
  BlogPost,
  ClassStatus,
  Course,
  CourseModule,
  CourseStatus,
  Enrollment,
  EnrollmentStatus,
  Instructor,
  Lead,
  Testimonial,
  TrainingClass,
  TrainingPath
} from "@/types";

type Tables = Database["public"]["Tables"];
export type CourseRow = Tables["curso"]["Row"];
export type InstructorRow = Tables["instrutor"]["Row"];
export type CourseInstructorRow = Tables["curso_instrutor"]["Row"];
export type ClassRow = Tables["turma"]["Row"];
export type LeadRow = Tables["lead"]["Row"];
export type BlogPostRow = Tables["post_blog"]["Row"];
export type AssessmentRow = Tables["avaliacao"]["Row"];
export type StudentRow = Tables["aluno"]["Row"];
export type EnrollmentRow = Tables["inscricao"]["Row"];
export type StudentInsert = Tables["aluno"]["Insert"];
export type EnrollmentInsert = Tables["inscricao"]["Insert"];
export type LeadInsert = Tables["lead"]["Insert"];
export type TrilhaRow = Tables["trilha"]["Row"];

export type AssessmentWithCourseRow = AssessmentRow & {
  turma?: {
    curso?: {
      titulo?: string | null;
    } | null;
  } | null;
};

const trainingPathNames: Record<string, string> = {
  "path-dp": "Departamento Pessoal",
  "path-gestao": "Gestão Pública",
  "path-licitacoes": "Licitações e Contratos",
  "path-pessoas": "Gestão de Pessoas",
  "path-tech": "Tecnologia e Dados",
  "path-comunicacao": "Comunicação Institucional",
  "path-auditoria": "Auditoria e Controle"
};

export function mapTrainingPath(row: TrilhaRow, courseCount: number): TrainingPath {
  return {
    id: row.id,
    code: row.codigo,
    name: row.nome,
    shortName: row.nome_curto,
    slug: row.slug,
    description: row.descricao,
    icon: row.icone,
    courseCount
  };
}

function asStringArray(value: Json): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asModules(value: Json): CourseModule[] {
  const items: unknown[] = Array.isArray(value) ? value : [];

  return items
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({
      title: String(item.title ?? item.titulo ?? "Módulo"),
      description: String(item.description ?? item.descricao ?? ""),
      topics: Array.isArray(item.topics)
        ? item.topics.filter((topic: unknown): topic is string => typeof topic === "string")
        : Array.isArray(item.topicos)
          ? item.topicos.filter((topic: unknown): topic is string => typeof topic === "string")
          : [],
      duration: String(item.duration ?? item.duracao ?? "")
    }));
}

export function toDbModality(value: Course["modality"]): ClassRow["modalidade"] {
  const map: Record<Course["modality"], ClassRow["modalidade"]> = {
    "Ao vivo online": "Online",
    Presencial: "Presencial",
    "In company": "InCompany",
    Híbrido: "Hibrido",
    Gravado: "Gravado"
  };

  return map[value];
}

export function fromDbModality(value: CourseRow["modalidade"]): Course["modality"] {
  const map: Record<CourseRow["modalidade"], Course["modality"]> = {
    Online: "Ao vivo online",
    Presencial: "Presencial",
    InCompany: "In company",
    Hibrido: "Híbrido",
    Gravado: "Gravado"
  };

  return map[value];
}

function fromDbLevel(value: CourseRow["nivel"]): Course["level"] {
  const map: Record<CourseRow["nivel"], Course["level"]> = {
    Basico: "Básico",
    Intermediario: "Intermediário",
    Avancado: "Avançado",
    Misto: "Básico / Intermediário"
  };

  return map[value];
}

function fromDbCourseStatus(value: CourseRow["status"]): CourseStatus {
  const map: Record<CourseRow["status"], CourseStatus> = {
    Ativo: "Ativo",
    Inativo: "Inativo",
    Destaque: "Destaque",
    EmBreve: "Em breve",
    Rascunho: "Inativo",
    Arquivado: "Inativo"
  };

  return map[value];
}

function fromDbClassStatus(value: ClassRow["status"]): ClassStatus {
  const map: Record<ClassRow["status"], ClassStatus> = {
    Aberta: "Inscrições abertas",
    PoucasVagas: "Poucas vagas",
    Encerrada: "Encerrada",
    Cancelada: "Encerrada",
    Realizada: "Encerrada",
    EmBreve: "Em breve"
  };

  return map[value];
}

function toDbEnrollmentStatus(value: EnrollmentStatus): EnrollmentRow["status_inscricao"] {
  const map: Record<EnrollmentStatus, EnrollmentRow["status_inscricao"]> = {
    Pendente: "Pendente",
    "Aguardando pagamento": "AguardandoPagamento",
    Confirmada: "Confirmada",
    Cancelada: "Cancelada",
    Concluída: "Concluida"
  };

  return map[value];
}

export function toDbPaymentMethod(value: Enrollment["paymentMethod"]): EnrollmentRow["forma_pagamento"] {
  return value === "Cartão" ? "Cartao" : value;
}

export function toDbStudentType(value: Enrollment["enrollmentType"]): StudentRow["tipo_aluno"] {
  if (value === "Empresa") return "PJ";
  if (value === "Órgão público") return "Servidor";
  return "PF";
}

function fromDbLeadStatus(value: LeadRow["status_crm"]): Lead["status"] {
  const map: Record<LeadRow["status_crm"], Lead["status"]> = {
    Novo: "Novo",
    Contatado: "Em atendimento",
    EmAtendimento: "Em atendimento",
    PropostaEnviada: "Proposta enviada",
    Convertido: "Convertido",
    Perdido: "Perdido"
  };

  return map[value];
}

function fromDbBlogCategory(value: string): BlogPost["category"] {
  const validCategories: BlogPost["category"][] = [
    "Departamento Pessoal",
    "eSocial",
    "Gestão Pública",
    "Liderança",
    "Tecnologia",
    "Assédio e Compliance"
  ];

  return validCategories.includes(value as BlogPost["category"])
    ? (value as BlogPost["category"])
    : "Tecnologia";
}

export function mapCourse(row: CourseRow, joins: CourseInstructorRow[], classes: ClassRow[]): Course {
  const primaryInstructor = joins.find((item) => item.curso_id === row.id && item.principal) ??
    joins.find((item) => item.curso_id === row.id);
  const nextClass = classes
    .filter((item) => item.curso_id === row.id)
    .sort((a, b) => a.data_inicio.localeCompare(b.data_inicio))[0];

  if (!row.trilha_nome && row.trilha_id && !(row.trilha_id in trainingPathNames)) {
    console.warn(`mapCourse: trilha_id "${row.trilha_id}" not found in trainingPathNames map (course ${row.id}).`);
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.titulo,
    pathId: row.trilha_id ?? "path-dp",
    pathName: row.trilha_nome ?? trainingPathNames[row.trilha_id ?? ""] ?? "Cursos",
    category: row.categoria ?? undefined,
    modality: fromDbModality(row.modalidade),
    modalities: [fromDbModality(row.modalidade)],
    durationLabel: `${row.carga_horaria}h`,
    durationHours: row.carga_horaria,
    level: fromDbLevel(row.nivel),
    price: Number(row.preco_base),
    shortDescription: row.descricao_curta ?? "",
    fullDescription: row.descricao ?? row.descricao_curta ?? "",
    targetAudience: asStringArray(row.publico_alvo),
    categories: row.categoria ? [row.categoria] : [],
    objectives: asStringArray(row.objetivos),
    benefits: asStringArray(row.beneficios),
    modules: asModules(row.ementa),
    instructorId: primaryInstructor?.instrutor_id ?? "",
    image: row.imagem_capa ?? courseCoverByPath[row.trilha_id ?? ""] ?? defaultCourseCover,
    rating: Number(row.rating),
    studentsCount: row.total_alunos,
    status: fromDbCourseStatus(row.status),
    featured: row.destaque || row.status === "Destaque",
    featuredCourseIds: [],
    nextClassId: nextClass?.id ?? ""
  };
}

export function mapClass(row: ClassRow): TrainingClass {
  return {
    id: row.id,
    courseId: row.curso_id,
    startDate: row.data_inicio,
    endDate: row.data_fim ?? row.data_inicio,
    time: row.horario ?? "",
    modality: fromDbModality(row.modalidade),
    location: row.local ?? "",
    instructorId: row.instrutor_id ?? "",
    totalSeats: row.vagas_total,
    manualFilledSeats: row.vagas_preenchidas,
    filledSeats: row.vagas_preenchidas,
    availableSeats: row.vagas_restantes,
    status: fromDbClassStatus(row.status),
    price: Number(row.preco_turma),
    notes: row.observacoes ?? ""
  };
}

export function mapInstructor(row: InstructorRow, joins: CourseInstructorRow[]): Instructor {
  return {
    id: row.id,
    name: row.nome,
    email: row.email ?? "",
    phone: row.telefone ?? "",
    specialty: row.especialidade ?? "",
    bio: row.bio ?? row.formacao ?? "",
    education: row.formacao ?? "",
    photoUrl: row.foto_url ?? "",
    courseIds: joins.filter((item) => item.instrutor_id === row.id).map((item) => item.curso_id),
    rating: Number(row.rating),
    avatar: row.foto_url ?? getInitials(row.nome),
    status: row.status === "Ativo" ? "Ativo" : "Inativo"
  };
}

export function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    name: row.nome,
    email: row.email ?? "",
    phone: row.telefone ?? "",
    courseInterest: row.tema_interesse ?? "",
    origin: (row.origem as Lead["origin"] | null) ?? "Site",
    status: fromDbLeadStatus(row.status_crm),
    message: row.mensagem ?? "",
    createdAt: row.created_at
  };
}

export function mapBlogPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    title: row.titulo,
    slug: row.slug,
    summary: row.resumo,
    content: row.conteudo,
    category: fromDbBlogCategory(row.categoria),
    tags: asStringArray(row.tags),
    author: row.autor,
    date: row.publicado_em ?? row.created_at,
    readingTime: row.tempo_leitura ?? "5 min",
    status: row.status,
    image: row.imagem_url ?? "",
    relatedCourseId: row.curso_id ?? ""
  };
}

export function mapAssessmentToTestimonial(row: AssessmentWithCourseRow): Testimonial {
  return {
    id: row.id,
    name: "Aluno RH Cursos",
    role: "Participante",
    organization: "Turma pública",
    course: row.turma?.curso?.titulo ?? "",
    text: row.comentario ?? "",
    rating: Math.min(Math.max(row.nota, 1), 5)
  };
}

export function enrollmentToStudentInsert(payload: Omit<Enrollment, "id" | "createdAt" | "status">): StudentInsert {
  return {
    nome_completo: payload.studentName,
    email: payload.email,
    cpf: payload.cpf,
    telefone: payload.phone,
    cargo: payload.jobTitle,
    orgao: payload.organization,
    tipo_aluno: toDbStudentType(payload.enrollmentType)
  };
}

export function enrollmentToInsert(
  payload: Omit<Enrollment, "id" | "createdAt" | "status">,
  alunoId: string
): EnrollmentInsert {
  return {
    aluno_id: alunoId,
    turma_id: payload.classId,
    status_inscricao: toDbEnrollmentStatus("Confirmada"),
    status_pagamento: "Pendente",
    valor_pago: 0,
    forma_pagamento: toDbPaymentMethod(payload.paymentMethod),
    tipo_inscricao: payload.enrollmentType,
    observacoes: payload.notes
  };
}

export function leadToInsert(payload: Omit<Lead, "id" | "createdAt" | "status">): LeadInsert {
  return {
    nome: payload.name,
    email: payload.email,
    telefone: payload.phone,
    orgao: payload.organization,
    num_participantes: payload.teamSize,
    tema_interesse: payload.courseInterest,
    origem: payload.origin,
    mensagem: payload.message,
    status_crm: "Novo"
  };
}
