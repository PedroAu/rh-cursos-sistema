import type { SupabaseClient } from "@supabase/supabase-js";

import type { Course, Instructor, TrainingClass } from "@/types";
import {
  mapClass,
  mapCourse,
  mapInstructor,
  type ClassRow,
  type CourseInstructorRow,
  type CourseRow,
  type InstructorRow,
} from "@/lib/supabase/mappers";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  type AdminListResult,
} from "@/lib/supabase/admin-read-models";

/**
 * Read models administrativos de catálogo — cursos, turmas e instrutores
 * (REC-304 — continua o fechamento de FND-08 iniciado por REC-303).
 *
 * FND-08: até REC-206 não existia leitura server-side desses dados no reload
 * administrativo. Este módulo constrói o caminho paginado e autorizado para os
 * três recursos centrais do catálogo, reutilizando as projeções DB→domínio já
 * validadas em `mappers.ts` (`mapCourse`/`mapClass`/`mapInstructor`) — nenhum
 * campo ou forma nova é inventado (Article IV — No Invention).
 *
 * Escopo do contrato (derivado da UI existente em `admin-resource-configs.tsx`):
 * cada recurso administrativo filtra por um único campo de busca textual —
 * cursos por título, instrutores por nome, turmas pelo título do curso. Nenhum
 * outro filtro é exposto porque a UI não consome nenhum outro.
 *
 * As colunas selecionadas espelham exatamente o caminho `admin` de
 * `fetchCatalog` (`rh-cursos-api.ts`), garantindo que os mappers recebam as
 * mesmas linhas. `curso`/`turma`/`instrutor` filtram `deleted_at is null`; a
 * leitura usa o cliente privilegiado apenas após autorização (ver rota +
 * `requireAdminApi`).
 */

const COURSE_SELECT =
  "id,titulo,slug,descricao_curta,descricao,ementa,objetivos,beneficios,publico_alvo,carga_horaria," +
  "modalidade,modalidades,nivel,categoria,categorias,trilha_id,trilha_nome,preco_base,status,destaque," +
  "imagem_capa,rating,total_alunos";

const CLASS_SELECT =
  "id,curso_id,instrutor_id,data_inicio,data_fim,horario,local,vagas_total,vagas_preenchidas," +
  "vagas_restantes,preco_turma,modalidade,status,observacoes";

const INSTRUCTOR_SELECT =
  "id,nome,email,telefone,bio,foto_url,formacao,especialidade,rating,status";

const COURSE_INSTRUCTOR_SELECT = "id,curso_id,instrutor_id,principal,created_at";

/**
 * Busca sanitizada de forma fail-safe: remove caracteres do operador PostgREST
 * (`.or()`/parênteses/percent) para que o termo não quebre o filtro nem permita
 * injeção, limita o comprimento e devolve `null` quando vazio. Mesma disciplina
 * de `normalizeListParams` (REC-303).
 */
function sanitizeSearch(value: string): string | null {
  const cleaned = value
    .replace(/[(),*%\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);

  return cleaned || null;
}

export type CatalogListParams = {
  page: number;
  pageSize: number;
  search: string | null;
};

/** Normaliza paginação + busca de forma fail-safe (página/tamanho sempre válidos). */
export function normalizeCatalogListParams(raw: URLSearchParams): CatalogListParams {
  const pageRaw = Number.parseInt(raw.get("page") ?? "", 10);
  const sizeRaw = Number.parseInt(raw.get("pageSize") ?? "", 10);

  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;
  const pageSize =
    Number.isFinite(sizeRaw) && sizeRaw >= 1 ? Math.min(sizeRaw, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;

  const searchRaw = raw.get("search")?.trim() ?? "";

  return { page, pageSize, search: sanitizeSearch(searchRaw) };
}

function pageRange(params: CatalogListParams): [number, number] {
  const from = (params.page - 1) * params.pageSize;
  return [from, from + params.pageSize - 1];
}

export async function listCourses(
  client: SupabaseClient,
  params: CatalogListParams
): Promise<AdminListResult<Course>> {
  const [from, to] = pageRange(params);

  let query = client
    .from("curso")
    .select(COURSE_SELECT, { count: "exact" })
    .is("deleted_at", null)
    .order("titulo");

  if (params.search) {
    query = query.ilike("titulo", `%${params.search}%`);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const rows = (data as unknown as CourseRow[]) ?? [];
  const courseIds = rows.map((row) => row.id);

  // As projeções de curso derivam o instrutor principal (`curso_instrutor`) e a
  // próxima turma (`turma`); ambos são buscados apenas para os cursos da página.
  let joins: CourseInstructorRow[] = [];
  let classes: ClassRow[] = [];
  if (courseIds.length > 0) {
    const [joinResult, classResult] = await Promise.all([
      client.from("curso_instrutor").select(COURSE_INSTRUCTOR_SELECT).in("curso_id", courseIds),
      client.from("turma").select(CLASS_SELECT).is("deleted_at", null).in("curso_id", courseIds),
    ]);
    if (joinResult.error) throw joinResult.error;
    if (classResult.error) throw classResult.error;
    joins = (joinResult.data as unknown as CourseInstructorRow[]) ?? [];
    classes = (classResult.data as unknown as ClassRow[]) ?? [];
  }

  return {
    data: rows.map((row) => mapCourse(row, joins, classes)),
    page: params.page,
    pageSize: params.pageSize,
    total: count ?? 0,
  };
}

export async function listClasses(
  client: SupabaseClient,
  params: CatalogListParams
): Promise<AdminListResult<TrainingClass>> {
  const [from, to] = pageRange(params);

  // A UI filtra turmas pelo título do curso; replicamos com um embed inner e o
  // filtro no recurso referenciado (mesmo padrão de REC-303). Sem busca, o
  // caminho permanece idêntico ao `fetchCatalog` admin (sem embed).
  const select = params.search ? `${CLASS_SELECT},curso:curso_id!inner(titulo)` : CLASS_SELECT;

  let query = client
    .from("turma")
    .select(select, { count: "exact" })
    .is("deleted_at", null)
    .order("data_inicio");

  if (params.search) {
    query = query.or(`titulo.ilike.%${params.search}%`, { referencedTable: "curso" });
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const rows = (data as unknown as ClassRow[]) ?? [];

  return {
    data: rows.map(mapClass),
    page: params.page,
    pageSize: params.pageSize,
    total: count ?? 0,
  };
}

export async function listInstructors(
  client: SupabaseClient,
  params: CatalogListParams
): Promise<AdminListResult<Instructor>> {
  const [from, to] = pageRange(params);

  let query = client
    .from("instrutor")
    .select(INSTRUCTOR_SELECT, { count: "exact" })
    .is("deleted_at", null)
    .order("nome");

  if (params.search) {
    query = query.ilike("nome", `%${params.search}%`);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const rows = (data as unknown as InstructorRow[]) ?? [];
  const instructorIds = rows.map((row) => row.id);

  // `mapInstructor` deriva `courseIds` de `curso_instrutor`; buscamos os vínculos
  // apenas para os instrutores da página.
  let joins: CourseInstructorRow[] = [];
  if (instructorIds.length > 0) {
    const joinResult = await client
      .from("curso_instrutor")
      .select(COURSE_INSTRUCTOR_SELECT)
      .in("instrutor_id", instructorIds);
    if (joinResult.error) throw joinResult.error;
    joins = (joinResult.data as unknown as CourseInstructorRow[]) ?? [];
  }

  return {
    data: rows.map((row) => mapInstructor(row, joins)),
    page: params.page,
    pageSize: params.pageSize,
    total: count ?? 0,
  };
}
