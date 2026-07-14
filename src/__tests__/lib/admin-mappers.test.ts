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

  it("omits the enrollment-managed student counter from ordinary admin saves", () => {
    const payload = courseToUpsert({
      title: "Curso existente",
      pathId: "path-dp",
      level: "Básico",
      status: "Ativo",
    });

    expect(payload).not.toHaveProperty("total_alunos");
  });

  it("maps the student counter only when an explicit trusted caller supplies it", () => {
    const payload = courseToUpsert({
      title: "Curso importado",
      pathId: "path-dp",
      level: "Básico",
      status: "Ativo",
      studentsCount: 42,
    });

    expect(payload.total_alunos).toBe(42);
  });
});
