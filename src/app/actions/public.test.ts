import { vi } from "vitest";
import { submitEnrollmentAction, submitLeadAction } from "@/app/actions/public";

const { revalidatePath, createAdminClient } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient,
}));

function buildFormData(entries: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

describe("public actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores a lead and revalidates only safe internal paths", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    createAdminClient.mockReturnValue({
      from: vi.fn(() => ({
        insert,
      })),
    });

    const result = await submitLeadAction(
      { error: null, success: null },
      buildFormData({
        nome: "Maria",
        email: "maria@example.com",
        telefone: "11999999999",
        tipo: "Curso",
        tema_interesse: "Lideranca",
        num_participantes: "12",
        origem: "Landing page",
        path_to_revalidate: "/contato",
      }),
    );

    expect(result).toEqual({
      error: null,
      success: "Recebemos seus dados e entraremos em contato.",
    });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Maria",
        email: "maria@example.com",
        tipo: "Curso",
        num_participantes: 12,
        origem: "Landing page",
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/contato");
  });

  it("stores in company leads with the specific lead type", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    createAdminClient.mockReturnValue({
      from: vi.fn(() => ({
        insert,
      })),
    });

    const result = await submitLeadAction(
      { error: null, success: null },
      buildFormData({
        nome: "Marina",
        email: "marina@example.com",
        telefone: "61999999999",
        tipo: "In Company",
        origem: "In company site RH Cursos",
        path_to_revalidate: "/in-company",
      }),
    );

    expect(result).toEqual({
      error: null,
      success: "Recebemos seus dados e entraremos em contato.",
    });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Marina",
        email: "marina@example.com",
        tipo: "In Company",
        origem: "In company site RH Cursos",
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/in-company");
  });

  it("returns validation error before trying enrollment persistence", async () => {
    const result = await submitEnrollmentAction(
      { error: null, success: null },
      buildFormData({
        nome: "Maria",
        email: "maria@example.com",
      }),
    );

    expect(result).toEqual({
      error: "Preencha os campos obrigatórios e aceite o tratamento de dados.",
      success: null,
    });
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("uses RPC enrollment path when available", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    createAdminClient.mockReturnValue({
      rpc,
    });

    const result = await submitEnrollmentAction(
      { error: null, success: null },
      buildFormData({
        nome: "Maria",
        email: "maria@example.com",
        telefone: "11999999999",
        cpf: "12345678900",
        cargo: "Analista",
        orgao: "Prefeitura",
        course_id: "course-1",
        turma_id: "class-1",
        pagamento_metodo: "pix",
        aceite_lgpd: "on",
        path_to_revalidate: "/inscricao/curso-x",
      }),
    );

    expect(result).toEqual({
      error: null,
      success: "Matrícula registrada com sucesso.",
    });
    expect(rpc).toHaveBeenCalledWith(
      "registrar_inscricao_publica",
      expect.objectContaining({
        p_forma_pagamento: "Pix",
        p_turma_id: "class-1",
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/inscricao/curso-x");
  });

  it("falls back to course_enrollments when RPC fails and the table exists", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const limit = vi.fn().mockResolvedValue({ error: null });
    const select = vi.fn(() => ({ limit }));
    const from = vi.fn((table: string) => {
      if (table === "course_enrollments") {
        return {
          select,
          insert,
        };
      }

      return {
        insert,
      };
    });

    createAdminClient
      .mockReturnValueOnce({
        rpc: vi.fn().mockResolvedValue({ error: { message: "rpc disabled" } }),
      })
      .mockReturnValueOnce({
        from,
      })
      .mockReturnValueOnce({
        from,
      });

    const result = await submitEnrollmentAction(
      { error: null, success: null },
      buildFormData({
        nome: "Maria",
        email: "maria@example.com",
        telefone: "11999999999",
        cpf: "12345678900",
        cargo: "Analista",
        orgao: "Prefeitura",
        empresa_razao: "Empresa X",
        empresa_cnpj: "",
        course_id: "course-1",
        turma_id: "class-1",
        pagamento_metodo: "boleto",
        aceite_lgpd: "on",
      }),
    );

    expect(result).toEqual({
      error: null,
      success: "Inscrição registrada com sucesso.",
    });
    expect(select).toHaveBeenCalledWith("id");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        course_id: "course-1",
        turma_id: "class-1",
        pagamento_metodo: "boleto",
        empresa_razao: "Empresa X",
      }),
    );
  });

  it("falls back to lead creation when enrollment table is unavailable", async () => {
    const leadInsert = vi.fn().mockResolvedValue({ error: null });
    const courseEnrollmentInsert = vi.fn().mockResolvedValue({ error: null });
    const limit = vi.fn().mockResolvedValue({ error: { message: "missing table" } });
    const select = vi.fn(() => ({ limit }));
    const from = vi.fn((table: string) => {
      if (table === "course_enrollments") {
        return {
          select,
          insert: courseEnrollmentInsert,
        };
      }

      if (table === "lead") {
        return {
          insert: leadInsert,
        };
      }

      return {
        insert: vi.fn(),
      };
    });

    createAdminClient
      .mockReturnValueOnce({
        rpc: vi.fn().mockResolvedValue({ error: { message: "rpc disabled" } }),
      })
      .mockReturnValueOnce({
        from,
      })
      .mockReturnValueOnce({
        from,
      });

    const result = await submitEnrollmentAction(
      { error: null, success: null },
      buildFormData({
        nome: "Maria",
        email: "maria@example.com",
        telefone: "11999999999",
        cpf: "12345678900",
        cargo: "Analista",
        orgao: "Prefeitura",
        course_id: "course-1",
        turma_id: "class-1",
        pagamento_metodo: "cartao",
        course_title: "Curso X",
        aceite_lgpd: "on",
        path_to_revalidate: "/inscricao/curso-x",
      }),
    );

    expect(result).toEqual({
      error: null,
      success: "Inscrição recebida e encaminhada para confirmação comercial.",
    });
    expect(courseEnrollmentInsert).not.toHaveBeenCalled();
    expect(leadInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: "Curso",
        curso_id: "course-1",
        tema_interesse: "Inscrição no curso: Curso X",
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/inscricao/curso-x");
  });
});
