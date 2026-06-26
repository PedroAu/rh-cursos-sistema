#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { parse } from "yaml";

const root = process.cwd();
const specPath = resolve(root, "docs/api/openapi.yaml");
const allowedMethods = new Set(["get", "post", "put", "patch", "delete", "options", "head"]);

function fail(message) {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readSpec() {
  try {
    return parse(readFileSync(specPath, "utf8"));
  } catch (error) {
    fail(`Falha ao ler ou parsear ${specPath}: ${error instanceof Error ? error.message : error}`);
  }
}

const spec = readSpec();

assert(spec && typeof spec === "object", "OpenAPI spec inválida.");
assert(typeof spec.openapi === "string" && spec.openapi.startsWith("3.1"), "openapi deve ser 3.1.x.");
assert(spec.info && typeof spec.info.title === "string", "info.title ausente.");
assert(spec.info && typeof spec.info.version === "string", "info.version ausente.");
assert(spec.paths && typeof spec.paths === "object" && Object.keys(spec.paths).length > 0, "paths ausente.");
assert(spec.components && typeof spec.components === "object", "components ausente.");
assert(spec.components.schemas && typeof spec.components.schemas === "object", "components.schemas ausente.");

for (const [path, operations] of Object.entries(spec.paths)) {
  assert(operations && typeof operations === "object", `Operações ausentes em ${path}.`);

  for (const [method, operation] of Object.entries(operations)) {
    if (!allowedMethods.has(method)) continue;

    assert(operation && typeof operation === "object", `${method.toUpperCase()} ${path} inválido.`);
    assert(typeof operation.summary === "string" && operation.summary.length > 0, `${method.toUpperCase()} ${path} sem summary.`);
    assert(operation.responses && typeof operation.responses === "object", `${method.toUpperCase()} ${path} sem responses.`);
  }
}

console.log(`✅ OpenAPI lint passou: ${specPath}`);
