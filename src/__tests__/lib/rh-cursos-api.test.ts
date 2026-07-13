import { describe, expect, it, vi } from "vitest";

import { fetchCourseCategories } from "@/lib/supabase/rh-cursos-api";

function buildClient(data: Array<{ categoria: string | null }>, error: unknown = null) {
  const order = vi.fn(async () => ({ data, error }));
  const not = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ not }));
  const from = vi.fn(() => ({ select }));
  const client = { from } as unknown as Parameters<typeof fetchCourseCategories>[0];

  return { client, from, select, not, order };
}

describe("fetchCourseCategories", () => {
  it("dedupes and sorts distinct categories, excluding nulls", async () => {
    const { client } = buildClient([
      { categoria: "Recursos Humanos" },
      { categoria: "Compliance" },
      { categoria: "Recursos Humanos" },
      { categoria: null },
      { categoria: "Auditoria" }
    ]);

    const result = await fetchCourseCategories(client);

    expect(result).toEqual(["Auditoria", "Compliance", "Recursos Humanos"]);
  });

  it("returns an empty list when there are no categories", async () => {
    const { client } = buildClient([]);

    const result = await fetchCourseCategories(client);

    expect(result).toEqual([]);
  });

  it("queries the curso table filtering out null categories, ordered", async () => {
    const { client, from, select, not, order } = buildClient([{ categoria: "Compliance" }]);

    await fetchCourseCategories(client);

    expect(from).toHaveBeenCalledWith("curso");
    expect(select).toHaveBeenCalledWith("categoria");
    expect(not).toHaveBeenCalledWith("categoria", "is", null);
    expect(order).toHaveBeenCalledWith("categoria");
  });

  it("throws when the query returns an error", async () => {
    const queryError = new Error("boom");
    const { client } = buildClient([], queryError);

    await expect(fetchCourseCategories(client)).rejects.toThrow("boom");
  });
});
