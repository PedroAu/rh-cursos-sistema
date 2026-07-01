import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type PortalClient = SupabaseClient<Database>;

type StudentProfileRow = {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string | null;
  orgao: string | null;
  cargo: string | null;
};

type StudentEnrollmentRow = {
  id: string;
  status_inscricao: string;
  forma_pagamento: string | null;
  created_at: string;
  certificado_emitido: boolean;
  observacoes: string | null;
  turma: {
    id: string;
    data_inicio: string;
    data_fim: string | null;
    horario: string | null;
    local: string | null;
    modalidade: string;
    status: string;
    curso: {
      id: string;
      titulo: string;
      slug: string;
    } | null;
  } | null;
};

type InstructorProfileRow = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  especialidade: string | null;
  bio: string | null;
};

type InstructorClassRow = {
  id: string;
  data_inicio: string;
  data_fim: string | null;
  horario: string | null;
  local: string | null;
  modalidade: string;
  status: string;
  vagas_preenchidas: number;
  vagas_total: number;
  curso: {
    id: string;
    titulo: string;
    slug: string;
  } | null;
  inscricoes: Array<{
    id: string;
    status_inscricao: string;
    aluno: {
      nome_completo: string;
      email: string;
      orgao: string | null;
    } | null;
  }> | null;
};

export type StudentPortalData = {
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    organization: string | null;
    jobTitle: string | null;
  };
  enrollments: Array<{
    id: string;
    status: string;
    paymentMethod: string | null;
    createdAt: string;
    certificateIssued: boolean;
    notes: string | null;
    class: {
      id: string;
      startDate: string;
      endDate: string | null;
      time: string | null;
      location: string | null;
      modality: string;
      status: string;
      course: {
        id: string;
        title: string;
        slug: string;
      } | null;
    } | null;
  }>;
};

export type InstructorPortalData = {
  profile: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    specialty: string | null;
    bio: string | null;
  };
  classes: Array<{
    id: string;
    startDate: string;
    endDate: string | null;
    time: string | null;
    location: string | null;
    modality: string;
    status: string;
    filledSeats: number;
    totalSeats: number;
    course: {
      id: string;
      title: string;
      slug: string;
    } | null;
    students: Array<{
      enrollmentId: string;
      name: string;
      email: string;
      organization: string | null;
      status: string;
    }>;
  }>;
};

export async function fetchStudentPortalData(client: PortalClient): Promise<StudentPortalData> {
  const {
    data: { user },
    error: userError
  } = await client.auth.getUser();

  if (userError || !user) {
    throw new Error("Sessão do aluno indisponível.");
  }

  const profileResult = await client
    .from("aluno")
    .select("id,nome_completo,email,telefone,orgao,cargo")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (profileResult.error) {
    throw profileResult.error;
  }

  const profile = profileResult.data as StudentProfileRow | null;

  if (!profile) {
    throw new Error("Perfil do aluno não vinculado à conta autenticada.");
  }

  const enrollmentsResult = await client
    .from("inscricao")
    .select(`
      id,
      status_inscricao,
      forma_pagamento,
      created_at,
      certificado_emitido,
      observacoes,
      turma:turma_id (
        id,
        data_inicio,
        data_fim,
        horario,
        local,
        modalidade,
        status,
        curso:curso_id (
          id,
          titulo,
          slug
        )
      )
    `)
    .eq("aluno_id", profile.id)
    .order("created_at", { ascending: false });

  if (enrollmentsResult.error) {
    throw enrollmentsResult.error;
  }

  const enrollments = ((enrollmentsResult.data ?? []) as StudentEnrollmentRow[]).map((row) => ({
    id: row.id,
    status: row.status_inscricao,
    paymentMethod: row.forma_pagamento,
    createdAt: row.created_at,
    certificateIssued: row.certificado_emitido,
    notes: row.observacoes,
    class: row.turma
      ? {
          id: row.turma.id,
          startDate: row.turma.data_inicio,
          endDate: row.turma.data_fim,
          time: row.turma.horario,
          location: row.turma.local,
          modality: row.turma.modalidade,
          status: row.turma.status,
          course: row.turma.curso
            ? {
                id: row.turma.curso.id,
                title: row.turma.curso.titulo,
                slug: row.turma.curso.slug
              }
            : null
        }
      : null
  }));

  return {
    profile: {
      id: profile.id,
      name: profile.nome_completo,
      email: profile.email,
      phone: profile.telefone,
      organization: profile.orgao,
      jobTitle: profile.cargo
    },
    enrollments
  };
}

export async function fetchInstructorPortalData(client: PortalClient): Promise<InstructorPortalData> {
  const {
    data: { user },
    error: userError
  } = await client.auth.getUser();

  if (userError || !user) {
    throw new Error("Sessão do instrutor indisponível.");
  }

  const profileResult = await client
    .from("instrutor")
    .select("id,nome,email,telefone,especialidade,bio")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (profileResult.error) {
    throw profileResult.error;
  }

  const profile = profileResult.data as InstructorProfileRow | null;

  if (!profile) {
    throw new Error("Perfil do instrutor não vinculado à conta autenticada.");
  }

  const classesResult = await client
    .from("turma")
    .select(`
      id,
      data_inicio,
      data_fim,
      horario,
      local,
      modalidade,
      status,
      vagas_preenchidas,
      vagas_total,
      curso:curso_id (
        id,
        titulo,
        slug
      ),
      inscricoes:inscricao (
        id,
        status_inscricao,
        aluno:aluno_id (
          nome_completo,
          email,
          orgao
        )
      )
    `)
    .eq("instrutor_id", profile.id)
    .is("deleted_at", null)
    .order("data_inicio", { ascending: true });

  if (classesResult.error) {
    throw classesResult.error;
  }

  const classes = ((classesResult.data ?? []) as InstructorClassRow[]).map((row) => ({
    id: row.id,
    startDate: row.data_inicio,
    endDate: row.data_fim,
    time: row.horario,
    location: row.local,
    modality: row.modalidade,
    status: row.status,
    filledSeats: row.vagas_preenchidas,
    totalSeats: row.vagas_total,
    course: row.curso
      ? {
          id: row.curso.id,
          title: row.curso.titulo,
          slug: row.curso.slug
        }
      : null,
    students: (row.inscricoes ?? []).map((enrollment) => ({
      enrollmentId: enrollment.id,
      name: enrollment.aluno?.nome_completo ?? "Aluno",
      email: enrollment.aluno?.email ?? "",
      organization: enrollment.aluno?.orgao ?? null,
      status: enrollment.status_inscricao
    }))
  }));

  return {
    profile: {
      id: profile.id,
      name: profile.nome,
      email: profile.email,
      phone: profile.telefone,
      specialty: profile.especialidade,
      bio: profile.bio
    },
    classes
  };
}
