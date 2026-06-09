import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import type { BlogPost, Course, EnrollmentStatus, Instructor, Lead, Student, TrainingClass } from "@/types";
import type { Database, Json } from "@/lib/supabase/database.types";

type Tables = Database["public"]["Tables"];
type ResourceKey = "courses" | "classes" | "students" | "leads" | "enrollments" | "instructors" | "blog";

type AdminMutation =
  | { resource: ResourceKey; action: "upsert"; payload: unknown }
  | { resource: ResourceKey; action: "delete"; id: string }
  | { resource: ResourceKey; action: "update-status"; id: string; status: string };

function toDbModality(value: Course["modality"]): Tables["curso"]["Row"]["modalidade"] {
  const map: Record<Course["modality"], Tables["curso"]["Row"]["modalidade"]> = {
    "Ao vivo online": "Online",
    Presencial: "Presencial",
    "In company": "InCompany",
    Híbrido: "Hibrido",
    Gravado: "Gravado"
  };

  return map[value];
}

function toDbLevel(value: Course["level"]): Tables["curso"]["Row"]["nivel"] {
  if (value === "Avançado" || value.includes("Avançado")) return "Avancado";
  if (value === "Intermediário" || value.includes("Intermediário")) return "Intermediario";
  if (value === "Básico / Intermediário") return "Misto";
  return "Basico";
}

function toDbCourseStatus(value: Course["status"]): Tables["curso"]["Row"]["status"] {
  if (value === "Em breve") return "EmBreve";
  return value;
}

function toDbClassStatus(value: TrainingClass["status"]): Tables["turma"]["Row"]["status"] {
  const map: Record<TrainingClass["status"], Tables["turma"]["Row"]["status"]> = {
    "Inscrições abertas": "Aberta",
    "Poucas vagas": "PoucasVagas",
    Encerrada: "Encerrada",
    "Em breve": "EmBreve"
  };

  return map[value];
}

function toDbLeadStatus(value: Lead["status"]): Tables["lead"]["Row"]["status_crm"] {
  const map: Record<Lead["status"], Tables["lead"]["Row"]["status_crm"]> = {
    Novo: "Novo",
    "Em atendimento": "EmAtendimento",
    "Proposta enviada": "PropostaEnviada",
    Convertido: "Convertido",
    Perdido: "Perdido"
  };

  return map[value];
}

function toDbEnrollmentStatus(value: EnrollmentStatus): Tables["inscricao"]["Row"]["status_inscricao"] {
  const map: Record<EnrollmentStatus, Tables["inscricao"]["Row"]["status_inscricao"]> = {
    Pendente: "Pendente",
    "Aguardando pagamento": "AguardandoPagamento",
    Confirmada: "Confirmada",
    Cancelada: "Cancelada",
    Concluída: "Concluida"
  };

  return map[value];
}

function courseToUpsert(payload: Partial<Course>): Tables["curso"]["Insert"] {
  return {
    id: payload.id,
    titulo: payload.title ?? "Novo curso",
    slug: payload.slug ?? slugify(payload.title ?? "novo-curso"),
    descricao_curta: payload.shortDescription ?? "",
    descricao: payload.fullDescription ?? "",
    ementa: (payload.modules ?? []) as Json,
    objetivos: (payload.objectives ?? []) as Json,
    beneficios: (payload.benefits ?? []) as Json,
    publico_alvo: (payload.targetAudience ?? []) as Json,
    carga_horaria: payload.durationHours ?? Number(payload.durationLabel?.replace(/\D/g, "") || 8),
    modalidade: toDbModality(payload.modality ?? payload.modalities?.[0] ?? "Ao vivo online"),
    nivel: toDbLevel(payload.level ?? "Básico"),
    categoria: payload.category ?? payload.categories?.[0],
    trilha_id: payload.pathId,
    trilha_nome: payload.pathName,
    preco_base: payload.price ?? 0,
    status: toDbCourseStatus(payload.status ?? "Ativo"),
    destaque: payload.featured ?? false,
    imagem_capa: payload.image,
    rating: payload.rating ?? 0,
    total_alunos: payload.studentsCount ?? 0
  };
}

function classToUpsert(payload: Partial<TrainingClass>): Tables["turma"]["Insert"] {
  return {
    id: payload.id,
    curso_id: payload.courseId ?? "",
    instrutor_id: payload.instructorId || null,
    data_inicio: (payload.startDate ?? new Date().toISOString()).slice(0, 10),
    data_fim: (payload.endDate ?? payload.startDate ?? new Date().toISOString()).slice(0, 10),
    horario: payload.time,
    local: payload.location,
    vagas_total: payload.totalSeats ?? 30,
    vagas_preenchidas: payload.filledSeats ?? 0,
    preco_turma: payload.price ?? 0,
    modalidade: toDbModality(payload.modality ?? "Ao vivo online"),
    status: toDbClassStatus(payload.status ?? "Inscrições abertas"),
    observacoes: payload.notes
  };
}

function instructorToUpsert(payload: Partial<Instructor>): Tables["instrutor"]["Insert"] {
  return {
    id: payload.id,
    nome: payload.name ?? "Novo instrutor",
    email: payload.email,
    telefone: payload.phone,
    bio: payload.bio,
    foto_url: payload.photoUrl,
    formacao: payload.education,
    especialidade: payload.specialty,
    rating: payload.rating ?? 0,
    status: payload.status ?? "Ativo"
  };
}

function blogPostToUpsert(payload: Partial<BlogPost>): Tables["post_blog"]["Insert"] {
  return {
    id: payload.id,
    titulo: payload.title ?? "Novo post",
    slug: payload.slug ?? slugify(payload.title ?? "novo-post"),
    resumo: payload.summary ?? "Resumo do artigo.",
    conteudo: payload.content ?? "Conteúdo do artigo.",
    categoria: payload.category ?? "Tecnologia",
    tags: (payload.tags ?? []) as Json,
    autor: payload.author ?? "Equipe RH Cursos",
    publicado_em: payload.date ?? new Date().toISOString(),
    tempo_leitura: payload.readingTime ?? "5 min",
    status: payload.status ?? "Rascunho",
    imagem_url: payload.image,
    curso_id: payload.relatedCourseId || null
  };
}

export async function mutateAdminResource(mutation: AdminMutation) {
  if (!supabaseAdmin) return { skipped: true };

  if (mutation.action === "delete") {
    const tableByResource = {
      courses: "curso",
      classes: "turma",
      instructors: "instrutor",
      blog: "post_blog"
    } as const;
    const table = tableByResource[mutation.resource as keyof typeof tableByResource];
    if (!table) return { skipped: true };

    const { error } = await supabaseAdmin.from(table).update({ deleted_at: new Date().toISOString() }).eq("id", mutation.id);
    if (error) throw error;
    return { skipped: false };
  }

  if (mutation.action === "update-status") {
    if (mutation.resource === "leads") {
      const { error } = await supabaseAdmin
        .from("lead")
        .update({ status_crm: toDbLeadStatus(mutation.status as Lead["status"]) })
        .eq("id", mutation.id);
      if (error) throw error;
    }

    if (mutation.resource === "enrollments") {
      const { error } = await supabaseAdmin
        .from("inscricao")
        .update({ status_inscricao: toDbEnrollmentStatus(mutation.status as EnrollmentStatus) })
        .eq("id", mutation.id);
      if (error) throw error;
    }

    return { skipped: false };
  }

  if (mutation.resource === "courses") {
    const { error } = await supabaseAdmin.from("curso").upsert(courseToUpsert(mutation.payload as Partial<Course>));
    if (error) throw error;
  }

  if (mutation.resource === "classes") {
    const { error } = await supabaseAdmin.from("turma").upsert(classToUpsert(mutation.payload as Partial<TrainingClass>));
    if (error) throw error;
  }

  if (mutation.resource === "students") {
    const payload = mutation.payload as Partial<Student>;
    const { error } = await supabaseAdmin
      .from("aluno")
      .update({
        nome_completo: payload.name,
        email: payload.email,
        orgao: payload.organization
      })
      .eq("id", payload.id ?? "");
    if (error) throw error;
  }

  if (mutation.resource === "instructors") {
    const { error } = await supabaseAdmin.from("instrutor").upsert(instructorToUpsert(mutation.payload as Partial<Instructor>));
    if (error) throw error;
  }

  if (mutation.resource === "blog") {
    const { error } = await supabaseAdmin.from("post_blog").upsert(blogPostToUpsert(mutation.payload as Partial<BlogPost>));
    if (error) throw error;
  }

  return { skipped: false };
}
