import { z } from "zod";

import { flattenZodErrors } from "@/lib/forms/flatten-zod-errors";

describe("flattenZodErrors", () => {
  const schema = z.object({
    nome: z.string().min(1, "Informe o nome."),
    email: z.string().email("E-mail inválido."),
  });

  it("mapeia cada campo para a primeira mensagem", () => {
    const result = schema.safeParse({ nome: "", email: "nao-email" });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(flattenZodErrors(result.error)).toEqual({
      nome: "Informe o nome.",
      email: "E-mail inválido.",
    });
  });

  it("retorna objeto vazio quando não há erros de campo", () => {
    const result = schema.safeParse({ nome: "Maria", email: "maria@example.com" });

    expect(result.success).toBe(true);
  });

  it("mantém apenas a primeira mensagem por campo", () => {
    const strict = z.object({
      cpf: z.string().min(11, "Mínimo 11.").regex(/^\d+$/, "Só números."),
    });

    const result = strict.safeParse({ cpf: "abc" });
    if (result.success) throw new Error("esperava falha");

    const flattened = flattenZodErrors(result.error);
    expect(Object.keys(flattened)).toEqual(["cpf"]);
  });
});
