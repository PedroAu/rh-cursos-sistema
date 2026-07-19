#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { parse } from "yaml";

const root = process.cwd();
const specPath = resolve(root, "docs/api/openapi.yaml");
const appApiRoot = resolve(root, "app/api");
const supabaseFunctionsRoot = resolve(root, "supabase/functions");
const allowedMethods = new Set(["get", "post", "put", "patch", "delete", "options", "head"]);
const exportedMethodPattern =
  /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b/g;
const conditionalMethodPattern =
  /[A-Za-z_$][\w$]*\.method\s*(?:!==|===)\s*["'](GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)["']/g;

function fail(message) {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

function readYaml(filePath) {
  try {
    return parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Falha ao ler ${filePath}: ${error instanceof Error ? error.message : error}`);
  }
}

function walkFiles(dir, predicate, collector = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, predicate, collector);
    } else if (predicate(fullPath)) {
      collector.push(fullPath);
    }
  }

  return collector;
}

/**
 * Converte segmentos dinâmicos do Next.js (`[name]`) para a sintaxe de path
 * parameter do OpenAPI (`{name}`), tornando `/api/functions/[name]` e
 * `/api/functions/{name}` equivalentes na comparação (REC-406, AC4). Também
 * cobre catch-all (`[...slug]` → `{slug}`) para evitar falso drift futuro.
 */
export function normalizeDynamicSegments(path) {
  return path.replace(/\[\.{0,3}([^\]]+)\]/g, "{$1}");
}

export function normalizeRoutePath(filePath, rootDir, suffixToRemove) {
  const relativePath = relative(rootDir, filePath).replaceAll("\\", "/");
  const withoutSuffix = relativePath.replace(suffixToRemove, "");
  const withoutFile = withoutSuffix.replace(/\/route\.ts$/, "");
  return normalizeDynamicSegments(`/${withoutFile}`);
}

export function detectMethods(content) {
  const methods = new Set();

  for (const match of content.matchAll(exportedMethodPattern)) {
    const method = (match[1] ?? "").toLowerCase();
    if (allowedMethods.has(method)) methods.add(method);
  }

  for (const match of content.matchAll(conditionalMethodPattern)) {
    const method = (match[1] ?? "").toLowerCase();
    if (allowedMethods.has(method)) methods.add(method);
  }

  return [...methods].sort();
}

export function listCodeEndpoints() {
  const endpoints = new Map();

  for (const filePath of walkFiles(appApiRoot, (path) => path.endsWith("route.ts"))) {
    const content = readFileSync(filePath, "utf8");
    const path = `/api${normalizeRoutePath(filePath, appApiRoot, "")}`;
    endpoints.set(path, detectMethods(content));
  }

  for (const filePath of walkFiles(supabaseFunctionsRoot, (path) => path.endsWith("index.ts"))) {
    if (filePath.includes(`${join("supabase", "functions", "_shared")}`)) continue;

    const content = readFileSync(filePath, "utf8");
    const relativePath = relative(supabaseFunctionsRoot, filePath).replaceAll("\\", "/");
    const [functionName] = relativePath.split("/");
    const path = `/functions/v1/${functionName}`;
    endpoints.set(path, detectMethods(content));
  }

  return endpoints;
}

/**
 * Extrai o inventário path→métodos declarado na spec OpenAPI, normalizando
 * qualquer segmento dinâmico para a mesma forma canônica do código.
 */
export function buildSpecEndpoints(spec) {
  const specEndpoints = new Map();

  for (const [path, operations] of Object.entries(spec?.paths ?? {})) {
    const methods = Object.keys(operations ?? {})
      .filter((method) => allowedMethods.has(method))
      .sort();
    specEndpoints.set(normalizeDynamicSegments(path), methods);
  }

  return specEndpoints;
}

/**
 * Compara os inventários de código e spec, retornando as três categorias de
 * divergência: paths ausentes na spec, paths excedentes na spec e diferenças de
 * método por rota.
 */
export function diffEndpoints(codeEndpoints, specEndpoints) {
  const missingFromSpec = [];
  const extraInSpec = [];
  const methodMismatches = [];

  for (const [path, methods] of codeEndpoints) {
    if (!specEndpoints.has(path)) {
      missingFromSpec.push(`${path} (${methods.map((method) => method.toUpperCase()).join(", ")})`);
      continue;
    }

    const specMethods = specEndpoints.get(path) ?? [];
    const missingMethods = methods.filter((method) => !specMethods.includes(method));
    const extraMethods = specMethods.filter((method) => !methods.includes(method));

    if (missingMethods.length || extraMethods.length) {
      methodMismatches.push({ path, missingMethods, extraMethods });
    }
  }

  for (const [path, methods] of specEndpoints) {
    if (!codeEndpoints.has(path)) {
      extraInSpec.push(`${path} (${methods.map((method) => method.toUpperCase()).join(", ")})`);
    }
  }

  return { missingFromSpec, extraInSpec, methodMismatches };
}

function main() {
  const spec = readYaml(specPath);
  const codeEndpoints = listCodeEndpoints();
  const specEndpoints = buildSpecEndpoints(spec);
  const { missingFromSpec, extraInSpec, methodMismatches } = diffEndpoints(codeEndpoints, specEndpoints);

  if (missingFromSpec.length || extraInSpec.length || methodMismatches.length) {
    console.error("❌ OpenAPI drift detectado.");

    if (missingFromSpec.length) {
      console.error(`\nRotas presentes no código e ausentes na spec:\n- ${missingFromSpec.join("\n- ")}`);
    }

    if (extraInSpec.length) {
      console.error(`\nRotas presentes na spec e ausentes no código:\n- ${extraInSpec.join("\n- ")}`);
    }

    if (methodMismatches.length) {
      console.error("\nDiferenças de método por rota:");
      for (const mismatch of methodMismatches) {
        const parts = [];
        if (mismatch.missingMethods.length) {
          parts.push(`faltando no spec: ${mismatch.missingMethods.map((method) => method.toUpperCase()).join(", ")}`);
        }
        if (mismatch.extraMethods.length) {
          parts.push(`excesso no spec: ${mismatch.extraMethods.map((method) => method.toUpperCase()).join(", ")}`);
        }
        console.error(`- ${mismatch.path} (${parts.join("; ")})`);
      }
    }

    process.exit(1);
  }

  console.log(`✅ OpenAPI drift gate passou: ${codeEndpoints.size} rotas reconciliadas.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main();
}
