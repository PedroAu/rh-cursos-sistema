import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * REC-304 — rotas administrativas de read model de catálogo
 * (cursos/turmas/instrutores). Exercita o guard REAL (`requireAdminApi` →
 * `requireServerRole`/REC-203) com as dependências de baixo nível mockadas.
 * Prova o contrato fail-closed: sem sessão → 401, papel insuficiente → 403,
 * lockdown → 503, admin → dados paginados. Nenhuma rede real; HMAC não é tocado.
 */

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  isLockdownActive: vi.fn(() => false),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => [{ name: "sb-access-token", value: "x" }],
    set: () => {},
  }),
}));

vi.mock("@/lib/lockdown", () => ({
  isLockdownActive: () => mocks.isLockdownActive(),
  LOCKDOWN_RESPONSE_BODY: { ok: false, error: "lockdown" },
}));

vi.mock("@/lib/supabase/session", () => ({
  isSupabaseSsrConfigured: true,
  createSupabaseSSRClient: () => ({ auth: { getUser: mocks.getUser } }),
}));

vi.mock("@/lib/supabase/server", () => ({
  isSupabaseServerConfigured: true,
  createSupabaseServerClient: () => ({ from: mocks.from }),
}));

function courseRow() {
  return {
    id: "curso-1",
    titulo: "Gestão de Contratos",
    slug: "gestao-contratos",
    descricao_curta: "curta",
    descricao: "completa",
    ementa: [],
    objetivos: [],
    beneficios: [],
    publico_alvo: [],
    carga_horaria: 16,
    modalidade: "Online",
    modalidades: ["Online"],
    nivel: "Intermediario",
    categoria: "Licitações",
    categorias: ["Licitações"],
    trilha_id: "path-licitacoes",
    trilha_nome: "Licitações e Contratos",
    preco_base: 1290,
    status: "Ativo",
    destaque: false,
    imagem_capa: "/img.jpg",
    rating: 4.8,
    total_alunos: 120,
  };
}

/**
 * Cliente PostgREST de mentira que despacha por tabela: `curso` resolve em
 * `range`; `curso_instrutor`/`turma` resolvem em `in` (joins scoped).
 */
function catalogClient(courseData: unknown[], count: number) {
  return (table: string) => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    const self = () => chain;
    chain.select = vi.fn(() => self());
    chain.is = vi.fn(() => self());
    chain.order = vi.fn(() => self());
    chain.ilike = vi.fn(() => self());
    chain.or = vi.fn(() => self());
    chain.range = vi.fn(async () => ({
      data: table === "curso" ? courseData : [],
      count: table === "curso" ? count : 0,
      error: null,
    }));
    chain.in = vi.fn(async () => ({ data: [], count: 0, error: null }));
    return chain;
  };
}

const adminUser = { email: "admin@rhcursos.test", app_metadata: { role: "admin" } };
const studentUser = { email: "student@rhcursos.test", app_metadata: { role: "student" } };

async function importRoutes() {
  const courses = await import("../../../../app/api/admin/courses/route");
  const classes = await import("../../../../app/api/admin/classes/route");
  const instructors = await import("../../../../app/api/admin/instructors/route");
  return { courses, classes, instructors };
}

describe("app/api/admin catalog read model routes — fail-closed", () => {
  beforeEach(() => {
    mocks.getUser.mockReset();
    mocks.from.mockReset();
    mocks.isLockdownActive.mockReturnValue(false);
  });

  it("sem sessão SSR → 401 e não consulta o banco", async () => {
    mocks.getUser.mockResolvedValue({ data: null, error: { message: "no session" } });
    mocks.from.mockImplementation(catalogClient([], 0));

    const { courses } = await importRoutes();
    const res = await courses.GET(new Request("https://x/api/admin/courses"));
    expect(res.status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("papel insuficiente (student exige admin) → 403", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: studentUser }, error: null });
    mocks.from.mockImplementation(catalogClient([], 0));

    const { instructors } = await importRoutes();
    const res = await instructors.GET(new Request("https://x/api/admin/instructors"));
    expect(res.status).toBe(403);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("lockdown ativo → 503 antes de qualquer autorização", async () => {
    mocks.isLockdownActive.mockReturnValue(true);
    const { classes } = await importRoutes();
    const res = await classes.GET(new Request("https://x/api/admin/classes"));
    expect(res.status).toBe(503);
    expect(mocks.getUser).not.toHaveBeenCalled();
  });

  it("admin válido → 200 com cursos paginados", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: adminUser }, error: null });
    mocks.from.mockImplementation(catalogClient([courseRow()], 1));

    const { courses } = await importRoutes();
    const res = await courses.GET(new Request("https://x/api/admin/courses?page=1&pageSize=20"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.total).toBe(1);
    expect(body.page).toBe(1);
    expect(body.data[0].title).toBe("Gestão de Contratos");
  });

  it("admin válido → turmas e instrutores respondem 200 paginado", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: adminUser }, error: null });
    mocks.from.mockImplementation(catalogClient([], 0));

    const { classes, instructors } = await importRoutes();
    const classesRes = await classes.GET(new Request("https://x/api/admin/classes?pageSize=5"));
    const instructorsRes = await instructors.GET(new Request("https://x/api/admin/instructors?pageSize=5"));
    expect(classesRes.status).toBe(200);
    expect(instructorsRes.status).toBe(200);
    expect((await classesRes.json()).pageSize).toBe(5);
    expect((await instructorsRes.json()).pageSize).toBe(5);
  });
});
