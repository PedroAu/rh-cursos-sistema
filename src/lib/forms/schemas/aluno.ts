"use server";

import { z } from "zod";

/**
 * Schema para criação/edição de aluno (admin-aluno-form).
 * Severidade: presença + não-vazio, mesmo que o código manual em admin.ts.
 */
export const alunoSchema = z.object({
  nome_completo: z.string().min(1, "Informe o nome completo."),
  email: z.string().email("E-mail inválido."),
  cpf: z.string().optional().refine(
    (v) => !v || v.replace(/\D/g, "").length === 11,
    "Informe um CPF com 11 dígitos ou deixe em branco."
  ),
  telefone: z.string().optional().refine(
    (v) => !v || (v.replace(/\D/g, "").length >= 10 && v.replace(/\D/g, "").length <= 13),
    "Informe um telefone com DDD ou deixe em branco."
  ),
  cargo: z.string().optional(),
  orgao: z.string().optional(),
  tipo_aluno: z.enum(["PF", "PJ"], { message: "Tipo de aluno inválido." }),
  user_id: z.string().optional().refine(
    (v) => !v || /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v),
    "Informe um User ID UUID válido ou deixe em branco."
  ),
});

export type AlunoInput = z.infer<typeof alunoSchema>;
