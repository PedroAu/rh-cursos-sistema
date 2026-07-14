import { describe, expect, it } from "vitest";

import { courseToUpsert } from "../../../supabase/functions/_shared/admin-mappers";

describe("courseToUpsert", () => {
  it("persists every selected modality while keeping the primary legacy field coherent", () => {
    const payload = courseToUpsert({
      title: "Curso multimodal",
      pathId: "path-dp",
      level: "Básico",
      status: "Ativo",
      modalities: ["Presencial", "Ao vivo online", "Gravado"],
    });

    expect(payload.modalidade).toBe("Presencial");
    expect(payload.modalidades).toEqual(["Presencial", "Online", "Gravado"]);
  });

  it("falls back to the singular modality only for legacy callers", () => {
    const payload = courseToUpsert({
      title: "Curso legado",
      pathId: "path-dp",
      level: "Básico",
      status: "Ativo",
      modality: "Híbrido",
    });

    expect(payload.modalidade).toBe("Hibrido");
    expect(payload.modalidades).toEqual(["Hibrido"]);
  });
});
