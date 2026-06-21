"use server";

import { revalidatePath } from "next/cache";
import { readAdminSettings, writeAdminSettings } from "@/lib/admin-settings";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminFormState = {
  error: string | null;
  success: string | null;
};

const userRoles = new Set(["admin", "professor", "aluno"]);
const ADMIN_ASSETS_BUCKET = "admin-assets";
const MAX_BRAND_ASSET_BYTES = 250 * 1024;
const userStatuses = new Set(["ativo", "pendente", "inativo"]);
const studentTypes = new Set(["PF", "PJ"]);

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

function normalizeStudentType(value: string) {
  return studentTypes.has(value) ? value : "PF";
}

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value.trim();
}

function normalizeDigits(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const digits = value.replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidOptionalCpf(value: string | null) {
  return value === null || value.length === 11;
}

function isValidOptionalPhone(value: string | null) {
  return value === null || (value.length >= 10 && value.length <= 13);
}

function isValidOptionalUuid(value: string | null) {
  return (
    value === null ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
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
  const nome = formData.get("nome");
  const especialidade = formData.get("especialidade");
  const areasAtuacao = listFromText(formData, "areas_atuacao", []);

  if (
    typeof nome !== "string" ||
    typeof especialidade !== "string" ||
    nome.length === 0 ||
    especialidade.length === 0 ||
    areasAtuacao.length === 0
  ) {
    return { error: "Informe nome, especialidade e áreas de atuação.", success: null };
  }

  const supabase = createAdminClient();
  const id = `inst-${Date.now()}`;
  const { error } = await supabase.from("instrutor").insert({
    id,
    nome,
    email: optionalString(formData, "email"),
    telefone: optionalString(formData, "telefone"),
    bio: optionalString(formData, "bio"),
    foto_url: optionalString(formData, "foto_url"),
    formacao: optionalString(formData, "formacao"),
    especialidade,
    areas_atuacao: areasAtuacao,
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
  const titulo = formData.get("titulo");
  const slug = formData.get("slug");
  const modalidade = formData.get("modalidade");
  const nivel = formData.get("nivel");
  const status = formData.get("status");
  const ementa = listFromText(formData, "ementa", []);
  const objetivos = listFromText(formData, "objetivos", []);
  const beneficios = listFromText(formData, "beneficios", []);
  const publicoAlvo = listFromText(formData, "publico_alvo", []);

  if (
    typeof titulo !== "string" ||
    typeof slug !== "string" ||
    typeof modalidade !== "string" ||
    typeof nivel !== "string" ||
    typeof status !== "string" ||
    titulo.length === 0 ||
    slug.length === 0 ||
    modalidade.length === 0 ||
    ementa.length === 0 ||
    objetivos.length === 0 ||
    beneficios.length === 0 ||
    publicoAlvo.length === 0
  ) {
    return { error: "Preencha titulo, slug, modalidade e listas obrigatorias.", success: null };
  }

  const supabase = createAdminClient();
  const id = `course-${Date.now()}`;
  const { error } = await supabase.from("curso").insert({
    id,
    titulo,
    slug: slugify(slug),
    descricao_curta: optionalString(formData, "descricao_curta"),
    descricao: optionalString(formData, "descricao"),
    ementa,
    objetivos,
    beneficios,
    publico_alvo: publicoAlvo,
    categoria: optionalString(formData, "categoria"),
    modalidade,
    nivel,
    trilha_id: optionalString(formData, "trilha_id"),
    trilha_nome: optionalString(formData, "trilha_nome"),
    tipo_publico: optionalString(formData, "tipo_publico"),
    carga_horaria: numberFromForm(formData, "carga_horaria", 0),
    preco_base: numberFromForm(formData, "preco_base", 0),
    status,
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
  const cursoId = formData.get("curso_id");
  const instrutorId = formData.get("instrutor_id");
  const dataInicio = formData.get("data_inicio");
  const dataFim = formData.get("data_fim");
  const horario = formData.get("horario");
  const local = formData.get("local");
  const modalidade = formData.get("modalidade");
  const status = formData.get("status");

  if (
    typeof cursoId !== "string" ||
    typeof instrutorId !== "string" ||
    typeof dataInicio !== "string" ||
    typeof horario !== "string" ||
    typeof local !== "string" ||
    typeof modalidade !== "string" ||
    typeof status !== "string" ||
    cursoId.length === 0 ||
    instrutorId.length === 0 ||
    dataInicio.length === 0 ||
    horario.length === 0 ||
    local.length === 0
  ) {
    return { error: "Preencha os campos obrigatórios da turma.", success: null };
  }

  const supabase = createAdminClient();
  const [courseResult, instructorResult] = await Promise.all([
    supabase.from("curso").select("id").eq("id", cursoId).is("deleted_at", null).maybeSingle(),
    supabase
      .from("instrutor")
      .select("id")
      .eq("id", instrutorId)
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
    curso_id: cursoId,
    instrutor_id: instrutorId,
    data_inicio: dataInicio,
    data_fim:
      typeof dataFim === "string" && dataFim.length > 0 ? dataFim : null,
    horario,
    local,
    vagas_total: numberFromForm(formData, "vagas_total", 0),
    vagas_preenchidas: numberFromForm(formData, "vagas_preenchidas", 0),
    preco_turma: numberFromForm(formData, "preco_turma", 0),
    modalidade,
    status,
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
  const cursoId = formData.get("curso_id");
  const instrutorId = formData.get("instrutor_id");
  const dataInicio = formData.get("data_inicio");
  const dataFim = formData.get("data_fim");
  const horario = formData.get("horario");
  const local = formData.get("local");
  const modalidade = formData.get("modalidade");
  const status = formData.get("status");

  if (
    typeof id !== "string" ||
    typeof cursoId !== "string" ||
    typeof instrutorId !== "string" ||
    typeof dataInicio !== "string" ||
    typeof horario !== "string" ||
    typeof local !== "string" ||
    typeof modalidade !== "string" ||
    typeof status !== "string" ||
    id.length === 0 ||
    cursoId.length === 0 ||
    instrutorId.length === 0 ||
    dataInicio.length === 0
  ) {
    return { error: "Dados insuficientes para atualizar a turma.", success: null };
  }

  const supabase = createAdminClient();
  const [courseResult, instructorResult] = await Promise.all([
    supabase.from("curso").select("id").eq("id", cursoId).is("deleted_at", null).maybeSingle(),
    supabase
      .from("instrutor")
      .select("id")
      .eq("id", instrutorId)
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
      curso_id: cursoId,
      instrutor_id: instrutorId,
      data_inicio: dataInicio,
      data_fim:
        typeof dataFim === "string" && dataFim.length > 0 ? dataFim : null,
      horario,
      local,
      vagas_total: numberFromForm(formData, "vagas_total", 0),
      vagas_preenchidas: numberFromForm(formData, "vagas_preenchidas", 0),
      preco_turma: numberFromForm(formData, "preco_turma", 0),
      modalidade,
      status,
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
  const titulo = formData.get("titulo");
  const slug = formData.get("slug");
  const modalidade = formData.get("modalidade");
  const nivel = formData.get("nivel");
  const status = formData.get("status");
  const destaque = formData.get("destaque");
  const ementa = listFromText(formData, "ementa", []);
  const objetivos = listFromText(formData, "objetivos", []);
  const beneficios = listFromText(formData, "beneficios", []);
  const publicoAlvo = listFromText(formData, "publico_alvo", []);

  if (
    typeof id !== "string" ||
    typeof titulo !== "string" ||
    typeof slug !== "string" ||
    typeof modalidade !== "string" ||
    typeof nivel !== "string" ||
    typeof status !== "string" ||
    id.length === 0 ||
    titulo.length === 0 ||
    slug.length === 0 ||
    ementa.length === 0 ||
    objetivos.length === 0 ||
    beneficios.length === 0 ||
    publicoAlvo.length === 0
  ) {
    return { error: "Dados insuficientes para atualizar o curso.", success: null };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("curso")
    .update({
      titulo,
      slug: slugify(slug),
      descricao_curta: optionalString(formData, "descricao_curta"),
      descricao: optionalString(formData, "descricao"),
      ementa,
      objetivos,
      beneficios,
      publico_alvo: publicoAlvo,
      categoria: optionalString(formData, "categoria"),
      modalidade,
      nivel,
      trilha_id: optionalString(formData, "trilha_id"),
      trilha_nome: optionalString(formData, "trilha_nome"),
      tipo_publico: optionalString(formData, "tipo_publico"),
      carga_horaria: numberFromForm(formData, "carga_horaria", 0),
      preco_base: numberFromForm(formData, "preco_base", 0),
      status,
      destaque: destaque === "on",
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
  const nome = formData.get("nome");
  const especialidade = formData.get("especialidade");
  const status = formData.get("status");
  const areasAtuacao = listFromText(formData, "areas_atuacao", []);

  if (
    typeof id !== "string" ||
    typeof nome !== "string" ||
    typeof especialidade !== "string" ||
    typeof status !== "string" ||
    id.length === 0 ||
    nome.length === 0 ||
    especialidade.length === 0 ||
    areasAtuacao.length === 0
  ) {
    return {
      error: "Dados insuficientes para atualizar o instrutor.",
      success: null,
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("instrutor")
    .update({
      nome,
      email: optionalString(formData, "email"),
      telefone: optionalString(formData, "telefone"),
      bio: optionalString(formData, "bio"),
      foto_url: optionalString(formData, "foto_url"),
      formacao: optionalString(formData, "formacao"),
      especialidade,
      areas_atuacao: areasAtuacao,
      rating: numberFromForm(formData, "rating", 0),
      status,
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
  const nome = readRequiredString(formData, "nome");
  const tipo = readRequiredString(formData, "tipo") || "Contato";

  if (!nome || !tipo) {
    return { error: "Informe nome e tipo do lead.", success: null };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("lead").insert({
    nome,
    email: optionalString(formData, "email"),
    telefone: optionalString(formData, "telefone"),
    tipo,
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
  const nomeCompleto = readRequiredString(formData, "nome_completo");
  const email = readRequiredString(formData, "email").toLowerCase();
  const tipoAluno = normalizeStudentType(readRequiredString(formData, "tipo_aluno"));
  const cpf = normalizeDigits(formData, "cpf");
  const telefone = normalizeDigits(formData, "telefone");
  const userId = optionalString(formData, "user_id");

  if (!nomeCompleto || !email || !tipoAluno || !isValidEmail(email)) {
    return { error: "Informe nome completo, e-mail válido e tipo do aluno.", success: null };
  }

  if (!isValidOptionalCpf(cpf)) {
    return { error: "Informe um CPF com 11 digitos ou deixe em branco.", success: null };
  }

  if (!isValidOptionalPhone(telefone)) {
    return { error: "Informe um telefone com DDD ou deixe em branco.", success: null };
  }

  if (!isValidOptionalUuid(userId)) {
    return { error: "Informe um User ID UUID válido ou deixe em branco.", success: null };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("aluno").insert({
    nome_completo: nomeCompleto,
    email,
    cpf,
    telefone,
    cargo: optionalString(formData, "cargo"),
    orgao: optionalString(formData, "orgao"),
    tipo_aluno: tipoAluno,
    user_id: userId,
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
  const nomeCompleto = readRequiredString(formData, "nome_completo");
  const email = readRequiredString(formData, "email").toLowerCase();
  const tipoAluno = normalizeStudentType(readRequiredString(formData, "tipo_aluno"));
  const cpf = normalizeDigits(formData, "cpf");
  const telefone = normalizeDigits(formData, "telefone");
  const userId = optionalString(formData, "user_id");

  if (!id || !nomeCompleto || !email || !tipoAluno || !isValidEmail(email)) {
    return { error: "Dados insuficientes para atualizar o aluno.", success: null };
  }

  if (!isValidOptionalCpf(cpf)) {
    return { error: "Informe um CPF com 11 digitos ou deixe em branco.", success: null };
  }

  if (!isValidOptionalPhone(telefone)) {
    return { error: "Informe um telefone com DDD ou deixe em branco.", success: null };
  }

  if (!isValidOptionalUuid(userId)) {
    return { error: "Informe um User ID UUID válido ou deixe em branco.", success: null };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("aluno")
    .update({
      nome_completo: nomeCompleto,
      email,
      cpf,
      telefone,
      cargo: optionalString(formData, "cargo"),
      orgao: optionalString(formData, "orgao"),
      tipo_aluno: tipoAluno,
      user_id: userId,
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
  const nome = readRequiredString(formData, "nome");
  const tipo = readRequiredString(formData, "tipo") || "Contato";

  if (!id || !nome || !tipo) {
    return { error: "Dados insuficientes para atualizar o lead.", success: null };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("lead")
    .update({
      nome,
      email: optionalString(formData, "email"),
      telefone: optionalString(formData, "telefone"),
      tipo,
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
  const operationName = formData.get("operationName");
  const commercialEmail = formData.get("commercialEmail");
  const mainLogoUrl = formData.get("mainLogoUrl");
  const faviconUrl = formData.get("faviconUrl");
  const mainLogoFile = getOptionalFile(formData.get("mainLogoFile"));
  const faviconFile = getOptionalFile(formData.get("faviconFile"));
  const dataSource = formData.get("dataSource");
  const priorityChannel = formData.get("priorityChannel");

  if (
    typeof operationName !== "string" ||
    typeof commercialEmail !== "string" ||
    typeof mainLogoUrl !== "string" ||
    typeof faviconUrl !== "string" ||
    typeof dataSource !== "string" ||
    typeof priorityChannel !== "string" ||
    operationName.length === 0 ||
    commercialEmail.length === 0
  ) {
    return {
      error: "Preencha os campos obrigatórios das configurações.",
      success: null,
    };
  }

  const normalizedMainLogoUrl = normalizeAssetUrl(mainLogoUrl);
  const normalizedFaviconUrl = normalizeAssetUrl(faviconUrl);

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
      operationName,
      commercialEmail,
      mainLogoUrl: uploadedMainLogoUrl,
      faviconUrl: uploadedFaviconUrl,
      notifyEnrollments: formData.get("notifyEnrollments") === "on",
      notifyLeads: formData.get("notifyLeads") === "on",
      dataSource,
      priorityChannel,
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
