// Mappers domínio → schema do banco para mutações administrativas.
// Portado de src/lib/supabase/admin-resources.ts (sem dependência de tipos
// gerados — usa shapes leves, já que o runtime Deno não importa database.types).

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type Modality = "Ao vivo online" | "Presencial" | "In company" | "Híbrido" | "Gravado";

export function toDbModality(value: Modality): string {
  const map: Record<Modality, string> = {
    "Ao vivo online": "Online",
    Presencial: "Presencial",
    "In company": "InCompany",
    Híbrido: "Hibrido",
    Gravado: "Gravado",
  };
  return map[value] ?? "Online";
}

export function toDbLevel(value: string): string {
  if (value === "Avançado" || value.includes("Avançado")) return "Avancado";
  if (value === "Intermediário" || value.includes("Intermediário")) return "Intermediario";
  if (value === "Básico / Intermediário") return "Misto";
  return "Basico";
}

export function toDbCourseStatus(value: string): string {
  return value === "Em breve" ? "EmBreve" : value;
}

export function toDbClassStatus(value: string): string {
  const map: Record<string, string> = {
    "Inscrições abertas": "Aberta",
    "Poucas vagas": "PoucasVagas",
    Encerrada: "Encerrada",
    "Em breve": "EmBreve",
  };
  return map[value] ?? "Aberta";
}

export function toDbLeadStatus(value: string): string {
  const map: Record<string, string> = {
    Novo: "Novo",
    "Em atendimento": "EmAtendimento",
    "Proposta enviada": "PropostaEnviada",
    Convertido: "Convertido",
    Perdido: "Perdido",
  };
  return map[value] ?? "Novo";
}

export function toDbEnrollmentStatus(value: string): string {
  const map: Record<string, string> = {
    Pendente: "Pendente",
    "Aguardando pagamento": "AguardandoPagamento",
    Confirmada: "Confirmada",
    Cancelada: "Cancelada",
    Concluída: "Concluida",
  };
  return map[value] ?? "Pendente";
}

// deno-lint-ignore no-explicit-any
type AnyPayload = Record<string, any>;

export function courseToUpsert(p: AnyPayload): AnyPayload {
  return {
    id: p.id,
    titulo: p.title ?? "Novo curso",
    slug: p.slug ?? slugify(p.title ?? "novo-curso"),
    descricao_curta: p.shortDescription ?? "",
    descricao: p.fullDescription ?? "",
    ementa: p.modules ?? [],
    objetivos: p.objectives ?? [],
    beneficios: p.benefits ?? [],
    publico_alvo: p.targetAudience ?? [],
    carga_horaria: p.durationHours ?? Number(String(p.durationLabel ?? "").replace(/\D/g, "") || 8),
    modalidade: toDbModality(p.modality ?? "Ao vivo online"),
    nivel: toDbLevel(p.level ?? "Básico"),
    trilha_id: p.pathId,
    trilha_nome: p.pathName,
    tipo_publico: p.publicType,
    preco_base: p.price ?? 0,
    status: toDbCourseStatus(p.status ?? "Ativo"),
    destaque: p.featured ?? false,
    imagem_capa: p.image,
    rating: p.rating ?? 0,
    total_alunos: p.studentsCount ?? 0,
  };
}

export function classToUpsert(p: AnyPayload): AnyPayload {
  return {
    id: p.id,
    curso_id: p.courseId ?? "",
    instrutor_id: p.instructorId || null,
    data_inicio: (p.startDate ?? new Date().toISOString()).slice(0, 10),
    data_fim: (p.endDate ?? p.startDate ?? new Date().toISOString()).slice(0, 10),
    horario: p.time,
    local: p.location,
    vagas_total: p.totalSeats ?? 30,
    vagas_preenchidas: p.filledSeats ?? 0,
    preco_turma: p.price ?? 0,
    modalidade: toDbModality(p.modality ?? "Ao vivo online"),
    status: toDbClassStatus(p.status ?? "Inscrições abertas"),
    observacoes: p.notes,
  };
}

export function instructorToUpsert(p: AnyPayload): AnyPayload {
  return {
    id: p.id,
    nome: p.name ?? "Novo instrutor",
    email: p.email,
    telefone: p.phone,
    bio: p.bio,
    especialidade: p.specialty,
    rating: p.rating ?? 0,
    status: p.status ?? "Ativo",
  };
}

export function blogPostToUpsert(p: AnyPayload): AnyPayload {
  return {
    id: p.id,
    titulo: p.title ?? "Novo post",
    slug: p.slug ?? slugify(p.title ?? "novo-post"),
    resumo: p.summary ?? "Resumo do artigo.",
    conteudo: p.content ?? "Conteúdo do artigo.",
    categoria: p.category ?? "Tecnologia",
    tags: p.tags ?? [],
    autor: p.author ?? "Equipe RH Cursos",
    publicado_em: p.date ?? new Date().toISOString(),
    tempo_leitura: p.readingTime ?? "5 min",
    status: p.status ?? "Rascunho",
    imagem_url: p.image,
    curso_id: p.relatedCourseId || null,
  };
}
