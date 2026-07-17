import { beforeEach, describe, expect, it, vi } from "vitest";

// REC-107: cobre o endurecimento do endpoint público de inscrição —
// separação de cliente (leitura pública vs. RPC privilegiada), body limit
// e status server-side (sucesso só após confirmação real do RPC).

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  publicFrom: vi.fn(),
  adminRpc: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => mocks.checkRateLimit(...args),
  clientIp: vi.fn(() => "203.0.113.9"),
  buildRateLimitKey: (scope: string, ip: string, userId?: string | null) =>
    typeof userId === "string" && userId.length > 0 ? `${scope}:${ip}:user:${userId}` : `${scope}:${ip}`,
  rateLimitConfigs: {
    enrollment: { windowMs: 60 * 1000, maxRequests: 20 },
    lead: { windowMs: 60 * 1000, maxRequests: 10 },
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
    admin: { windowMs: 60 * 1000, maxRequests: 30 },
  },
}));

// REC-205: sessão SSR não configurada nestes testes => `readRateLimitUserIdentity`
// retorna null e a chave permanece anônima (byte-idêntica ao comportamento REC-107).
vi.mock("@/lib/supabase/session", () => ({
  isSupabaseSsrConfigured: false,
  createSupabaseSSRClient: vi.fn(() => null),
  readSSRSession: vi.fn(),
}));

function openClassRow() {
  return { id: "class-1", curso_id: "course-1", status: "Aberta", vagas_restantes: 5 };
}

vi.mock("@/lib/supabase/server", () => ({
  isSupabaseServerConfigured: true,
  isSupabasePublicServerConfigured: true,
  createSupabasePublicServerClient: () => ({
    from: mocks.publicFrom,
  }),
  createSupabaseServerClient: () => ({
    rpc: mocks.adminRpc,
  }),
}));

function validPayload() {
  return {
    studentName: "Aluno de Teste",
    email: "aluno@rhcursos.test",
    cpf: "123.456.789-00",
    phone: "(11) 91234-5678",
    courseId: "course-1",
    classId: "class-1",
    organization: "",
    jobTitle: "",
    enrollmentType: "Pessoa física",
    notes: "",
  };
}

function mockQueryChain(rows: unknown[]) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const self = (): typeof chain => chain;
  chain.select = vi.fn(self);
  chain.eq = vi.fn(self);
  chain.in = vi.fn(self);
  chain.gt = vi.fn(self);
  chain.order = vi.fn(self);
  chain.limit = vi.fn(async () => ({ data: rows, error: null }));
  return chain;
}

describe("app/api/enrollments POST", () => {
  beforeEach(() => {
    mocks.checkRateLimit.mockReset();
    mocks.checkRateLimit.mockResolvedValue({ allowed: true, remaining: 19, retryAfter: 0 });
    mocks.publicFrom.mockReset();
    mocks.publicFrom.mockImplementation(() => mockQueryChain([openClassRow()]));
    mocks.adminRpc.mockReset();
    mocks.adminRpc.mockResolvedValue({ data: "abcd1234abcd1234", error: null });
  });

  it("rejects a body larger than the configured limit before parsing", async () => {
    const { POST } = await import("../../../../app/api/enrollments/route");

    const oversizedNotes = "x".repeat(9 * 1024);
    const response = await POST(
      new Request("http://localhost/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validPayload(), notes: oversizedNotes }),
      })
    );

    expect(response.status).toBe(413);
    expect(mocks.publicFrom).not.toHaveBeenCalled();
    expect(mocks.adminRpc).not.toHaveBeenCalled();
  });

  it("reads the class/course lookup via the public client and calls the RPC via the privileged client", async () => {
    const { POST } = await import("../../../../app/api/enrollments/route");

    const response = await POST(
      new Request("http://localhost/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPayload()),
      })
    );

    expect(mocks.publicFrom).toHaveBeenCalledWith("turma");
    expect(mocks.adminRpc).toHaveBeenCalledWith(
      "registrar_inscricao_publica",
      expect.objectContaining({ p_turma_id: "class-1" })
    );
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ ok: true, enrollmentId: "abcd1234abcd1234" })
    );
  });

  it("only reports success after the RPC confirms persistence (no optimistic success)", async () => {
    mocks.adminRpc.mockResolvedValue({
      data: null,
      error: { code: "P0003", message: "Turma sem vagas disponíveis." },
    });

    const { POST } = await import("../../../../app/api/enrollments/route");
    const response = await POST(
      new Request("http://localhost/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPayload()),
      })
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Turma sem vagas disponíveis.",
    });
  });

  it("maps a concurrent duplicate (raw unique_violation) to the same friendly P0004 message", async () => {
    mocks.adminRpc.mockResolvedValue({
      data: null,
      error: {
        code: "23505",
        message:
          'duplicate key value violates unique constraint "inscricao_aluno_turma_active_idx"',
      },
    });

    const { POST } = await import("../../../../app/api/enrollments/route");
    const response = await POST(
      new Request("http://localhost/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPayload()),
      })
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Aluno já possui inscrição ativa nesta turma.",
    });
  });

  it("rejects requests blocked by the rate limiter before touching Supabase", async () => {
    mocks.checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, retryAfter: 30 });

    const { POST } = await import("../../../../app/api/enrollments/route");
    const response = await POST(
      new Request("http://localhost/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPayload()),
      })
    );

    expect(response.status).toBe(429);
    expect(mocks.publicFrom).not.toHaveBeenCalled();
    expect(mocks.adminRpc).not.toHaveBeenCalled();
  });

  it("rejects a payload with an unexpected extra field (strict schema)", async () => {
    const { POST } = await import("../../../../app/api/enrollments/route");
    const response = await POST(
      new Request("http://localhost/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validPayload(), isAdmin: true }),
      })
    );

    expect(response.status).toBe(400);
    expect(mocks.adminRpc).not.toHaveBeenCalled();
  });
});
