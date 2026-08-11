import { describe, expect, it } from "vitest";

import { getPublicCourseName } from "@/lib/seo";

describe("SEO de cursos", () => {
  it("expande o prefixo de curso e a sigla DP", () => {
    expect(getPublicCourseName("eSocial Leiaute 1.3")).toBe("Curso de eSocial Leiaute 1.3");
    expect(getPublicCourseName("DP na Prática (CLT)")).toBe("Curso de Departamento Pessoal na Prática (CLT)");
  });

  it("não duplica o prefixo quando o título já está padronizado", () => {
    expect(getPublicCourseName("Curso de Folha de Pagamento")).toBe("Curso de Folha de Pagamento");
  });
});
