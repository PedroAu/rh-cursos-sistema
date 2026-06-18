"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type PublicFormState = {
  error: string | null;
  success: string | null;
};

function normalizePaymentMethod(value: string) {
  const map: Record<string, string> = {
    cartao: "Cartao",
    pix: "Pix",
    boleto: "Boleto",
    empenho: "Empenho",
  };

  return map[value.toLowerCase()] ?? value;
}

function normalizeLeadType(value: FormDataEntryValue | null) {
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
  const nome = formData.get("nome");
  const email = formData.get("email");
  const telefone = formData.get("telefone");
  const tipo = formData.get("tipo");
  const mensagem = formData.get("mensagem");
  const temaInteresse = formData.get("tema_interesse");
  const cursoId = formData.get("curso_id");
  const modalidadePreferida = formData.get("modalidade_preferida");
  const objetivoTreinamento = formData.get("objetivo_treinamento");
  const temaTreinamento = formData.get("tema_treinamento");
  const desafiosPrincipais = formData.get("desafios_principais");
  const orgao = formData.get("orgao");
  const numParticipantes = formData.get("num_participantes");
  const origem = formData.get("origem");
  const pathToRevalidate = formData.get("path_to_revalidate");

  if (typeof nome !== "string" || typeof email !== "string") {
    return {
      error: "Preencha pelo menos nome e email.",
      success: null,
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("lead").insert({
    nome,
    email,
    telefone: typeof telefone === "string" ? telefone : null,
    tipo: normalizeLeadType(tipo),
    mensagem: typeof mensagem === "string" ? mensagem : null,
    tema_interesse:
      typeof temaInteresse === "string" && temaInteresse.length > 0
        ? temaInteresse
        : null,
    curso_id:
      typeof cursoId === "string" && cursoId.length > 0 ? cursoId : null,
    modalidade_preferida:
      typeof modalidadePreferida === "string" && modalidadePreferida.length > 0
        ? modalidadePreferida
        : null,
    objetivo_treinamento:
      typeof objetivoTreinamento === "string" && objetivoTreinamento.length > 0
        ? objetivoTreinamento
        : null,
    tema_treinamento:
      typeof temaTreinamento === "string" && temaTreinamento.length > 0
        ? temaTreinamento
        : null,
    desafios_principais:
      typeof desafiosPrincipais === "string" && desafiosPrincipais.length > 0
        ? desafiosPrincipais
        : null,
    orgao: typeof orgao === "string" && orgao.length > 0 ? orgao : null,
    num_participantes:
      typeof numParticipantes === "string" && numParticipantes.length > 0
        ? Number(numParticipantes)
        : null,
    origem: typeof origem === "string" ? origem : "Site RH Cursos",
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
  const nome = formData.get("nome");
  const email = formData.get("email");
  const telefone = formData.get("telefone");
  const cpf = formData.get("cpf");
  const cargo = formData.get("cargo");
  const orgao = formData.get("orgao");
  const empresaRazao = formData.get("empresa_razao");
  const empresaCnpj = formData.get("empresa_cnpj");
  const courseId = formData.get("course_id");
  const turmaId = formData.get("turma_id");
  const pagamentoMetodo = formData.get("pagamento_metodo");
  const aceiteLgpd = formData.get("aceite_lgpd");
  const observacoes = formData.get("observacoes");
  const courseTitle = formData.get("course_title");
  const pathToRevalidate = formData.get("path_to_revalidate");

  if (
    typeof nome !== "string" ||
    typeof email !== "string" ||
    typeof cpf !== "string" ||
    typeof telefone !== "string" ||
    typeof cargo !== "string" ||
    typeof orgao !== "string" ||
    typeof courseId !== "string" ||
    typeof turmaId !== "string" ||
    typeof pagamentoMetodo !== "string" ||
    nome.length === 0 ||
    email.length === 0 ||
    cpf.length === 0 ||
    telefone.length === 0 ||
    cargo.length === 0 ||
    orgao.length === 0 ||
    courseId.length === 0 ||
    turmaId.length === 0 ||
    pagamentoMetodo.length === 0 ||
    aceiteLgpd !== "on"
  ) {
    return {
      error: "Preencha os campos obrigatórios e aceite o tratamento de dados.",
      success: null,
    };
  }

  const rpcResult = await registerEnrollmentViaRpc({
    nome,
    email,
    cpf,
    telefone,
    cargo,
    orgao,
    turmaId,
    pagamentoMetodo,
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
    const { error } = await supabase.from("course_enrollments").insert({
      id: `enr-${Date.now()}`,
      course_id: courseId,
      turma_id: turmaId,
      aluno_nome: nome,
      aluno_email: email,
      aluno_telefone: telefone,
      aluno_cpf: cpf,
      empresa_razao:
        typeof empresaRazao === "string" && empresaRazao.length > 0 ? empresaRazao : null,
      empresa_cnpj:
        typeof empresaCnpj === "string" && empresaCnpj.length > 0 ? empresaCnpj : null,
      orgao,
      pagamento_metodo: pagamentoMetodo,
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

  const { error } = await supabase.from("lead").insert({
    nome,
    email,
    telefone: typeof telefone === "string" ? telefone : null,
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
