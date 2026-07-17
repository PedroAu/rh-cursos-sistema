import { describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  listClasses,
  listCourses,
  listInstructors,
  normalizeCatalogListParams,
} from "@/lib/supabase/admin-catalog-read-models";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/supabase/admin-read-models";

/**
 * REC-304 — read models administrativos de catálogo (cursos/turmas/instrutores).
 * Cobre a normalização fail-safe dos parâmetros e a montagem correta da query
 * paginada/filtrada, reutilizando as projeções DB→domínio de `mappers.ts`.
 * Nenhuma chamada de rede real.
 */

function courseRow(overrides: Record<string, unknown> = {}) {
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
    ...overrides,
  };
}

function classRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "turma-1",
    curso_id: "curso-1",
    instrutor_id: "instrutor-1",
    data_inicio: "2026-08-01",
    data_fim: "2026-08-03",
    horario: "09:00",
    local: "Online",
    vagas_total: 30,
    vagas_preenchidas: 10,
    vagas_restantes: 20,
    preco_turma: 1290,
    modalidade: "Online",
    status: "Aberta",
    observacoes: "obs interna",
    ...overrides,
  };
}

function instructorRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "instrutor-1",
    nome: "Ana Souza",
    email: "ana@rhcursos.test",
    telefone: "(11) 90000-0000",
    bio: "Especialista",
    foto_url: "/ana.jpg",
    formacao: "Direito",
    especialidade: "Licitações",
    rating: 4.9,
    status: "Ativo",
    ...overrides,
  };
}

function joinRow(overrides: Record<string, unknown> = {}) {
  return { id: "ci-1", curso_id: "curso-1", instrutor_id: "instrutor-1", principal: true, ...overrides };
}

/**
 * Cliente PostgREST de mentira que despacha por tabela. Cada tabela recebe um
 * resultado pré-definido; o chain encadeável registra as chamadas e resolve em
 * `range` (consultas paginadas) ou em `in` (join scoped por ids da página).
 */
function makeClient(byTable: Record<string, { data: unknown[]; count?: number; error?: unknown }>) {
  const calls: Record<string, unknown[][]> = {};
  const record = (name: string, args: unknown[]) => {
    (calls[name] ??= []).push(args);
  };

  const from = vi.fn((table: string) => {
    record("from", [table]);
    const result = byTable[table] ?? { data: [], count: 0 };
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    const self = () => chain;
    chain.select = vi.fn((...a: unknown[]) => (record(`select:${table}`, a), self()));
    chain.is = vi.fn((...a: unknown[]) => (record(`is:${table}`, a), self()));
    chain.order = vi.fn((...a: unknown[]) => (record(`order:${table}`, a), self()));
    chain.ilike = vi.fn((...a: unknown[]) => (record(`ilike:${table}`, a), self()));
    chain.or = vi.fn((...a: unknown[]) => (record(`or:${table}`, a), self()));
    chain.range = vi.fn(async (...a: unknown[]) => {
      record(`range:${table}`, a);
      return { data: result.data, count: result.count ?? 0, error: result.error ?? null };
    });
    // Join scoped: `.in(...)` é o ponto de resolução (não há `range`).
    chain.in = vi.fn(async (...a: unknown[]) => {
      record(`in:${table}`, a);
      return { data: result.data, count: result.count ?? 0, error: result.error ?? null };
    });
    return chain;
  });

  const client = { from } as unknown as SupabaseClient;
  return { client, calls };
}

describe("normalizeCatalogListParams — fail-safe", () => {
  it("aplica defaults quando ausente/inválido", () => {
    const p = normalizeCatalogListParams(new URLSearchParams("page=0&pageSize=abc"));
    expect(p).toEqual({ page: 1, pageSize: DEFAULT_PAGE_SIZE, search: null });
  });

  it("limita pageSize a MAX_PAGE_SIZE", () => {
    expect(normalizeCatalogListParams(new URLSearchParams("pageSize=9999")).pageSize).toBe(MAX_PAGE_SIZE);
  });

  it("sanitiza a busca removendo caracteres do operador PostgREST", () => {
    const p = normalizeCatalogListParams(new URLSearchParams("search=%29or%28*%2Cgestao"));
    expect(p.search).not.toMatch(/[(),*%\\]/);
    expect(p.search).toContain("gestao");
  });
});

describe("listCourses — query paginada e projeção", () => {
  it("aplica range/order, busca os joins da página e devolve total do count", async () => {
    const { client, calls } = makeClient({
      curso: { data: [courseRow()], count: 5 },
      curso_instrutor: { data: [joinRow()] },
      turma: { data: [classRow()] },
    });

    const result = await listCourses(client, { page: 2, pageSize: 10, search: "gestao" });

    expect(calls.from).toContainEqual(["curso"]);
    expect(calls["order:curso"]?.[0]?.[0]).toBe("titulo");
    expect(calls["ilike:curso"]?.[0]).toEqual(["titulo", "%gestao%"]);
    expect(calls["range:curso"]?.[0]).toEqual([10, 19]);
    // joins scoped pelos ids dos cursos da página
    expect(calls["in:curso_instrutor"]?.[0]).toEqual(["curso_id", ["curso-1"]]);
    expect(calls["in:turma"]?.[0]).toEqual(["curso_id", ["curso-1"]]);
    expect(result.total).toBe(5);
    expect(result.page).toBe(2);
    expect(result.data[0]).toMatchObject({
      id: "curso-1",
      title: "Gestão de Contratos",
      instructorId: "instrutor-1",
      nextClassId: "turma-1",
    });
  });

  it("não busca joins quando a página está vazia e não aplica filtro sem busca", async () => {
    const { client, calls } = makeClient({ curso: { data: [], count: 0 } });
    const result = await listCourses(client, { page: 1, pageSize: 20, search: null });
    expect(calls["ilike:curso"]).toBeUndefined();
    expect(calls["in:curso_instrutor"]).toBeUndefined();
    expect(calls["range:curso"]?.[0]).toEqual([0, 19]);
    expect(result.data).toEqual([]);
  });

  it("propaga erro do banco", async () => {
    const { client } = makeClient({ curso: { data: [], count: 0, error: { message: "db down" } } });
    await expect(listCourses(client, { page: 1, pageSize: 20, search: null })).rejects.toEqual({
      message: "db down",
    });
  });
});

describe("listClasses — query paginada e projeção", () => {
  it("aplica range/order e devolve turmas mapeadas", async () => {
    const { client, calls } = makeClient({ turma: { data: [classRow()], count: 3 } });
    const result = await listClasses(client, { page: 1, pageSize: 20, search: null });

    expect(calls.from).toContainEqual(["turma"]);
    expect(calls["order:turma"]?.[0]?.[0]).toBe("data_inicio");
    expect(calls["range:turma"]?.[0]).toEqual([0, 19]);
    expect(result.total).toBe(3);
    expect(result.data[0]).toMatchObject({ id: "turma-1", courseId: "curso-1", status: "Inscrições abertas" });
  });

  it("busca pelo título do curso via embed inner (referencedTable curso)", async () => {
    const { client, calls } = makeClient({ turma: { data: [], count: 0 } });
    await listClasses(client, { page: 1, pageSize: 20, search: "gestao" });
    expect(calls["select:turma"]?.[0]?.[0]).toContain("curso:curso_id!inner(titulo)");
    expect(calls["or:turma"]?.[0]?.[0]).toContain("titulo.ilike.%gestao%");
    expect(calls["or:turma"]?.[0]?.[1]).toEqual({ referencedTable: "curso" });
  });
});

describe("listInstructors — query paginada e projeção", () => {
  it("aplica range/order, busca vínculos da página e projeta courseIds", async () => {
    const { client, calls } = makeClient({
      instrutor: { data: [instructorRow()], count: 8 },
      curso_instrutor: { data: [joinRow()] },
    });

    const result = await listInstructors(client, { page: 1, pageSize: 20, search: "ana" });

    expect(calls.from).toContainEqual(["instrutor"]);
    expect(calls["order:instrutor"]?.[0]?.[0]).toBe("nome");
    expect(calls["ilike:instrutor"]?.[0]).toEqual(["nome", "%ana%"]);
    expect(calls["in:curso_instrutor"]?.[0]).toEqual(["instrutor_id", ["instrutor-1"]]);
    expect(result.total).toBe(8);
    expect(result.data[0]).toMatchObject({ id: "instrutor-1", name: "Ana Souza", courseIds: ["curso-1"] });
  });

  it("não busca vínculos quando a página está vazia", async () => {
    const { client, calls } = makeClient({ instrutor: { data: [], count: 0 } });
    const result = await listInstructors(client, { page: 1, pageSize: 20, search: null });
    expect(calls["in:curso_instrutor"]).toBeUndefined();
    expect(result.data).toEqual([]);
  });
});
