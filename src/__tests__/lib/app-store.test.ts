import React, { useEffect } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { CurrentSession, Enrollment, Lead } from "@/types";

const mocks = vi.hoisted(() => {
  const trainingPaths = [
    {
      id: "path-1",
      code: "DP",
      name: "Departamento Pessoal",
      shortName: "DP",
      slug: "departamento-pessoal",
      description: "Trilha de departamento pessoal",
      icon: "Users",
      courseCount: 1,
    },
  ];
  const mockCourses = [
    {
      id: "course-1",
      slug: "curso-base",
      title: "Curso Base",
      pathId: "path-1",
      pathName: "Departamento Pessoal",
      category: "DP",
      categories: ["DP"],
      modality: "Ao vivo online",
      modalities: ["Ao vivo online"],
      durationLabel: "8h",
      durationHours: 8,
      level: "Básico",
      price: 1000,
      shortDescription: "Curso base",
      fullDescription: "Curso base completo",
      targetAudience: ["Profissionais"],
      objectives: ["Aprender"],
      benefits: ["Material"],
      modules: [],
      instructorId: "inst-1",
      image: "/course.png",
      rating: 4.8,
      studentsCount: 10,
      status: "Ativo",
      featured: false,
      featuredCourseIds: [],
      nextClassId: "class-1",
    },
  ];
  const mockClasses = [
    {
      id: "class-1",
      courseId: "course-1",
      startDate: "2026-07-01T09:00:00.000Z",
      endDate: "2026-07-01T17:00:00.000Z",
      time: "09:00 às 17:00",
      modality: "Ao vivo online",
      location: "Online",
      instructorId: "inst-1",
      totalSeats: 30,
      manualFilledSeats: 4,
      filledSeats: 5,
      availableSeats: 25,
      status: "Inscrições abertas",
      price: 1000,
      notes: "Turma base",
    },
  ];
  const mockLeads = [
    {
      id: "lead-1",
      name: "Lead Existente",
      email: "lead.existente@example.com",
      phone: "(61) 99999-2222",
      courseInterest: "Curso Base",
      organization: "Empresa",
      teamSize: 5,
      preferredModality: "Ao vivo online",
      trainingObjective: "Capacitar equipe",
      mainChallenges: "Agenda",
      origin: "Site",
      status: "Novo",
      message: "Mensagem",
      createdAt: "2026-06-01T12:00:00.000Z",
    },
  ];
  const mockEnrollments = [
    {
      id: "enrollment-1",
      studentName: "Aluno Existente",
      email: "aluno@example.com",
      phone: "(61) 99999-3333",
      cpf: "123.456.789-10",
      organization: "Empresa",
      jobTitle: "Analista",
      enrollmentType: "Pessoa física",
      paymentMethod: "Pix",
      courseId: "course-1",
      classId: "class-1",
      status: "Confirmada",
      createdAt: "2026-06-01T12:00:00.000Z",
      notes: "",
    },
  ];
  const mockInstructors = [
    {
      id: "inst-1",
      name: "Instrutor Base",
      email: "instrutor@example.com",
      phone: "(61) 3965-1929",
      specialty: "DP",
      bio: "Bio",
      education: "MBA",
      photoUrl: "",
      courseIds: ["course-1"],
      rating: 4.8,
      avatar: "IB",
      status: "Ativo",
    },
  ];

  return {
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
    fetchMock: vi.fn(),
    clearSessionToken: vi.fn(),
    setSessionToken: vi.fn<(token: string) => void>(),
    getSessionToken: vi.fn<() => string | null>(() => null),
    decodeSessionToken: vi.fn<(token: string | null) => CurrentSession | null>(() => null),
    getSupabaseSession: vi.fn<() => { access_token: string; refresh_token: string } | null>(() => null),
    data: {
      courseCoverByPath: { "path-1": "/course.png" },
      defaultCourseCover: "/default-course.png",
      mockBlogPosts: [
        {
          id: "post-1",
          title: "Post Base",
          slug: "post-base",
          summary: "Resumo",
          content: "Conteúdo",
          category: "Tecnologia",
          tags: ["base"],
          author: "Equipe RH Cursos",
          date: "2026-06-01T12:00:00.000Z",
          readingTime: "5 min",
          status: "Publicado",
          image: "/post.png",
          relatedCourseId: "course-1",
        },
      ],
      mockClasses,
      mockCourses,
      mockEnrollments,
      mockInstructors,
      mockLeads,
      mockStudents: [],
      mockTestimonials: [],
      trainingPaths,
    },
  };
});

vi.mock("@/lib/course-covers", () => ({
  courseCoverByPath: mocks.data.courseCoverByPath,
  defaultCourseCover: mocks.data.defaultCourseCover,
}));
vi.mock("sonner", () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

vi.mock("@/lib/supabase/client", () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

vi.mock("@/lib/supabase/functions-client", () => ({
  isFunctionsConfigured: false,
  invokeFunction: vi.fn(),
}));

vi.mock("@/lib/supabase/rh-cursos-api", () => ({
  fetchPublicCatalogFromSupabase: vi.fn(),
  fetchPublicBlogPostsFromSupabase: vi.fn(),
  fetchLeadsFromSupabase: vi.fn(),
}));

vi.mock("@/lib/supabase/session-token", () => ({
  getSessionToken: mocks.getSessionToken,
  clearSessionToken: mocks.clearSessionToken,
  setSessionToken: mocks.setSessionToken,
  decodeSessionToken: mocks.decodeSessionToken,
  getSupabaseSession: mocks.getSupabaseSession,
  SESSION_ACTIVITY_SYNC_MS: 5 * 60 * 1000,
}));

type Store = ReturnType<AppStoreModule["useAppStore"]>;
type AppStoreModule = typeof import("@/lib/app-store");

let AppStoreProvider: AppStoreModule["AppStoreProvider"];
let useAppStore: AppStoreModule["useAppStore"];
let useCourseBySlug: AppStoreModule["useCourseBySlug"];
let useDashboardCharts: AppStoreModule["useDashboardCharts"];
let mockClasses: Array<(typeof mocks.data.mockClasses)[number]>;
let mockCourses: Array<(typeof mocks.data.mockCourses)[number]>;
let mockLeads: Array<(typeof mocks.data.mockLeads)[number]>;

const h = React.createElement;

function StoreProbe({ onStore }: { onStore: (store: Store) => void }) {
  const store = useAppStore();

  useEffect(() => {
    onStore(store);
  }, [onStore, store]);

  return h(
    "div",
    null,
    h("span", { "data-testid": "session-email" }, store.currentSession?.email ?? "none"),
    h("span", { "data-testid": "course-count" }, store.courses.length),
    h("span", { "data-testid": "lead-count" }, store.leads.length),
    h("span", { "data-testid": "enrollment-count" }, store.enrollments.length)
  );
}

function CourseProbe({ slug }: { slug?: string }) {
  const course = useCourseBySlug(slug);
  return h("span", { "data-testid": "course-title" }, course?.title ?? "missing");
}

function DashboardProbe() {
  const charts = useDashboardCharts();
  return h(
    "div",
    null,
    h("span", { "data-testid": "lead-chart-count" }, charts.leadsByStatus.length),
    h("span", { "data-testid": "revenue-chart-count" }, charts.revenueByMonth.length),
    h("span", { "data-testid": "modality-chart-count" }, charts.classesByModality.length)
  );
}

function BrokenConsumer() {
  useAppStore();
  return null;
}

function renderStore(initialSession?: CurrentSession | null) {
  let latestStore: Store | undefined;
  const onStore = vi.fn((store: Store) => {
    latestStore = store;
  });

  render(h(AppStoreProvider, { initialSession }, h(StoreProbe, { onStore })));

  return {
    onStore,
    get store() {
      if (!latestStore) {
        throw new Error("Store was not captured by StoreProbe");
      }
      return latestStore;
    },
  };
}

function buildEnrollmentPayload(store: Store): Omit<Enrollment, "id" | "createdAt" | "status"> {
  const targetClass = store.classes.find((item) => item.availableSeats > 0);
  const course = store.courses.find((item) => item.id === targetClass?.courseId) ?? store.courses[0];

  return {
    studentName: "Maria Teste",
    email: "maria.teste@example.com",
    phone: "(61) 99999-0000",
    cpf: "123.456.789-10",
    organization: "Empresa Teste",
    jobTitle: "Analista",
    enrollmentType: "Pessoa física",
    paymentMethod: "Pix",
    courseId: course?.id ?? "course-1",
    classId: targetClass?.id ?? "class-1",
    notes: "Inscrição unitária",
  };
}

function buildLeadPayload(store: Store): Omit<Lead, "id" | "createdAt" | "status"> {
  return {
    name: "Lead Teste",
    email: "lead@example.com",
    phone: "(61) 99999-1111",
    type: "Curso",
    courseInterest: store.courses[0]?.title ?? "Curso de teste",
    organization: "Empresa Lead",
    teamSize: 12,
    preferredModality: "Ao vivo online",
    trainingObjective: "Capacitação",
    mainChallenges: "Escala",
    origin: "Site",
    message: "Quero detalhes do treinamento.",
  };
}

function installMemoryStorage() {
  const values = new Map<string, string>();
  const storage = {
    get length() {
      return values.size;
    },
    clear: vi.fn(() => values.clear()),
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    key: vi.fn((index: number) => Array.from(values.keys())[index] ?? null),
    removeItem: vi.fn((key: string) => values.delete(key)),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
  };

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storage,
  });

  return storage;
}

describe("AppStoreProvider and hooks", () => {
  beforeAll(async () => {
    vi.resetModules();
    const appStore = await import("@/lib/app-store");

    AppStoreProvider = appStore.AppStoreProvider;
    useAppStore = appStore.useAppStore;
    useCourseBySlug = appStore.useCourseBySlug;
    useDashboardCharts = appStore.useDashboardCharts;
    mockClasses = mocks.data.mockClasses;
    mockCourses = mocks.data.mockCourses;
    mockLeads = mocks.data.mockLeads;
  });

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-06-22T12:00:00.000Z"));
    installMemoryStorage();
    mocks.fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    global.fetch = mocks.fetchMock as unknown as typeof fetch;
    mocks.toastSuccess.mockClear();
    mocks.toastError.mockClear();
    mocks.clearSessionToken.mockClear();
    mocks.setSessionToken.mockClear();
    mocks.getSessionToken.mockClear();
    mocks.decodeSessionToken.mockClear();
    mocks.getSupabaseSession.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it("throws when useAppStore is rendered without AppStoreProvider", () => {
    expect(() => render(h(BrokenConsumer))).toThrow("useAppStore must be used within AppStoreProvider");
  });

  it("hydrates the provider with an optional server session", async () => {
    const session: CurrentSession = {
      role: "admin",
      email: "admin@rhcursos.demo",
      name: "Admin RH Cursos",
    };
    mocks.fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ session, token: "renewed.token" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const harness = renderStore(session);

    expect(screen.getByTestId("session-email")).toHaveTextContent(session.email);

    await waitFor(() => expect(harness.onStore).toHaveBeenCalled());
    expect(harness.store.currentSession).toEqual(session);
    await waitFor(() => expect(mocks.setSessionToken).toHaveBeenCalledWith("renewed.token"));
  });

  it("sets and clears the current session via provider actions", async () => {
    const harness = renderStore();
    const session: CurrentSession = {
      role: "admin",
      email: "session@example.com",
      name: "Session User",
    };

    await act(async () => {
      harness.store.setSession(session);
    });

    expect(screen.getByTestId("session-email")).toHaveTextContent(session.email);
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Login realizado.");

    await act(async () => {
      harness.store.logout();
    });

    await waitFor(() =>
      expect(mocks.fetchMock).toHaveBeenCalledWith("/api/auth/session", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: undefined }),
      })
    );
    expect(mocks.clearSessionToken).toHaveBeenCalled();
    expect(screen.getByTestId("session-email")).toHaveTextContent("none");
    await waitFor(() => expect(mocks.toastSuccess).toHaveBeenCalledWith("Sessão local encerrada."));
  });

  it("does not rehydrate from the session endpoint after logout starts", async () => {
    const session: CurrentSession = {
      role: "admin",
      email: "session@example.com",
      name: "Session User",
    };
    mocks.fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ session, token: "initial.token" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const harness = renderStore(session);
    await waitFor(() => expect(harness.store.currentSession).toEqual(session));

    mocks.fetchMock.mockClear();
    mocks.setSessionToken.mockClear();
    mocks.fetchMock.mockImplementation((_input, init) => {
      if ((init as RequestInit | undefined)?.method === "DELETE") {
        return Promise.resolve(
          new Response(JSON.stringify({ ok: true, mode: "local-only", revoked: false }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }

      return Promise.resolve(
        new Response(JSON.stringify({ session, token: "stale.token" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    await act(async () => {
      harness.store.logout();
    });

    await waitFor(() => expect(screen.getByTestId("session-email")).toHaveTextContent("none"));
    await waitFor(() =>
      expect(mocks.fetchMock).toHaveBeenCalledWith("/api/auth/session", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: undefined }),
      })
    );
    expect(mocks.fetchMock.mock.calls.every(([, init]) => (init as RequestInit | undefined)?.method === "DELETE")).toBe(true);
    expect(mocks.setSessionToken).not.toHaveBeenCalledWith("stale.token");
  });

  it("warns when the logout falls back to local-only despite having an access token", async () => {
    const harness = renderStore();
    const session: CurrentSession = {
      role: "admin",
      email: "session@example.com",
      name: "Session User",
    };
    mocks.getSupabaseSession.mockReturnValue({
      access_token: "supabase-access-token",
      refresh_token: "supabase-refresh-token",
    });
    mocks.fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true, mode: "local-only", revoked: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await act(async () => {
      harness.store.setSession(session);
    });

    await act(async () => {
      harness.store.logout();
    });

    await waitFor(() =>
      expect(mocks.fetchMock).toHaveBeenCalledWith("/api/auth/session", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: "supabase-access-token" }),
      })
    );
    await waitFor(() => expect(mocks.toastSuccess).toHaveBeenCalledWith("Sessão local encerrada."));
    await waitFor(() =>
      expect(mocks.toastError).toHaveBeenCalledWith(
        "Não foi possível confirmar a revogação global da sessão."
      )
    );
  });

  it("creates leads through the provider and prepends them to state", async () => {
    const harness = renderStore();
    const initialLeadCount = harness.store.leads.length;
    const payload = buildLeadPayload(harness.store);

    await act(async () => {
      await harness.store.createLead(payload);
    });

    expect(screen.getByTestId("lead-count")).toHaveTextContent(String(initialLeadCount + 1));
    expect(harness.store.leads[0]).toMatchObject({
      ...payload,
      id: "lead-1782129600000",
      status: "Novo",
      createdAt: "2026-06-22T12:00:00.000Z",
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Lead registrado apenas nesta sessão de desenvolvimento.");
  });

  it("creates enrollments and updates the related class capacity from provider state", async () => {
    const harness = renderStore();
    const initialCourseCount = harness.store.courses.length;
    await act(async () => {
      await harness.store.upsertCourse({ title: "Curso para Inscrição" });
    });
    await waitFor(() => expect(harness.store.courses).toHaveLength(initialCourseCount + 1));

    const initialClassCount = harness.store.classes.length;
    await act(async () => {
      await harness.store.upsertClass({
        courseId: harness.store.courses[0].id,
        totalSeats: 10,
        filledSeats: 2,
        manualFilledSeats: 2,
      });
    });
    await waitFor(() => expect(harness.store.classes).toHaveLength(initialClassCount + 1));

    const initialEnrollmentCount = harness.store.enrollments.length;
    const payload = buildEnrollmentPayload(harness.store);
    const classBefore = harness.store.classes.find((item) => item.id === payload.classId);

    await act(async () => {
      await harness.store.createEnrollment(payload);
    });

    const classAfter = harness.store.classes.find((item) => item.id === payload.classId);

    expect(screen.getByTestId("enrollment-count")).toHaveTextContent(String(initialEnrollmentCount + 1));
    expect(harness.store.enrollments[0]).toMatchObject({
      ...payload,
      id: "enrollment-1782129600000",
      status: "Confirmada",
      createdAt: "2026-06-22T12:00:00.000Z",
    });
    expect(harness.store.students[0]).toMatchObject({
      name: payload.studentName,
      email: payload.email,
      classId: payload.classId,
      enrollmentStatus: "Confirmada",
    });
    expect(classAfter?.availableSeats).toBeLessThanOrEqual(classBefore?.availableSeats ?? Number.POSITIVE_INFINITY);
    expect(classAfter?.filledSeats).toBeGreaterThanOrEqual(classBefore?.filledSeats ?? 0);
  });

  it("upserts, duplicates, and deletes courses through exported store actions", async () => {
    const harness = renderStore();
    const initialCourseCount = harness.store.courses.length;

    await act(async () => {
      await harness.store.upsertCourse({ title: "Curso Teste Avançado" });
    });
    await waitFor(() => expect(harness.store.courses).toHaveLength(initialCourseCount + 1));

    expect(screen.getByTestId("course-count")).toHaveTextContent(String(initialCourseCount + 1));
    expect(harness.store.courses[0]).toMatchObject({
      id: "course-1782129600000",
      slug: "curso-teste-avancado",
      title: "Curso Teste Avançado",
      status: "Ativo",
    });

    await act(async () => {
      vi.setSystemTime(new Date("2026-06-22T12:00:00.001Z"));
      harness.store.duplicateCourse(harness.store.courses[0].id);
    });
    await waitFor(() => expect(harness.store.courses).toHaveLength(initialCourseCount + 2));

    expect(harness.store.courses[0]).toMatchObject({
      slug: "curso-teste-avancado-copia",
      title: "Curso Teste Avançado (Cópia)",
    });

    await act(async () => {
      await harness.store.deleteCourse(harness.store.courses[0].id);
    });
    await waitFor(() => expect(harness.store.courses).toHaveLength(initialCourseCount + 1));

    expect(harness.store.courses).toHaveLength(initialCourseCount + 1);
  });

  it("exposes derived course and dashboard hooks through the provider", async () => {
    let store: Store | undefined;
    render(
      h(
        AppStoreProvider,
        null,
        h(StoreProbe, { onStore: (value: Store) => { store = value; } }),
        h(CourseProbe, { slug: "curso-derivado" }),
        h(DashboardProbe)
      )
    );

    await waitFor(() => expect(store).toBeDefined());
    await act(async () => {
      await store!.upsertCourse({ title: "Curso Derivado" });
    });

    await waitFor(() => expect(screen.getByTestId("course-title")).toHaveTextContent("Curso Derivado"));
    expect(Number(screen.getByTestId("lead-chart-count").textContent)).toBeGreaterThanOrEqual(0);
    expect(Number(screen.getByTestId("revenue-chart-count").textContent)).toBeGreaterThanOrEqual(0);
    expect(Number(screen.getByTestId("modality-chart-count").textContent)).toBeGreaterThanOrEqual(0);
  });

  it("hydrates from the optimistic session token when no server session is provided", async () => {
    const decodedSession: CurrentSession = {
      role: "admin",
      email: "token@example.com",
      name: "Token User",
    };
    mocks.getSessionToken.mockReturnValue("payload.signature");
    mocks.decodeSessionToken.mockReturnValue(decodedSession);
    mocks.fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ session: decodedSession, token: "payload.signature" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const harness = renderStore();

    await waitFor(() => expect(harness.store.currentSession).toEqual(decodedSession));
    expect(screen.getByTestId("session-email")).toHaveTextContent(decodedSession.email);
  });

  it("clears the optimistic session when the server reports expiration", async () => {
    const session: CurrentSession = {
      role: "admin",
      email: "expired@example.com",
      name: "Expired User",
    };
    mocks.fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    const harness = renderStore(session);

    await waitFor(() => expect(mocks.clearSessionToken).toHaveBeenCalled());
    await waitFor(() => expect(harness.store.currentSession).toBeNull());
    expect(screen.getByTestId("session-email")).toHaveTextContent("none");
  });

  it("keeps an explicit initial session when stored state has another session", async () => {
    const initialSession: CurrentSession = {
      role: "admin",
      email: "initial@example.com",
      name: "Initial User",
    };
    window.localStorage.setItem(
      "rhcursos-demo-store-v4",
      JSON.stringify({
        courses: [mockCourses[0]],
        classes: [mockClasses[0]],
        students: [],
        instructors: [],
        leads: [],
        enrollments: [],
        blogPosts: [],
        testimonials: [],
        currentSession: {
          role: "admin",
          email: "stored@example.com",
          name: "Stored User",
        },
      })
    );

    const harness = renderStore(initialSession);

    expect(harness.store.currentSession).toEqual(initialSession);
  });
});
