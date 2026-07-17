#!/usr/bin/env node
// REC-105 — teste de concorrência REAL para a reserva atômica de vaga em
// public.registrar_inscricao_publica (FND-12, FR-03, NFR-05).
//
// Diferença deliberada em relação a scripts/test-db-concurrency.mjs (EP12):
// aquele script dispara duas chamadas concorrentes com o MESMO e-mail, o que
// testa a prevenção de inscrição duplicada (P0004) — a corrida ali é
// resolvida pela restrição de unicidade "aluno já inscrito", não pela
// disputa por vaga. Este script dispara duas chamadas concorrentes com
// e-mails DIFERENTES contra uma turma com exatamente 1 vaga restante, o que
// exercita especificamente a disputa pela última vaga (overbooking).
//
// Abordagem: dois processos `psql` distintos (duas conexões reais ao
// Postgres local), disparados via Promise.all para maximizar a chance de
// colisão real na janela entre a checagem de capacidade e o incremento.
// pgTAP roda tudo em uma única conexão/transação por padrão, por isso não
// consegue exercitar concorrência real — daí a necessidade deste script
// separado (mesma abordagem já adotada por scripts/test-db-concurrency.mjs).

import { spawn } from "node:child_process";

const connectionString =
  process.env.SUPABASE_DB_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const cursoId = "rec105-conc-course";
const turmaId = "rec105-conc-class";
const emailA = `rec105-conc-a-${Date.now()}@rhcursos.test`;
const emailB = `rec105-conc-b-${Date.now()}@rhcursos.test`;

function runPsql(sql, { allowFailure = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "psql",
      [connectionString, "-v", "ON_ERROR_STOP=1", "-tA", "-c", sql],
      { stdio: ["ignore", "pipe", "pipe"] }
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
      const result = { code: code ?? 1, stdout: stdout.trim(), stderr: stderr.trim() };
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

async function scalar(sql) {
  const result = await runPsql(sql);
  return result.stdout;
}

function enrollmentSql(targetEmail, label) {
  return `
    select public.registrar_inscricao_publica(
      'REC-105 Concorrencia ${label}',
      '${targetEmail}',
      '3216549870${label === "A" ? "0" : "1"}',
      '6198888777${label === "A" ? "0" : "1"}',
      'Coordenador',
      'Orgao de Teste',
      'PF',
      '${turmaId}',
      'PF',
      'Pix',
      'rec-105 race test ${label}'
    );
  `;
}

async function setup() {
  await runPsql(`
    insert into public.curso (
      id, titulo, slug, descricao_curta, descricao, ementa, objetivos,
      beneficios, publico_alvo, carga_horaria, modalidade, nivel,
      preco_base, status, destaque
    ) values (
      '${cursoId}', 'REC-105 Curso Concorrencia', 'rec-105-curso-concorrencia',
      'Curso sintetico para teste de concorrencia real.',
      'Curso sintetico para teste de concorrencia real.',
      '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
      8, 'Online', 'Basico', 100, 'Ativo', false
    )
    on conflict (id) do update set deleted_at = null;

    insert into public.turma (
      id, curso_id, data_inicio, data_fim, horario, local,
      vagas_total, vagas_preenchidas, preco_turma, modalidade, status, observacoes
    ) values (
      '${turmaId}', '${cursoId}', '2026-09-01', '2026-09-01', '09:00 as 17:00',
      'Online ao vivo', 5, 4, 100, 'Online', 'PoucasVagas',
      'Turma sintetica REC-105 com 1 vaga restante para teste de concorrencia real.'
    )
    on conflict (id) do update set
      vagas_total = 5,
      vagas_preenchidas = 4,
      status = 'PoucasVagas',
      deleted_at = null;
  `);
}

async function cleanup() {
  await runPsql(
    `
      delete from public.inscricao
      where aluno_id in (
        select id from public.aluno
        where lower(email) in (lower('${emailA}'), lower('${emailB}'))
      );

      delete from public.aluno
      where lower(email) in (lower('${emailA}'), lower('${emailB}'));

      delete from public.turma where id = '${turmaId}';
      delete from public.curso where id = '${cursoId}';
    `,
    { allowFailure: true }
  );
}

async function main() {
  await cleanup();
  await setup();

  try {
    const [resultA, resultB] = await Promise.all([
      runPsql(enrollmentSql(emailA, "A"), { allowFailure: true }),
      runPsql(enrollmentSql(emailB, "B"), { allowFailure: true }),
    ]);

    const results = [resultA, resultB];
    const successes = results.filter((r) => r.code === 0);
    const failures = results.filter((r) => r.code !== 0);

    assert(
      successes.length === 1,
      `Esperava exatamente 1 sucesso na disputa pela última vaga; obtidos ${successes.length}.`
    );
    assert(
      failures.length === 1,
      `Esperava exatamente 1 conflito coerente na disputa pela última vaga; obtidos ${failures.length}.`
    );

    // O turma-alvo tem exatamente 1 vaga restante: quem vencer a reserva
    // atômica leva vagas_preenchidas a igualar vagas_total, e o trigger
    // `sync_turma_status` (before update of vagas_preenchidas) fecha a turma
    // para 'Encerrada' na MESMA transação/commit do vencedor. Quando a
    // atualização do perdedor, bloqueada pelo lock de linha, é reavaliada
    // após o commit do vencedor, ela já enxerga status='Encerrada' — por
    // isso o diagnóstico pós-falha desta corrida específica (disputa pela
    // ÚLTIMA vaga) relata determinística e corretamente P0002 ("Turma não
    // está disponível para inscrição"), não P0003 ("Turma sem vagas
    // disponíveis."). Ambos são conflitos coerentes de falta de capacidade
    // (nenhum overbooking ocorre em nenhum dos dois); P0003 só apareceria
    // isoladamente se a turma tivesse vagas_preenchidas < vagas_total mas
    // sem nenhuma vaga "verdadeira" fosse possível — cenário não aplicável
    // quando o próprio esgotamento fecha a turma. O teste sequencial em
    // supabase/tests/database/rec-105-atomic-enrollment.test.sql isola o
    // ramo P0003 manualmente (reabrindo o status) justamente para cobrir
    // esse branch específico do código sem depender do trigger.
    const failureOutput = `${failures[0].stdout}\n${failures[0].stderr}`;
    assert(
      /turma sem vagas dispon[íi]veis|turma n[ãa]o est[áa] dispon[íi]vel para inscri[çc][ãa]o/i.test(
        failureOutput
      ),
      `Conflito da disputa por vaga não retornou um erro coerente de falta de capacidade (P0002/P0003): ${
        failureOutput || "(sem saída)"
      }`
    );
    assert(
      !/duplicate key|já possui inscrição/i.test(failureOutput),
      `Conflito inesperado por duplicidade (P0004) em vez de disputa por capacidade (P0002/P0003): ${failureOutput}`
    );

    const alunoCount = Number(
      await scalar(
        `select count(*) from public.aluno where lower(email) in (lower('${emailA}'), lower('${emailB}'));`
      )
    );
    const inscricaoCount = Number(
      await scalar(`
        select count(*)
        from public.inscricao i
        join public.aluno a on a.id = i.aluno_id
        where lower(a.email) in (lower('${emailA}'), lower('${emailB}'))
          and i.turma_id = '${turmaId}'
          and i.status_inscricao <> 'Cancelada';
      `)
    );
    const vagasPreenchidas = Number(
      await scalar(`select vagas_preenchidas from public.turma where id = '${turmaId}';`)
    );

    assert(
      alunoCount === 1,
      `Esperava exatamente 1 aluno persistido (o vencedor da disputa); obtidos ${alunoCount}. O perdedor não deve deixar registro órfão.`
    );
    assert(
      inscricaoCount === 1,
      `Esperava exatamente 1 inscrição ativa na turma disputada; obtidas ${inscricaoCount} (overbooking).`
    );
    assert(
      vagasPreenchidas === 5,
      `Esperava vagas_preenchidas=5 (4 originais + 1 reserva vencedora); obtido ${vagasPreenchidas}.`
    );

    console.log(
      "✅ REC-105: disputa concorrente real pela última vaga produziu exatamente 1 sucesso e 1 conflito coerente (P0002/P0003), sem overbooking."
    );
  } finally {
    await cleanup();
  }
}

main().catch((error) => {
  console.error(`\n❌ ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
