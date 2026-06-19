import {
  formatPrice,
  matchesDateRange,
  matchesExactFilter,
  matchesQuery,
  normalizeStringList,
  normalizeValue,
} from "@/lib/admin-data/filters";

describe("admin data filter helpers", () => {
  it("normalizes accents and case for query matching", () => {
    expect(normalizeValue("Órgão Público")).toBe("orgao publico");
    expect(matchesQuery(["Gestão Pública"], "gestao")).toBe(true);
    expect(matchesQuery(["Folha"], "esocial")).toBe(false);
    expect(matchesQuery(["Folha"], "   ")).toBe(true);
  });

  it("matches exact filters with the todos bypass", () => {
    expect(matchesExactFilter("Aberta", "aberta")).toBe(true);
    expect(matchesExactFilter("Aberta", "todos")).toBe(true);
    expect(matchesExactFilter("Aberta", "fechada")).toBe(false);
  });

  it("matches date ranges using ISO date prefixes", () => {
    expect(matchesDateRange("2026-06-19T10:00:00Z", "2026-06-01", "2026-06-30")).toBe(true);
    expect(matchesDateRange("2026-07-01", "2026-06-01", "2026-06-30")).toBe(false);
    expect(matchesDateRange(null, undefined, undefined)).toBe(true);
    expect(matchesDateRange(null, "2026-06-01", undefined)).toBe(false);
  });

  it("formats empty and positive prices consistently", () => {
    expect(formatPrice(null)).toBe("Sob consulta");
    expect(formatPrice(0)).toBe("Sob consulta");
    expect(formatPrice(199.9)).toBe("R$ 200");
  });

  it("normalizes string list values from strings and object labels", () => {
    expect(
      normalizeStringList([
        "Item direto",
        { title: "Título" },
        { label: "Rótulo" },
        { name: "Nome" },
        { description: "Descrição" },
        "",
        null,
      ]),
    ).toEqual(["Item direto", "Título", "Rótulo", "Nome", "Descrição"]);
  });
});
