import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * REC-303 — rotas administrativas de read model (alunos/inscrições).
 *
 * Exercita o guard REAL (`requireAdminApi` → `requireServerRole`/REC-203) com as
 * dependências de baixo nível mockadas. Prova o contrato fail-closed:
 * sem sessão → 401, papel insuficiente → 403, admin → dados paginados; e que os
 * filtros de query chegam ao read model. Nenhuma rede real; HMAC não é tocado.
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

function joinedRow() {
  return {
    id: "insc-1",
    aluno_id: "aluno-1",
    turma_id: "turma-1",
    status_inscricao: "Confirmada",
    forma_pagamento: "Pix",
    tipo_inscricao: "Pessoa física",
    observacoes: "",
    certificado_emitido: false,
    created_at: "2026-07-17T10:00:00.000Z",
    aluno: {
      nome_completo: "Maria Silva",
      email: "maria@rhcursos.test",
      cpf: "1",
      telefone: "2",
      cargo: "3",
      orgao: "4",
      tipo_aluno: "PF",
    },
    turma: { curso_id: "curso-9" },
  };
}

function recordingChain(result: { data: unknown[]; count: number }) {
  const calls: Record<string, unknown[][]> = {};
  const rec = (n: string, a: unknown[]) => ((calls[n] ??= []).push(a), chain);
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn((...a) => rec("select", a));
  chain.order = vi.fn((...a) => rec("order", a));
  chain.eq = vi.fn((...a) => rec("eq", a));
  chain.or = vi.fn((...a) => rec("or", a));
  chain.range = vi.fn(async (...a) => (rec("range", a), { data: result.data, count: result.count, error: null }));
  return { chain, calls };
}

const adminUser = { email: "admin@rhcursos.test", app_metadata: { role: "admin" } };
const studentUser = { email: "student@rhcursos.test", app_metadata: { role: "student" } };

async function importRoutes() {
  const enrollments = await import("../../../../app/api/admin/enrollments/route");
  const students = await import("../../../../app/api/admin/students/route");
  return { enrollments, students };
}

describe("app/api/admin read model routes — fail-closed", () => {
  beforeEach(() => {
    mocks.getUser.mockReset();
    mocks.from.mockReset();
    mocks.isLockdownActive.mockReturnValue(false);
  });

  it("sem sessão SSR → 401 e não consulta o banco", async () => {
    mocks.getUser.mockResolvedValue({ data: null, error: { message: "no session" } });
    const { chain } = recordingChain({ data: [], count: 0 });
    mocks.from.mockReturnValue(chain);

    const { enrollments } = await importRoutes();
    const res = await enrollments.GET(new Request("https://x/api/admin/enrollments"));
    expect(res.status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("papel insuficiente (student exige admin) → 403", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: studentUser }, error: null });
    const { chain } = recordingChain({ data: [], count: 0 });
    mocks.from.mockReturnValue(chain);

    const { students } = await importRoutes();
    const res = await students.GET(new Request("https://x/api/admin/students"));
    expect(res.status).toBe(403);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("lockdown ativo → 503 antes de qualquer autorização", async () => {
    mocks.isLockdownActive.mockReturnValue(true);
    const { enrollments } = await importRoutes();
    const res = await enrollments.GET(new Request("https://x/api/admin/enrollments"));
    expect(res.status).toBe(503);
    expect(mocks.getUser).not.toHaveBeenCalled();
  });

  it("admin válido → 200 com dados paginados", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: adminUser }, error: null });
    const { chain } = recordingChain({ data: [joinedRow()], count: 1 });
    mocks.from.mockReturnValue(chain);

    const { enrollments } = await importRoutes();
    const res = await enrollments.GET(new Request("https://x/api/admin/enrollments"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.total).toBe(1);
    expect(body.page).toBe(1);
    expect(body.data[0].studentName).toBe("Maria Silva");
  });

  it("admin válido → filtros de query (turma/status/busca) chegam ao read model", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: adminUser }, error: null });
    const { chain, calls } = recordingChain({ data: [], count: 0 });
    mocks.from.mockReturnValue(chain);

    const { students } = await importRoutes();
    const res = await students.GET(
      new Request("https://x/api/admin/students?page=2&pageSize=10&classId=turma-7&status=Confirmada&search=maria")
    );
    expect(res.status).toBe(200);
    expect(calls.eq).toContainEqual(["turma_id", "turma-7"]);
    expect(calls.eq).toContainEqual(["status_inscricao", "Confirmada"]);
    expect(calls.or?.[0]?.[0]).toContain("nome_completo.ilike.%maria%");
    expect(calls.range?.[0]).toEqual([10, 19]);
  });
});
