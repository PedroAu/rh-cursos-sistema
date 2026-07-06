import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "playwright";

const BASE_URL = process.env.EPIC14_FIDELITY_BASE_URL ?? "http://127.0.0.1:3100";
const OUTPUT_DIR = process.env.EPIC14_FIDELITY_OUT_DIR
  ? join(process.cwd(), process.env.EPIC14_FIDELITY_OUT_DIR)
  : join(process.cwd(), "artifacts", "epic14-fidelity");

const viewport = { width: 1180, height: 2400 };

const auditTargets = [
  {
    id: "home",
    routePath: "/",
    canvasPaths: ["/RH%20Cursos%20Home.html"],
  },
  {
    id: "courses",
    routePath: "/cursos",
    canvasPaths: [],
  },
  {
    id: "agenda",
    routePath: "/agenda",
    canvasPaths: ["/RH%20Cursos%20Agenda.html"],
  },
  {
    id: "in-company",
    routePath: "/in-company",
    canvasPaths: [],
  },
  {
    id: "about",
    routePath: "/sobre",
    canvasPaths: [],
  },
  {
    id: "blog",
    routePath: "/blog",
    canvasPaths: [],
  },
];

async function waitForStablePage(page) {
  await page.locator("body").waitFor({ state: "attached" });
  await page.waitForLoadState("domcontentloaded");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
}

async function capture(page, path, filePath, options = {}) {
  console.log(`Capturing ${path} -> ${filePath}`);
  const response = await page.goto(path, { waitUntil: "domcontentloaded", timeout: 30_000 });
  const status = response?.status() ?? 0;

  if (options.requireOk !== false && (!response || status >= 400)) {
    throw new Error(`Capture target ${path} responded with invalid status ${status}.`);
  }

  await waitForStablePage(page);
  await page.screenshot({ path: filePath, fullPage: true });

  return {
    status,
    finalUrl: page.url(),
  };
}

function cleanupStaleArtifacts(filesToKeep) {
  const keep = new Set(filesToKeep);

  for (const entry of readdirSync(OUTPUT_DIR)) {
    if (keep.has(entry)) continue;
    if (!entry.endsWith(".png") && entry !== "manifest.json") continue;

    unlinkSync(join(OUTPUT_DIR, entry));
  }
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const filesToKeep = ["manifest.json"];
  for (const target of auditTargets) {
    filesToKeep.push(`${target.id}-route.png`);

    if (target.canvasPaths.length === 1) {
      filesToKeep.push(`${target.id}-canvas.png`);
    } else {
      for (let index = 0; index < target.canvasPaths.length; index += 1) {
        filesToKeep.push(`${target.id}-canvas-${index + 1}.png`);
      }
    }
  }

  cleanupStaleArtifacts(filesToKeep);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: BASE_URL, viewport, bypassCSP: true });
  const page = await context.newPage();

  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    viewport,
    outputDir: OUTPUT_DIR,
    targets: [],
  };

  try {
    for (const target of auditTargets) {
      const routeFile = `${target.id}-route.png`;
      const routeMeta = await capture(page, target.routePath, join(OUTPUT_DIR, routeFile));

      const canvasFiles = [];
      const canvasMetas = [];
      for (let index = 0; index < target.canvasPaths.length; index += 1) {
        const canvasFile =
          target.canvasPaths.length === 1
            ? `${target.id}-canvas.png`
            : `${target.id}-canvas-${index + 1}.png`;
        const canvasMeta = await capture(page, target.canvasPaths[index], join(OUTPUT_DIR, canvasFile));
        canvasFiles.push(canvasFile);
        canvasMetas.push({
          path: target.canvasPaths[index],
          screenshot: canvasFile,
          status: canvasMeta.status,
          finalUrl: canvasMeta.finalUrl,
        });
      }

      manifest.targets.push({
        id: target.id,
        routePath: target.routePath,
        routeScreenshot: routeFile,
        routeStatus: routeMeta.status,
        canvasPaths: target.canvasPaths,
        canvasScreenshots: canvasFiles,
        canvasAvailable: target.canvasPaths.length > 0,
        canvasEvidence:
          target.canvasPaths.length > 0
            ? canvasMetas
            : [{ status: "unavailable", reason: "No reference canvas asset exists in public/ for this route." }],
      });
    }
  } finally {
    await context.close();
    await browser.close();
  }

  writeFileSync(join(OUTPUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));

  console.log(`Epic 14 fidelity captures written to ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
