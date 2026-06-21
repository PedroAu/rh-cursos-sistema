"use server";

import { z } from "zod";

/**
 * Schema para configurações do admin.
 * Severidade: presença + não-vazio para campos obrigatórios.
 */
export const settingsSchema = z.object({
  operationName: z.string().min(1, "Informe o nome da operação."),
  commercialEmail: z.string().min(1, "Informe o e-mail comercial."),
  mainLogoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  dataSource: z.string().min(1, "Selecione a fonte de dados."),
  priorityChannel: z.string().min(1, "Selecione o canal de prioridade."),
  notifyEnrollments: z.literal("on").optional(),
  notifyLeads: z.literal("on").optional(),
  mainLogoFile: z.any().optional(),
  faviconFile: z.any().optional(),
}).passthrough();

export type SettingsInput = z.infer<typeof settingsSchema>;
