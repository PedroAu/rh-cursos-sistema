"use server";

import { z } from "zod";

/**
 * Schema para curso (create + update).
 * Severidade: presença + não-vazio para campos obrigatórios.
 */
export const cursoSchema = z.object({
  titulo: z.string().min(1, "Informe o título do curso."),
  slug: z.string().min(1, "Informe o slug."),
  modalidade: z.string().min(1, "Selecione a modalidade."),
  nivel: z.string().min(1, "Selecione o nível."),
  status: z.string().min(1, "Selecione o status."),
  ementa: z.string().min(1, "Informe a ementa do curso."),
  objetivos: z.string().min(1, "Informe os objetivos do curso."),
  beneficios: z.string().min(1, "Informe os benefícios do curso."),
  publico_alvo: z.string().min(1, "Informe o público alvo."),
  descricao_curta: z.string().optional(),
  descricao: z.string().optional(),
  categoria: z.string().optional(),
  trilha_id: z.string().optional(),
  trilha_nome: z.string().optional(),
  tipo_publico: z.string().optional(),
  carga_horaria: z.string().optional(),
  preco_base: z.string().optional(),
  imagem_capa: z.string().optional(),
  rating: z.string().optional(),
  total_alunos: z.string().optional(),
  destaque: z.literal("on").optional(),
}).passthrough();

export type CursoInput = z.infer<typeof cursoSchema>;
