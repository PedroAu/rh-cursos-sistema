import type { Enrollment, Lead } from "@/types";
import { supabase } from "@/lib/supabase/client";
import {
  leadToInsert,
  mapClass,
  mapCourse,
  mapInstructor,
  mapLead,
  type ClassRow,
  type CourseInstructorRow,
  type CourseRow,
  type InstructorRow,
  type LeadRow
} from "@/lib/supabase/mappers";

export async function fetchPublicCatalogFromSupabase() {
  if (!supabase) return null;

  const [coursesResult, classesResult, instructorsResult, courseInstructorsResult] = await Promise.all([
    supabase
      .from("curso")
      .select("id,titulo,slug,descricao_curta,descricao,ementa,objetivos,beneficios,publico_alvo,carga_horaria,modalidade,nivel,categoria,trilha_id,trilha_nome,preco_base,status,destaque,imagem_capa,rating,total_alunos")
      .order("titulo"),
    supabase
      .from("turma")
      .select("id,curso_id,instrutor_id,data_inicio,data_fim,horario,local,vagas_total,vagas_preenchidas,vagas_restantes,preco_turma,modalidade,status,observacoes")
      .order("data_inicio"),
    supabase
      .from("instrutor")
      .select("id,nome,email,telefone,bio,foto_url,formacao,especialidade,rating,status")
      .order("nome"),
    supabase
      .from("curso_instrutor")
      .select("id,curso_id,instrutor_id,principal")
  ]);

  if (coursesResult.error) throw coursesResult.error;
  if (classesResult.error) throw classesResult.error;
  if (instructorsResult.error) throw instructorsResult.error;
  if (courseInstructorsResult.error) throw courseInstructorsResult.error;

  const courseRows = coursesResult.data as CourseRow[];
  const classRows = classesResult.data as ClassRow[];
  const instructorRows = instructorsResult.data as InstructorRow[];
  const courseInstructorRows = courseInstructorsResult.data as CourseInstructorRow[];

  return {
    courses: courseRows.map((course) => mapCourse(course, courseInstructorRows, classRows)),
    classes: classRows.map(mapClass),
    instructors: instructorRows.map((instructor) => mapInstructor(instructor, courseInstructorRows))
  };
}

export async function fetchLeadsFromSupabase() {
  if (!supabase) return null;

  const result = await supabase.from("lead").select("*").order("created_at", { ascending: false });
  if (result.error) throw result.error;

  return (result.data as LeadRow[]).map(mapLead);
}


export async function createLeadInSupabase(payload: Omit<Lead, "id" | "createdAt" | "status">) {
  if (!supabase) return null;

  const result = await supabase.from("lead").insert(leadToInsert(payload)).select("*").single();
  if (result.error) throw result.error;

  return mapLead(result.data as LeadRow);
}

export async function createEnrollmentInSupabase(payload: Omit<Enrollment, "id" | "createdAt" | "status">) {
  if (!supabase) return null;

  const result = await supabase.rpc("registrar_inscricao_publica", {
    p_nome_completo: payload.studentName,
    p_email: payload.email,
    p_cpf: payload.cpf,
    p_telefone: payload.phone,
    p_cargo: payload.jobTitle,
    p_orgao: payload.organization,
    p_tipo_aluno:
      payload.enrollmentType === "Empresa"
        ? "PJ"
        : payload.enrollmentType === "Órgão público"
          ? "Servidor"
          : "PF",
    p_turma_id: payload.classId,
    p_tipo_inscricao: payload.enrollmentType,
    p_forma_pagamento: payload.paymentMethod === "Cartão" ? "Cartao" : payload.paymentMethod,
    p_observacoes: payload.notes
  });

  if (result.error) throw result.error;

  return result.data;
}
