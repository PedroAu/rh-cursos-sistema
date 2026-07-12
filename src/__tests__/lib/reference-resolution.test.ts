import { describe, expect, it } from "vitest";

import { AdminResourceError } from "../../../supabase/functions/_shared/admin-resource-errors";
import { normalizeSearchText, resolveUniqueId } from "../../../supabase/functions/_shared/reference-resolution";

describe("reference-resolution", () => {
  const rows = [
    { id: "course-1", slug: "esocial-basico", titulo: "eSocial Básico" },
    { id: "course-2", slug: "esocial-avancado", titulo: "eSocial Avançado" },
    { id: "course-3", slug: "gestao-publica", titulo: "Gestão Pública" },
  ];

  it("normalizes accents and punctuation before matching", () => {
    expect(normalizeSearchText("eSocial Básico!")).toBe("esocial basico");
  });

  it("resolves an exact identifier without fuzzy ambiguity", () => {
    expect(
      resolveUniqueId(
        rows,
        "course-1",
        "Curso",
        [
          (row, rawReference) => row.id === rawReference,
          (row, rawReference) => row.slug === rawReference,
          (row, _rawReference, normalizedReference) =>
            normalizeSearchText(String(row.slug ?? "")) === normalizedReference ||
            normalizeSearchText(String(row.titulo ?? "")) === normalizedReference,
        ],
        (row) => normalizeSearchText(`${row.slug ?? ""} ${row.titulo ?? ""}`)
      )
    ).toBe("course-1");
  });

  it("rejects ambiguous fuzzy matches instead of picking the first row", () => {
    expect(() =>
      resolveUniqueId(
        rows,
        "eSocial",
        "Curso",
        [
          (row, rawReference) => row.id === rawReference,
          (row, rawReference) => row.slug === rawReference,
          (row, _rawReference, normalizedReference) =>
            normalizeSearchText(String(row.slug ?? "")) === normalizedReference ||
            normalizeSearchText(String(row.titulo ?? "")) === normalizedReference,
        ],
        (row) => normalizeSearchText(`${row.slug ?? ""} ${row.titulo ?? ""}`)
      )
    ).toThrow(AdminResourceError);
  });

  it("rejects references that cannot be resolved", () => {
    expect(() =>
      resolveUniqueId(
        rows,
        "curso inexistente",
        "Curso",
        [
          (row, rawReference) => row.id === rawReference,
          (row, rawReference) => row.slug === rawReference,
          (row, _rawReference, normalizedReference) =>
            normalizeSearchText(String(row.slug ?? "")) === normalizedReference ||
            normalizeSearchText(String(row.titulo ?? "")) === normalizedReference,
        ],
        (row) => normalizeSearchText(`${row.slug ?? ""} ${row.titulo ?? ""}`)
      )
    ).toThrow("Curso não encontrado para \"curso inexistente\".");
  });
});
