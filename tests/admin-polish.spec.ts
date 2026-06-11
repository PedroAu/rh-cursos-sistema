import { expect, test } from "@playwright/test";

import {
  mockBlogPosts,
  mockClasses,
  mockCourses,
  mockEnrollments,
  mockInstructors,
  mockLeads,
  mockStudents,
  mockTestimonials,
  trainingPaths,
} from "@/data";
import {
  buildChartSummaryItems,
  buildRevenueSummaryItems,
} from "@/features/admin/dashboard/model/dashboard-metrics";
import {
  buildPerformanceStats,
  buildRecentActivities,
  formatRelativeTime,
} from "@/features/admin/dashboard/model/dashboard-activity";
import { buildResourceConfig } from "@/lib/admin-resource-configs";

function createStoreSnapshot() {
  return {
    courses: mockCourses,
    classes: mockClasses,
    students: mockStudents,
    instructors: mockInstructors,
    leads: mockLeads,
    enrollments: mockEnrollments,
    blogPosts: mockBlogPosts,
    testimonials: mockTestimonials,
    trainingPaths,
    currentSession: null,
  };
}

test.describe("epica 3 — admin polish", () => {
  test("guard de regressao mantém campos estruturados e relações por seleção", async () => {
    const store = createStoreSnapshot();
    const noop = () => undefined;
    const deps = {
      search: "",
      editingId: null,
      form: {},
      setForm: noop,
      setEditingId: noop,
      setValidationErrors: noop,
      setOpen: noop,
    };

    const courseConfig = buildResourceConfig("courses", store as never, deps as never);
    const classConfig = buildResourceConfig("classes", store as never, deps as never);
    const leadConfig = buildResourceConfig("leads", store as never, deps as never);

    expect(courseConfig.fields.find((field) => field.key === "objectives")?.type).toBe("array");
    expect(courseConfig.fields.find((field) => field.key === "benefits")?.type).toBe("array");
    expect(courseConfig.fields.find((field) => field.key === "modules")?.type).toBe("modules");
    expect(courseConfig.fields.find((field) => field.key === "pathId")?.type).toBe("select");
    expect(courseConfig.fields.find((field) => field.key === "featuredCourseIds")?.type).toBe("multiselect");

    expect(classConfig.fields.find((field) => field.key === "courseId")?.type).toBe("select");
    expect(classConfig.fields.find((field) => field.key === "instructorId")?.type).toBe("select");
    expect(leadConfig.fields.find((field) => field.key === "courseInterest")?.type).toBe("select");
  });

  test("inscrições derivam contexto read-only antes da atualização de status", async () => {
    const store = createStoreSnapshot();
    let capturedForm: Record<string, unknown> = {};

    const deps = {
      search: "",
      editingId: null,
      form: {},
      setForm: (value: unknown) => {
        capturedForm = value as Record<string, unknown>;
      },
      setEditingId: () => undefined,
      setValidationErrors: () => undefined,
      setOpen: () => undefined,
    };

    const config = buildResourceConfig("enrollments", store as never, deps as never);
    config.onEdit(store.enrollments[0] as never);

    expect(capturedForm.studentName).toBeTruthy();
    expect(capturedForm.courseTitle).toBeTruthy();
    expect(capturedForm.classLabel).toBeTruthy();
    expect(capturedForm.createdAtLabel).toBeTruthy();
    expect(String(capturedForm.derivedStatus ?? "")).not.toHaveLength(0);
    expect(config.fields.find((field) => field.key === "studentName")?.type).toBe("readonly");
    expect(config.fields.find((field) => field.key === "status")?.section).toBe("Ação operacional");
  });

  test("dashboard expõe resumos textuais derivados para os gráficos", async () => {
    const chartSummary = buildChartSummaryItems([
      { name: "Confirmada", value: 12 },
      { name: "Pendente", value: 4 },
    ]);
    const revenueSummary = buildRevenueSummaryItems([{ month: "jun/26", value: 24000 }]);

    expect(chartSummary).toEqual([
      { label: "Confirmada", value: 12 },
      { label: "Pendente", value: 4 },
    ]);
    expect(revenueSummary[0]?.label).toBe("jun/26");
    expect(String(revenueSummary[0]?.value)).toContain("R$");
  });

  test("atividades recentes combinam inscrições e leads ordenados por data", () => {
    const store = createStoreSnapshot();
    const activities = buildRecentActivities(
      { enrollments: store.enrollments, leads: store.leads, courses: store.courses },
      5
    );

    expect(activities.length).toBeGreaterThan(0);
    expect(activities.length).toBeLessThanOrEqual(5);

    // Ordenado do mais recente para o mais antigo.
    for (let i = 1; i < activities.length; i += 1) {
      expect(activities[i - 1].timestamp).toBeGreaterThanOrEqual(activities[i].timestamp);
    }

    // Cada atividade carrega rótulo textual e tipo conhecido.
    for (const activity of activities) {
      expect(activity.title).not.toHaveLength(0);
      expect(activity.description).not.toHaveLength(0);
      expect(["enrollment", "payment", "lead"]).toContain(activity.kind);
    }
  });

  test("performance stats derivam percentuais reais do funil", () => {
    const store = createStoreSnapshot();
    const stats = buildPerformanceStats({ enrollments: store.enrollments, leads: store.leads });

    const labels = stats.map((stat) => stat.label);
    expect(labels).toEqual(["Conclusão", "Confirmação", "Conversão", "Inscrições"]);

    // Percentuais terminam em "%" ou são "—" quando não há denominador.
    for (const stat of stats.slice(0, 3)) {
      expect(stat.value === "—" || stat.value.endsWith("%")).toBe(true);
    }
    // Volume de inscrições é numérico.
    expect(Number.isNaN(Number(stats[3].value))).toBe(false);
  });

  test("formatRelativeTime é determinístico em relação à data de referência", () => {
    const now = new Date("2026-06-11T12:00:00.000Z").getTime();

    expect(formatRelativeTime("2026-06-11T10:00:00.000Z", now)).toContain("hora");
    expect(formatRelativeTime("2026-06-10T12:00:00.000Z", now)).toMatch(/dia|ontem/);
    expect(formatRelativeTime("data-invalida", now)).toBe("data indisponível");
  });
});
