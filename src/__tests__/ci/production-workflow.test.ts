import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const workflowsDirectory = resolve(process.cwd(), ".github/workflows");

function readWorkflow(name: string) {
  return readFileSync(resolve(workflowsDirectory, name), "utf8");
}

function readTopLevelBlock(source: string, key: string) {
  const lines = source.split("\n");
  const start = lines.findIndex((line) => line === `${key}:`);
  if (start < 0) throw new Error(`Bloco top-level ausente: ${key}`);

  const block: string[] = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    if (line !== "" && !line.startsWith(" ") && !line.startsWith("#")) break;
    block.push(line);
  }
  return block.join("\n");
}

function readNestedBlock(source: string, key: string, indentation: number) {
  const lines = source.split("\n");
  const prefix = `${" ".repeat(indentation)}${key}:`;
  const start = lines.findIndex((line) => line === prefix);
  if (start < 0) throw new Error(`Bloco aninhado ausente: ${key}`);

  const block: string[] = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const currentIndentation = line.match(/^ */)?.[0].length ?? 0;
    if (line.trim() !== "" && currentIndentation <= indentation) break;
    block.push(line);
  }
  return block.join("\n");
}

function externalActionReferences(source: string) {
  return Array.from(source.matchAll(/^\s*(?:-\s*)?uses:\s*([^\s#]+)/gm), (match) => match[1] ?? "")
    .filter((reference) => !reference.startsWith("./"));
}

describe("REC-401 production delivery graph", () => {
  const ci = readWorkflow("ci.yml");
  const deployFunctions = readWorkflow("deploy-functions.yml");
  const deployFrontend = readWorkflow("deploy-frontend.yml");
  const production = readWorkflow("production-pipeline.yml");

  it("uses one canonical production entrypoint without direct deploy bypasses", () => {
    const ciTriggers = readTopLevelBlock(ci, "on");
    const ciPush = readNestedBlock(ciTriggers, "push", 2);
    const functionsTriggers = readTopLevelBlock(deployFunctions, "on");
    const frontendTriggers = readTopLevelBlock(deployFrontend, "on");
    const productionTriggers = readTopLevelBlock(production, "on");

    expect(ciTriggers).toContain("  workflow_call:");
    expect(ciPush).toContain("develop");
    expect(ciPush).toContain("feature/**");
    expect(ciPush).not.toContain("main");

    for (const triggers of [functionsTriggers, frontendTriggers]) {
      expect(triggers).toContain("  workflow_call:");
      expect(triggers).not.toMatch(/^  push:/m);
      expect(triggers).not.toMatch(/^  workflow_dispatch:/m);
    }

    expect(productionTriggers).toContain("  push:");
    expect(productionTriggers).toContain("main");
    expect(productionTriggers).toContain("  workflow_dispatch:");
  });

  it("blocks deploys on CI failure and orders Functions before frontend", () => {
    expect(production).toMatch(/^  ci:\n    uses: \.\/\.github\/workflows\/ci\.yml$/m);
    expect(production).toMatch(/^  deploy-functions:\n    needs: \[changes, ci\]$/m);
    expect(production).toContain("needs.ci.result == 'success'");
    expect(production).toMatch(/^  deploy-frontend:\n    needs: \[changes, ci, deploy-functions\]$/m);
    expect(production).toContain("needs.deploy-functions.result == 'success'");
    expect(production).toContain("needs.deploy-functions.result == 'skipped'");
    expect(production).not.toContain("continue-on-error");
  });

  it("passes only the secrets declared by each reusable workflow", () => {
    const ciJob = readNestedBlock(production, "ci", 2);
    const functionsJob = readNestedBlock(production, "deploy-functions", 2);
    const frontendJob = readNestedBlock(production, "deploy-frontend", 2);

    expect(production).not.toContain("secrets: inherit");

    for (const secret of [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_APP_URL",
      "AUTH_SESSION_SECRET",
    ]) {
      expect(ciJob).toContain(`${secret}: \${{ secrets.${secret} }}`);
    }
    expect(ciJob).not.toContain("SUPABASE_ACCESS_TOKEN");
    expect(ciJob).not.toContain("CLOUDFLARE_API_TOKEN");

    for (const secret of [
      "SUPABASE_ACCESS_TOKEN",
      "SUPABASE_PROJECT_REF",
      "AUTH_SESSION_SECRET",
      "NEXT_PUBLIC_APP_URL",
      "EXTRA_ALLOWED_ORIGINS",
    ]) {
      expect(functionsJob).toContain(`${secret}: \${{ secrets.${secret} }}`);
    }
    expect(functionsJob).not.toContain("CLOUDFLARE_API_TOKEN");

    for (const secret of [
      "CLOUDFLARE_API_TOKEN",
      "CLOUDFLARE_ACCOUNT_ID",
      "AUTH_SESSION_SECRET",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_APP_URL",
    ]) {
      expect(frontendJob).toContain(`${secret}: \${{ secrets.${secret} }}`);
    }
    expect(frontendJob).not.toContain("SUPABASE_ACCESS_TOKEN");
  });

  it("keeps path decisions fail-closed and makes manual dispatch explicit", () => {
    expect(production).toContain("EVENT_NAME: ${{ github.event_name }}");
    expect(production).toContain('"$EVENT_NAME" == "workflow_dispatch"');
    expect(production).toContain("supabase/functions/*");
    expect(production).toContain("app/*");
    expect(production).toContain("functions=true");
    expect(production).toContain("frontend=true");
    expect(production).toContain("needs.changes.outputs.functions == 'true'");
    expect(production).toContain("needs.changes.outputs.frontend == 'true'");
  });

  it("pins every external action used by the delivery workflows", () => {
    const references = [ci, deployFunctions, deployFrontend, production]
      .flatMap(externalActionReferences);

    expect(references.length).toBeGreaterThan(0);
    for (const reference of references) {
      expect(reference).toMatch(/@[a-f0-9]{40}$/);
    }
  });
});
