#!/usr/bin/env node
// purge-gate — Épico 14 (Redesign Trust Keith)
//
// Gate estático e determinístico que trava a REGRESSÃO da purga do Mantine.
// Não substitui os testes de runtime (epic14-mantine-removal.smoke.spec.ts);
// roda antes deles, é rápido e não abre browser.
//
// Níveis:
//   BLOCK (exit 1): import de @mantine/* ou @emotion/* no código, ou pacote
//                   @mantine/* / @emotion/* declarado no package.json.
//                   Isso significa que a dependência voltou → falha o gate.
//   WARN  (exit 0): resíduo de NOMENCLATURA (arquivos/identificadores "Mantine",
//                   classes apple-material, createStyles). Dívida cosmética,
//                   não dependência — reportado mas não bloqueia.
//
// Uso: node scripts/purge-gate.mjs  |  npm run purge:gate
// Ref: docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md (Fase 1, Gate F1)

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SCAN_DIRS = ["app", "src"];
const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"]);
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build"]);

// Imports proibidos → BLOCK (a dependência voltou)
const BLOCK_IMPORT = /(?:from\s+|import\(|require\()\s*["'](@mantine\/[^"']+|@emotion\/[^"']+)["']/g;
// Pacotes proibidos no package.json → BLOCK
const BLOCK_PKG = /^(@mantine\/|@emotion\/)/;
// Resíduo de nomenclatura → WARN (dívida cosmética)
const WARN_PATTERNS = [
  { re: /\bMantineProvider\b/, label: "identificador MantineProvider" },
  { re: /\bcreateStyles\b/, label: "createStyles (API Mantine/Emotion)" },
  { re: /apple-material/, label: "classe apple-material (removida no redesign)" },
];

/** Caminha recursivamente por um diretório coletando arquivos de código. */
function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (CODE_EXT.has(extname(name))) acc.push(full);
  }
  return acc;
}

const rel = (p) => p.slice(ROOT.length).replace(/^\/+/, "");

const blockers = []; // { file, line, match, reason }
const warnings = []; // { file, line, label }

// 1) Varredura de código-fonte
const files = SCAN_DIRS.flatMap((d) => walk(join(ROOT, d)));
for (const file of files) {
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");

  // filename residue (WARN)
  if (/mantine/i.test(basename(file))) {
    warnings.push({ file: rel(file), line: 1, label: "arquivo com \"mantine\" no nome" });
  }

  lines.forEach((lineText, i) => {
    for (const m of lineText.matchAll(BLOCK_IMPORT)) {
      blockers.push({ file: rel(file), line: i + 1, match: m[1], reason: "import de dependência purgada" });
    }
    for (const { re, label } of WARN_PATTERNS) {
      if (re.test(lineText)) warnings.push({ file: rel(file), line: i + 1, label });
    }
  });
}

// 2) package.json — dependências declaradas
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
  for (const name of Object.keys(pkg[field] ?? {})) {
    if (BLOCK_PKG.test(name)) {
      blockers.push({ file: "package.json", line: 0, match: name, reason: `declarado em ${field}` });
    }
  }
}

// 3) Relatório
const green = "\x1b[32m", red = "\x1b[31m", yellow = "\x1b[33m", dim = "\x1b[2m", reset = "\x1b[0m";
console.log(`${dim}purge-gate · Épico 14 — varredura de resíduo Mantine/Emotion${reset}`);
console.log(`${dim}  arquivos escaneados: ${files.length} (app/, src/) + package.json${reset}\n`);

if (warnings.length > 0) {
  console.log(`${yellow}⚠ ${warnings.length} resíduo(s) de nomenclatura (não bloqueia — dívida a limpar):${reset}`);
  for (const w of warnings) console.log(`  ${yellow}·${reset} ${w.file}:${w.line} — ${w.label}`);
  console.log("");
}

if (blockers.length > 0) {
  console.log(`${red}✖ PURGE-GATE FALHOU — dependência purgada reintroduzida:${reset}`);
  for (const b of blockers) console.log(`  ${red}✖${reset} ${b.file}:${b.line} — ${b.match} (${b.reason})`);
  console.log(`\n${red}Remova o import/pacote acima. A purga do Mantine é invariante do Épico 14.${reset}`);
  process.exit(1);
}

console.log(`${green}✔ purge-gate PASS — zero import/pacote @mantine ou @emotion.${reset}`);
if (warnings.length > 0) {
  console.log(`${dim}  (${warnings.length} resíduo(s) de nome pendente(s) — ver avisos acima.)${reset}`);
}
process.exit(0);
