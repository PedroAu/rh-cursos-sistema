import type { ZodError } from "zod";

/**
 * Converte um ZodError em `{ campo: primeira mensagem }`.
 *
 * Itera `error.issues` diretamente (estável entre versões do zod) e usa
 * `issue.path[0]` como nome do campo — que deve casar 1:1 com o `name` do
 * input. Mantém apenas a 1ª mensagem por campo (a UI exibe uma por vez).
 */
export function flattenZodErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];

    if (typeof key !== "string" && typeof key !== "number") {
      continue;
    }

    const field = String(key);

    if (!(field in fieldErrors)) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}
