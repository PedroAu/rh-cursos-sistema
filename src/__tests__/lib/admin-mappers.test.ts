import { describe, expect, it } from "vitest";

import { courseToUpsert } from "../../../supabase/functions/_shared/admin-mappers";

describe("courseToUpsert", () => {
  it("persists every selected modality while keeping the primary legacy field coherent", () => {
    const payload = courseToUpsert(
      {
        title: "Curso multimodal",
        pathId: "path-dp",
        level: "Básico",
        status: "Ativo",
        modalities: ["Presencial", "Ao vivo online", "Gravado"],
      },
      "Departamento Pessoal"
    );

    expect(payload.modalidade).toBe("Presencial");
    expect(payload.modalidades).toEqual(["Presencial", "Online", "Gravado"]);
  });

  it("falls back to the singular modality only for legacy callers", () => {
    const payload = courseToUpsert(
      {
        title: "Curso legado",
        pathId: "path-dp",
        level: "Básico",
        status: "Ativo",
        modality: "Híbrido",
      },
      "Departamento Pessoal"
    );

    expect(payload.modalidade).toBe("Hibrido");
    expect(payload.modalidades).toEqual(["Hibrido"]);
  });

  it("persists every selected category while keeping the primary legacy field coherent [Story ADR015-F3]", () => {
    const payload = courseToUpsert(
      {
        title: "Curso multicategoria",
        pathId: "path-dp",
        level: "Básico",
        status: "Ativo",
        categories: ["Tecnologia", "Gestão Pública"],
      },
      "Departamento Pessoal"
    );

    expect(payload.categoria).toBe("Tecnologia");
    expect(payload.categorias).toEqual(["Tecnologia", "Gestão Pública"]);
  });

  it("falls back to the singular category only for legacy callers [Story ADR015-F3]", () => {
    const payload = courseToUpsert(
      {
        title: "Curso legado",
        pathId: "path-dp",
        level: "Básico",
        status: "Ativo",
        category: "Saúde",
      },
      "Departamento Pessoal"
    );

    expect(payload.categoria).toBe("Saúde");
    expect(payload.categorias).toEqual(["Saúde"]);
  });

  it("persists an empty categorias array when no category is provided [Story ADR015-F3]", () => {
    const payload = courseToUpsert(
      {
        title: "Curso sem categoria",
        pathId: "path-dp",
        level: "Básico",
        status: "Ativo",
      },
      "Departamento Pessoal"
    );

    expect(payload.categorias).toEqual([]);
  });

  it("omits the enrollment-managed student counter from ordinary admin saves", () => {
    const payload = courseToUpsert(
      {
        title: "Curso existente",
        pathId: "path-dp",
        level: "Básico",
        status: "Ativo",
      },
      "Departamento Pessoal"
    );

    expect(payload).not.toHaveProperty("total_alunos");
  });

  it("maps the student counter only when an explicit trusted caller supplies it", () => {
    const payload = courseToUpsert(
      {
        title: "Curso importado",
        pathId: "path-dp",
        level: "Básico",
        status: "Ativo",
        studentsCount: 42,
      },
      "Departamento Pessoal"
    );

    expect(payload.total_alunos).toBe(42);
  });

  it("ignores a stale pathName from the client payload and uses the server-resolved trilha name [Story 17.4]", () => {
    const payload = courseToUpsert(
      {
        title: "Curso com trilha trocada",
        pathId: "path-gestao-publica",
        pathName: "Departamento Pessoal", // valor antigo, reenviado por spread do form
        level: "Básico",
        status: "Ativo",
      },
      "Gestão Pública" // resolvido no servidor a partir de path-gestao-publica
    );

    expect(payload.trilha_id).toBe("path-gestao-publica");
    expect(payload.trilha_nome).toBe("Gestão Pública");
  });
});
