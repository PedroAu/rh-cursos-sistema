import { describe, it, expect } from "vitest";

import {
  ALL_ORIGINS_CHIP,
  buildLeadOriginChips,
  buildLeadsByOrigin,
  buildOverviewKpis,
  buildOverviewSubtitle,
  buildRecentLeadRows,
  buildUpcomingClasses
} from "@/features/admin/dashboard/model/dashboard-overview";
import type { Course, Enrollment, Lead, TrainingClass } from "@/types";

const NOW = new Date("2026-07-13T12:00:00.000Z").getTime();
const DAY_MS = 24 * 60 * 60 * 1000;
const isoDaysAgo = (days: number) => new Date(NOW - days * DAY_MS).toISOString();
const isoDaysAhead = (days: number) => new Date(NOW + days * DAY_MS).toISOString();

function makeLead(overrides: Partial<Lead>): Lead {
  return {
    id: "lead-1",
    name: "Ana Souza",
    email: "ana@empresa.com.br",
    phone: "61999999999",
    type: "Curso",
    courseInterest: "LGPD na prática",
    origin: "Site",
    status: "Novo",
    message: "",
    createdAt: isoDaysAgo(1),
    ...overrides
  };
}

function makeClass(overrides: Partial<TrainingClass>): TrainingClass {
  return {
    id: "class-1",
    courseId: "course-1",
    startDate: isoDaysAhead(10),
    endDate: isoDaysAhead(15),
    time: "19h",
    modality: "Ao vivo online",
    location: "Online",
    instructorId: "instructor-1",
    totalSeats: 20,
    filledSeats: 10,
    availableSeats: 10,
    status: "Inscrições abertas",
    price: 1000,
    notes: "",
    ...overrides
  };
}

function makeEnrollment(overrides: Partial<Enrollment>): Enrollment {
  return {
    id: "enr-1",
    studentName: "Ana Souza",
    email: "ana@empresa.com.br",
    phone: "61999999999",
    cpf: "00000000000",
    organization: "Empresa X",
    jobTitle: "Analista",
    enrollmentType: "Pessoa física",
    paymentMethod: "Pix",
    courseId: "course-1",
    classId: "class-1",
    status: "Confirmada",
    createdAt: isoDaysAgo(1),
    notes: "",
    ...overrides
  };
}

function makeCourse(overrides: Partial<Course>): Course {
  return {
    id: "course-1",
    slug: "curso-1",
    title: "LGPD na prática",
    pathId: "path-1",
    pathName: "Compliance",
    modality: "Ao vivo online",
    durationLabel: "20h",
    durationHours: 20,
    level: "Básico",
    price: 1000,
    shortDescription: "",
    fullDescription: "",
    targetAudience: [],
    objectives: [],
    benefits: [],
    modules: [],
    instructorId: "instructor-1",
    image: "",
    rating: 5,
    studentsCount: 0,
    status: "Ativo",
    featured: false,
    nextClassId: "class-1",
    ...overrides
  };
}

describe("buildOverviewSubtitle", () => {
  it("capitaliza o dia da semana e inclui a janela de 30 dias", () => {
    const subtitle = buildOverviewSubtitle(NOW);
    expect(subtitle).toMatch(/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/);
    expect(subtitle).toContain("· últimos 30 dias");
  });
});

describe("buildOverviewKpis — corte de 30/45 dias e divisão por zero", () => {
  it("ignora leads fora da janela de 30 dias em 'Leads novos'", () => {
    const leads = [makeLead({ id: "l-recent", createdAt: isoDaysAgo(5) }), makeLead({ id: "l-old", createdAt: isoDaysAgo(31) })];
    const kpis = buildOverviewKpis({ classes: [], enrollments: [], leads }, NOW);
    const leadsKpi = kpis.find((kpi) => kpi.key === "leads");
    expect(leadsKpi?.value).toBe("1");
  });

  it("conta turmas que iniciam em até 45 dias, mas não além disso", () => {
    const classes = [
      makeClass({ id: "c-near", startDate: isoDaysAhead(30) }),
      makeClass({ id: "c-far", startDate: isoDaysAhead(60) })
    ];
    const kpis = buildOverviewKpis({ classes, enrollments: [], leads: [] }, NOW);
    const turmasKpi = kpis.find((kpi) => kpi.key === "turmas");
    expect(turmasKpi?.value).toBe("2");
    expect(turmasKpi?.helper).toContain("1 inicia em até 45 dias");
  });

  it("não divide por zero quando totalSeats é 0 e ainda calcula a ocupação das demais turmas", () => {
    const classes = [
      makeClass({ id: "c-zero", totalSeats: 0, filledSeats: 0 }),
      makeClass({ id: "c-half", totalSeats: 10, filledSeats: 5 })
    ];
    const kpis = buildOverviewKpis({ classes, enrollments: [], leads: [] }, NOW);
    const ocupacaoKpi = kpis.find((kpi) => kpi.key === "ocupacao");
    expect(ocupacaoKpi?.value).toBe("25%");
    expect(ocupacaoKpi?.barPct).toBe(25);
  });

  it("retorna ocupação 0% quando não há turmas com vagas", () => {
    const kpis = buildOverviewKpis({ classes: [], enrollments: [], leads: [] }, NOW);
    const ocupacaoKpi = kpis.find((kpi) => kpi.key === "ocupacao");
    expect(ocupacaoKpi?.value).toBe("0%");
  });
});

describe("buildLeadOriginChips e buildRecentLeadRows — corte de 30 dias e fallback vazio", () => {
  it("inclui apenas origens presentes nos leads dos últimos 30 dias, com 'Todas' sempre primeiro", () => {
    const leads = [
      makeLead({ id: "l1", origin: "Site", createdAt: isoDaysAgo(2) }),
      makeLead({ id: "l2", origin: "WhatsApp", createdAt: isoDaysAgo(40) })
    ];
    const chips = buildLeadOriginChips(leads, NOW);
    expect(chips[0]).toEqual({ name: ALL_ORIGINS_CHIP, label: "Todas" });
    expect(chips.map((chip) => chip.name)).toEqual([ALL_ORIGINS_CHIP, "Site"]);
  });

  it("retorna apenas o chip 'Todas' quando não há leads", () => {
    const chips = buildLeadOriginChips([], NOW);
    expect(chips).toEqual([{ name: ALL_ORIGINS_CHIP, label: "Todas" }]);
  });

  it("filtra as linhas pela origem ativa e ordena da mais recente para a mais antiga", () => {
    const leads = [
      makeLead({ id: "l-old", origin: "Site", createdAt: isoDaysAgo(3) }),
      makeLead({ id: "l-new", origin: "Site", createdAt: isoDaysAgo(1) }),
      makeLead({ id: "l-other", origin: "WhatsApp", createdAt: isoDaysAgo(1) })
    ];
    const rows = buildRecentLeadRows(leads, "Site", NOW);
    expect(rows.map((row) => row.id)).toEqual(["l-new", "l-old"]);
  });

  it("exclui leads fora da janela de 30 dias mesmo com o chip 'Todas' ativo", () => {
    const leads = [makeLead({ id: "l-recent", createdAt: isoDaysAgo(2) }), makeLead({ id: "l-old", createdAt: isoDaysAgo(45) })];
    const rows = buildRecentLeadRows(leads, ALL_ORIGINS_CHIP, NOW);
    expect(rows.map((row) => row.id)).toEqual(["l-recent"]);
  });
});

describe("buildUpcomingClasses — ordenação por proximidade e fallback vazio", () => {
  it("ordena turmas futuras da mais próxima para a mais distante e ignora turmas encerradas/passadas", () => {
    const classes = [
      makeClass({ id: "c-far", startDate: isoDaysAhead(20) }),
      makeClass({ id: "c-near", startDate: isoDaysAhead(2) }),
      makeClass({ id: "c-past", startDate: isoDaysAgo(5) }),
      makeClass({ id: "c-closed", startDate: isoDaysAhead(3), status: "Encerrada" })
    ];
    const courses = [makeCourse({})];
    const upcoming = buildUpcomingClasses({ classes, courses }, NOW);
    expect(upcoming.map((item) => item.id)).toEqual(["c-near", "c-far"]);
  });

  it("retorna lista vazia quando não há turmas futuras (fallback de UI cobre o empty state)", () => {
    const upcoming = buildUpcomingClasses({ classes: [], courses: [] }, NOW);
    expect(upcoming).toEqual([]);
  });

  it("marca 'hot' e usa 'Esgotada' quando a ocupação é alta e não há vagas", () => {
    const classes = [makeClass({ id: "c-full", totalSeats: 10, filledSeats: 10, availableSeats: 0 })];
    const upcoming = buildUpcomingClasses({ classes, courses: [makeCourse({})] }, NOW);
    expect(upcoming[0].hot).toBe(true);
    expect(upcoming[0].seatsLabel).toBe("Esgotada");
  });
});

describe("buildLeadsByOrigin — agregação de 30 dias e showBreakdown", () => {
  it("oculta o card (showBreakdown=false) quando não há leads nos últimos 30 dias", () => {
    const leads = [makeLead({ createdAt: isoDaysAgo(45) })];
    const result = buildLeadsByOrigin(leads, NOW);
    expect(result.showBreakdown).toBe(false);
    expect(result.items).toEqual([]);
  });

  it("agrega por origem e calcula o percentual relativo ao maior grupo", () => {
    const leads = [
      makeLead({ id: "l1", origin: "Site", createdAt: isoDaysAgo(1) }),
      makeLead({ id: "l2", origin: "Site", createdAt: isoDaysAgo(2) }),
      makeLead({ id: "l3", origin: "WhatsApp", createdAt: isoDaysAgo(1) })
    ];
    const result = buildLeadsByOrigin(leads, NOW);
    expect(result.showBreakdown).toBe(true);
    expect(result.items).toEqual([
      { label: "Site", count: 2, pct: 100 },
      { label: "WhatsApp", count: 1, pct: 50 }
    ]);
  });
});
