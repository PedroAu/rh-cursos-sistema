import { mkdirSync, writeFileSync } from "node:fs";
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
    canvasPaths: ["/RH%20Cursos%20Home.dc.html", "/RH%20Home%20Sections.dc.html"],
  },
  {
    id: "courses",
    routePath: "/cursos",
    canvasPaths: ["/RH%20Cursos%20Cata%CC%81logo.dc.html"],
  },
  {
    id: "agenda",
    routePath: "/agenda",
    canvasPaths: ["/RH%20Cursos%20Agenda.dc.html"],
  },
  {
    id: "in-company",
    routePath: "/in-company",
    canvasPaths: ["/RH%20Cursos%20In-company.dc.html"],
  },
  {
    id: "about",
    routePath: "/sobre",
    canvasPaths: ["/RH%20Cursos%20Quem%20Somos.dc.html"],
  },
  {
    id: "blog",
    routePath: "/blog",
    canvasPaths: ["/RH%20Cursos%20Blog.dc.html"],
  },
];

async function waitForStablePage(page) {
  await page.locator("body").waitFor({ state: "attached" });
  await page.waitForLoadState("domcontentloaded");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
}

async function capture(page, path, filePath) {
  console.log(`Capturing ${path} -> ${filePath}`);
  await page.goto(path, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await waitForStablePage(page);
  await page.screenshot({ path: filePath, fullPage: true });
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

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
      await capture(page, target.routePath, join(OUTPUT_DIR, routeFile));

      const canvasFiles = [];
      for (let index = 0; index < target.canvasPaths.length; index += 1) {
        const canvasFile =
          target.canvasPaths.length === 1
            ? `${target.id}-canvas.png`
            : `${target.id}-canvas-${index + 1}.png`;
        await capture(page, target.canvasPaths[index], join(OUTPUT_DIR, canvasFile));
        canvasFiles.push(canvasFile);
      }

      manifest.targets.push({
        id: target.id,
        routePath: target.routePath,
        routeScreenshot: routeFile,
        canvasPaths: target.canvasPaths,
        canvasScreenshots: canvasFiles,
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
