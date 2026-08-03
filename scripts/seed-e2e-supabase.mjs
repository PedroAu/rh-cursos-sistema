import { createClient } from "@supabase/supabase-js";

import { validateE2EEnvironment } from "./verify-e2e-environment.mjs";

const E2E_COURSE = {
  id: "e2e-course-esocial-ci",
  titulo: "Curso E2E de Atualização do eSocial",
  slug: "curso-e2e-atualizacao-esocial",
  descricao_curta: "Massa determinística para a validação E2E isolada.",
  descricao: "Curso de teste exclusivo para a automação E2E do ambiente isolado.",
  ementa: ["Validação de ambiente", "Fluxo de inscrição"],
  objetivos: ["Validar o catálogo", "Validar o formulário público"],
  beneficios: [],
  publico_alvo: ["Automação E2E"],
  categoria: "Qualidade",
  modalidade: "Online",
  nivel: "Básico",
  carga_horaria: 8,
  preco_base: 0,
  status: "Ativo",
  destaque: true,
  rating: 0,
  total_alunos: 0,
  deleted_at: null,
};

const E2E_CLASS = {
  id: "e2e-class-esocial-ci",
  curso_id: E2E_COURSE.id,
  data_inicio: "2099-10-20",
  data_fim: "2099-10-21",
  horario: "09:00 às 17:00",
  local: "Online",
  vagas_total: 30,
  vagas_preenchidas: 0,
  preco_turma: 0,
  modalidade: "Online",
  status: "Aberta",
  observacoes: "Fixture E2E gerenciada pelo CI.",
  deleted_at: null,
};

async function upsertFixture() {
  const { targetRef, supabaseUrl, serviceRoleKey } = validateE2EEnvironment();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const courseResult = await supabase.from("curso").upsert(E2E_COURSE, { onConflict: "id" });

  if (courseResult.error) {
    throw new Error(`could not upsert the E2E course fixture: ${courseResult.error.message}`);
  }

  const classResult = await supabase.from("turma").upsert(E2E_CLASS, { onConflict: "id" });

  if (classResult.error) {
    throw new Error(`could not upsert the E2E class fixture: ${classResult.error.message}`);
  }

  console.log(`E2E fixture seeded in isolated project ${targetRef}.`);
}

upsertFixture().catch((error) => {
  console.error(`E2E fixture seeding failed: ${error.message}`);
  process.exit(1);
});
