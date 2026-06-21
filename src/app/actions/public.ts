"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

import type { FormState } from "@/lib/forms/form-state";

export type PublicFormState = FormState;

function normalizePaymentMethod(value: string) {
  const map: Record<string, string> = {
    cartao: "Cartao",
    pix: "Pix",
    boleto: "Boleto",
    empenho: "Empenho",
  };

  return map[value.toLowerCase()] ?? value;
}

function normalizeLeadType(value: string | null | undefined) {
  if (typeof value !== "string") {
    return "Contato";
  }

  const normalizedValue = value.toLowerCase().trim();

  if (normalizedValue === "curso") {
    return "Curso";
  }

  if (normalizedValue === "in company" || normalizedValue === "in-company") {
    return "In Company";
  }

  if (normalizedValue === "especialista") {
    return "Especialista";
  }

  return "Contato";
}

async function canUseCourseEnrollmentsTable() {
  const supabase = createAdminClient();
  const result = await supabase
    .from("course_enrollments")
    .select("id")
    .limit(1);

  return !result.error;
}

function logEnrollmentFallback(target: "course_enrollments" | "lead") {
  console.warn("[enrollment-fallback]", {
    reason: "registrar_inscricao_publica_failed",
    target,
  });
}

async function registerEnrollmentViaRpc(input: {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  cargo: string;
  orgao: string;
  turmaId: string;
  pagamentoMetodo: string;
  observacoes: string | null;
}) {
  const supabase = createAdminClient();

  return supabase.rpc("registrar_inscricao_publica", {
    p_nome_completo: input.nome,
    p_email: input.email,
    p_cpf: input.cpf,
    p_telefone: input.telefone,
    p_cargo: input.cargo,
    p_orgao: input.orgao,
    p_tipo_aluno: "PF",
    p_turma_id: input.turmaId,
    p_tipo_inscricao: "Pessoa física",
    p_forma_pagamento: normalizePaymentMethod(input.pagamentoMetodo),
    p_observacoes: input.observacoes,
  });
}

export async function submitLeadAction(
  _previousState: PublicFormState,
  formData: FormData,
): Promise<PublicFormState> {
  // Validação com zod
  const { leadSchema } = await import("@/lib/forms/schemas/lead");
  const { flattenZodErrors } = await import("@/lib/forms/flatten-zod-errors");

  const parsed = leadSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      error: "Preencha pelo menos nome e email.",
      success: null,
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const pathToRevalidate = formData.get("path_to_revalidate");

  const supabase = createAdminClient();
  const { error } = await supabase.from("lead").insert({
    nome: parsed.data.nome,
    email: parsed.data.email,
    telefone: parsed.data.telefone ?? null,
    tipo: normalizeLeadType(parsed.data.tipo ?? null),
    mensagem: parsed.data.mensagem ?? null,
    tema_interesse: parsed.data.tema_interesse ?? null,
    curso_id: parsed.data.curso_id ?? null,
    modalidade_preferida: parsed.data.modalidade_preferida ?? null,
    objetivo_treinamento: parsed.data.objetivo_treinamento ?? null,
    tema_treinamento: parsed.data.tema_treinamento ?? null,
    desafios_principais: parsed.data.desafios_principais ?? null,
    orgao: parsed.data.orgao ?? null,
    num_participantes: parsed.data.num_participantes ? Number(parsed.data.num_participantes) : null,
    origem: parsed.data.origem ?? "Site RH Cursos",
    status_crm: "Novo",
  });

  if (error) {
    return {
      error: "Não foi possível enviar agora. Tente novamente em instantes.",
      success: null,
    };
  }

  if (typeof pathToRevalidate === "string" && pathToRevalidate.startsWith("/")) {
    revalidatePath(pathToRevalidate);
  }

  return {
    error: null,
    success: "Recebemos seus dados e entraremos em contato.",
  };
}

export async function submitEnrollmentAction(
  _previousState: PublicFormState,
  formData: FormData,
): Promise<PublicFormState> {
  // Validação com zod (determinística + mensagens por campo)
  const { enrollmentSchema } = await import("@/lib/forms/schemas/enrollment");
  const { flattenZodErrors } = await import("@/lib/forms/flatten-zod-errors");

  const parsed = enrollmentSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      error: "Preencha os campos obrigatórios e aceite o tratamento de dados.",
      success: null,
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  // Extrair dados do form (incluindo hidden fields que o schema não valida)
  const empresaRazao = formData.get("empresa_razao");
  const empresaCnpj = formData.get("empresa_cnpj");
  const courseId = formData.get("course_id");
  const courseTitle = formData.get("course_title");
  const pathToRevalidate = formData.get("path_to_revalidate");
  const cargo = formData.get("cargo");
  const orgao = formData.get("orgao");
  const observacoes = formData.get("observacoes");

  const rpcResult = await registerEnrollmentViaRpc({
    nome: parsed.data.nome,
    email: parsed.data.email,
    cpf: parsed.data.cpf,
    telefone: parsed.data.telefone,
    cargo: typeof cargo === "string" ? cargo : "Participante",
    orgao: typeof orgao === "string" ? orgao : "Não informado",
    turmaId: parsed.data.turma_id,
    pagamentoMetodo: parsed.data.pagamento_metodo,
    observacoes:
      typeof observacoes === "string" && observacoes.length > 0 ? observacoes : null,
  });

  if (!rpcResult.error) {
    if (typeof pathToRevalidate === "string" && pathToRevalidate.startsWith("/")) {
      revalidatePath(pathToRevalidate);
    }

    return {
      error: null,
      success: "Matrícula registrada com sucesso.",
    };
  }

  const supabase = createAdminClient();

  if (await canUseCourseEnrollmentsTable()) {
    logEnrollmentFallback("course_enrollments");

    const { error } = await supabase.from("course_enrollments").insert({
      id: `enr-${Date.now()}`,
      course_id: courseId,
      turma_id: parsed.data.turma_id,
      aluno_nome: parsed.data.nome,
      aluno_email: parsed.data.email,
      aluno_telefone: parsed.data.telefone,
      aluno_cpf: parsed.data.cpf,
      empresa_razao:
        typeof empresaRazao === "string" && empresaRazao.length > 0 ? empresaRazao : null,
      empresa_cnpj:
        typeof empresaCnpj === "string" && empresaCnpj.length > 0 ? empresaCnpj : null,
      orgao: typeof orgao === "string" ? orgao : "Não informado",
      pagamento_metodo: parsed.data.pagamento_metodo,
      aceite_lgpd: true,
      observacoes:
        typeof observacoes === "string" && observacoes.length > 0 ? observacoes : null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return {
        error: "Não foi possível concluir a inscrição agora.",
        success: null,
      };
    }

    if (typeof pathToRevalidate === "string" && pathToRevalidate.startsWith("/")) {
      revalidatePath(pathToRevalidate);
    }

    return {
      error: null,
      success: "Inscrição registrada com sucesso.",
    };
  }

  logEnrollmentFallback("lead");

  const { error } = await supabase.from("lead").insert({
    nome: parsed.data.nome,
    email: parsed.data.email,
    telefone: parsed.data.telefone,
    tipo: "Curso",
    mensagem:
      typeof observacoes === "string" && observacoes.length > 0
        ? observacoes
        : `Inscrição registrada para ${typeof courseTitle === "string" ? courseTitle : "curso"}.`,
    tema_interesse:
      typeof courseTitle === "string" ? `Inscrição no curso: ${courseTitle}` : "Inscrição",
    curso_id: courseId,
    orgao: typeof orgao === "string" && orgao.length > 0 ? orgao : null,
    origem: "Inscrição site RH Cursos",
    status_crm: "Novo",
  });

  if (error) {
    return {
      error: "Não foi possível registrar a inscrição agora.",
      success: null,
    };
  }

  if (typeof pathToRevalidate === "string" && pathToRevalidate.startsWith("/")) {
    revalidatePath(pathToRevalidate);
  }

  return {
    error: null,
    success: "Inscrição recebida e encaminhada para confirmação comercial.",
  };
}
