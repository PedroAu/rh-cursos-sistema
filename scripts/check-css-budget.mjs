#!/usr/bin/env node

import { gzipSync } from "node:zlib";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, basename, resolve } from "node:path";

const root = process.cwd();
// Varre .next/static inteiro (não só chunks/) para que o budget continue
// válido se o Next passar a emitir CSS em outro subdiretório (ex.: css/).
const chunksDir = resolve(root, ".next/static");

// Performance budget for the production CSS output. Measured as gzip size —
// the same metric already used by bundle:check for JS — because that reflects
// bytes over the wire, which is what the AC's <30KB target is protecting.
// Raw (uncompressed) CSS naturally runs several times larger due to Tailwind's
// long, highly repetitive utility class selectors, which is exactly the kind
// of content gzip compresses best; measuring raw would make the budget
// meaningless for a utility-first stylesheet.
// Env override malformado (NaN, <=0) cai no default em vez de
// desabilitar silenciosamente o gate.
const rawBudget = Number(process.env.CSS_GZIP_BUDGET_KB);
const CSS_BUDGET_KB = Number.isFinite(rawBudget) && rawBudget > 0 ? rawBudget : 30;

function fail(message) {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

function walkCssFiles(dir, collector = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkCssFiles(fullPath, collector);
    } else if (fullPath.endsWith(".css")) {
      collector.push(fullPath);
    }
  }

  return collector;
}

function toKb(bytes) {
  return bytes / 1024;
}

if (!existsSync(chunksDir)) {
  fail(`Diretório de build não encontrado: ${chunksDir}. Rode "npm run build" antes.`);
}

const files = walkCssFiles(chunksDir);

if (files.length === 0) {
  fail(`Nenhum chunk CSS encontrado em ${chunksDir}.`);
}

let totalGzip = 0;
let totalRaw = 0;
let largest = { name: "", gzip: 0 };

for (const file of files) {
  const raw = readFileSync(file);
  const gzip = gzipSync(raw).length;
  totalRaw += raw.length;
  totalGzip += gzip;
  if (gzip > largest.gzip) {
    largest = { name: basename(file), gzip };
  }
}

const totalKb = toKb(totalGzip);
const rawKb = toKb(totalRaw);

console.log("🎨 CSS size");
console.log(`   Chunks CSS: ${files.length}`);
console.log(`   Raw total:  ${rawKb.toFixed(1)} KB (informativo — não orçado)`);
console.log(`   Gzip total: ${totalKb.toFixed(1)} KB / ${CSS_BUDGET_KB} KB budget`);
console.log(`   Maior:      ${toKb(largest.gzip).toFixed(1)} KB (${largest.name})`);

if (totalKb > CSS_BUDGET_KB) {
  fail(
    `Budget de CSS excedido: total gzip ${totalKb.toFixed(1)} KB excede o budget de ${CSS_BUDGET_KB} KB.`
  );
}

console.log("\n✅ CSS dentro do budget de performance (gzip).");
