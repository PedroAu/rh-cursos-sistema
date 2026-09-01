"use server";

import { z } from "zod";

/**
 * Schema para formulário de lead (public-lead-form).
 * Severidade: presença + não-vazio.
 */
export const leadSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome.").max(120, "Nome muito longo."),
  email: z.string().trim().email("E-mail inválido.").max(254, "E-mail muito longo."),
  telefone: z.string().max(30, "Telefone inválido.").optional(),
  tipo: z.string().max(40, "Tipo inválido.").optional(),
  mensagem: z.string().max(2000, "Mensagem muito longa.").optional(),
  tema_interesse: z.string().max(200, "Tema muito longo.").optional(),
  curso_id: z.string().max(120, "Curso inválido.").optional(),
  modalidade_preferida: z.string().max(80, "Modalidade inválida.").optional(),
  objetivo_treinamento: z.string().max(500, "Objetivo muito longo.").optional(),
  tema_treinamento: z.string().max(200, "Tema muito longo.").optional(),
  desafios_principais: z.string().max(2000, "Desafios muito longos.").optional(),
  orgao: z.string().max(200, "Órgão muito longo.").optional(),
  num_participantes: z.string().regex(/^\d{1,5}$/, "Número de participantes inválido.").optional(),
  origem: z.string().max(100, "Origem inválida.").optional(),
}).passthrough();

export type LeadInput = z.infer<typeof leadSchema>;
