import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@sentry/nextjs", () => ({
  addBreadcrumb: vi.fn(),
  captureMessage: vi.fn()
}));

import {
  clearQueryMetrics,
  getQueryMetrics,
  wrapSupabaseWithQueryLogging
} from "@/lib/supabase/query-logging-middleware";

/**
 * Reproduz o formato relevante do PostgrestFilterBuilder: os filtros
 * (.eq/.order/.not/.single) mutam e retornam `this` (não uma nova
 * instância), e o builder é "thenable" (implementa `.then`). É esse
 * contrato que o middleware precisa preservar ao interceptar select/insert/
 * update/delete (Story 16.1, gate REL-001).
 */
class FakeFilterBuilder<T> implements PromiseLike<{ data: T; error: null }> {
  calls: string[] = [];

  constructor(private readonly result: { data: T; error: null }) {}

  eq(column: string, value: unknown) {
    this.calls.push(`eq(${column},${String(value)})`);
    return this;
  }

  order(column: string) {
    this.calls.push(`order(${column})`);
    return this;
  }

  not(column: string, operator: string, value: unknown) {
    this.calls.push(`not(${column},${operator},${String(value)})`);
    return this;
  }

  single() {
    this.calls.push("single()");
    return this;
  }

  then<TResult1 = { data: T; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.result).then(onfulfilled, onrejected);
  }
}

function createFakeSupabaseClient<T>(result: { data: T; error: null }) {
  const builder = {
    select: vi.fn((..._args: unknown[]) => new FakeFilterBuilder(result)),
    insert: vi.fn((..._args: unknown[]) => new FakeFilterBuilder(result)),
    update: vi.fn((..._args: unknown[]) => new FakeFilterBuilder(result)),
    delete: vi.fn((..._args: unknown[]) => new FakeFilterBuilder(result))
  };

  return {
    from: vi.fn((_table: string) => builder),
    _builder: builder
  };
}

describe("wrapSupabaseWithQueryLogging", () => {
  beforeEach(() => {
    clearQueryMetrics();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("preserva o encadeamento de filtros após select() (regressão do gate REL-001)", async () => {
    const rows = [{ id: "curso-1" }];
    const client = createFakeSupabaseClient({ data: rows, error: null });

    wrapSupabaseWithQueryLogging(client as any, { logAllQueries: true });

    const query = client.from("curso").select("id").eq("status", "Ativo").order("created_at");
    const result = await query;

    expect(result).toEqual({ data: rows, error: null });
  });

  it("preserva o encadeamento após insert()/update()/delete()", async () => {
    const client = createFakeSupabaseClient({ data: null, error: null });

    wrapSupabaseWithQueryLogging(client as any, { logAllQueries: true });

    await expect(client.from("curso").insert({ titulo: "Novo" }).single()).resolves.toEqual({
      data: null,
      error: null
    });
    await expect(client.from("curso").update({ titulo: "Editado" }).eq("id", "curso-1")).resolves.toEqual({
      data: null,
      error: null
    });
    await expect(client.from("curso").delete().eq("id", "curso-1")).resolves.toEqual({
      data: null,
      error: null
    });
  });

  it("registra métricas de duração sem alterar o resultado da query", async () => {
    const client = createFakeSupabaseClient({ data: [], error: null });

    wrapSupabaseWithQueryLogging(client as any, { logAllQueries: true, enableConsoleLogging: false });

    await client.from("turma").select("*").order("data_inicio");

    const metrics = getQueryMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toMatchObject({ method: "select", table: "turma" });
    expect(metrics[0].duration).toBeGreaterThanOrEqual(0);
  });
});
