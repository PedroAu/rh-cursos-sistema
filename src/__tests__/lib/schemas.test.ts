import { describe, expect, it } from "vitest";

import { publicCourseSchema } from "@/lib/supabase/schemas";

const validCourseRow = {
  id: "course-1",
  titulo: "Curso de Teste",
  slug: "curso-de-teste",
  descricao_curta: "Resumo",
  descricao: "Descricao completa",
  ementa: [],
  objetivos: [],
  beneficios: [],
  publico_alvo: [],
  carga_horaria: 8,
  modalidade: "Online",
  nivel: "Basico",
  categoria: "Tecnologia",
  categorias: ["Tecnologia", "Gestão Pública"],
  trilha_id: "path-tech",
  trilha_nome: null,
  preco_base: 1200,
  status: "Ativo",
  destaque: false,
  imagem_capa: null,
  rating: 4.5,
  total_alunos: 10,
};

describe("publicCourseSchema", () => {
  it("keeps categorias intact instead of stripping it at the validation boundary [Story ADR015-F3]", () => {
    const parsed = publicCourseSchema.parse(validCourseRow);

    expect(parsed.categorias).toEqual(["Tecnologia", "Gestão Pública"]);
  });

  it("defaults categorias to an empty array for legacy rows selected before the migration ran", () => {
    const { categorias: _categorias, ...legacyRow } = validCourseRow;

    const parsed = publicCourseSchema.parse(legacyRow);

    expect(parsed.categorias).toEqual([]);
  });
});
