import { formatPrice } from "@/lib/admin-data/filters";
import type {
  AdminAgendaRow,
  AdminCourseRow,
  AdminDashboardSnapshot,
  AdminLeadRow,
} from "@/lib/admin-data";

// Column-light DB row shapes loaded specifically for the dashboard snapshot.
// They intentionally exclude heavy free-text columns (curso.descricao/ementa/
// objetivos/beneficios/publico_alvo, lead.mensagem/objetivo_treinamento/...) so
// the Cloudflare Worker isolate (128 MB hard limit) does not buffer data the
// dashboard never renders. See Story 1.11.
export type DashboardLeadRow = {
  id: string;
  nome: string | null;
  tema_interesse: string | null;
  status_crm: string | null;
  created_at: string | null;
};

export type DashboardTurmaRow = {
  id: string;
  curso_id: string;
  instrutor_id: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  modalidade: string | null;
  horario: string | null;
  local: string | null;
  status: string | null;
  vagas_total: number | null;
  vagas_preenchidas: number | null;
  preco_turma: number | null;
  updated_at: string | null;
};

export type DashboardCourseRow = {
  id: string;
  titulo: string;
  slug: string | null;
  categoria: string | null;
  status: string | null;
  preco_base: number | null;
  updated_at: string | null;
};

export type DashboardSnapshotInput = {
  coursesCount: number;
  turmasCount: number;
  leadsCount: number;
  profilesCount: number;
  leads: DashboardLeadRow[];
  turmas: DashboardTurmaRow[];
  courses: DashboardCourseRow[];
};

function toLeadRow(lead: DashboardLeadRow): AdminLeadRow {
  return {
    id: lead.id,
    name: lead.nome ?? "",
    email: "",
    phone: "-",
    type: "Contato",
    organization: "",
    participants: 0,
    interest: lead.tema_interesse ?? "-",
    courseId: "",
    origin: "Site",
    crmStatus: lead.status_crm ?? "Novo",
    message: "",
    preferredFormat: "",
    trainingGoal: "",
    trainingTheme: "",
    mainChallenges: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
    createdAt: lead.created_at?.slice(0, 10) ?? "-",
  };
}

function toAgendaRow(
  turma: DashboardTurmaRow,
  courseTitleById: Map<string, string>,
): AdminAgendaRow {
  return {
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
    notes: "",
    updatedAt: turma.updated_at ?? "",
  };
}

function toCourseRow(
  course: DashboardCourseRow,
  firstTurma: DashboardTurmaRow | undefined,
): AdminCourseRow {
  const seatsTotal = firstTurma?.vagas_total ?? 0;
  const seatsFilled = firstTurma?.vagas_preenchidas ?? 0;
  const occupancy = seatsTotal > 0 ? Math.round((seatsFilled / seatsTotal) * 100) : 0;

  return {
    id: course.id,
    title: course.titulo,
    slug: course.slug ?? "",
    category: course.categoria ?? "Curso",
    shortDescription: "",
    description: "",
    syllabus: [],
    objectives: [],
    benefits: [],
    audience: [],
    workload: 0,
    format: firstTurma?.modalidade ?? "Online",
    courseFormat: "Online",
    level: "Básico",
    trackId: "",
    trackName: "",
    publicType: "",
    basePrice: course.preco_base ?? 0,
    price: formatPrice(firstTurma?.preco_turma ?? course.preco_base),
    status: firstTurma?.status ?? course.status ?? "Ativo",
    courseStatus: course.status ?? "Ativo",
    highlighted: false,
    coverImage: "",
    rating: 0,
    totalStudents: 0,
    seatsLabel: firstTurma
      ? `${seatsFilled} / ${seatsTotal || 0} vagas`
      : "Sem turmas vinculadas",
    occupancy,
    updatedAt: course.updated_at ?? "",
  };
}

/**
 * Pure builder for the admin dashboard snapshot. Mirrors the field-level
 * behavior previously produced by combining getAdminLeads/getAdminAgenda/
 * getAdminCourses, but operates on column-light rows and loads curso/turma
 * exactly once each. No I/O — fully unit-testable.
 */
export function buildDashboardSnapshot(
  input: DashboardSnapshotInput,
): AdminDashboardSnapshot {
  const today = new Date();
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + 30);

  const courseTitleById = new Map(
    input.courses.map((course) => [course.id, course.titulo]),
  );

  const turmasByCourse = new Map<string, DashboardTurmaRow[]>();
  for (const turma of input.turmas) {
    const rows = turmasByCourse.get(turma.curso_id) ?? [];
    rows.push(turma);
    turmasByCourse.set(turma.curso_id, rows);
  }

  const leadRows = input.leads.map(toLeadRow);
  const agendaRows = input.turmas.map((turma) => toAgendaRow(turma, courseTitleById));
  const courseRows = input.courses.map((course) =>
    toCourseRow(course, turmasByCourse.get(course.id)?.[0]),
  );

  return {
    coursesCount: input.coursesCount,
    turmasCount: input.turmasCount,
    leadsCount: input.leadsCount,
    profilesCount: input.profilesCount,
    newLeadsCount: leadRows.filter((lead) => lead.crmStatus === "Novo").length,
    nextThirtyDaysTurmasCount: agendaRows.filter((turma) => {
      const startDate = new Date(turma.startDate);
      return startDate >= today && startDate <= threshold;
    }).length,
    coursesWithoutClassCount: courseRows.filter(
      (course) => course.seatsLabel === "Sem turmas vinculadas",
    ).length,
    draftCoursesCount: courseRows.filter((course) => course.courseStatus === "Rascunho")
      .length,
    criticalOccupancyTurmasCount: agendaRows.filter(
      (turma) => turma.seatsTotal > 0 && turma.seatsFilled / turma.seatsTotal >= 0.9,
    ).length,
    recentLeads: leadRows.slice(0, 5),
    upcomingTurmas: agendaRows.slice(0, 5),
    recentCourses: courseRows
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 5),
  };
}
