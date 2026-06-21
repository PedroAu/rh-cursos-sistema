"use server";

import { z } from "zod";

/**
 * Schema para formulário de lead (public-lead-form).
 * Severidade: presença + não-vazio.
 */
export const leadSchema = z.object({
  nome: z.string().min(1, "Informe o nome."),
  email: z.string().email("E-mail inválido."),
  telefone: z.string().optional(),
  tipo: z.string().optional(),
  mensagem: z.string().optional(),
  tema_interesse: z.string().optional(),
  curso_id: z.string().optional(),
  modalidade_preferida: z.string().optional(),
  objetivo_treinamento: z.string().optional(),
  tema_treinamento: z.string().optional(),
  desafios_principais: z.string().optional(),
  orgao: z.string().optional(),
  num_participantes: z.string().optional(),
  origem: z.string().optional(),
}).passthrough();

export type LeadInput = z.infer<typeof leadSchema>;
