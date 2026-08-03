import { createClient } from "@supabase/supabase-js";

import { validateE2EEnvironment } from "./verify-e2e-environment.mjs";

const E2E_COURSE = {
  id: "e2e-course-esocial-ci",
  titulo: "Curso E2E de Atualização do eSocial",
  slug: "curso-e2e-atualizacao-esocial",
};

const E2E_CLASS = {
  id: "e2e-class-esocial-ci",
  curso_id: E2E_COURSE.id,
  data_inicio: "2099-10-20",
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
