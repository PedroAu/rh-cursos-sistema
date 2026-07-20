import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import net from "node:net";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { chromium } from "playwright";

/**
 * Epic 14/15 fidelity capture harness (Story 18.2).
 *
 * Restores the reproducible route × canvas pair that the previous version
 * dropped (every `canvasPaths: []`). For each target it captures:
 *   - the live route screenshot (HTTP status validated), and
 *   - the reference canvas screenshot rendered from the versioned
 *     `docs/design-system/*.dc.html` at the same viewport.
 *
 * The reference canvases ship with design-tool asset paths under a hashed
 * `_ds/trust-keith-design-system-.../` prefix that does not exist on disk.
 * The real assets live unhashed in `docs/design-system/` (styles.css,
 * _ds_bundle.js, tokens/*). We resolve the prefix to render the canvas with
 * its own `--tk-*` tokens. Missing runtime shims (support.js) and missing
 * uploads (logo) are recorded as canvas warnings — they degrade the render to
 * CONCERNS, they never silently pass.
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
const HASHED_ASSET_PREFIX =
  "_ds/trust-keith-design-system-e3aaece8-51bd-4e84-9608-1b258b4c11e3/";

// ADR-014 D6 ratifies 1180px for the public canvases; the admin dashboard
// canvas / spec-admin-dashboard.md use a 1360px reference width.
const PUBLIC_VIEWPORT = { width: 1180, height: 2400 };
const ADMIN_VIEWPORT = { width: 1360, height: 2400 };

const OUTPUT_DIR = process.env.EPIC14_FIDELITY_OUT_DIR
  ? join(REPO_ROOT, process.env.EPIC14_FIDELITY_OUT_DIR)
  : join(REPO_ROOT, "artifacts", "epic14-fidelity");

/**
 * Canvas-backed targets. `canvasFile` is a file in docs/design-system/.
 * `routeRequired: false` marks routes that are not deterministically
 * reachable in the harness (dynamic slug / auth wall) — their HTTP status is
 * still recorded but a non-200 does not hard-fail the run.
 */
const auditTargets = [
  {
    id: "home",
    epic: 14,
    routePath: "/",
    canvasFile: "RH Cursos Home.dc.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: true,
  },
  {
    id: "courses",
    epic: 14,
    routePath: "/cursos",
    canvasFile: "RH Cursos Catálogo.dc.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: true,
  },
  {
    id: "agenda",
    epic: 14,
    routePath: "/agenda",
    canvasFile: "Agenda export.dc.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: true,
  },
  {
    id: "in-company",
    epic: 14,
    routePath: "/in-company",
    canvasFile: "RH Cursos In-company.dc.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: true,
  },
  {
    id: "about",
    epic: 14,
    routePath: "/sobre",
    canvasFile: "RH Cursos Quem Somos.dc.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: true,
  },
  {
    id: "blog",
    epic: 14,
    routePath: "/blog",
    canvasFile: "RH Cursos Blog.dc.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: true,
  },
  {
    id: "login",
    epic: 14,
    routePath: "/login",
    canvasFile: "RH Cursos Login.dc.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: true,
  },
  {
    id: "course-detail",
    epic: 14,
    routePath: process.env.EPIC14_FIDELITY_COURSE_PATH ?? "/cursos",
    canvasFile: "RH Cursos Curso.dc.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: false,
    routeNote:
      "Rota real é dinâmica (/cursos/[slug]); captura usa a listagem como proxy. Defina EPIC14_FIDELITY_COURSE_PATH com um slug de fixture para comparar a página de detalhe.",
  },
  {
    id: "checkout",
    epic: 14,
    routePath: process.env.EPIC14_FIDELITY_CHECKOUT_PATH ?? "/cursos",
    canvasFile: "RH Cursos Checkout.dc.html",
    viewport: PUBLIC_VIEWPORT,
    auth: "none",
    routeRequired: false,
    routeNote:
      "Rota real é dinâmica (/cursos/[slug]/checkout) e depende de fixture. Defina EPIC14_FIDELITY_CHECKOUT_PATH com um caminho válido para comparar o checkout.",
  },
  {
    id: "admin-dashboard",
    epic: 15,
    routePath: "/admin",
    canvasFile: "RH Cursos Admin Dashboard.dc.html",
    viewport: ADMIN_VIEWPORT,
    auth: "admin",
    routeRequired: false,
    routeNote:
      "Admin exige sessão SSR autenticada. Sem contrato de auth no harness a rota redireciona para /login — captura documenta o estado; a comparação real depende da Story 18.3.",
  },
];

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

  if (!existsSync(join(REPO_ROOT, ".next", "BUILD_ID"))) {
    throw new Error(
      "Nenhum servidor alcançável e build de produção ausente. Rode `npm run build` ou aponte EPIC14_FIDELITY_BASE_URL para um servidor ativo."
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
  const page = await context.newPage();
  const filePath = join(OUTPUT_DIR, `${target.id}-route.png`);
  const url = new URL(target.routePath, baseUrl).toString();
  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
    const status = response?.status() ?? 0;
    await waitForStablePage(page);
    await page.screenshot({ path: filePath, fullPage: true });
    const finalUrl = page.url();
    const redirected = new URL(finalUrl).pathname !== new URL(url).pathname;
    return { status, finalUrl, redirected, screenshot: `${target.id}-route.png` };
  } finally {
    await page.close();
  }
}

/**
 * Render a reference canvas by resolving its hashed asset prefix to the real
 * files in docs/design-system/. Writes a temp resolved html next to the assets
 * (so relative token @imports resolve), screenshots it, then removes the temp.
 */
async function captureCanvas(context, target) {
  const sourcePath = join(DESIGN_SYSTEM_DIR, target.canvasFile);
  if (!existsSync(sourcePath)) {
    return { available: false, reason: `Canvas de referência ausente: docs/design-system/${target.canvasFile}` };
  }

  const raw = readFileSync(sourcePath, "utf8");
  const resolved = raw.split(HASHED_ASSET_PREFIX).join("");
  const tempName = `.epic14-fidelity-${target.id}.resolved.html`;
  const tempPath = join(DESIGN_SYSTEM_DIR, tempName);
  writeFileSync(tempPath, resolved);

  const page = await context.newPage();
  const missingAssets = new Set();
  page.on("requestfailed", (request) => missingAssets.add(shortAsset(request.url())));
  page.on("response", (response) => {
    if (response.status() >= 400) missingAssets.add(`${shortAsset(response.url())} (${response.status()})`);
  });

  const filePath = join(OUTPUT_DIR, `${target.id}-canvas.png`);
  try {
    const fileUrl = pathToFileURL(tempPath).toString();
    const response = await page.goto(fileUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await waitForStablePage(page);
    await page.screenshot({ path: filePath, fullPage: true });

    const warnings = [...missingAssets];
    const criticalMissing = warnings.filter((asset) => /styles\.css|_ds_bundle\.js|colors\.css|tokens\//.test(asset));
    return {
      available: true,
      screenshot: `${target.id}-canvas.png`,
      status: response?.status() ?? 0,
      canvasFile: `docs/design-system/${target.canvasFile}`,
      viewport: target.viewport,
      warnings,
      criticalMissing,
    };
  } finally {
    await page.close();
    rmSync(tempPath, { force: true });
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
    if (target.auth === "admin") {
      reasons.push("Auth SSR do admin fora do escopo desta story (Story 18.3).");
    }
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
  mkdirSync(OUTPUT_DIR, { recursive: true });

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
