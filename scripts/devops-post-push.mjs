#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: options.capture ? "pipe" : "inherit",
    encoding: "utf8",
    shell: false,
    env: process.env
  });

  return result;
}

function capture(command, args, fallback = null) {
  const result = run(command, args, { capture: true });
  if (result.status !== 0) {
    return fallback;
  }

  return result.stdout.trim();
}

function commandExists(command) {
  return run("sh", ["-lc", `command -v ${command}`], { capture: true }).status === 0;
}

function printSection(title) {
  console.log(`\n==> ${title}`);
}

function printKey(label, value) {
  console.log(`${label}: ${value}`);
}

const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

const branch = capture("git", ["branch", "--show-current"], "unknown");
const remote = capture("git", ["config", "--get", `branch.${branch}.remote`], "origin");
const upstream = capture("git", ["rev-parse", "--abbrev-ref", `${branch}@{upstream}`], `${remote}/${branch}`);

console.log("AIOX DevOps post-push check");
printKey("Package", packageJson.name);
printKey("Branch", branch);
printKey("Upstream", upstream);

printSection("Fetch");
const fetchResult = run("git", ["fetch", "--prune", remote]);
if (fetchResult.status !== 0) {
  console.error(`Failed to fetch ${remote}.`);
  process.exit(fetchResult.status ?? 1);
}

printSection("Repository");
const worktreeStatus = capture("git", ["status", "--porcelain"], "");
const worktreeLabel = worktreeStatus ? "dirty" : "clean";
const aheadBehind = capture("git", ["rev-list", "--left-right", "--count", `${upstream}...HEAD`], "0\t0");
const [behind = "0", ahead = "0"] = aheadBehind.split("\t");
const latestLocal = capture("git", ["log", "--oneline", "-n", "1", "HEAD"], "unknown");
const latestRemote = capture("git", ["log", "--oneline", "-n", "1", upstream], "unknown");
const defaultBranch = capture("git", ["symbolic-ref", "--short", "refs/remotes/origin/HEAD"], "origin/main");

printKey("Working tree", worktreeLabel);
printKey("Ahead", ahead);
printKey("Behind", behind);
printKey("Latest local", latestLocal);
printKey("Latest upstream", latestRemote);
printKey("Remote default", defaultBranch);

if (commandExists("gh")) {
  printSection("GitHub");
  const repoInfo = capture("gh", ["repo", "view", "--json", "nameWithOwner,url,defaultBranchRef"], "");
  if (repoInfo) {
    try {
      const parsed = JSON.parse(repoInfo);
      printKey("Repository", parsed.nameWithOwner);
      printKey("URL", parsed.url);
      printKey("Default branch", parsed.defaultBranchRef?.name ?? "unknown");
    } catch {
      printKey("Repository", "available");
    }
  }

  if (branch !== (defaultBranch.split("/").pop() ?? "main")) {
    const prStatus = capture("gh", ["pr", "status"], "");
    if (prStatus) {
      console.log(prStatus);
    }
  }
}

printSection("Next steps");
if (Number(ahead) > 0) {
  console.log("- Push incompleto: ainda existem commits locais pendentes.");
} else if (Number(behind) > 0) {
  console.log("- Seu branch remoto avançou depois do push; faça fetch/pull antes de seguir.");
} else {
  console.log("- Push confirmado: HEAD local está sincronizado com o upstream.");
}

if (worktreeStatus) {
  console.log("- O worktree ficou sujo após o push; revise antes de novo commit.");
} else {
  console.log("- Worktree limpo.");
}

if (branch === (defaultBranch.split("/").pop() ?? "main")) {
  console.log("- Fluxo sugerido: release, deploy ou cleanup de branches/worktrees.");
} else {
  console.log("- Fluxo sugerido: criar/revisar PR da branch atual.");
}
