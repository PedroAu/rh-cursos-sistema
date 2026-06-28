#!/usr/bin/env node

import { gzipSync } from "node:zlib";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, basename, resolve } from "node:path";

const root = process.cwd();
const chunksDir = resolve(root, ".next/static/chunks");

// Performance budgets for the client JS bundle (gzipped).
// Current baseline: ~785 KB total, ~132 KB largest chunk. Budgets keep headroom
// while failing CI on meaningful regressions. Override via env for tuning.
const TOTAL_BUDGET_KB = Number(process.env.BUNDLE_TOTAL_BUDGET_KB ?? 1000);
const CHUNK_BUDGET_KB = Number(process.env.BUNDLE_CHUNK_BUDGET_KB ?? 175);

function fail(message) {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

function walkJsFiles(dir, collector = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkJsFiles(fullPath, collector);
    } else if (fullPath.endsWith(".js")) {
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

const files = walkJsFiles(chunksDir);

if (files.length === 0) {
  fail(`Nenhum chunk JS encontrado em ${chunksDir}.`);
}

let totalGzip = 0;
let largest = { name: "", gzip: 0 };

for (const file of files) {
  const gzip = gzipSync(readFileSync(file)).length;
  totalGzip += gzip;
  if (gzip > largest.gzip) {
    largest = { name: basename(file), gzip };
  }
}

const totalKb = toKb(totalGzip);
const largestKb = toKb(largest.gzip);

console.log("📦 Bundle size (gzipped)");
console.log(`   Chunks JS: ${files.length}`);
console.log(`   Total:     ${totalKb.toFixed(1)} KB / ${TOTAL_BUDGET_KB} KB budget`);
console.log(`   Maior:     ${largestKb.toFixed(1)} KB (${largest.name}) / ${CHUNK_BUDGET_KB} KB budget`);

const violations = [];
if (totalKb > TOTAL_BUDGET_KB) {
  violations.push(
    `Total ${totalKb.toFixed(1)} KB excede o budget de ${TOTAL_BUDGET_KB} KB.`
  );
}
if (largestKb > CHUNK_BUDGET_KB) {
  violations.push(
    `Chunk ${largest.name} (${largestKb.toFixed(1)} KB) excede o budget de ${CHUNK_BUDGET_KB} KB.`
  );
}

if (violations.length > 0) {
  fail(`Budget de bundle excedido:\n   - ${violations.join("\n   - ")}`);
}

console.log("\n✅ Bundle dentro dos budgets de performance.");
