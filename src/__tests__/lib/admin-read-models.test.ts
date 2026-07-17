import { describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  fromDbEnrollmentStatus,
  fromDbPaymentMethod,
  fromDbStudentType,
  listEnrollments,
  listStudents,
  mapDbEnrollment,
  mapDbStudent,
  normalizeListParams,
} from "@/lib/supabase/admin-read-models";

/**
 * REC-303 — read models administrativos de alunos/inscrições (fecha FND-08).
 * Cobre a projeção DB→domínio, a normalização fail-safe dos parâmetros e a
 * montagem correta da query paginada/filtrada. Nenhuma chamada de rede real.
 */

function joinedRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "insc-1",
    aluno_id: "aluno-1",
    turma_id: "turma-1",
    status_inscricao: "Confirmada",
    forma_pagamento: "Cartao",
    tipo_inscricao: "Empresa",
    observacoes: "obs interna",
    certificado_emitido: true,
    created_at: "2026-07-17T10:00:00.000Z",
    aluno: {
      nome_completo: "Maria Silva",
      email: "maria@rhcursos.test",
      cpf: "111.222.333-44",
      telefone: "(11) 90000-0000",
      cargo: "Analista",
      orgao: "Prefeitura",
      tipo_aluno: "PJ",
    },
    turma: { curso_id: "curso-9" },
    ...overrides,
  };
}

/**
 * Recorder de query PostgREST: cada método encadeável devolve o próprio chain e
 * registra a chamada; `range` resolve com `{ data, count, error }`.
 */
function makeRecordingClient(result: { data: unknown[]; count: number; error?: unknown }) {
  const calls: Record<string, unknown[][]> = {};
  const record = (name: string, args: unknown[]) => {
    (calls[name] ??= []).push(args);
  };
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const self = () => chain;
  chain.select = vi.fn((...a: unknown[]) => (record("select", a), self()));
  chain.order = vi.fn((...a: unknown[]) => (record("order", a), self()));
  chain.eq = vi.fn((...a: unknown[]) => (record("eq", a), self()));
  chain.or = vi.fn((...a: unknown[]) => (record("or", a), self()));
  chain.range = vi.fn(async (...a: unknown[]) => {
    record("range", a);
    return { data: result.data, count: result.count, error: result.error ?? null };
  });
  const from = vi.fn((...a: unknown[]) => (record("from", a), self()));
  const client = { from } as unknown as SupabaseClient;
  return { client, calls, chain };
}

describe("fromDb* — conversões inversas de enum", () => {
  it("status_inscricao → EnrollmentStatus", () => {
    expect(fromDbEnrollmentStatus("Confirmada")).toBe("Confirmada");
    expect(fromDbEnrollmentStatus("AguardandoPagamento")).toBe("Aguardando pagamento");
    expect(fromDbEnrollmentStatus("Concluida")).toBe("Concluída");
    expect(fromDbEnrollmentStatus("Cancelada")).toBe("Cancelada");
    expect(fromDbEnrollmentStatus("ListaEspera")).toBe("Pendente");
    expect(fromDbEnrollmentStatus(null)).toBe("Pendente");
  });

  it("tipo_aluno → enrollmentType", () => {
    expect(fromDbStudentType("PJ")).toBe("Empresa");
    expect(fromDbStudentType("Servidor")).toBe("Órgão público");
    expect(fromDbStudentType("PF")).toBe("Pessoa física");
    expect(fromDbStudentType(null)).toBe("Pessoa física");
  });

  it("forma_pagamento → paymentMethod", () => {
    expect(fromDbPaymentMethod("Cartao")).toBe("Cartão");
    expect(fromDbPaymentMethod("Pix")).toBe("Pix");
    expect(fromDbPaymentMethod(null)).toBeNull();
    expect(fromDbPaymentMethod("Desconhecido")).toBeNull();
  });
});

describe("mapDbEnrollment / mapDbStudent — projeção DB→domínio", () => {
  it("mapeia inscrição para o domínio Enrollment", () => {
    expect(mapDbEnrollment(joinedRow() as never)).toEqual({
      id: "insc-1",
      studentName: "Maria Silva",
      email: "maria@rhcursos.test",
      phone: "(11) 90000-0000",
      cpf: "111.222.333-44",
      organization: "Prefeitura",
      jobTitle: "Analista",
      enrollmentType: "Empresa",
      paymentMethod: "Cartão",
      courseId: "curso-9",
      classId: "turma-1",
      status: "Confirmada",
      createdAt: "2026-07-17T10:00:00.000Z",
      notes: "obs interna",
    });
  });

  it("mapeia inscrição para o domínio Student (id = aluno_id)", () => {
    expect(mapDbStudent(joinedRow() as never)).toEqual({
      id: "aluno-1",
      name: "Maria Silva",
      email: "maria@rhcursos.test",
      phone: "(11) 90000-0000",
      cpf: "111.222.333-44",
      organization: "Prefeitura",
      jobTitle: "Analista",
      courseId: "curso-9",
      classId: "turma-1",
      enrollmentStatus: "Confirmada",
      certificateIssued: true,
      enrolledAt: "2026-07-17T10:00:00.000Z",
      paymentMethod: "Cartão",
    });
  });

  it("aceita embed devolvido como array (inferência PostgREST 1:N)", () => {
    const row = joinedRow({ aluno: [joinedRow().aluno], turma: [joinedRow().turma] });
    expect(mapDbEnrollment(row as never).studentName).toBe("Maria Silva");
    expect(mapDbEnrollment(row as never).courseId).toBe("curso-9");
  });
});

describe("normalizeListParams — fail-safe", () => {
  it("aplica defaults quando ausente/inválido", () => {
    const p = normalizeListParams(new URLSearchParams("page=0&pageSize=abc"));
    expect(p).toEqual({ page: 1, pageSize: DEFAULT_PAGE_SIZE, classId: null, status: null, search: null });
  });

  it("limita pageSize a MAX_PAGE_SIZE", () => {
    expect(normalizeListParams(new URLSearchParams("pageSize=9999")).pageSize).toBe(MAX_PAGE_SIZE);
  });

  it("só aceita status que é EnrollmentStatus conhecido", () => {
    expect(normalizeListParams(new URLSearchParams("status=Confirmada")).status).toBe("Confirmada");
    expect(normalizeListParams(new URLSearchParams("status=Hacked")).status).toBeNull();
  });

  it("sanitiza a busca removendo caracteres do operador PostgREST", () => {
    const p = normalizeListParams(new URLSearchParams("search=%29or%28*%2Cmaria"));
    // parênteses, asterisco e percent removidos; vírgula do input decodificado some
    expect(p.search).not.toMatch(/[(),*%\\]/);
    expect(p.search).toContain("maria");
  });
});

describe("listEnrollments / listStudents — query paginada e filtrada", () => {
  const params = { page: 2, pageSize: 10, classId: "turma-7", status: "Confirmada" as const, search: "maria" };

  it("aplica range, order, filtros e devolve total do count", async () => {
    const { client, calls } = makeRecordingClient({ data: [joinedRow()], count: 42 });
    const result = await listEnrollments(client, params);

    expect(calls.from?.[0]).toEqual(["inscricao"]);
    expect(calls.order?.[0]?.[0]).toBe("created_at");
    expect(calls.eq).toContainEqual(["turma_id", "turma-7"]);
    expect(calls.eq).toContainEqual(["status_inscricao", "Confirmada"]);
    expect(calls.or?.[0]?.[0]).toContain("nome_completo.ilike.%maria%");
    expect(calls.or?.[0]?.[0]).toContain("email.ilike.%maria%");
    expect(calls.or?.[0]?.[1]).toEqual({ referencedTable: "aluno" });
    // page 2, size 10 → range(10, 19)
    expect(calls.range?.[0]).toEqual([10, 19]);
    expect(result).toEqual({
      data: [mapDbEnrollment(joinedRow() as never)],
      page: 2,
      pageSize: 10,
      total: 42,
    });
  });

  it("não aplica filtros quando ausentes", async () => {
    const { client, calls } = makeRecordingClient({ data: [], count: 0 });
    await listStudents(client, { page: 1, pageSize: 20, classId: null, status: null, search: null });
    expect(calls.eq).toBeUndefined();
    expect(calls.or).toBeUndefined();
    expect(calls.range?.[0]).toEqual([0, 19]);
  });

  it("propaga erro do banco", async () => {
    const { client } = makeRecordingClient({ data: [], count: 0, error: { message: "db down" } });
    await expect(
      listEnrollments(client, { page: 1, pageSize: 20, classId: null, status: null, search: null })
    ).rejects.toEqual({ message: "db down" });
  });
});
