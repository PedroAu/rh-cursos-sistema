"use server";

import { z } from "zod";

/**
 * Schema para turma (create + update).
 * Severidade: presença + não-vazio para campos obrigatórios.
 */
export const turmaSchema = z.object({
  curso_id: z.string().min(1, "Selecione um curso."),
  instrutor_id: z.string().min(1, "Selecione um professor."),
  data_inicio: z.string().min(1, "Informe a data de início."),
  horario: z.string().min(1, "Informe o horário."),
  local: z.string().min(1, "Informe o local."),
  modalidade: z.string().min(1, "Selecione a modalidade."),
  status: z.string().min(1, "Selecione o status."),
  data_fim: z.string().optional(),
  vagas_total: z.string().optional(),
  vagas_preenchidas: z.string().optional(),
  preco_turma: z.string().optional(),
  observacoes: z.string().optional(),
}).passthrough();

export type TurmaInput = z.infer<typeof turmaSchema>;
