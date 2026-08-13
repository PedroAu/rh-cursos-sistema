import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import net from "node:net";
import { join, relative } from "node:path";
import { loadEnvFile } from "node:process";
import { pathToFileURL } from "node:url";

import { chromium } from "playwright";

if (existsSync(".env.e2e.local")) loadEnvFile(".env.e2e.local");

/**
 * Epic 14/15 fidelity capture harness (Story 18.2).
 *
 * Restores the reproducible route × canvas pair that the previous version
 * dropped (every `canvasPaths: []`). For each target it captures:
 *   - the live route screenshot (HTTP status validated), and
 *   - the reference canvas screenshot rendered from the versioned
 *     `docs/design-system/reference/*.html` at the same viewport.
 *
 * References are generated and validated as static, self-contained HTML by
 * `build-fidelity-references.mjs`; no design-tool runtime or missing asset is
 * allowed in this comparison layer.
 *
 * Verdict rules (AC3/AC4):
 *   - No reference canvas, or canvas failed to render        → NOT_ASSESSABLE
 *   - Route HTTP invalid (>= 400 / no response)              → FAIL
 *   - Route redirected away (e.g. admin auth wall)           → CONCERNS
 *   - Canvas rendered with missing sub-resources             → CONCERNS
 *   - Route OK + canvas OK, no manual pixel sign-off yet     → CONCERNS
 *   - PASS is emitted ONLY when a target carries an explicit
 *     `manualSignoff: { by, date, evidence }` (none do today).
 *
 * `canvasAvailable: false` can therefore never be PASS.
 */

const REPO_ROOT = process.cwd();
const DESIGN_SYSTEM_DIR = join(REPO_ROOT, "docs", "design-system");
const REFERENCE_DIR = join(DESIGN_SYSTEM_DIR, "reference");
const SIGNOFF_PATH = join(REPO_ROOT, "docs", "qa", "fidelity-signoff.json");

// ADR-014 D6 ratifies 1180px for the public canvases; the admin dashboard
// canvas / spec-admin-dashboard.md use a 1360px reference width.
const PUBLIC_VIEWPORT = { width: 1180, height: 2400 };
const ADMIN_VIEWPORT = { width: 1360, height: 2400 };

const OUTPUT_DIR = process.env.EPIC14_FIDELITY_OUT_DIR
  ? join(REPO_ROOT, process.env.EPIC14_FIDELITY_OUT_DIR)
  : join(REPO_ROOT, "artifacts", "epic14-fidelity");

/**
 * Canvas-backed targets. `canvasFile` is a file in docs/design-system/reference/.
 * Dynamic public routes are required to receive explicit real catalog fixtures;
 * the harness fails closed instead of silently comparing the catalog proxy.
 */
const auditTargets = [
  {
    id: "home",
    epic: 14,
    routePath: "/",
    canvasFile: "home.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: true,
  },
  {
    id: "courses",
    epic: 14,
    routePath: "/cursos",
    canvasFile: "courses.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: true,
  },
  {
    id: "agenda",
    epic: 14,
    routePath: "/agenda",
    canvasFile: "agenda.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: true,
  },
  {
    id: "in-company",
    epic: 14,
    routePath: "/in-company",
    canvasFile: "in-company.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: true,
  },
  {
    id: "about",
    epic: 14,
    routePath: "/sobre",
    canvasFile: "about.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: true,
  },
  {
    id: "blog",
    epic: 14,
    routePath: "/blog",
    canvasFile: "blog.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: true,
  },
  {
    id: "login",
    epic: 14,
    routePath: "/login",
    canvasFile: "login.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: true,
  },
  {
    id: "course-detail",
    epic: 14,
    routePath: process.env.EPIC14_FIDELITY_COURSE_PATH ?? "/cursos",
    canvasFile: "course-detail.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: true,
    routeNote:
      "Captura usa fixture real do catálogo configurada por EPIC14_FIDELITY_COURSE_PATH.",
  },
  {
    id: "checkout",
    epic: 14,
    routePath: process.env.EPIC14_FIDELITY_CHECKOUT_PATH ?? "/cursos",
    canvasFile: "checkout.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: true,
    routeNote:
      "Captura usa fixture real do catálogo configurada por EPIC14_FIDELITY_CHECKOUT_PATH.",
  },
  ...[
    ["admin-dashboard", "/admin", "dashboard"],
    ["admin-cursos", "/admin/cursos", "cursos"],
    ["admin-turmas", "/admin/turmas", "turmas"],
    ["admin-matriculas", "/admin/inscricoes", "matriculas"],
    ["admin-alunos", "/admin/alunos", "alunos"],
    ["admin-instrutores", "/admin/instrutores", "instrutores"],
    ["admin-leads", "/admin/leads", "leads"],
    ["admin-blog", "/admin/blog", "blog"],
    ["admin-paginas", "/admin/paginas", "paginas"],
    ["admin-configuracoes", "/admin/configuracoes", "config"],
  ].map(([id, routePath, screen]) => ({
    id,
    epic: 15,
    routePath,
    canvasFile: `admin-${screen}.html`,
    viewport: ADMIN_VIEWPORT,
    auth: "admin",
    routeRequired: true,
  })),
];

function loadManualSignoffs() {
  if (!existsSync(SIGNOFF_PATH)) return new Map();
  try {
    const payload = JSON.parse(readFileSync(SIGNOFF_PATH, "utf8"));
    const entries = Object.entries(payload.routes ?? {});
    for (const [targetId, signoff] of entries) {
      if (
        !signoff ||
        typeof signoff !== "object" ||
        Array.isArray(signoff) ||
        typeof signoff.by !== "string" ||
        !signoff.by.trim() ||
        typeof signoff.date !== "string" ||
        Number.isNaN(Date.parse(signoff.date))
      ) {
        throw new Error(`Sign-off manual inválido para ${targetId}.`);
      }
    }
    return new Map(entries);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Falha ao ler sign-offs em ${SIGNOFF_PATH}: ${message}`, { cause: error });
  }
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port);
  });
}

async function choosePort(preferredPort = 3100, maxOffset = 20) {
  for (let offset = 0; offset <= maxOffset; offset += 1) {
    const candidate = preferredPort + offset;
    if (await isPortFree(candidate)) return candidate;
  }
  throw new Error(`No free port found in range ${preferredPort}-${preferredPort + maxOffset}.`);
}

async function isServerReachable(baseUrl) {
  try {
    await fetch(baseUrl, { redirect: "manual" });
    return true;
  } catch {
    return false;
  }
}

function waitForServer(url, timeoutMs = 120_000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      fetch(url, { redirect: "manual" })
        .then(() => resolve())
        .catch(() => {
          if (Date.now() - start >= timeoutMs) {
            reject(new Error(`Timed out waiting for test server at ${url}.`));
            return;
          }
          setTimeout(attempt, 250);
        });
    };
    attempt();
  });
}

/**
 * Ensure a server is available. Returns { baseUrl, teardown }.
 * Reuses an external server when EPIC14_FIDELITY_BASE_URL is set and reachable,
 * otherwise spawns the production test server (requires a prior `next build`).
 */
async function ensureServer() {
  const externalBase = process.env.EPIC14_FIDELITY_BASE_URL;
  if (externalBase && (await isServerReachable(externalBase))) {
    return { baseUrl: externalBase, teardown: () => {} };
  }

  const distDir = process.env.NEXT_DIST_DIR ?? ".next";
  if (!existsSync(join(REPO_ROOT, distDir, "BUILD_ID"))) {
    throw new Error(
      `Nenhum servidor alcançável e build de produção ausente em ${distDir}. Rode o build correspondente ou aponte EPIC14_FIDELITY_BASE_URL para um servidor ativo.`
    );
  }

  const port = await choosePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ["scripts/start-test-server.mjs"], {
    cwd: REPO_ROOT,
    env: { ...process.env, PLAYWRIGHT_PORT: String(port), PORT: String(port) },
    stdio: "inherit",
  });

  const teardown = () => {
    if (!server.killed) server.kill("SIGTERM");
  };
  process.once("SIGINT", teardown);
  process.once("SIGTERM", teardown);

  try {
    await waitForServer(baseUrl);
  } catch (error) {
    teardown();
    throw error;
  }

  return { baseUrl, teardown };
}

async function waitForStablePage(page) {
  await page.locator("body").waitFor({ state: "attached" });
  await page.waitForLoadState("domcontentloaded");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
}

async function captureRoute(context, baseUrl, target) {
  if (target.auth === "admin") await authenticateAdmin(context, baseUrl, target.id);
  const page = await context.newPage();
  const filePath = join(OUTPUT_DIR, `${target.id}-route.png`);
  const url = new URL(target.routePath, baseUrl).toString();
  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
    const status = response?.status() ?? 0;
    await waitForStablePage(page);
    const visibleText = await page.locator("body").innerText();
    const mockSignatures = [
      "nova-lei-de-licitacoes-na-pratica",
      "lgpd-para-o-setor-publico-da-teoria-a-rotina",
      "course-nova-lei-licitacoes",
    ];
    const mockDetected = mockSignatures.some((signature) => `${target.routePath} ${visibleText}`.toLowerCase().includes(signature));
    if (mockDetected) throw new Error(`Guarda anti-mock acionada para ${target.routePath}.`);
    await page.screenshot({ path: filePath, fullPage: true });
    const finalUrl = page.url();
    const redirected = new URL(finalUrl).pathname !== new URL(url).pathname;
    return { status, finalUrl, redirected, screenshot: `${target.id}-route.png` };
  } finally {
    await page.close();
  }
}

async function authenticateAdmin(context, baseUrl, targetId) {
  const email = process.env.E2E_ADMIN_EMAIL ?? "admin-contract@rhcursos.test";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD deve ser definido para capturas autenticadas.");
  const ipOctet = [...targetId].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 200 + 20;
  const ip = `10.24.18.${ipOctet}`;
  const response = await context.request.post(new URL("/api/auth/session", baseUrl).toString(), {
    data: { email, password, role: "admin" },
    headers: {
      "cf-connecting-ip": ip,
      "x-forwarded-for": ip,
      "x-real-ip": ip,
    },
  });
  if (!response.ok()) {
    throw new Error(`Falha ao autenticar fixture admin via /api/auth/session: ${response.status()}`);
  }
  const payload = await response.json();
  if (payload.ok !== true || payload.session?.role !== "admin") {
    throw new Error("Contrato SSR não confirmou uma sessão admin válida para a captura.");
  }
}

/**
 * Render the generated, self-contained reference canvas. The generated file is
 * reused directly so any missing asset becomes a deterministic harness finding.
 */
async function captureCanvas(context, target) {
  const sourcePath = join(REFERENCE_DIR, target.canvasFile);
  if (!existsSync(sourcePath)) {
    return { available: false, reason: `Canvas de referência ausente: docs/design-system/reference/${target.canvasFile}` };
  }

  const page = await context.newPage();
  const missingAssets = new Set();
  page.on("requestfailed", (request) => missingAssets.add(shortAsset(request.url())));
  page.on("response", (response) => {
    if (response.status() >= 400) missingAssets.add(`${shortAsset(response.url())} (${response.status()})`);
  });

  const filePath = join(OUTPUT_DIR, `${target.id}-canvas.png`);
  try {
    const fileUrl = pathToFileURL(sourcePath).toString();
    const response = await page.goto(fileUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await waitForStablePage(page);
    await page.screenshot({ path: filePath, fullPage: true });

    const warnings = [...missingAssets];
    const criticalMissing = warnings.filter((asset) => /styles\.css|_ds_bundle\.js|colors\.css|tokens\//.test(asset));
    return {
      available: true,
      screenshot: `${target.id}-canvas.png`,
      status: response?.status() ?? 0,
      canvasFile: `docs/design-system/reference/${target.canvasFile}`,
      viewport: target.viewport,
      warnings,
      criticalMissing,
    };
  } finally {
    await page.close();
  }
}

function shortAsset(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.split("/").slice(-1)[0] || parsed.pathname;
  } catch {
    return url;
  }
}

function computeVerdict(target, route, canvas) {
  const reasons = [];

  if (!canvas.available) {
    reasons.push(canvas.reason ?? "Referência de canvas indisponível.");
    return { verdict: "NOT_ASSESSABLE", reasons };
  }

  if (canvas.criticalMissing && canvas.criticalMissing.length > 0) {
    reasons.push(`Canvas renderizou sem tokens/CSS críticos: ${canvas.criticalMissing.join(", ")}.`);
    return { verdict: "NOT_ASSESSABLE", reasons };
  }

  if (target.routeRequired && (!route.status || route.status >= 400)) {
    reasons.push(`Rota respondeu com status inválido (${route.status}).`);
    return { verdict: "FAIL", reasons };
  }

  if (route.redirected) {
    reasons.push(`Rota redirecionou para ${route.finalUrl} — não avaliável diretamente.`);
    return { verdict: "FAIL", reasons };
  }

  if (target.routeNote) reasons.push(target.routeNote);

  if (canvas.warnings && canvas.warnings.length > 0) {
    reasons.push(`Canvas com sub-recursos ausentes (não fatais): ${canvas.warnings.join(", ")}.`);
  }

  if (target.manualSignoff) {
    reasons.push(
      `Sign-off manual de fidelidade por ${target.manualSignoff.by} em ${target.manualSignoff.date}.`
    );
    return { verdict: "PASS", reasons };
  }

  reasons.push(
    "Par rota×canvas disponível; fidelidade pixel-a-pixel exige revisão visual manual (harness não afirma PASS automaticamente)."
  );
  return { verdict: "CONCERNS", reasons };
}

function cleanupStaleArtifacts(filesToKeep) {
  const keep = new Set([...filesToKeep, "manifest.json"]);
  for (const entry of readdirSync(OUTPUT_DIR)) {
    if (keep.has(entry)) continue;
    if (!entry.endsWith(".png") && entry !== "manifest.json") continue;
    unlinkSync(join(OUTPUT_DIR, entry));
  }
}

async function main() {
  if (!process.env.EPIC14_FIDELITY_COURSE_PATH || !process.env.EPIC14_FIDELITY_CHECKOUT_PATH) {
    throw new Error(
      "Captura fechada: defina EPIC14_FIDELITY_COURSE_PATH e EPIC14_FIDELITY_CHECKOUT_PATH com caminhos reais do catálogo; /cursos não é um proxy válido."
    );
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const manualSignoffs = loadManualSignoffs();
  for (const target of auditTargets) {
    const signoff = manualSignoffs.get(target.id);
    if (signoff) target.manualSignoff = signoff;
  }

  const filesToKeep = [];
  for (const target of auditTargets) {
    filesToKeep.push(`${target.id}-route.png`, `${target.id}-canvas.png`);
  }
  cleanupStaleArtifacts(filesToKeep);

  const { baseUrl, teardown } = await ensureServer();
  const browser = await chromium.launch({ headless: true });

  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    publicViewport: PUBLIC_VIEWPORT,
    adminViewport: ADMIN_VIEWPORT,
    outputDir: relative(REPO_ROOT, OUTPUT_DIR),
    verdictLegend: {
      PASS: "Rota e canvas comparados com sign-off manual de fidelidade.",
      CONCERNS: "Par disponível; requer revisão visual manual ou possui ressalvas.",
      FAIL: "Rota respondeu com status inválido.",
      NOT_ASSESSABLE: "Sem referência de canvas utilizável.",
    },
    targets: [],
  };

  const summary = { PASS: 0, CONCERNS: 0, FAIL: 0, NOT_ASSESSABLE: 0 };

  try {
    for (const target of auditTargets) {
      console.log(`\n▶ ${target.id} (epic ${target.epic}) route=${target.routePath}`);
      const context = await browser.newContext({
        viewport: target.viewport,
        colorScheme: "light",
        bypassCSP: true,
      });

      let route = { status: 0, finalUrl: null, redirected: false, screenshot: null };
      try {
        route = await captureRoute(context, baseUrl, target);
        console.log(`  route → status ${route.status}${route.redirected ? ` (redirect ${route.finalUrl})` : ""}`);
      } catch (error) {
        route.error = error instanceof Error ? error.message : String(error);
        console.log(`  route → error ${route.error}`);
      }

      let canvas;
      try {
        canvas = await captureCanvas(context, target);
      } catch (error) {
        canvas = {
          available: false,
          reason: error instanceof Error ? error.message : String(error),
        };
      }
      console.log(
        canvas.available
          ? `  canvas → ${canvas.screenshot}${canvas.warnings?.length ? ` (${canvas.warnings.length} warnings)` : ""}`
          : `  canvas → unavailable`
      );

      await context.close();

      const { verdict, reasons } = computeVerdict(target, route, canvas);
      summary[verdict] += 1;
      console.log(`  verdict → ${verdict}`);

      manifest.targets.push({
        id: target.id,
        epic: target.epic,
        routePath: target.routePath,
        auth: target.auth,
        viewport: target.viewport,
        canvasAvailable: canvas.available,
        canvasFile: canvas.canvasFile ?? null,
        routeScreenshot: route.screenshot,
        routeStatus: route.status,
        routeFinalUrl: route.finalUrl,
        routeRedirected: route.redirected,
        routeError: route.error ?? null,
        canvasScreenshot: canvas.screenshot ?? null,
        canvasWarnings: canvas.warnings ?? [],
        canvasCriticalMissing: canvas.criticalMissing ?? [],
        verdict,
        reasons,
      });
    }
  } finally {
    await browser.close();
    teardown();
  }

  manifest.summary = summary;
  writeFileSync(join(OUTPUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));

  console.log(`\nEpic 14/15 fidelity captures written to ${OUTPUT_DIR}`);
  console.log(`Verdict summary: ${JSON.stringify(summary)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
