"use server";

import { z } from "zod";

/**
 * Schema para lead no admin (create + update).
 * Severidade: presença + não-vazio para nome e tipo.
 */
export const leadAdminSchema = z.object({
  nome: z.string().min(1, "Informe o nome do lead."),
  tipo: z.string().min(1, "Selecione o tipo de lead."),
  email: z.string().optional(),
  telefone: z.string().optional(),
  orgao: z.string().optional(),
  num_participantes: z.string().optional(),
  tema_interesse: z.string().optional(),
  curso_id: z.string().optional(),
  status_crm: z.string().optional(),
  mensagem: z.string().optional(),
  utm_source: z.string().optional(),
  origem: z.string().optional(),
  modalidade_preferida: z.string().optional(),
  objetivo_treinamento: z.string().optional(),
  tema_treinamento: z.string().optional(),
  desafios_principais: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
}).passthrough();

export type LeadAdminInput = z.infer<typeof leadAdminSchema>;
