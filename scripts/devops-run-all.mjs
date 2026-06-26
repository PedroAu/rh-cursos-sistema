#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const args = process.argv.slice(2);

function getArgValue(name) {
  const index = args.indexOf(name);
  if (index === -1) return null;
  return args[index + 1] ?? null;
}

function hasArg(name) {
  return args.includes(name);
}

function run(command, commandArgs, options = {}) {
  const label = options.label ?? [command, ...commandArgs].join(" ");
  const startedAt = Date.now();
  console.log(`\n==> ${label}`);

  const result = spawnSync(command, commandArgs, {
    cwd: root,
    stdio: options.capture ? "pipe" : "inherit",
    encoding: "utf8",
    shell: false,
    env: process.env,
  });

  const duration = ((Date.now() - startedAt) / 1000).toFixed(1);
  const code = result.status ?? 1;

  if (!options.capture) {
    console.log(`==> ${label} ${code === 0 ? "PASS" : "FAIL"} (${duration}s)`);
  }

  return result;
}

function capture(command, commandArgs) {
  const result = run(command, commandArgs, { capture: true });
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

function maskRemoteUrl(remoteUrl) {
  if (!remoteUrl) return "unknown";

  try {
    const url = new URL(remoteUrl);
    url.username = "";
    url.password = "";
    return url.toString();
  } catch {
    return remoteUrl.replace(/\/\/[^/@\s]+@/, "//***@");
  }
}

function detectStoryFromProjectStatus() {
  const statusPath = resolve(root, ".aiox/project-status.yaml");
  if (!existsSync(statusPath)) return null;

  const content = readFileSync(statusPath, "utf8");
  const match = content.match(/^\s*currentStory:\s*(.+)$/m);
  if (!match) return null;

  const value = match[1].trim().replace(/^['"]|['"]$/g, "");
  if (!value || value === "null") return null;
  return value;
}

function checkStory(storyPath) {
  if (!storyPath) {
    return {
      ok: true,
      label: "SKIP",
      message: "No story path provided. Use --story docs/stories/<file>.md for push-ready validation.",
    };
  }

  const absolutePath = resolve(root, storyPath);
  if (!existsSync(absolutePath)) {
    return {
      ok: false,
      label: "FAIL",
      message: `Story file not found: ${storyPath}`,
    };
  }

  const content = readFileSync(absolutePath, "utf8");
  const status = content.match(/^## Status\s*\n+([^\n]+)/m)?.[1]?.trim() ?? null;
  const ok = status === "Done" || status === "Ready for Review";

  return {
    ok,
    label: ok ? "PASS" : "FAIL",
    message: status
      ? `Story status is "${status}" (${storyPath})`
      : `Story status not found (${storyPath})`,
  };
}

function commandExists(command) {
  const result = spawnSync("sh", ["-lc", `command -v ${command}`], {
    cwd: root,
    stdio: "ignore",
  });
  return result.status === 0;
}

const explicitStoryPath = getArgValue("--story") ?? process.env.AIOX_STORY ?? null;
const storyPath = explicitStoryPath ?? detectStoryFromProjectStatus();
const skipCodeRabbit = hasArg("--skip-coderabbit") || hasArg("--no-coderabbit");

console.log("AIOX DevOps local execution");
console.log(
  `Repository: ${maskRemoteUrl(capture("git", ["config", "--get", "remote.origin.url"]))}`
);
console.log(`Branch: ${capture("git", ["branch", "--show-current"]) ?? "unknown"}`);
console.log(`Package: ${JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")).name}`);

const dirtyFiles = capture("git", ["status", "--porcelain"]);
console.log(`Working tree: ${dirtyFiles ? "dirty" : "clean"}`);

const storyCheck = checkStory(storyPath);
console.log(`Story gate: ${storyCheck.label} - ${storyCheck.message}`);
if (explicitStoryPath && !storyCheck.ok) {
  process.exit(1);
}
if (!explicitStoryPath && !storyCheck.ok) {
  console.log("Story gate is non-blocking because it was auto-detected.");
}

const steps = [];

if (!skipCodeRabbit) {
  if (commandExists("coderabbit")) {
    steps.push({
      label: "coderabbit review --agent --type uncommitted",
      command: "coderabbit",
      args: ["review", "--agent", "--type", "uncommitted"],
    });
  } else {
    console.log("CodeRabbit gate: SKIP - coderabbit CLI not found.");
  }
}

steps.push(
  { label: "npm run lint", command: "npm", args: ["run", "lint"] },
  { label: "npm run typecheck", command: "npm", args: ["run", "typecheck"] },
  { label: "npm run build", command: "npm", args: ["run", "build"] },
  { label: "npm test", command: "npm", args: ["test"] },
);

for (const step of steps) {
  const result = run(step.command, step.args, { label: step.label });
  if (result.status !== 0) {
    console.error(`\nDevOps execution blocked at: ${step.label}`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nAIOX DevOps local execution PASS.");
console.log("Remote actions were not executed. Use @devops *push / *create-pr after explicit confirmation.");
