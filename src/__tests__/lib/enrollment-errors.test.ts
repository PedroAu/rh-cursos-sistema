import { describe, expect, it } from "vitest";

import { getEnrollmentErrorMessage } from "../../../supabase/functions/_shared/enrollment-errors";

describe("getEnrollmentErrorMessage", () => {
  it("classifica a turma não encontrada", () => {
    expect(getEnrollmentErrorMessage({ code: "P0001" })).toBe("Turma não encontrada.");
  });

  it("classifica turma sem vagas pelo código ou pela mensagem", () => {
    expect(getEnrollmentErrorMessage({ code: "P0003" })).toBe("Turma sem vagas disponíveis.");
    expect(
      getEnrollmentErrorMessage({
        message: "Turma não está disponível para inscrição (status: Encerrada).",
      })
    ).toBe("Turma não está disponível para inscrição.");
  });

  it("classifica inscrição duplicada", () => {
    expect(getEnrollmentErrorMessage({ code: "P0004" })).toBe(
      "Aluno já possui inscrição ativa nesta turma."
    );
  });

  it("classifica a violação bruta do índice único de duplicidade sob concorrência (REC-107)", () => {
    expect(
      getEnrollmentErrorMessage({
        code: "23505",
        message:
          'duplicate key value violates unique constraint "inscricao_aluno_turma_active_idx"',
      })
    ).toBe("Aluno já possui inscrição ativa nesta turma.");
  });

  it("retorna null para erros desconhecidos", () => {
    expect(getEnrollmentErrorMessage({ code: "XX001", message: "falha inesperada" })).toBeNull();
  });
});
