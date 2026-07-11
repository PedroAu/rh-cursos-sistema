type EnrollmentRpcErrorLike = {
  code?: string;
  message?: string;
};

const enrollmentErrorMatchers = [
  {
    code: "P0001",
    needle: "turma não encontrada",
    message: "Turma não encontrada.",
  },
  {
    code: "P0002",
    needle: "turma não está disponível para inscrição",
    message: "Turma não está disponível para inscrição.",
  },
  {
    code: "P0003",
    needle: "turma sem vagas disponíveis",
    message: "Turma sem vagas disponíveis.",
  },
  {
    code: "P0004",
    needle: "aluno já possui inscrição ativa nesta turma",
    message: "Aluno já possui inscrição ativa nesta turma.",
  },
] as const;

export function getEnrollmentErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;

  const typedError = error as EnrollmentRpcErrorLike;
  const code = typeof typedError.code === "string" ? typedError.code : null;
  const rawMessage = typeof typedError.message === "string" ? typedError.message.toLowerCase() : "";

  for (const matcher of enrollmentErrorMatchers) {
    if (code === matcher.code) return matcher.message;
    if (rawMessage.includes(matcher.needle)) return matcher.message;
  }

  return null;
}

