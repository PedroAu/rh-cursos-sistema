"use server";

import { revalidatePath } from "next/cache";
import { readAdminSettings, writeAdminSettings } from "@/lib/admin-settings";
import { assertAdminAction } from "@/lib/admin-action-auth";
import { createAdminClient } from "@/lib/supabase/admin";

import type { FormState } from "@/lib/forms/form-state";

export type AdminFormState = FormState;

const userRoles = new Set(["admin", "professor", "aluno"]);
const ADMIN_ASSETS_BUCKET = "admin-assets";
const MAX_BRAND_ASSET_BYTES = 250 * 1024;
const userStatuses = new Set(["ativo", "pendente", "inativo"]);

function unauthorizedAdminFormState(): AdminFormState {
  return {
    error: "Acesso não autorizado.",
    success: null,
  };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeUserRole(value: string) {
  return userRoles.has(value) ? value : "aluno";
}

function normalizeUserStatus(value: string) {
  return userStatuses.has(value) ? value : "pendente";
}

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value.trim();
}

function numberFromForm(formData: FormData, key: string, fallback: number) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    return fallback;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function listFromText(formData: FormData, key: string, fallback: string[]) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return fallback;
  }

  const items = value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : fallback;
}

async function syncProfileRole(userId: string, role: string) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  return supabase.from("profiles").upsert({
    id: userId,
    role,
    created_at: now,
    updated_at: now,
  });
}

async function getExistingUserMetadata(userId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase.auth.admin.getUserById(userId);

  return data.user?.user_metadata ?? {};
}

export async function createSystemUserAction(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const nome = readRequiredString(formData, "nome");
  const email = readRequiredString(formData, "email");
  const password = readRequiredString(formData, "password");
  const role = normalizeUserRole(readRequiredString(formData, "role"));
  const status = normalizeUserStatus(readRequiredString(formData, "status"));

  if (!nome || !email || !password || password.length < 8) {
    return {
      error: "Informe nome, e-mail e senha provisória com pelo menos 8 caracteres.",
      success: null,
    };
  }

  if (!(await assertAdminAction())) {
    return unauthorizedAdminFormState();
  }

  const supabase = createAdminClient();
  const createResult = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: status === "ativo",
    user_metadata: {
      name: nome,
      nome,
      role,
      status,
    },
    app_metadata: {
      role,
    },
  });

  if (createResult.error || !createResult.data.user) {
    return { error: "Não foi possível criar o usuário.", success: null };
  }

  const profileResult = await syncProfileRole(createResult.data.user.id, role);

  if (profileResult.error) {
    return {
      error: "Usuário criado no Auth, mas não foi possível sincronizar o perfil.",
      success: null,
    };
  }

  if (status === "inativo") {
    await supabase.auth.admin.updateUserById(createResult.data.user.id, {
      ban_duration: "876000h",
    });
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");

  return { error: null, success: "Usuário criado com sucesso." };
}

export async function updateSystemUserAction(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const id = readRequiredString(formData, "id");
  const nome = readRequiredString(formData, "nome");
  const email = readRequiredString(formData, "email");
  const role = normalizeUserRole(readRequiredString(formData, "role"));
  const status = normalizeUserStatus(readRequiredString(formData, "status"));

  if (!id || !nome || !email) {
    return { error: "Dados insuficientes para atualizar o usuario.", success: null };
  }

  if (!(await assertAdminAction())) {
    return unauthorizedAdminFormState();
  }

  const supabase = createAdminClient();
  const existingMetadata = await getExistingUserMetadata(id);
  const updateResult = await supabase.auth.admin.updateUserById(id, {
    email,
    ban_duration: status === "inativo" ? "876000h" : "none",
    email_confirm: status === "ativo",
    user_metadata: {
      ...existingMetadata,
      name: nome,
      nome,
      role,
      status,
    },
    app_metadata: {
      role,
    },
  });

  if (updateResult.error) {
    return { error: "Não foi possível atualizar o usuário.", success: null };
  }

  const profileResult = await syncProfileRole(id, role);

  if (profileResult.error) {
    return { error: "Usuário atualizado, mas o perfil não foi sincronizado.", success: null };
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");

  return { error: null, success: "Usuário atualizado com sucesso." };
}

export async function deactivateSystemUserAction(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const id = readRequiredString(formData, "id");

  if (!id) {
    return { error: "Usuário inválido.", success: null };
  }

  if (!(await assertAdminAction())) {
    return unauthorizedAdminFormState();
  }

  const supabase = createAdminClient();
  const existingMetadata = await getExistingUserMetadata(id);
  const { error } = await supabase.auth.admin.updateUserById(id, {
    ban_duration: "876000h",
    user_metadata: {
      ...existingMetadata,
      status: "inativo",
    },
  });

  if (error) {
    return { error: "Não foi possível desativar o usuário.", success: null };
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");

  return { error: null, success: "Usuário desativado com sucesso." };
}

export async function reactivateSystemUserAction(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const id = readRequiredString(formData, "id");

  if (!id) {
    return { error: "Usuário inválido.", success: null };
  }

  if (!(await assertAdminAction())) {
    return unauthorizedAdminFormState();
  }

  const supabase = createAdminClient();
  const existingMetadata = await getExistingUserMetadata(id);
  const { error } = await supabase.auth.admin.updateUserById(id, {
    ban_duration: "none",
    email_confirm: true,
    user_metadata: {
      ...existingMetadata,
      status: "ativo",
    },
  });

  if (error) {
    return { error: "Não foi possível reativar o usuário.", success: null };
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");

  return { error: null, success: "Usuário reativado com sucesso." };
}

export async function createInstructorAction(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const { instrutorSchema } = await import("@/lib/forms/schemas/instrutor");
  const { flattenZodErrors } = await import("@/lib/forms/flatten-zod-errors");

  const parsed = instrutorSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      error: "Informe nome, especialidade e áreas de atuação.",
      success: null,
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  if (!(await assertAdminAction())) {
    return unauthorizedAdminFormState();
  }

  const supabase = createAdminClient();
  const id = `inst-${Date.now()}`;
  const { error } = await supabase.from("instrutor").insert({
    id,
    nome: parsed.data.nome,
    email: optionalString(formData, "email"),
    telefone: optionalString(formData, "telefone"),
    bio: optionalString(formData, "bio"),
    foto_url: optionalString(formData, "foto_url"),
    formacao: optionalString(formData, "formacao"),
    especialidade: parsed.data.especialidade,
    areas_atuacao: listFromText(formData, "areas_atuacao", []),
    rating: numberFromForm(formData, "rating", 0),
    status: readRequiredString(formData, "status") || "Ativo",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { error: "Não foi possível criar o instrutor.", success: null };
  }

  revalidatePath("/admin/professores");
  revalidatePath("/admin");

  return { error: null, success: "Instrutor criado com sucesso." };
}

export async function createCourseAction(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const { cursoSchema } = await import("@/lib/forms/schemas/curso");
  const { flattenZodErrors } = await import("@/lib/forms/flatten-zod-errors");

  const parsed = cursoSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      error: "Preencha titulo, slug, modalidade e listas obrigatórias.",
      success: null,
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  if (!(await assertAdminAction())) {
    return unauthorizedAdminFormState();
  }

  const supabase = createAdminClient();
  const id = `course-${Date.now()}`;
  const { error } = await supabase.from("curso").insert({
    id,
    titulo: parsed.data.titulo,
    slug: slugify(parsed.data.slug),
    descricao_curta: optionalString(formData, "descricao_curta"),
    descricao: optionalString(formData, "descricao"),
    ementa: listFromText(formData, "ementa", []),
    objetivos: listFromText(formData, "objetivos", []),
    beneficios: listFromText(formData, "beneficios", []),
    publico_alvo: listFromText(formData, "publico_alvo", []),
    categoria: optionalString(formData, "categoria"),
    modalidade: parsed.data.modalidade,
    nivel: parsed.data.nivel,
    trilha_id: optionalString(formData, "trilha_id"),
    trilha_nome: optionalString(formData, "trilha_nome"),
    tipo_publico: optionalString(formData, "tipo_publico"),
    carga_horaria: numberFromForm(formData, "carga_horaria", 0),
    preco_base: numberFromForm(formData, "preco_base", 0),
    status: parsed.data.status,
    destaque: formData.get("destaque") === "on",
    imagem_capa: optionalString(formData, "imagem_capa"),
    rating: numberFromForm(formData, "rating", 0),
    total_alunos: numberFromForm(formData, "total_alunos", 0),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { error: "Não foi possível criar o curso.", success: null };
  }

  revalidatePath("/admin/cursos");
  revalidatePath("/admin");

  return { error: null, success: "Curso criado com sucesso." };
}

export async function createTurmaAction(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const { turmaSchema } = await import("@/lib/forms/schemas/turma");
  const { flattenZodErrors } = await import("@/lib/forms/flatten-zod-errors");

  const parsed = turmaSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      error: "Preencha os campos obrigatórios da turma.",
      success: null,
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  if (!(await assertAdminAction())) {
    return unauthorizedAdminFormState();
  }

  const supabase = createAdminClient();
  const [courseResult, instructorResult] = await Promise.all([
    supabase.from("curso").select("id").eq("id", parsed.data.curso_id).is("deleted_at", null).maybeSingle(),
    supabase
      .from("instrutor")
      .select("id")
      .eq("id", parsed.data.instrutor_id)
      .is("deleted_at", null)
      .maybeSingle(),
  ]);

  if (courseResult.error || !courseResult.data) {
    return { error: "Selecione um curso existente antes de criar a turma.", success: null };
  }

  if (instructorResult.error || !instructorResult.data) {
    return { error: "Selecione um professor existente antes de criar a turma.", success: null };
  }

  const { error } = await supabase.from("turma").insert({
    id: `class-${Date.now()}`,
    curso_id: parsed.data.curso_id,
    instrutor_id: parsed.data.instrutor_id,
    data_inicio: parsed.data.data_inicio,
    data_fim:
      typeof formData.get("data_fim") === "string" && (formData.get("data_fim") as string).length > 0
        ? formData.get("data_fim")
        : null,
    horario: parsed.data.horario,
    local: parsed.data.local,
    vagas_total: numberFromForm(formData, "vagas_total", 0),
    vagas_preenchidas: numberFromForm(formData, "vagas_preenchidas", 0),
    preco_turma: numberFromForm(formData, "preco_turma", 0),
    modalidade: parsed.data.modalidade,
    status: parsed.data.status,
    observacoes: optionalString(formData, "observacoes"),
  });

  if (error) {
    return { error: "Não foi possível criar a turma.", success: null };
  }

  revalidatePath("/admin/agenda");
  revalidatePath("/admin/cursos");
  revalidatePath("/admin");

  return { error: null, success: "Turma criada com sucesso." };
}

export async function updateTurmaAction(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return { error: "ID da turma inválido.", success: null };
  }

  const { turmaSchema } = await import("@/lib/forms/schemas/turma");
  const { flattenZodErrors } = await import("@/lib/forms/flatten-zod-errors");

  const parsed = turmaSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      error: "Dados insuficientes para atualizar a turma.",
      success: null,
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  if (!(await assertAdminAction())) {
    return unauthorizedAdminFormState();
  }

  const supabase = createAdminClient();
  const [courseResult, instructorResult] = await Promise.all([
    supabase.from("curso").select("id").eq("id", parsed.data.curso_id).is("deleted_at", null).maybeSingle(),
    supabase
      .from("instrutor")
      .select("id")
      .eq("id", parsed.data.instrutor_id)
      .is("deleted_at", null)
      .maybeSingle(),
  ]);

  if (courseResult.error || !courseResult.data) {
    return { error: "Selecione um curso existente antes de atualizar a turma.", success: null };
  }

  if (instructorResult.error || !instructorResult.data) {
    return { error: "Selecione um professor existente antes de atualizar a turma.", success: null };
  }

  const { error } = await supabase
    .from("turma")
    .update({
      curso_id: parsed.data.curso_id,
      instrutor_id: parsed.data.instrutor_id,
      data_inicio: parsed.data.data_inicio,
      data_fim:
        typeof formData.get("data_fim") === "string" && (formData.get("data_fim") as string).length > 0
          ? formData.get("data_fim")
          : null,
      horario: parsed.data.horario,
      local: parsed.data.local,
      vagas_total: numberFromForm(formData, "vagas_total", 0),
      vagas_preenchidas: numberFromForm(formData, "vagas_preenchidas", 0),
      preco_turma: numberFromForm(formData, "preco_turma", 0),
      modalidade: parsed.data.modalidade,
      status: parsed.data.status,
      observacoes: optionalString(formData, "observacoes"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Não foi possível atualizar a turma.", success: null };
  }

  revalidatePath("/admin/agenda");
  revalidatePath("/admin/cursos");
  revalidatePath("/admin");

  return { error: null, success: "Turma atualizada com sucesso." };
}

export async function updateCourseAction(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return { error: "ID do curso inválido.", success: null };
  }

  const { cursoSchema } = await import("@/lib/forms/schemas/curso");
  const { flattenZodErrors } = await import("@/lib/forms/flatten-zod-errors");

  const parsed = cursoSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      error: "Dados insuficientes para atualizar o curso.",
      success: null,
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  if (!(await assertAdminAction())) {
    return unauthorizedAdminFormState();
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("curso")
    .update({
      titulo: parsed.data.titulo,
      slug: slugify(parsed.data.slug),
      descricao_curta: optionalString(formData, "descricao_curta"),
      descricao: optionalString(formData, "descricao"),
      ementa: listFromText(formData, "ementa", []),
      objetivos: listFromText(formData, "objetivos", []),
      beneficios: listFromText(formData, "beneficios", []),
      publico_alvo: listFromText(formData, "publico_alvo", []),
      categoria: optionalString(formData, "categoria"),
      modalidade: parsed.data.modalidade,
      nivel: parsed.data.nivel,
      trilha_id: optionalString(formData, "trilha_id"),
      trilha_nome: optionalString(formData, "trilha_nome"),
      tipo_publico: optionalString(formData, "tipo_publico"),
      carga_horaria: numberFromForm(formData, "carga_horaria", 0),
      preco_base: numberFromForm(formData, "preco_base", 0),
      status: parsed.data.status,
      destaque: formData.get("destaque") === "on",
      imagem_capa: optionalString(formData, "imagem_capa"),
      rating: numberFromForm(formData, "rating", 0),
      total_alunos: numberFromForm(formData, "total_alunos", 0),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Não foi possível atualizar o curso.", success: null };
  }

  revalidatePath("/admin/cursos");
  revalidatePath("/admin");

  return { error: null, success: "Curso atualizado com sucesso." };
}

export async function updateInstructorAction(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return { error: "ID do instrutor inválido.", success: null };
  }

  const { instrutorSchema } = await import("@/lib/forms/schemas/instrutor");
  const { flattenZodErrors } = await import("@/lib/forms/flatten-zod-errors");

  const parsed = instrutorSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      error: "Dados insuficientes para atualizar o instrutor.",
      success: null,
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  if (!(await assertAdminAction())) {
    return unauthorizedAdminFormState();
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("instrutor")
    .update({
      nome: parsed.data.nome,
      email: optionalString(formData, "email"),
      telefone: optionalString(formData, "telefone"),
      bio: optionalString(formData, "bio"),
      foto_url: optionalString(formData, "foto_url"),
      formacao: optionalString(formData, "formacao"),
      especialidade: parsed.data.especialidade,
      areas_atuacao: listFromText(formData, "areas_atuacao", []),
      rating: numberFromForm(formData, "rating", 0),
      status: parsed.data.status || "Ativo",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Não foi possível atualizar o instrutor.", success: null };
  }

  revalidatePath("/admin/professores");
  revalidatePath("/admin");

  return { error: null, success: "Instrutor atualizado com sucesso." };
}

export async function updateLeadStatusAction(formData: FormData) {
  const leadId = formData.get("lead_id");
  const status = formData.get("status_crm");

  if (
    typeof leadId !== "string" ||
    typeof status !== "string" ||
    leadId.length === 0 ||
    status.length === 0
  ) {
    return;
  }

  if (!(await assertAdminAction())) {
    return;
  }

  const supabase = createAdminClient();
  await supabase
    .from("lead")
    .update({
      status_crm: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function createLeadAction(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const { leadAdminSchema } = await import("@/lib/forms/schemas/lead-admin");
  const { flattenZodErrors } = await import("@/lib/forms/flatten-zod-errors");

  const parsed = leadAdminSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      error: "Informe nome e tipo do lead.",
      success: null,
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  if (!(await assertAdminAction())) {
    return unauthorizedAdminFormState();
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("lead").insert({
    nome: parsed.data.nome,
    email: optionalString(formData, "email"),
    telefone: optionalString(formData, "telefone"),
    tipo: parsed.data.tipo,
    orgao: optionalString(formData, "orgao"),
    num_participantes: numberFromForm(formData, "num_participantes", 0) || null,
    tema_interesse: optionalString(formData, "tema_interesse"),
    curso_id: optionalString(formData, "curso_id"),
    status_crm: readRequiredString(formData, "status_crm") || "Novo",
    mensagem: optionalString(formData, "mensagem"),
    utm_source: optionalString(formData, "utm_source"),
    origem: optionalString(formData, "origem"),
    modalidade_preferida: optionalString(formData, "modalidade_preferida"),
    objetivo_treinamento: optionalString(formData, "objetivo_treinamento"),
    tema_treinamento: optionalString(formData, "tema_treinamento"),
    desafios_principais: optionalString(formData, "desafios_principais"),
    utm_medium: optionalString(formData, "utm_medium"),
    utm_campaign: optionalString(formData, "utm_campaign"),
    utm_term: optionalString(formData, "utm_term"),
    utm_content: optionalString(formData, "utm_content"),
  });

  if (error) {
    return { error: "Não foi possível criar o lead.", success: null };
  }

  revalidatePath("/admin/leads");
  revalidatePath("/admin");

  return { error: null, success: "Lead criado com sucesso." };
}

export async function createAlunoAction(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const { alunoSchema } = await import("@/lib/forms/schemas/aluno");
  const { flattenZodErrors } = await import("@/lib/forms/flatten-zod-errors");

  const parsed = alunoSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      error: "Informe nome completo, e-mail válido e tipo do aluno.",
      success: null,
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  if (!(await assertAdminAction())) {
    return unauthorizedAdminFormState();
  }

  const supabase = createAdminClient();
  const cpfNormalized = parsed.data.cpf ? parsed.data.cpf.replace(/\D/g, "") : null;
  const telefoneNormalized = parsed.data.telefone ? parsed.data.telefone.replace(/\D/g, "") : null;
  const userIdNormalized = parsed.data.user_id && parsed.data.user_id.trim().length > 0 ? parsed.data.user_id : null;

  const { error } = await supabase.from("aluno").insert({
    nome_completo: parsed.data.nome_completo,
    email: parsed.data.email.toLowerCase(),
    cpf: cpfNormalized,
    telefone: telefoneNormalized,
    cargo: optionalString(formData, "cargo"),
    orgao: optionalString(formData, "orgao"),
    tipo_aluno: parsed.data.tipo_aluno,
    user_id: userIdNormalized,
  });

  if (error) {
    return { error: "Não foi possível criar o aluno.", success: null };
  }

  revalidatePath("/admin/alunos");
  revalidatePath("/admin");

  return { error: null, success: "Aluno criado com sucesso." };
}

export async function updateAlunoAction(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const id = readRequiredString(formData, "id");

  if (!id) {
    return { error: "ID do aluno inválido.", success: null };
  }

  const { alunoSchema } = await import("@/lib/forms/schemas/aluno");
  const { flattenZodErrors } = await import("@/lib/forms/flatten-zod-errors");

  const parsed = alunoSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      error: "Dados insuficientes para atualizar o aluno.",
      success: null,
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  if (!(await assertAdminAction())) {
    return unauthorizedAdminFormState();
  }

  const supabase = createAdminClient();
  const cpfNormalized = parsed.data.cpf ? parsed.data.cpf.replace(/\D/g, "") : null;
  const telefoneNormalized = parsed.data.telefone ? parsed.data.telefone.replace(/\D/g, "") : null;
  const userIdNormalized = parsed.data.user_id && parsed.data.user_id.trim().length > 0 ? parsed.data.user_id : null;

  const { error } = await supabase
    .from("aluno")
    .update({
      nome_completo: parsed.data.nome_completo,
      email: parsed.data.email.toLowerCase(),
      cpf: cpfNormalized,
      telefone: telefoneNormalized,
      cargo: optionalString(formData, "cargo"),
      orgao: optionalString(formData, "orgao"),
      tipo_aluno: parsed.data.tipo_aluno,
      user_id: userIdNormalized,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Não foi possível atualizar o aluno.", success: null };
  }

  revalidatePath("/admin/alunos");
  revalidatePath("/admin");

  return { error: null, success: "Aluno atualizado com sucesso." };
}

export async function updateLeadAction(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const id = readRequiredString(formData, "id");

  if (!id) {
    return { error: "ID do lead inválido.", success: null };
  }

  const { leadAdminSchema } = await import("@/lib/forms/schemas/lead-admin");
  const { flattenZodErrors } = await import("@/lib/forms/flatten-zod-errors");

  const parsed = leadAdminSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      error: "Dados insuficientes para atualizar o lead.",
      success: null,
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  if (!(await assertAdminAction())) {
    return unauthorizedAdminFormState();
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("lead")
    .update({
      nome: parsed.data.nome,
      email: optionalString(formData, "email"),
      telefone: optionalString(formData, "telefone"),
      tipo: parsed.data.tipo,
      orgao: optionalString(formData, "orgao"),
      num_participantes: numberFromForm(formData, "num_participantes", 0) || null,
      tema_interesse: optionalString(formData, "tema_interesse"),
      curso_id: optionalString(formData, "curso_id"),
      status_crm: readRequiredString(formData, "status_crm") || "Novo",
      mensagem: optionalString(formData, "mensagem"),
      utm_source: optionalString(formData, "utm_source"),
      origem: optionalString(formData, "origem"),
      modalidade_preferida: optionalString(formData, "modalidade_preferida"),
      objetivo_treinamento: optionalString(formData, "objetivo_treinamento"),
      tema_treinamento: optionalString(formData, "tema_treinamento"),
      desafios_principais: optionalString(formData, "desafios_principais"),
      utm_medium: optionalString(formData, "utm_medium"),
      utm_campaign: optionalString(formData, "utm_campaign"),
      utm_term: optionalString(formData, "utm_term"),
      utm_content: optionalString(formData, "utm_content"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Não foi possível atualizar o lead.", success: null };
  }

  revalidatePath("/admin/leads");
  revalidatePath("/admin");

  return { error: null, success: "Lead atualizado com sucesso." };
}

export async function archiveEntityAction(formData: FormData) {
  const table = formData.get("table");
  const id = formData.get("id");

  if (typeof table !== "string" || typeof id !== "string") {
    return;
  }

  const allowedTables = new Set(["curso", "instrutor", "turma", "lead", "aluno"]);

  if (!allowedTables.has(table)) {
    return;
  }

  if (!(await assertAdminAction())) {
    return;
  }

  const supabase = createAdminClient();
  await supabase
    .from(table)
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/admin/cursos");
  revalidatePath("/admin/professores");
  revalidatePath("/admin/agenda");
  revalidatePath("/admin/leads");
  revalidatePath("/admin/alunos");
  revalidatePath("/admin");
}

export async function restoreEntityAction(formData: FormData) {
  const table = formData.get("table");
  const id = formData.get("id");

  if (typeof table !== "string" || typeof id !== "string") {
    return;
  }

  const allowedTables = new Set(["curso", "instrutor", "turma", "lead", "aluno"]);

  if (!allowedTables.has(table)) {
    return;
  }

  if (!(await assertAdminAction())) {
    return;
  }

  const supabase = createAdminClient();
  await supabase
    .from(table)
    .update({
      deleted_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/admin/cursos");
  revalidatePath("/admin/professores");
  revalidatePath("/admin/agenda");
  revalidatePath("/admin/leads");
  revalidatePath("/admin/alunos");
  revalidatePath("/admin");
}

export async function saveAdminSettingsAction(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const { settingsSchema } = await import("@/lib/forms/schemas/settings");
  const { flattenZodErrors } = await import("@/lib/forms/flatten-zod-errors");

  const parsed = settingsSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      error: "Preencha os campos obrigatórios das configurações.",
      success: null,
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const mainLogoFile = getOptionalFile(formData.get("mainLogoFile"));
  const faviconFile = getOptionalFile(formData.get("faviconFile"));
  const normalizedMainLogoUrl = normalizeAssetUrl(parsed.data.mainLogoUrl ?? "");
  const normalizedFaviconUrl = normalizeAssetUrl(parsed.data.faviconUrl ?? "");

  if (!isValidAssetUrl(normalizedMainLogoUrl, ["svg", "png", "jpg", "jpeg", "webp"])) {
    return {
      error: "Informe uma URL válida para o logo principal em SVG, PNG, JPG ou WebP.",
      success: null,
    };
  }

  if (!isValidAssetUrl(normalizedFaviconUrl, ["ico", "png", "svg"])) {
    return {
      error: "Informe uma URL válida para o favicon em ICO, PNG ou SVG.",
      success: null,
    };
  }

  const logoValidation = validateAssetFile(mainLogoFile, {
    label: "logo principal",
    allowedExtensions: ["svg", "png", "jpg", "jpeg", "webp"],
    allowedTypes: ["image/svg+xml", "image/png", "image/jpeg", "image/webp"],
  });

  if (logoValidation) {
    return {
      error: logoValidation,
      success: null,
    };
  }

  const faviconValidation = validateAssetFile(faviconFile, {
    label: "favicon",
    allowedExtensions: ["ico", "png", "svg"],
    allowedTypes: ["image/x-icon", "image/vnd.microsoft.icon", "image/png", "image/svg+xml"],
  });

  if (faviconValidation) {
    return {
      error: faviconValidation,
      success: null,
    };
  }

  if (!(await assertAdminAction())) {
    return unauthorizedAdminFormState();
  }

  try {
    const current = await readAdminSettings();
    const supabase = mainLogoFile || faviconFile ? createAdminClient() : null;
    const uploadedMainLogoUrl = mainLogoFile
      ? await uploadAdminAsset(supabase, mainLogoFile, "logo")
      : normalizedMainLogoUrl;
    const uploadedFaviconUrl = faviconFile
      ? await uploadAdminAsset(supabase, faviconFile, "favicon")
      : normalizedFaviconUrl;

    await writeAdminSettings({
      ...current,
      operationName: parsed.data.operationName,
      commercialEmail: parsed.data.commercialEmail,
      mainLogoUrl: uploadedMainLogoUrl,
      faviconUrl: uploadedFaviconUrl,
      notifyEnrollments: formData.get("notifyEnrollments") === "on",
      notifyLeads: formData.get("notifyLeads") === "on",
      dataSource: parsed.data.dataSource,
      priorityChannel: parsed.data.priorityChannel,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as configurações.",
      success: null,
    };
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");

  return {
    error: null,
    success: "Configurações salvas com sucesso.",
  };
}

function normalizeAssetUrl(value: string) {
  return value.trim();
}

function isValidAssetUrl(value: string, allowedExtensions: string[]) {
  if (value.length === 0) {
    return true;
  }

  const path = value.startsWith("/") ? value : parseAbsoluteUrlPath(value);

  if (!path || path.includes(" ")) {
    return false;
  }

  const extension = path.split(".").pop()?.toLowerCase();

  return extension ? allowedExtensions.includes(extension) : false;
}

function parseAbsoluteUrlPath(value: string) {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url.pathname;
  } catch {
    return null;
  }
}

function getOptionalFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0 || value.name.length === 0) {
    return null;
  }

  return value;
}

function validateAssetFile(
  file: File | null,
  options: {
    label: string;
    allowedExtensions: string[];
    allowedTypes: string[];
  },
) {
  if (!file) {
    return null;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!extension || !options.allowedExtensions.includes(extension)) {
    return `Envie um arquivo válido para o ${options.label}.`;
  }

  if (file.type && !options.allowedTypes.includes(file.type)) {
    return `Envie um arquivo válido para o ${options.label}.`;
  }

  if (file.size > MAX_BRAND_ASSET_BYTES) {
    return `O arquivo do ${options.label} deve ter no máximo 250 KB.`;
  }

  return null;
}

async function uploadAdminAsset(
  supabase: ReturnType<typeof createAdminClient> | null,
  file: File,
  kind: "logo" | "favicon",
) {
  if (!supabase) {
    throw new Error("Supabase admin client is required for uploads.");
  }

  await ensureAdminAssetsBucket(supabase);

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const filePath = `${kind}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const uploadResult = await supabase.storage
    .from(ADMIN_ASSETS_BUCKET)
    .upload(filePath, file, {
      cacheControl: "31536000",
      contentType: file.type || undefined,
      upsert: true,
    });

  if (uploadResult.error) {
    throw new Error(`Não foi possível enviar o arquivo de ${kind}.`);
  }

  const publicUrlResult = supabase.storage
    .from(ADMIN_ASSETS_BUCKET)
    .getPublicUrl(uploadResult.data.path);

  return publicUrlResult.data.publicUrl;
}

async function ensureAdminAssetsBucket(supabase: ReturnType<typeof createAdminClient>) {
  const bucketResult = await supabase.storage.getBucket(ADMIN_ASSETS_BUCKET);

  if (!bucketResult.error) {
    return;
  }

  const createResult = await supabase.storage.createBucket(ADMIN_ASSETS_BUCKET, {
    public: true,
    fileSizeLimit: MAX_BRAND_ASSET_BYTES,
    allowedMimeTypes: [
      "image/svg+xml",
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/x-icon",
      "image/vnd.microsoft.icon",
    ],
  });

  if (
    createResult.error &&
    !createResult.error.message.toLowerCase().includes("already exists")
  ) {
    throw new Error("Não foi possível preparar o armazenamento de imagens.");
  }
}
