import type { SupabaseClient } from "@supabase/supabase-js";

import type { Enrollment, EnrollmentStatus, Student } from "@/types";

/**
 * Read models administrativos de alunos e inscrições (REC-303 — fecha FND-08).
 *
 * FND-08: as listas administrativas de alunos/inscrições não hidratam após
 * reload porque, até REC-206, NÃO existia leitura server-side desses dados —
 * `admin-resources` `list` só atendia `leads` (todo o resto retornava
 * `{ skipped: true }`) e o `app-store` nascia com `students: []`/`enrollments: []`
 * sem nenhum caminho de re-hidratação. Este módulo constrói esse caminho: a
 * projeção DB→domínio (uma linha por `inscricao`, com `aluno`/`turma` embutidos)
 * paginada e filtrável, consultada com o cliente privilegiado server-side.
 *
 * Escopo (Article IV — No Invention): os filtros expostos (turma, status, busca
 * por nome/email) e a forma de `Enrollment`/`Student` derivam exatamente do que
 * a UI administrativa já consome (`src/types` + `AdminResourcePage`); nenhum
 * campo ou filtro novo é inventado.
 */

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Colunas de `inscricao` + embeds `aluno`/`turma` necessários ao domínio. */
const ENROLLMENT_SELECT =
  "id,aluno_id,turma_id,status_inscricao,forma_pagamento,tipo_inscricao,observacoes,certificado_emitido,created_at," +
  "aluno:aluno_id!inner(nome_completo,email,cpf,telefone,cargo,orgao,tipo_aluno)," +
  "turma:turma_id!inner(curso_id)";

type AlunoEmbed = {
  nome_completo: string | null;
  email: string | null;
  cpf: string | null;
  telefone: string | null;
  cargo: string | null;
  orgao: string | null;
  tipo_aluno: "PF" | "PJ" | "Servidor" | null;
};

type TurmaEmbed = { curso_id: string | null };

/**
 * PostgREST devolve o embed como objeto (1:1) mas o tipo gerado pode ser
 * `objeto | array` dependendo da inferência da FK; normalizamos aqui.
 */
type EnrollmentJoinedRow = {
  id: string;
  aluno_id: string;
  turma_id: string;
  status_inscricao: string;
  forma_pagamento: string | null;
  tipo_inscricao: string | null;
  observacoes: string | null;
  certificado_emitido: boolean | null;
  created_at: string;
  aluno: AlunoEmbed | AlunoEmbed[] | null;
  turma: TurmaEmbed | TurmaEmbed[] | null;
};

function firstOf<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

/** DB `status_inscricao` → domínio `EnrollmentStatus` (inverso de `toDbEnrollmentStatus`). */
export function fromDbEnrollmentStatus(value: string | null): EnrollmentStatus {
  switch (value) {
    case "Confirmada":
      return "Confirmada";
    case "Cancelada":
      return "Cancelada";
    case "Concluida":
      return "Concluída";
    case "AguardandoPagamento":
      return "Aguardando pagamento";
    case "Pendente":
    case "ListaEspera":
    default:
      return "Pendente";
  }
}

/** DB `tipo_aluno` → domínio `enrollmentType` (inverso de `toDbStudentType`). */
export function fromDbStudentType(value: string | null): Enrollment["enrollmentType"] {
  if (value === "PJ") return "Empresa";
  if (value === "Servidor") return "Órgão público";
  return "Pessoa física";
}

/** DB `forma_pagamento` → domínio `paymentMethod` (inverso de `toDbPaymentMethod`). */
export function fromDbPaymentMethod(value: string | null): Enrollment["paymentMethod"] {
  if (value === "Cartao") return "Cartão";
  if (value === "Pix" || value === "Boleto" || value === "Empenho") return value;
  return null;
}

export function mapDbEnrollment(row: EnrollmentJoinedRow): Enrollment {
  const aluno = firstOf(row.aluno);
  const turma = firstOf(row.turma);
  return {
    id: row.id,
    studentName: aluno?.nome_completo ?? "",
    email: aluno?.email ?? "",
    phone: aluno?.telefone ?? "",
    cpf: aluno?.cpf ?? "",
    organization: aluno?.orgao ?? "",
    jobTitle: aluno?.cargo ?? "",
    enrollmentType: fromDbStudentType(aluno?.tipo_aluno ?? null),
    paymentMethod: fromDbPaymentMethod(row.forma_pagamento),
    courseId: turma?.curso_id ?? "",
    classId: row.turma_id,
    status: fromDbEnrollmentStatus(row.status_inscricao),
    createdAt: row.created_at,
    notes: row.observacoes ?? "",
  };
}

export function mapDbStudent(row: EnrollmentJoinedRow): Student {
  const aluno = firstOf(row.aluno);
  const turma = firstOf(row.turma);
  return {
    id: row.aluno_id,
    name: aluno?.nome_completo ?? "",
    email: aluno?.email ?? "",
    phone: aluno?.telefone ?? "",
    cpf: aluno?.cpf ?? "",
    organization: aluno?.orgao ?? "",
    jobTitle: aluno?.cargo ?? "",
    courseId: turma?.curso_id ?? "",
    classId: row.turma_id,
    enrollmentStatus: fromDbEnrollmentStatus(row.status_inscricao),
    certificateIssued: Boolean(row.certificado_emitido),
    enrolledAt: row.created_at,
    paymentMethod: fromDbPaymentMethod(row.forma_pagamento),
  };
}

const DOMAIN_TO_DB_STATUS: Record<EnrollmentStatus, string> = {
  Pendente: "Pendente",
  "Aguardando pagamento": "AguardandoPagamento",
  Confirmada: "Confirmada",
  Cancelada: "Cancelada",
  Concluída: "Concluida",
};

function isEnrollmentStatus(value: string): value is EnrollmentStatus {
  return value in DOMAIN_TO_DB_STATUS;
}

export type AdminListParams = {
  page: number;
  pageSize: number;
  classId: string | null;
  status: EnrollmentStatus | null;
  search: string | null;
};

/**
 * Normaliza os parâmetros de query crus (paginação + filtros) de forma
 * fail-safe: página/tamanho sempre válidos e limitados, status só aceito se for
 * um `EnrollmentStatus` conhecido, e a busca sanitizada para não quebrar o
 * filtro PostgREST `.or()` (remove caracteres de controle do operador).
 */
export function normalizeListParams(raw: URLSearchParams): AdminListParams {
  const pageRaw = Number.parseInt(raw.get("page") ?? "", 10);
  const sizeRaw = Number.parseInt(raw.get("pageSize") ?? "", 10);

  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;
  const pageSize =
    Number.isFinite(sizeRaw) && sizeRaw >= 1 ? Math.min(sizeRaw, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;

  const classIdRaw = raw.get("classId")?.trim() ?? "";
  const statusRaw = raw.get("status")?.trim() ?? "";
  const searchRaw = raw.get("search")?.trim() ?? "";

  const search = searchRaw
    ? searchRaw.replace(/[(),*%\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120)
    : "";

  return {
    page,
    pageSize,
    classId: classIdRaw || null,
    status: statusRaw && isEnrollmentStatus(statusRaw) ? statusRaw : null,
    search: search || null,
  };
}

async function queryEnrollmentRows(
  client: SupabaseClient,
  params: AdminListParams
): Promise<{ rows: EnrollmentJoinedRow[]; total: number }> {
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  let query = client
    .from("inscricao")
    .select(ENROLLMENT_SELECT, { count: "exact" })
    .order("created_at", { ascending: false });

  if (params.classId) {
    query = query.eq("turma_id", params.classId);
  }
  if (params.status) {
    query = query.eq("status_inscricao", DOMAIN_TO_DB_STATUS[params.status]);
  }
  if (params.search) {
    query = query.or(`nome_completo.ilike.%${params.search}%,email.ilike.%${params.search}%`, {
      referencedTable: "aluno",
    });
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return { rows: (data as unknown as EnrollmentJoinedRow[]) ?? [], total: count ?? 0 };
}

export type AdminListResult<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export async function listEnrollments(
  client: SupabaseClient,
  params: AdminListParams
): Promise<AdminListResult<Enrollment>> {
  const { rows, total } = await queryEnrollmentRows(client, params);
  return {
    data: rows.map(mapDbEnrollment),
    page: params.page,
    pageSize: params.pageSize,
    total,
  };
}

export async function listStudents(
  client: SupabaseClient,
  params: AdminListParams
): Promise<AdminListResult<Student>> {
  const { rows, total } = await queryEnrollmentRows(client, params);
  return {
    data: rows.map(mapDbStudent),
    page: params.page,
    pageSize: params.pageSize,
    total,
  };
}
