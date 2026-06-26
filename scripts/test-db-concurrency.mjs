#!/usr/bin/env node

import { spawn } from "node:child_process";

const connectionString =
  process.env.SUPABASE_DB_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const turmaId = "class-3-1";
const email = `ep12-concurrency-${Date.now()}@rhcursos.test`;

function runPsql(sql, { allowFailure = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "psql",
      [connectionString, "-v", "ON_ERROR_STOP=1", "-tA", "-c", sql],
      {
        stdio: ["ignore", "pipe", "pipe"],
      }
    );

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      const result = {
        code: code ?? 1,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      };

      if (result.code !== 0 && !allowFailure) {
        reject(new Error(result.stderr || `psql saiu com código ${result.code}.`));
        return;
      }

      resolve(result);
    });
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function enrollmentSql(targetEmail) {
  return `
    select public.registrar_inscricao_publica(
      'EP12 Concurrency',
      '${targetEmail}',
      '32165498700',
      '61988887777',
      'Coordenador',
      'Orgao de Teste',
      'PF',
      '${turmaId}',
      'PF',
      'Pix',
      'race test'
    );
  `;
}

async function scalar(sql) {
  const result = await runPsql(sql);
  return result.stdout;
}

async function cleanup(originalSlots) {
  await runPsql(
    `
      delete from public.inscricao
      where aluno_id in (
        select id from public.aluno where lower(email) = lower('${email}')
      );

      delete from public.aluno
      where lower(email) = lower('${email}');

      update public.turma
      set vagas_preenchidas = ${originalSlots}
      where id = '${turmaId}';
    `,
    { allowFailure: true }
  );
}

async function main() {
  const beforeSlots = Number(await scalar(`select vagas_preenchidas from public.turma where id = '${turmaId}';`));
  assert(Number.isFinite(beforeSlots), `Turma ${turmaId} não encontrada para o teste concorrente.`);

  await cleanup(beforeSlots);

  try {
    const [first, second] = await Promise.all([
      runPsql(enrollmentSql(email), { allowFailure: true }),
      runPsql(enrollmentSql(email), { allowFailure: true }),
    ]);

    const successes = [first, second].filter((result) => result.code === 0);
    const failures = [first, second].filter((result) => result.code !== 0);

    assert(successes.length === 1, `Esperava exatamente 1 sucesso concorrente; obtidos ${successes.length}.`);
    assert(failures.length === 1, `Esperava exatamente 1 falha concorrente; obtidas ${failures.length}.`);

    const failureOutput = `${failures[0].stdout}\n${failures[0].stderr}`;
    assert(
      /Aluno já possui inscrição ativa nesta turma|duplicate key value violates unique constraint/i.test(
        failureOutput
      ),
      `Falha concorrente inesperada: ${failureOutput || "(sem saída)"}`
    );

    const studentCount = Number(
      await scalar(`select count(*) from public.aluno where lower(email) = lower('${email}');`)
    );
    const enrollmentCount = Number(
      await scalar(`
        select count(*)
        from public.inscricao i
        join public.aluno a on a.id = i.aluno_id
        where lower(a.email) = lower('${email}')
          and i.turma_id = '${turmaId}'
          and i.status_inscricao <> 'Cancelada';
      `)
    );
    const afterSlots = Number(
      await scalar(`select vagas_preenchidas from public.turma where id = '${turmaId}';`)
    );

    assert(studentCount === 1, `Esperava 1 aluno após corrida concorrente; obtidos ${studentCount}.`);
    assert(
      enrollmentCount === 1,
      `Esperava 1 inscrição ativa após corrida concorrente; obtidas ${enrollmentCount}.`
    );
    assert(
      afterSlots === beforeSlots + 1,
      `Esperava vagas_preenchidas=${beforeSlots + 1}; obtido ${afterSlots}.`
    );

    console.log("✅ Concurrency DB test passou.");
  } finally {
    await cleanup(beforeSlots);
  }
}

main().catch((error) => {
  console.error(`\n❌ ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
