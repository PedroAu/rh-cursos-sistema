import { buildDashboardSnapshot } from "@/lib/admin-data/dashboard";
import type {
  DashboardCourseRow,
  DashboardLeadRow,
  DashboardTurmaRow,
} from "@/lib/admin-data/dashboard";

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const courses: DashboardCourseRow[] = [
  { id: "c1", titulo: "Curso A", slug: "curso-a", categoria: "Tech", status: "Ativo", preco_base: 100, updated_at: "2026-06-20" },
  { id: "c2", titulo: "Curso B", slug: "curso-b", categoria: "Gestão", status: "Rascunho", preco_base: 200, updated_at: "2026-06-21" },
  { id: "c3", titulo: "Curso C", slug: "curso-c", categoria: "Tech", status: "Ativo", preco_base: 0, updated_at: "2026-06-19" },
];

const turmas: DashboardTurmaRow[] = [
  { id: "t1", curso_id: "c1", instrutor_id: null, data_inicio: dateOffset(10), data_fim: null, modalidade: "Online", horario: "19h", local: "Remoto", status: "Aberta", vagas_total: 10, vagas_preenchidas: 9, preco_turma: 150, updated_at: "2026-06-20" },
  { id: "t2", curso_id: "c2", instrutor_id: null, data_inicio: dateOffset(40), data_fim: null, modalidade: "Presencial", horario: "9h", local: "SP", status: "Aberta", vagas_total: 20, vagas_preenchidas: 5, preco_turma: 300, updated_at: "2026-06-21" },
];

const leads: DashboardLeadRow[] = [
  { id: "l1", nome: "Lead 1", tema_interesse: "EFD-Reinf", status_crm: "Novo", created_at: "2026-06-21" },
  { id: "l2", nome: "Lead 2", tema_interesse: "eSocial", status_crm: "Convertido", created_at: "2026-06-20" },
  { id: "l3", nome: "Lead 3", tema_interesse: "SPED", status_crm: "Novo", created_at: "2026-06-19" },
];

describe("buildDashboardSnapshot", () => {
  const snapshot = buildDashboardSnapshot({
    coursesCount: 3,
    turmasCount: 2,
    leadsCount: 3,
    profilesCount: 7,
    leads,
    turmas,
    courses,
  });

  it("passes counts through unchanged", () => {
    expect(snapshot.coursesCount).toBe(3);
    expect(snapshot.turmasCount).toBe(2);
    expect(snapshot.leadsCount).toBe(3);
    expect(snapshot.profilesCount).toBe(7);
  });

  it("counts new leads and exposes the latest 5", () => {
    expect(snapshot.newLeadsCount).toBe(2);
    expect(snapshot.recentLeads).toHaveLength(3);
    expect(snapshot.recentLeads[0]).toMatchObject({ name: "Lead 1", crmStatus: "Novo", interest: "EFD-Reinf" });
  });

  it("derives course seats, draft and without-class counts", () => {
    expect(snapshot.draftCoursesCount).toBe(1);
    expect(snapshot.coursesWithoutClassCount).toBe(1);

    const courseA = snapshot.recentCourses.find((c) => c.id === "c1");
    expect(courseA?.seatsLabel).toBe("9 / 10 vagas");
    expect(courseA?.occupancy).toBe(90);
    expect(courseA?.status).toBe("Aberta");

    const courseC = snapshot.recentCourses.find((c) => c.id === "c3");
    expect(courseC?.seatsLabel).toBe("Sem turmas vinculadas");
    expect(courseC?.occupancy).toBe(0);
  });

  it("sorts recent courses by updatedAt descending", () => {
    expect(snapshot.recentCourses.map((c) => c.id)).toEqual(["c2", "c1", "c3"]);
  });

  it("counts upcoming (30d) and critical-occupancy turmas", () => {
    expect(snapshot.nextThirtyDaysTurmasCount).toBe(1);
    expect(snapshot.criticalOccupancyTurmasCount).toBe(1);
  });

  it("does not leak heavy text fields into recent courses", () => {
    for (const course of snapshot.recentCourses) {
      expect(course.description).toBe("");
      expect(course.syllabus).toEqual([]);
    }
  });
});
