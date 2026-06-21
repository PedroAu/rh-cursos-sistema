"use server";

import { z } from "zod";

/**
 * Schema para instrutor (create + update).
 * Severidade: presença + não-vazio para campos obrigatórios.
 */
export const instrutorSchema = z.object({
  nome: z.string().min(1, "Informe o nome do instrutor."),
  especialidade: z.string().min(1, "Informe a especialidade."),
  areas_atuacao: z.string().min(1, "Informe as áreas de atuação."),
  email: z.string().optional(),
  telefone: z.string().optional(),
  bio: z.string().optional(),
  foto_url: z.string().optional(),
  formacao: z.string().optional(),
  rating: z.string().optional(),
  status: z.string().optional(),
}).passthrough();

export type InstrutorInput = z.infer<typeof instrutorSchema>;
