import React, { useEffect } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { CurrentSession, Enrollment, Lead, Student } from "@/types";

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
      manualFilledSeats: 5,
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
    supabaseConfigured: false,
    supabaseClient: {
      // REC-204 Fase B: com sessão admin (SSR), a store abre canais realtime
      // pelo cliente browser. Stub encadeável channel().on().subscribe().
      channel: vi.fn(() => {
        const chainable = {
          on: vi.fn(() => chainable),
          subscribe: vi.fn(() => chainable),
        };
        return chainable;
      }),
      removeChannel: vi.fn(),
      auth: {
        setSession: vi.fn(),
        signOut: vi.fn(() => Promise.resolve()),
      },
    },
    fetchPublicCatalog: vi.fn(),
    fetchPublicBlogPosts: vi.fn(),
    functionsConfigured: false,
    invokeFunction: vi.fn(),
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
    fetchMock: vi.fn(),
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
  get isSupabaseConfigured() {
    return mocks.supabaseConfigured;
  },
  get supabase() {
    return mocks.supabaseConfigured ? mocks.supabaseClient : null;
  },
}));

vi.mock("@/lib/supabase/functions-client", () => ({
  get isFunctionsConfigured() {
    return mocks.functionsConfigured;
  },
  invokeFunction: mocks.invokeFunction,
  getStableClientIp: () => "2001:db8::test",
}));

vi.mock("@/lib/supabase/rh-cursos-api", () => ({
  fetchPublicCatalogFromSupabase: mocks.fetchPublicCatalog,
  fetchPublicBlogPostsFromSupabase: mocks.fetchPublicBlogPosts,
  isExplicitPublicTestBaselineEnabled: vi.fn(() => false),
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
    h("span", { "data-testid": "student-count" }, store.students.length),
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

function renderStore(
  initialSession?: CurrentSession | null,
  initialData?: Parameters<typeof AppStoreProvider>[0]["initialData"],
  bootstrapPublicData?: boolean
) {
  let latestStore: Store | undefined;
  const onStore = vi.fn((store: Store) => {
    latestStore = store;
  });

  render(
    h(AppStoreProvider, { initialSession, initialData, bootstrapPublicData }, h(StoreProbe, { onStore }))
  );

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

function buildEnrollmentPayload(
  store: Store,
): Omit<Enrollment, "id" | "createdAt" | "status" | "paymentMethod"> {
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

function buildStudentPayload(): Parameters<Store["createStudent"]>[0] {
  return {
    name: "Aluno Teste",
    email: "aluno.teste@example.com",
    organization: "Órgão Teste",
    enrollmentStatus: "Pendente",
  } satisfies Pick<Student, "name" | "email" | "organization" | "enrollmentStatus">;
}

function findDeleteSessionCall() {
  return mocks.fetchMock.mock.calls.find(
    ([input, init]) => input === "/api/auth/session" && (init as RequestInit | undefined)?.method === "DELETE"
  );
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
    mocks.invokeFunction.mockClear();
    mocks.functionsConfigured = false;
    mocks.supabaseConfigured = false;
    mocks.fetchPublicCatalog.mockReset();
    mocks.fetchPublicBlogPosts.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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
    // REC-204 Fase B: nenhum token HMAC é persistido no browser.
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

    await waitFor(() => expect(findDeleteSessionCall()).toBeTruthy());
    expect(findDeleteSessionCall()).toEqual([
      "/api/auth/session",
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ accessToken: undefined }),
      }),
    ]);
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
    await waitFor(() => expect(findDeleteSessionCall()).toBeTruthy());
    expect(findDeleteSessionCall()).toEqual([
      "/api/auth/session",
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ accessToken: undefined }),
      }),
    ]);
    expect(
      mocks.fetchMock.mock.calls
        .filter(([, init]) => (init as RequestInit | undefined)?.method !== "GET")
        .every(([, init]) => (init as RequestInit | undefined)?.method === "DELETE")
    ).toBe(true);
  });

  // REC-204 Fase B: o logout não depende mais de um access token do browser
  // (removido do localStorage). A revogação global é server-side (signOutSSR na
  // rota DELETE), então o cenário "despite having an access token" deixou de
  // existir — teste removido junto com o caminho HMAC/token.

  it("hydrates admin leads on bootstrap exclusively through the same-origin BFF (REC-206)", async () => {
    // REC-204 Fase B / REC-206: com sessão admin SSR ativa, o reload
    // administrativo hidrata os leads pelo contrato same-origin admin-resources
    // leads/list — sem token HMAC e sem leitura via cliente Supabase direto.
    mocks.functionsConfigured = true;
    mocks.supabaseConfigured = true;
    const leadRow = {
      id: "lead-hydrated",
      nome: "Lead Hidratado",
      email: "hidratado@example.com",
      telefone: null,
      tipo: "Curso",
      tema_interesse: null,
      curso_id: null,
      orgao: null,
      num_participantes: null,
      modalidade_preferida: null,
      objetivo_treinamento: null,
      tema_treinamento: null,
      desafios_principais: null,
      origem: null,
      status_crm: "Novo",
      mensagem: null,
      created_at: "2026-06-10T12:00:00.000Z",
    };
    mocks.invokeFunction.mockResolvedValue(
      new Response(JSON.stringify({ data: [leadRow] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    // bootstrapPublicData=false isola o caminho administrativo (a hidratação
    // de leads via BFF não depende do bootstrap público). A capacidade admin
    // agora deriva do papel da sessão SSR, não de um token no localStorage.
    const harness = renderStore(
      { role: "admin", email: "admin@example.com", name: "Admin" },
      undefined,
      false
    );

    await waitFor(() =>
      expect(harness.store.leads.some((lead) => lead.id === "lead-hydrated")).toBe(true)
    );
    expect(mocks.invokeFunction).toHaveBeenCalledWith("admin-resources", {
      body: { resource: "leads", action: "list" },
    });
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
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("creates admin students with the canonical id returned by admin-resources", async () => {
    mocks.functionsConfigured = true;
    mocks.invokeFunction.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, data: { id: "student-db-1" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const harness = renderStore({ role: "admin", email: "admin@example.com", name: "Admin" });

    await act(async () => {
      await harness.store.createStudent(buildStudentPayload());
    });

    expect(screen.getByTestId("student-count")).toHaveTextContent("1");
    expect(harness.store.students[0]).toMatchObject({
      id: "student-db-1",
      name: "Aluno Teste",
      email: "aluno.teste@example.com",
      enrollmentStatus: "Pendente",
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Aluno criado.");
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("rejects admin student success without a canonical id", async () => {
    mocks.functionsConfigured = true;
    mocks.invokeFunction.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, data: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const harness = renderStore({ role: "admin", email: "admin@example.com", name: "Admin" });

    await act(async () => {
      await expect(harness.store.createStudent(buildStudentPayload())).rejects.toThrow(
        "Resposta inválida ao criar o aluno."
      );
    });

    expect(harness.store.students).toHaveLength(0);
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("creates admin leads with the canonical identity returned by admin-resources", async () => {
    mocks.functionsConfigured = true;
    const harness = renderStore({
      role: "admin",
      email: "admin@example.com",
      name: "Admin",
    });
    const payload = buildLeadPayload(harness.store);
    mocks.invokeFunction.mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          data: {
            id: "lead-db-1",
            created_at: "2026-06-22T12:30:00.000Z",
            status_crm: "Novo",
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );

    await act(async () => {
      await harness.store.createLead(payload);
    });

    expect(mocks.invokeFunction).toHaveBeenCalledWith("admin-resources", {
      body: {
        resource: "leads",
        action: "create",
        payload: {
          ...payload,
          status: "Novo",
        },
      },
    });
    expect(mocks.invokeFunction).toHaveBeenCalledTimes(1);
    expect(harness.store.leads[0]).toMatchObject({
      ...payload,
      id: "lead-db-1",
      createdAt: "2026-06-22T12:30:00.000Z",
      status: "Novo",
    });
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("uses the canonical admin lead id in subsequent status and delete mutations", async () => {
    mocks.functionsConfigured = true;
    const harness = renderStore({
      role: "admin",
      email: "admin@example.com",
      name: "Admin",
    });
    const payload = buildLeadPayload(harness.store);
    mocks.invokeFunction
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: true,
            data: {
              id: "lead-db-follow-up",
              created_at: "2026-06-22T12:30:00.000Z",
              status_crm: "Novo",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await act(async () => {
      await harness.store.createLead(payload);
    });
    await act(async () => {
      await harness.store.updateLeadStatus("lead-db-follow-up", "Em atendimento");
    });
    await act(async () => {
      await harness.store.deleteLead("lead-db-follow-up");
    });

    expect(mocks.invokeFunction).toHaveBeenNthCalledWith(2, "admin-resources", {
      body: {
        resource: "leads",
        action: "update-status",
        id: "lead-db-follow-up",
        status: "Em atendimento",
      },
    });
    expect(mocks.invokeFunction).toHaveBeenNthCalledWith(3, "admin-resources", {
      body: { resource: "leads", action: "delete", id: "lead-db-follow-up" },
      keepalive: true,
    });
  });

  it.each([
    ["missing canonical identity", { ok: true, data: { status_crm: "Novo" } }],
    [
      "ok false despite canonical-looking data",
      {
        ok: false,
        data: {
          id: "lead-must-not-be-accepted",
          created_at: "2026-06-22T12:30:00.000Z",
          status_crm: "Novo",
        },
      },
    ],
  ])("rejects an invalid admin success envelope (%s) without mutating lead state", async (_case, body) => {
    mocks.functionsConfigured = true;
    const harness = renderStore({
      role: "admin",
      email: "admin@example.com",
      name: "Admin",
    });
    const initialLeadCount = harness.store.leads.length;
    mocks.invokeFunction.mockResolvedValueOnce(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await act(async () => {
      await expect(harness.store.createLead(buildLeadPayload(harness.store))).rejects.toThrow(
        "Resposta inválida ao cadastrar o lead."
      );
    });

    expect(harness.store.leads.length).toBe(initialLeadCount);
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("rejects admin lead network failures without mutating state or emitting toast", async () => {
    mocks.functionsConfigured = true;
    const harness = renderStore({
      role: "admin",
      email: "admin@example.com",
      name: "Admin",
    });
    const initialLeadCount = harness.store.leads.length;
    const payload = buildLeadPayload(harness.store);
    mocks.invokeFunction.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await act(async () => {
      await expect(harness.store.createLead(payload)).rejects.toThrow(
        "Serviço indisponível no momento. A solicitação não foi enviada."
      );
    });

    expect(harness.store.leads.length).toBe(initialLeadCount);
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("rejects non-2xx admin lead responses with the safe server message", async () => {
    mocks.functionsConfigured = true;
    const harness = renderStore({
      role: "admin",
      email: "admin@example.com",
      name: "Admin",
    });
    const initialLeadCount = harness.store.leads.length;
    const payload = buildLeadPayload(harness.store);
    mocks.invokeFunction.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Sessão administrativa inválida." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    );

    await act(async () => {
      await expect(harness.store.createLead(payload)).rejects.toThrow(
        "Sessão administrativa inválida."
      );
    });

    expect(harness.store.leads.length).toBe(initialLeadCount);
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it.each([400, 403, 409, 429, 500])(
    "rejects public lead sync failures with status %s without mutating state or emitting toast",
    async (status) => {
      mocks.functionsConfigured = true;
      const harness = renderStore();
      const initialLeadCount = harness.store.leads.length;
      const payload = buildLeadPayload(harness.store);
      mocks.invokeFunction.mockResolvedValue(
        new Response(JSON.stringify({ ok: false, error: "Solicitação rejeitada" }), {
          status,
          headers: { "Content-Type": "application/json" },
        })
      );

      await act(async () => {
        await expect(harness.store.createLead(payload)).rejects.toThrow("Solicitação rejeitada");
      });

      expect(harness.store.leads.length).toBe(initialLeadCount);
      expect(mocks.toastError).not.toHaveBeenCalled();
      expect(mocks.toastSuccess).not.toHaveBeenCalled();
    }
  );

  it("uses a safe fallback when the public lead sync returns a non-JSON error", async () => {
    mocks.functionsConfigured = true;
    const harness = renderStore();
    const initialLeadCount = harness.store.leads.length;
    const payload = buildLeadPayload(harness.store);
    mocks.invokeFunction.mockResolvedValue(
      new Response("upstream unavailable", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      })
    );

    await act(async () => {
      await expect(harness.store.createLead(payload)).rejects.toThrow(
        "Não foi possível cadastrar o lead."
      );
    });

    expect(harness.store.leads.length).toBe(initialLeadCount);
    expect(mocks.toastError).not.toHaveBeenCalled();
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
  });

  it("rejects network failures without mutating state or emitting toast", async () => {
    mocks.functionsConfigured = true;
    const harness = renderStore();
    const initialLeadCount = harness.store.leads.length;
    const payload = buildLeadPayload(harness.store);
    mocks.invokeFunction.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await act(async () => {
      await expect(harness.store.createLead(payload)).rejects.toThrow(
        "Serviço indisponível no momento. A solicitação não foi enviada."
      );
    });

    expect(harness.store.leads.length).toBe(initialLeadCount);
    expect(mocks.toastError).not.toHaveBeenCalled();
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
  });

  it("does not mutate leads while the public request is pending", async () => {
    mocks.functionsConfigured = true;
    const harness = renderStore();
    const initialLeadCount = harness.store.leads.length;
    const payload = buildLeadPayload(harness.store);
    let resolveRequest: ((response: Response) => void) | undefined;
    const request = new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    });
    mocks.invokeFunction.mockReturnValueOnce(request);

    let creation: Promise<void>;
    act(() => {
      creation = harness.store.createLead(payload);
    });

    expect(harness.store.leads.length).toBe(initialLeadCount);
    expect(mocks.toastError).not.toHaveBeenCalled();
    expect(mocks.toastSuccess).not.toHaveBeenCalled();

    await act(async () => {
      resolveRequest?.(new Response(JSON.stringify({ ok: true }), { status: 201 }));
      await creation!;
    });

    await waitFor(() => expect(harness.store.leads.length).toBe(initialLeadCount + 1));
    expect(mocks.toastError).not.toHaveBeenCalled();
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
  });

  it("fails closed in production when Supabase Functions are not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.functionsConfigured = false;
    const harness = renderStore();
    const initialLeadCount = harness.store.leads.length;
    const payload = buildLeadPayload(harness.store);

    await act(async () => {
      await expect(harness.store.createLead(payload)).rejects.toThrow(
        "Serviço de atendimento indisponível. Tente novamente mais tarde."
      );
    });

    expect(harness.store.leads.length).toBe(initialLeadCount);
    expect(mocks.invokeFunction).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
  });

  it("preserves the complete admin model without starting the public bootstrap", async () => {
    mocks.supabaseConfigured = true;
    mocks.fetchPublicCatalog.mockResolvedValue({
      courses: [],
      classes: [],
      instructors: [],
      trainingPaths: [],
      coursePublicContents: [],
      courseCategories: [],
    });
    mocks.fetchPublicBlogPosts.mockResolvedValue([]);
    const inactiveInstructor = {
      ...mocks.data.mockInstructors[0],
      id: "inst-inactive",
      status: "Inativo" as const,
    };
    const harness = renderStore(
      { role: "admin", email: "admin@example.com", name: "Admin" },
      {
        courses: mockCourses,
        classes: mockClasses,
        instructors: [inactiveInstructor],
        trainingPaths: mocks.data.trainingPaths,
        blogPosts: mocks.data.mockBlogPosts,
      } as Parameters<typeof AppStoreProvider>[0]["initialData"],
      false
    );

    await act(async () => Promise.resolve());

    expect(harness.store.instructors).toEqual([inactiveInstructor]);
    expect(harness.store.blogPosts).toEqual(mocks.data.mockBlogPosts);
    expect(mocks.fetchPublicCatalog).not.toHaveBeenCalled();
    expect(mocks.fetchPublicBlogPosts).not.toHaveBeenCalled();
  });

  it("creates pending pre-enrollments from the canonical receipt without changing capacity", async () => {
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
    const studentsBefore = harness.store.students.map((student) => ({ ...student }));
    const payload = buildEnrollmentPayload(harness.store);
    const originalClass = harness.store.classes.find((item) => item.id === payload.classId);
    const classBefore = originalClass ? { ...originalClass } : undefined;
    mocks.toastSuccess.mockClear();
    mocks.fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ok: true, enrollmentId: "enrollment-db-public-1", classId: payload.classId }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      ),
    );

    let receipt: Awaited<ReturnType<Store["createEnrollment"]>> | undefined;
    await act(async () => {
      receipt = await harness.store.createEnrollment(payload);
    });

    const classAfter = harness.store.classes.find((item) => item.id === payload.classId);

    expect(screen.getByTestId("enrollment-count")).toHaveTextContent(String(initialEnrollmentCount + 1));
    expect(harness.store.enrollments[0]).toMatchObject({
      ...payload,
      id: "enrollment-db-public-1",
      status: "Pendente",
      paymentMethod: null,
      createdAt: "2026-06-22T12:00:00.000Z",
    });
    expect(harness.store.students).toStrictEqual(studentsBefore);
    expect(receipt).toEqual({ enrollmentId: "enrollment-db-public-1", classId: payload.classId });
    expect(classAfter).toStrictEqual(classBefore);
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    const requestBody = JSON.parse(String(mocks.fetchMock.mock.calls.at(-1)?.[1]?.body));
    expect(requestBody).not.toHaveProperty("paymentMethod");
  });

  it("deletes enrollments through the provider and recalculates the class capacity from remaining rows", async () => {
    const harness = renderStore(
      {
        role: "admin",
        email: "admin@example.com",
        name: "Admin",
      },
      {
        courses: mockCourses,
        classes: mockClasses,
        instructors: mocks.data.mockInstructors,
        trainingPaths: mocks.data.trainingPaths,
      } as Parameters<typeof AppStoreProvider>[0]["initialData"]
    );
    const initialClassCount = harness.store.classes.length;
    const payload = buildEnrollmentPayload(harness.store);
    const classBefore = harness.store.classes.find((item) => item.id === payload.classId);
    mocks.fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ok: true, enrollmentId: "enrollment-db-public-2", classId: payload.classId }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      ),
    );

    await act(async () => {
      await harness.store.createEnrollment(payload);
    });

    await waitFor(() => expect(harness.store.classes).toHaveLength(initialClassCount));

    mocks.functionsConfigured = true;
    mocks.invokeFunction.mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const enrollmentId = harness.store.enrollments[0]?.id;
    expect(enrollmentId).toBeDefined();

    await act(async () => {
      await harness.store.deleteEnrollment(enrollmentId!);
    });

    expect(mocks.invokeFunction).toHaveBeenCalledWith("admin-resources", {
      body: {
        resource: "enrollments",
        action: "delete",
        id: enrollmentId,
      },
      keepalive: true,
    });
    await waitFor(() => expect(harness.store.enrollments).toHaveLength(0));
    await waitFor(() =>
      expect(harness.store.classes.find((item) => item.id === payload.classId)).toMatchObject({
        filledSeats: classBefore?.filledSeats,
        availableSeats: classBefore?.availableSeats,
      })
    );
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Inscrição excluída.");
  });

  it("deletes an admin-created enrollment in the same session using the server-issued id", async () => {
    mocks.functionsConfigured = true;
    const harness = renderStore(
      {
        role: "admin",
        email: "admin@example.com",
        name: "Admin",
      },
      {
        courses: mockCourses,
        classes: mockClasses,
        instructors: mocks.data.mockInstructors,
        trainingPaths: mocks.data.trainingPaths,
      } as Parameters<typeof AppStoreProvider>[0]["initialData"]
    );
    const payload = buildEnrollmentPayload(harness.store);

    mocks.invokeFunction.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, data: { id: "enrollment-db-1" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await act(async () => {
      await harness.store.createEnrollmentAdmin({ ...payload, paymentMethod: "Pix" });
    });

    expect(harness.store.enrollments[0]?.id).toBe("enrollment-db-1");

    mocks.invokeFunction.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, data: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await act(async () => {
      await harness.store.deleteEnrollment("enrollment-db-1");
    });

    expect(mocks.invokeFunction).toHaveBeenCalledWith("admin-resources", {
      body: {
        resource: "enrollments",
        action: "delete",
        id: "enrollment-db-1",
      },
      keepalive: true,
    });
    await waitFor(() => expect(harness.store.enrollments).toHaveLength(0));
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

  it("preserves the full modalities array when creating and editing courses", async () => {
    mocks.functionsConfigured = true;
    mocks.invokeFunction.mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const harness = renderStore();

    await act(async () => {
      await harness.store.upsertCourse({
        title: "Curso Multimodal",
        modality: "Presencial",
        modalities: ["Presencial", "Ao vivo online"],
      });
    });

    await waitFor(() =>
      expect(harness.store.courses[0]).toMatchObject({
        title: "Curso Multimodal",
        modality: "Presencial",
        modalities: ["Presencial", "Ao vivo online"],
      })
    );

    await act(async () => {
      await harness.store.upsertCourse({
        id: harness.store.courses[0].id,
        modalities: ["Gravado", "Ao vivo online"],
      });
    });

    await waitFor(() =>
      expect(harness.store.courses[0]).toMatchObject({
        modality: "Gravado",
        modalities: ["Gravado", "Ao vivo online"],
      })
    );

    expect(mocks.invokeFunction).toHaveBeenLastCalledWith("admin-resources", {
      body: {
        resource: "courses",
        action: "upsert",
        payload: expect.objectContaining({
          modality: "Gravado",
          modalities: ["Gravado", "Ao vivo online"],
        }),
      },
    });
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

  // REC-204 Fase B: a hidratação otimista a partir de um token HMAC em
  // localStorage foi removida (D2 — sem localStorage). A sessão admin passa a
  // vir exclusivamente do `initialSession` server-side (cookie SSR) e da
  // revalidação via GET /api/auth/session. Os dois testes de "optimistic token"
  // e "preserve admin-resources token during sync" foram removidos com o
  // caminho HMAC.

  it("clears the optimistic session when the server reports expiration", async () => {
    const session: CurrentSession = {
      role: "admin",
      email: "expired@example.com",
      name: "Expired User",
    };
    mocks.fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    const harness = renderStore(session);

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

  it("starts with an empty catalog (no mock fallback) when no initial data is provided", async () => {
    const harness = renderStore();

    expect(harness.store.courses).toEqual([]);
    expect(harness.store.classes).toEqual([]);
    expect(harness.store.instructors).toEqual([]);
    expect(harness.store.blogPosts).toEqual([]);
    expect(harness.store.courseCategories).toEqual([]);
  });

  it("never surfaces known mock-public-data course slugs when the catalog bootstraps empty (Story 16.1, AC9)", async () => {
    const { mockCatalog } = await import("@/lib/mock-public-data");
    const knownMockSlugs = mockCatalog.courses.map((course) => course.slug);
    expect(knownMockSlugs).toContain("nova-lei-de-licitacoes-na-pratica-lei-14133-21");

    const harness = renderStore();
    const renderedSlugs = harness.store.courses.map((course) => course.slug);

    expect(renderedSlugs).toEqual([]);
    expect(renderedSlugs.some((slug) => knownMockSlugs.includes(slug))).toBe(false);
  });

  it("uses courseCategories from the initial catalog data when provided", async () => {
    const harness = renderStore(undefined, { courseCategories: ["Auditoria", "Compliance"] });

    expect(harness.store.courseCategories).toEqual(["Auditoria", "Compliance"]);
  });

  it("ignores a non-array courseCategories value in the initial catalog data", async () => {
    const fallback = renderStore().store.courseCategories;
    const harness = renderStore(undefined, {
      courseCategories: "not-an-array" as unknown as string[],
    });

    expect(harness.store.courseCategories).toEqual(fallback);
  });
});
