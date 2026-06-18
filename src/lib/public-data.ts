import { createAdminClient } from "@/lib/supabase/admin";
import {
  courses as fallbackCourses,
  getCourseBySlug as getFallbackCourseBySlug,
  type Course,
} from "@/lib/site-data";

type LegacyCourseRow = {
  id: string;
  titulo: string;
  slug: string;
  categoria: string | null;
  descricao_curta: string | null;
  descricao: string | null;
  ementa: unknown[] | null;
  objetivos: unknown[] | null;
  publico_alvo: unknown[] | null;
  carga_horaria: number | null;
  modalidade: string | null;
  nivel: string | null;
  preco_base: number | null;
  destaque: boolean | null;
  total_alunos: number | null;
  rating: number | null;
  deleted_at?: string | null;
};

type LegacyTurmaRow = {
  id: string;
  curso_id: string;
  instrutor_id: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  horario: string | null;
  local: string | null;
  vagas_total: number | null;
  vagas_preenchidas: number | null;
  vagas_restantes: number | null;
  preco_turma: number | null;
  modalidade: string | null;
  status: string | null;
  deleted_at?: string | null;
};

type LegacyInstructorRow = {
  id: string;
  nome: string;
  especialidade: string | null;
  deleted_at?: string | null;
};

export type AgendaItem = {
  id: string;
  courseSlug: string;
  courseTitle: string;
  startDate: string;
  endDate: string | null;
  schedule: string;
  location: string;
  format: string;
  status: string;
  remainingSeats: number | null;
};

export type EnrollmentClassOption = {
  value: string;
  label: string;
  status: string;
};

export type EnrollmentContext = {
  courseId: string | null;
  classes: EnrollmentClassOption[];
};

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

function formatDuration(hours: number | null | undefined) {
  if (!hours) {
    return "Carga horária sob consulta";
  }

  return `${hours}h`;
}

function normalizeArrayEntry(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    for (const key of ["title", "description", "name", "label"]) {
      const field = record[key];

      if (typeof field === "string" && field.trim().length > 0) {
        return field.trim();
      }
    }

    if (Array.isArray(record.topics)) {
      const topic = record.topics.find((item) => typeof item === "string" && item.trim().length > 0);

      if (typeof topic === "string") {
        return topic.trim();
      }
    }
  }

  return null;
}

function normalizeTextArray(values: unknown[] | null | undefined, fallback: string[]) {
  const normalizedValues = (values ?? [])
    .map(normalizeArrayEntry)
    .filter((item): item is string => Boolean(item));

  return normalizedValues.length > 0 ? normalizedValues : fallback;
}

function mapLegacyCourse(
  course: LegacyCourseRow,
  turmas: LegacyTurmaRow[],
  instructorsById: Map<string, LegacyInstructorRow>,
): Course {
  const turma = turmas.find((item) => item.curso_id === course.id);
  const instructor = turma?.instrutor_id
    ? instructorsById.get(turma.instrutor_id)
    : undefined;

  return {
    slug: course.slug,
    title: course.titulo,
    category: course.categoria ?? "Curso",
    summary: course.descricao_curta ?? "Capacitação profissional com foco prático.",
    description: course.descricao ?? course.descricao_curta ?? "Conteúdo em atualização.",
    duration: formatDuration(course.carga_horaria),
    format: turma?.modalidade ?? course.modalidade ?? "Online",
    level: course.nivel ?? undefined,
    price: formatPrice(turma?.preco_turma ?? course.preco_base),
    audience: normalizeTextArray(course.publico_alvo, [
      "Profissionais em formação e lideranças operacionais",
    ]),
    outcomes: normalizeTextArray(
      course.objetivos,
      normalizeTextArray(course.ementa, ["Conteúdo em atualização"]),
    ),
    instructor: {
      name: instructor?.nome ?? "Equipe RH Cursos",
      role:
        instructor?.especialidade ??
        (course.categoria ? `Especialista em ${course.categoria}` : "Especialista convidado"),
    },
  };
}

async function loadLegacyCatalog() {
  const supabase = createAdminClient();

  const [coursesResult, turmasResult, instructorsResult] = await Promise.all([
    supabase
      .from("curso")
      .select(
        "id,titulo,slug,categoria,descricao_curta,descricao,ementa,objetivos,publico_alvo,carga_horaria,modalidade,nivel,preco_base,destaque,total_alunos,rating,deleted_at",
      )
      .is("deleted_at", null)
      .order("destaque", { ascending: false })
      .order("titulo", { ascending: true }),
    supabase
      .from("turma")
      .select(
        "id,curso_id,instrutor_id,data_inicio,data_fim,horario,local,vagas_total,vagas_preenchidas,vagas_restantes,preco_turma,modalidade,status,deleted_at",
      )
      .is("deleted_at", null)
      .order("data_inicio", { ascending: true }),
    supabase
      .from("instrutor")
      .select("id,nome,especialidade,deleted_at")
      .is("deleted_at", null)
      .order("nome", { ascending: true }),
  ]);

  if (coursesResult.error || turmasResult.error || instructorsResult.error) {
    throw new Error("Legacy Supabase catalog is unavailable.");
  }

  const coursesRows = (coursesResult.data ?? []) as LegacyCourseRow[];
  const turmasRows = (turmasResult.data ?? []) as LegacyTurmaRow[];
  const instructorsRows = (instructorsResult.data ?? []) as LegacyInstructorRow[];

  if (coursesRows.length === 0) {
    return null;
  }

  const instructorsById = new Map(
    instructorsRows.map((item) => [item.id, item]),
  );

  const idToSlug = new Map(coursesRows.map((item) => [item.id, item.slug]));
  const mappedCourses = coursesRows.map((course) =>
    mapLegacyCourse(course, turmasRows, instructorsById),
  );

  const agenda = turmasRows
    .map((turma) => {
      const courseSlug = idToSlug.get(turma.curso_id);
      const course = mappedCourses.find((item) => item.slug === courseSlug);

      if (!course || !turma.data_inicio) {
        return null;
      }

      return {
        id: turma.id,
        courseSlug: course.slug,
        courseTitle: course.title,
        startDate: turma.data_inicio,
        endDate: turma.data_fim,
        schedule: turma.horario ?? "Horário a confirmar",
        location: turma.local ?? "Local a confirmar",
        format: turma.modalidade ?? course.format,
        status: turma.status ?? "Planejamento",
        remainingSeats: turma.vagas_restantes,
      } satisfies AgendaItem;
    })
    .filter((item): item is AgendaItem => item !== null);

  return {
    courses: mappedCourses,
    agenda,
  };
}

export async function getPublicCourses() {
  try {
    const legacyCatalog = await loadLegacyCatalog();
    return legacyCatalog?.courses ?? fallbackCourses;
  } catch {
    return fallbackCourses;
  }
}

export async function getPublicCourseBySlug(slug: string) {
  const courses = await getPublicCourses();
  return (
    courses.find((course) => course.slug === slug) ??
    getFallbackCourseBySlug(slug)
  );
}

export async function getEnrollmentContextBySlug(slug: string): Promise<EnrollmentContext> {
  try {
    const supabase = createAdminClient();
    const courseResult = await supabase
      .from("curso")
      .select("id")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle<{ id: string }>();

    if (courseResult.error || !courseResult.data) {
      return { courseId: null, classes: [] };
    }

    const turmasResult = await supabase
      .from("turma")
      .select("id,data_inicio,modalidade,status,local,deleted_at")
      .eq("curso_id", courseResult.data.id)
      .is("deleted_at", null)
      .order("data_inicio", { ascending: true });

    return {
      courseId: courseResult.data.id,
      classes: (turmasResult.data ?? []).map((turma) => ({
        value: turma.id,
        label: `${turma.data_inicio ?? "Data a confirmar"} · ${turma.modalidade ?? "Online"} · ${turma.local ?? "Local a confirmar"}`,
        status: turma.status ?? "Aberta",
      })),
    };
  } catch {
    return { courseId: null, classes: [] };
  }
}

export async function getAgendaItems() {
  try {
    const legacyCatalog = await loadLegacyCatalog();

    if (legacyCatalog && legacyCatalog.agenda.length > 0) {
      return legacyCatalog.agenda;
    }
  } catch {
    // Fallback below.
  }

  return fallbackCourses.map((course, index) => ({
    id: `fallback-${course.slug}`,
    courseSlug: course.slug,
    courseTitle: course.title,
    startDate: `2026-07-${String(index + 12).padStart(2, "0")}`,
    endDate: `2026-07-${String(index + 13).padStart(2, "0")}`,
    schedule: "09:00 às 17:00",
    location: course.format,
    format: course.format,
    status: index % 2 === 0 ? "Turma aberta" : "Planejamento",
    remainingSeats: 20 - index * 3,
  }));
}
