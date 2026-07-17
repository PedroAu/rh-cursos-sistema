import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

function readPackageJson() {
  const raw = readFileSync(resolve(repoRoot, "package.json"), "utf8");
  return JSON.parse(raw) as { scripts: Record<string, string> };
}

function readAllWorkflows() {
  const workflowsDirectory = resolve(repoRoot, ".github/workflows");
  return readdirSync(workflowsDirectory)
    .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
    .map((name) => ({
      name,
      source: readFileSync(resolve(workflowsDirectory, name), "utf8"),
    }));
}

/**
 * REC-405 — Separar comparação visual da atualização (Onda 5, FND-15/NFR-06).
 *
 * A suíte visual real ("tests/ui-governance.spec.ts", toHaveScreenshot) só
 * pode ser rodada por um comando de COMPARAÇÃO, nunca por um comando capaz
 * de também atualizar o baseline. Este teste trava essa garantia:
 * - existe um script de comparação (`test:visual`) sem flag de update;
 * - existe um script SEPARADO e explicitamente nomeado (`test:visual:update`)
 *   só para atualização manual/local;
 * - nenhum workflow de CI referencia o comando de atualização ou a flag
 *   `--update-snapshots`/`-u` do Playwright.
 */
describe("REC-405 visual baseline comparison vs. update separation", () => {
  const { scripts } = readPackageJson();

  it("defines a comparison-only script that never carries an update flag", () => {
    expect(scripts["test:visual"]).toBeDefined();
    expect(scripts["test:visual"]).toContain("ui-governance.spec.ts");
    expect(scripts["test:visual"]).not.toMatch(/--update-snapshots|(^|\s)-u(\s|$)/);
  });

  it("defines a separately named, explicit baseline-update script", () => {
    expect(scripts["test:visual:update"]).toBeDefined();
    expect(scripts["test:visual:update"]).toContain("ui-governance.spec.ts");
    expect(scripts["test:visual:update"]).toContain("--update-snapshots");
  });

  it("keeps every other script free of the update-snapshots flag", () => {
    for (const [name, command] of Object.entries(scripts)) {
      if (name === "test:visual:update") continue;
      expect(command, `script "${name}" must not carry --update-snapshots`).not.toMatch(
        /--update-snapshots/
      );
    }
  });

  it("never invokes the baseline-update script or the update flag from any CI workflow", () => {
    const workflows = readAllWorkflows();
    expect(workflows.length).toBeGreaterThan(0);

    for (const { name, source } of workflows) {
      expect(source, `${name} must not run npm run test:visual:update`).not.toContain(
        "test:visual:update"
      );
      expect(source, `${name} must not pass --update-snapshots`).not.toContain(
        "--update-snapshots"
      );
    }
  });

  it("keeps the CI e2e lane on the comparison-only smoke command", () => {
    const ci = readFileSync(resolve(repoRoot, ".github/workflows/ci.yml"), "utf8");
    expect(ci).toContain("npm run test:e2e:smoke");
    expect(ci).not.toContain("npm run test:visual:update");
  });
});
