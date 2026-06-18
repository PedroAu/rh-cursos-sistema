import { createAdminClient } from "@/lib/supabase/admin";

export type AdminCourseRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  syllabus: string[];
  objectives: string[];
  benefits: string[];
  audience: string[];
  workload: number;
  format: string;
  courseFormat: string;
  level: string;
  trackId: string;
  trackName: string;
  publicType: string;
  basePrice: number;
  price: string;
  status: string;
  courseStatus: string;
  highlighted: boolean;
  coverImage: string;
  rating: number;
  totalStudents: number;
  seatsLabel: string;
  occupancy: number;
  updatedAt: string;
};

export type AdminInstructorRow = {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  bio: string;
  photoUrl: string;
  education: string;
  areas: string[];
  rating: number;
  status: string;
  email: string;
  turmaCount: number;
  updatedAt: string;
};

export type AdminAgendaRow = {
  id: string;
  courseId: string;
  instructorId: string | null;
  courseTitle: string;
  startDate: string;
  endDate: string | null;
  format: string;
  schedule: string;
  location: string;
  status: string;
  seatsTotal: number;
  seatsFilled: number;
  classPrice: number;
  notes: string;
  updatedAt: string;
};

export type AdminSelectOption = {
  value: string;
  label: string;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastSignInAt: string;
};

export type AdminLeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  organization: string;
  participants: number;
  interest: string;
  courseId: string;
  origin: string;
  crmStatus: string;
  message: string;
  preferredFormat: string;
  trainingGoal: string;
  trainingTheme: string;
  mainChallenges: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  createdAt: string;
};

export type AdminAlunoRow = {
  id: string;
  fullName: string;
  email: string;
  cpf: string;
  phone: string;
  role: string;
  organization: string;
  studentType: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminArchivedRow = {
  id: string;
  title: string;
  subtitle: string;
  table: "curso" | "instrutor" | "turma" | "lead" | "aluno";
  deletedAt: string;
};

export type AdminDashboardSnapshot = {
  coursesCount: number;
  turmasCount: number;
  leadsCount: number;
  profilesCount: number;
  newLeadsCount: number;
  nextThirtyDaysTurmasCount: number;
  coursesWithoutClassCount: number;
  draftCoursesCount: number;
  criticalOccupancyTurmasCount: number;
  recentLeads: AdminLeadRow[];
  upcomingTurmas: AdminAgendaRow[];
  recentCourses: AdminCourseRow[];
};

type AdminFilters = {
  query?: string;
  status?: string;
  format?: string;
  courseStatus?: string;
  classStatus?: string;
  classFormat?: string;
  category?: string;
  role?: string;
  type?: string;
  courseId?: string;
  instructorId?: string;
  source?: string;
  area?: string;
  allocation?: string;
  access?: string;
  completeness?: string;
  dateFrom?: string;
  dateTo?: string;
  month?: string;
};

function normalizeValue(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matchesQuery(fields: Array<string | null | undefined>, query?: string) {
  if (!query) {
    return true;
  }

  const normalizedQuery = normalizeValue(query).trim();

  if (normalizedQuery.length === 0) {
    return true;
  }

  return fields.some((field) => normalizeValue(field).includes(normalizedQuery));
}

function matchesExactFilter(value: string | null | undefined, filter?: string) {
  if (!filter || filter === "todos") {
    return true;
  }

  return normalizeValue(value) === normalizeValue(filter);
}

function matchesDateRange(value: string | null | undefined, dateFrom?: string, dateTo?: string) {
  if (!value) {
    return !dateFrom && !dateTo;
  }

  const date = value.slice(0, 10);

  if (dateFrom && date < dateFrom) {
    return false;
  }

  if (dateTo && date > dateTo) {
    return false;
  }

  return true;
}

function formatPrice(value: number | null | undefined) {
  if (!value || value <= 0) {
    return "Sob consulta";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const text = record.title ?? record.label ?? record.name ?? record.description;
        return typeof text === "string" ? text : null;
      }

      return null;
    })
    .filter((item): item is string => Boolean(item && item.trim().length > 0));
}

export async function getAdminCourses(filters: AdminFilters = {}) {
  const supabase = createAdminClient();

  const [coursesResult, turmasResult] = await Promise.all([
    supabase
      .from("curso")
      .select(
        "id,titulo,slug,descricao_curta,descricao,ementa,objetivos,beneficios,publico_alvo,carga_horaria,modalidade,nivel,categoria,trilha_id,trilha_nome,tipo_publico,preco_base,status,destaque,imagem_capa,rating,total_alunos,deleted_at,updated_at",
      )
      .is("deleted_at", null)
      .order("updated_at", { ascending: false }),
    supabase
      .from("turma")
      .select(
        "id,curso_id,vagas_total,vagas_preenchidas,vagas_restantes,preco_turma,modalidade,status,deleted_at",
      )
      .is("deleted_at", null),
  ]);

  if (coursesResult.error || turmasResult.error) {
    return [];
  }

  const turmasByCourse = new Map<
    string,
    {
      vagas_total: number | null;
      vagas_preenchidas: number | null;
      vagas_restantes: number | null;
      preco_turma: number | null;
      modalidade: string | null;
      status: string | null;
    }[]
  >();

  for (const turma of turmasResult.data ?? []) {
    const rows = turmasByCourse.get(turma.curso_id) ?? [];
    rows.push(turma);
    turmasByCourse.set(turma.curso_id, rows);
  }

  return (coursesResult.data ?? []).map((course) => {
    const courseTurmas = turmasByCourse.get(course.id) ?? [];
    const firstTurma = courseTurmas[0];
    const seatsTotal = firstTurma?.vagas_total ?? 0;
    const seatsFilled = firstTurma?.vagas_preenchidas ?? 0;
    const occupancy = seatsTotal > 0 ? Math.round((seatsFilled / seatsTotal) * 100) : 0;

    return {
      id: course.id,
      title: course.titulo,
      slug: course.slug,
      category: course.categoria ?? "Curso",
      shortDescription: course.descricao_curta ?? "",
      description: course.descricao ?? "",
      syllabus: normalizeStringList(course.ementa),
      objectives: normalizeStringList(course.objetivos),
      benefits: normalizeStringList(course.beneficios),
      audience: normalizeStringList(course.publico_alvo),
      workload: course.carga_horaria ?? 0,
      format: firstTurma?.modalidade ?? course.modalidade ?? "Online",
      courseFormat: course.modalidade ?? "Online",
      level: course.nivel ?? "Básico",
      trackId: course.trilha_id ?? "",
      trackName: course.trilha_nome ?? "",
      publicType: course.tipo_publico ?? "",
      basePrice: course.preco_base ?? 0,
      price: formatPrice(firstTurma?.preco_turma ?? course.preco_base),
      status: firstTurma?.status ?? course.status ?? "Ativo",
      courseStatus: course.status ?? "Ativo",
      highlighted: Boolean(course.destaque),
      coverImage: course.imagem_capa ?? "",
      rating: course.rating ?? 0,
      totalStudents: course.total_alunos ?? 0,
      seatsLabel: firstTurma
        ? `${seatsFilled} / ${seatsTotal || 0} vagas`
        : "Sem turmas vinculadas",
      occupancy,
      updatedAt: course.updated_at ?? "",
    } satisfies AdminCourseRow;
  }).filter(
    (row) =>
      matchesQuery([row.title, row.slug, row.category, row.format], filters.query) &&
      matchesExactFilter(row.courseStatus, filters.courseStatus ?? filters.status) &&
      matchesExactFilter(row.status, filters.classStatus) &&
      matchesExactFilter(row.courseFormat, filters.format) &&
      matchesExactFilter(row.format, filters.classFormat) &&
      matchesExactFilter(row.category, filters.category),
  );
}

export async function getAdminInstructors(filters: AdminFilters = {}) {
  const supabase = createAdminClient();

  const [instructorsResult, turmasResult] = await Promise.all([
    supabase
      .from("instrutor")
      .select("id,nome,email,telefone,bio,foto_url,formacao,especialidade,areas_atuacao,rating,status,deleted_at,updated_at")
      .is("deleted_at", null)
      .order("nome", { ascending: true }),
    supabase
      .from("turma")
      .select("id,instrutor_id,deleted_at")
      .is("deleted_at", null),
  ]);

  if (instructorsResult.error || turmasResult.error) {
    return [];
  }

  const turmaCountByInstructor = new Map<string, number>();

  for (const turma of turmasResult.data ?? []) {
    if (!turma.instrutor_id) continue;
    turmaCountByInstructor.set(
      turma.instrutor_id,
      (turmaCountByInstructor.get(turma.instrutor_id) ?? 0) + 1,
    );
  }

  return (instructorsResult.data ?? []).map((instructor) => ({
    id: instructor.id,
    name: instructor.nome,
    specialty: instructor.especialidade ?? "Não informado",
    phone: instructor.telefone ?? "",
    bio: instructor.bio ?? "",
    photoUrl: instructor.foto_url ?? "",
    education: instructor.formacao ?? "",
    areas: normalizeStringList(instructor.areas_atuacao),
    rating: instructor.rating ?? 0,
    status: instructor.status ?? "Ativo",
    email: instructor.email ?? "-",
    turmaCount: turmaCountByInstructor.get(instructor.id) ?? 0,
    updatedAt: instructor.updated_at ?? "",
  })).filter(
    (row) =>
      matchesQuery([row.name, row.email, row.specialty], filters.query) &&
      matchesExactFilter(row.status, filters.status) &&
      (filters.area && filters.area !== "todos"
        ? row.areas.some((area) => normalizeValue(area) === normalizeValue(filters.area))
        : true) &&
      (filters.allocation === "com-turma"
        ? row.turmaCount > 0
        : filters.allocation === "sem-turma"
          ? row.turmaCount === 0
          : true),
  );
}

export async function getAdminAgenda(filters: AdminFilters = {}) {
  const supabase = createAdminClient();

  const [turmasResult, coursesResult] = await Promise.all([
    supabase
      .from("turma")
      .select(
        "id,curso_id,instrutor_id,data_inicio,data_fim,modalidade,horario,local,status,vagas_total,vagas_preenchidas,preco_turma,observacoes,deleted_at,updated_at",
      )
      .is("deleted_at", null)
      .order("data_inicio", { ascending: true }),
    supabase
      .from("curso")
      .select("id,titulo,deleted_at")
      .is("deleted_at", null),
  ]);

  if (turmasResult.error || coursesResult.error) {
    return [];
  }

  const courseTitleById = new Map(
    (coursesResult.data ?? []).map((item) => [item.id, item.titulo]),
  );

  return (turmasResult.data ?? []).map((turma) => ({
    id: turma.id,
    courseId: turma.curso_id,
    instructorId: turma.instrutor_id,
    courseTitle: courseTitleById.get(turma.curso_id) ?? "Curso removido",
    startDate: turma.data_inicio ?? "-",
    endDate: turma.data_fim,
    format: turma.modalidade ?? "Online",
    schedule: turma.horario ?? "Horário a confirmar",
    location: turma.local ?? "Local a confirmar",
    status: turma.status ?? "Planejamento",
    seatsTotal: turma.vagas_total ?? 0,
    seatsFilled: turma.vagas_preenchidas ?? 0,
    classPrice: turma.preco_turma ?? 0,
    notes: turma.observacoes ?? "",
    updatedAt: turma.updated_at ?? "",
  })).filter(
    (row) =>
      matchesQuery([row.courseTitle, row.location, row.schedule, row.id], filters.query) &&
      matchesExactFilter(row.status, filters.status) &&
      matchesExactFilter(row.format, filters.format) &&
      matchesExactFilter(row.courseId, filters.courseId) &&
      matchesExactFilter(row.instructorId, filters.instructorId) &&
      matchesDateRange(row.startDate, filters.dateFrom, filters.dateTo) &&
      (!filters.month || filters.month === "todos" ? true : row.startDate.startsWith(filters.month)),
  );
}

export async function getAdminCourseOptions() {
  const supabase = createAdminClient();
  const result = await supabase
    .from("curso")
    .select("id,titulo,deleted_at")
    .is("deleted_at", null)
    .order("titulo", { ascending: true });

  if (result.error) {
    return [] satisfies AdminSelectOption[];
  }

  return (result.data ?? []).map((course) => ({
    value: course.id,
    label: course.titulo,
  }));
}

export async function getAdminInstructorOptions() {
  const supabase = createAdminClient();
  const result = await supabase
    .from("instrutor")
    .select("id,nome,deleted_at")
    .is("deleted_at", null)
    .order("nome", { ascending: true });

  if (result.error) {
    return [] satisfies AdminSelectOption[];
  }

  return (result.data ?? []).map((instructor) => ({
    value: instructor.id,
    label: instructor.nome,
  }));
}

export async function getAdminUsers(filters: AdminFilters = {}) {
  const supabase = createAdminClient();
  const usersResult = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  const profilesResult = await supabase
    .from("profiles")
    .select("id,role")
    .order("created_at", { ascending: false });

  if (usersResult.error) {
    return [];
  }

  const roleById = new Map(
    (profilesResult.data ?? []).map((profile) => [profile.id, profile.role]),
  );

  return usersResult.data.users.map((user) => ({
    id: user.id,
    name:
      typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : typeof user.user_metadata?.nome === "string"
          ? user.user_metadata.nome
          : user.email?.split("@")[0] ?? "Usuário",
    email: user.email ?? "-",
    role:
      roleById.get(user.id) ??
      (typeof user.user_metadata?.role === "string" ? user.user_metadata.role : "aluno"),
    status: user.banned_until
      ? "inativo"
      : user.email_confirmed_at
        ? "ativo"
        : "pendente",
    createdAt: user.created_at?.slice(0, 10) ?? "-",
    lastSignInAt: user.last_sign_in_at?.slice(0, 10) ?? "-",
  })).filter(
    (row) =>
      matchesQuery([row.name, row.email, row.role], filters.query) &&
      matchesExactFilter(row.role, filters.role) &&
      matchesExactFilter(row.status, filters.status),
  );
}

export async function getAdminLeads(filters: AdminFilters = {}) {
  const supabase = createAdminClient();
  const result = await supabase
    .from("lead")
    .select(
      "id,nome,email,telefone,tipo,orgao,num_participantes,tema_interesse,curso_id,origem,status_crm,mensagem,modalidade_preferida,objetivo_treinamento,tema_treinamento,desafios_principais,utm_source,utm_medium,utm_campaign,utm_term,utm_content,created_at,deleted_at",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(200);

  if (result.error) {
    return [];
  }

  return (result.data ?? []).map((lead) => ({
    id: lead.id,
    name: lead.nome,
    email: lead.email ?? "",
    phone: lead.telefone ?? "-",
    type: lead.tipo ?? "Contato",
    organization: lead.orgao ?? "",
    participants: lead.num_participantes ?? 0,
    interest: lead.tema_interesse ?? "-",
    courseId: lead.curso_id ?? "",
    origin: lead.origem ?? "Site",
    crmStatus: lead.status_crm ?? "Novo",
    message: lead.mensagem ?? "",
    preferredFormat: lead.modalidade_preferida ?? "",
    trainingGoal: lead.objetivo_treinamento ?? "",
    trainingTheme: lead.tema_treinamento ?? "",
    mainChallenges: lead.desafios_principais ?? "",
    utmSource: lead.utm_source ?? "",
    utmMedium: lead.utm_medium ?? "",
    utmCampaign: lead.utm_campaign ?? "",
    utmTerm: lead.utm_term ?? "",
    utmContent: lead.utm_content ?? "",
    createdAt: lead.created_at?.slice(0, 10) ?? "-",
  })).filter(
    (row) =>
      matchesQuery([row.name, row.email, row.phone, row.interest, row.origin], filters.query) &&
      matchesExactFilter(row.crmStatus, filters.status) &&
      matchesExactFilter(row.type, filters.type) &&
      matchesExactFilter(row.courseId, filters.courseId) &&
      matchesExactFilter(row.origin, filters.source) &&
      matchesDateRange(row.createdAt, filters.dateFrom, filters.dateTo),
  );
}

export async function getAdminAlunos(filters: AdminFilters = {}) {
  const supabase = createAdminClient();
  const result = await supabase
    .from("aluno")
    .select(
      "id,nome_completo,email,cpf,telefone,cargo,orgao,tipo_aluno,user_id,created_at,updated_at,deleted_at",
    )
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(300);

  if (result.error) {
    return [];
  }

  return (result.data ?? []).map((aluno) => ({
    id: aluno.id,
    fullName: aluno.nome_completo,
    email: aluno.email,
    cpf: aluno.cpf ?? "",
    phone: aluno.telefone ?? "",
    role: aluno.cargo ?? "",
    organization: aluno.orgao ?? "",
    studentType: aluno.tipo_aluno ?? "PF",
    userId: aluno.user_id ?? "",
    createdAt: aluno.created_at?.slice(0, 10) ?? "-",
    updatedAt: aluno.updated_at?.slice(0, 10) ?? "-",
  })).filter(
    (row) =>
      matchesQuery(
        [row.fullName, row.email, row.cpf, row.phone, row.role, row.organization],
        filters.query,
      ) &&
      matchesExactFilter(row.studentType, filters.type) &&
      (filters.access === "com-acesso"
        ? row.userId.length > 0
        : filters.access === "sem-acesso"
          ? row.userId.length === 0
          : true) &&
      (filters.completeness === "incompleto" ? !row.cpf || !row.phone : true),
  );
}

async function getCountWithFallback(
  primaryTable: string,
  fallbackTable?: string,
) {
  const supabase = createAdminClient();

  const primary = await supabase
    .from(primaryTable)
    .select("*", { count: "exact", head: true });

  if (!primary.error) {
    return primary.count ?? 0;
  }

  if (!fallbackTable) {
    return 0;
  }

  const fallback = await supabase
    .from(fallbackTable)
    .select("*", { count: "exact", head: true });

  return fallback.error ? 0 : fallback.count ?? 0;
}

export async function getAdminDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
  const [coursesCount, turmasCount, leadsCount, profilesCount, recentLeads, upcomingTurmas, recentCourses] =
    await Promise.all([
      getCountWithFallback("courses", "curso"),
      getCountWithFallback("turmas", "turma"),
      getCountWithFallback("leads", "lead"),
      getCountWithFallback("profiles"),
      getAdminLeads(),
      getAdminAgenda(),
      getAdminCourses(),
    ]);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + 30);
  const today = new Date();

  return {
    coursesCount,
    turmasCount,
    leadsCount,
    profilesCount,
    newLeadsCount: recentLeads.filter((lead) => lead.crmStatus === "Novo").length,
    nextThirtyDaysTurmasCount: upcomingTurmas.filter((turma) => {
      const startDate = new Date(turma.startDate);
      return startDate >= today && startDate <= threshold;
    }).length,
    coursesWithoutClassCount: recentCourses.filter(
      (course) => course.seatsLabel === "Sem turmas vinculadas",
    ).length,
    draftCoursesCount: recentCourses.filter((course) => course.courseStatus === "Rascunho").length,
    criticalOccupancyTurmasCount: upcomingTurmas.filter(
      (turma) => turma.seatsTotal > 0 && turma.seatsFilled / turma.seatsTotal >= 0.9,
    ).length,
    recentLeads: recentLeads.slice(0, 5),
    upcomingTurmas: upcomingTurmas.slice(0, 5),
    recentCourses: recentCourses
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 5),
  };
}

export async function getArchivedAdminEntities() {
  const supabase = createAdminClient();

  const [coursesResult, instructorsResult, turmasResult, leadsResult, alunosResult] = await Promise.all([
    supabase
      .from("curso")
      .select("id,titulo,slug,deleted_at")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .limit(20),
    supabase
      .from("instrutor")
      .select("id,nome,email,deleted_at")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .limit(20),
    supabase
      .from("turma")
      .select("id,local,data_inicio,deleted_at")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .limit(20),
    supabase
      .from("lead")
      .select("id,nome,email,deleted_at")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .limit(20),
    supabase
      .from("aluno")
      .select("id,nome_completo,email,deleted_at")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .limit(20),
  ]);

  const rows: AdminArchivedRow[] = [];

  for (const course of coursesResult.data ?? []) {
    rows.push({
      id: course.id,
      title: course.titulo,
      subtitle: course.slug ?? "Curso",
      table: "curso",
      deletedAt: course.deleted_at?.slice(0, 10) ?? "-",
    });
  }

  for (const instructor of instructorsResult.data ?? []) {
    rows.push({
      id: instructor.id,
      title: instructor.nome,
      subtitle: instructor.email ?? "Instrutor",
      table: "instrutor",
      deletedAt: instructor.deleted_at?.slice(0, 10) ?? "-",
    });
  }

  for (const turma of turmasResult.data ?? []) {
    rows.push({
      id: turma.id,
      title: `Turma ${turma.data_inicio ?? ""}`.trim(),
      subtitle: turma.local ?? "Turma",
      table: "turma",
      deletedAt: turma.deleted_at?.slice(0, 10) ?? "-",
    });
  }

  for (const lead of leadsResult.data ?? []) {
    rows.push({
      id: lead.id,
      title: lead.nome,
      subtitle: lead.email ?? "Lead",
      table: "lead",
      deletedAt: lead.deleted_at?.slice(0, 10) ?? "-",
    });
  }

  for (const aluno of alunosResult.data ?? []) {
    rows.push({
      id: aluno.id,
      title: aluno.nome_completo,
      subtitle: aluno.email ?? "Aluno",
      table: "aluno",
      deletedAt: aluno.deleted_at?.slice(0, 10) ?? "-",
    });
  }

  return rows.sort((a, b) => b.deletedAt.localeCompare(a.deletedAt)).slice(0, 12);
}
