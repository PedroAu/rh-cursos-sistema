import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const secretNamePattern = /(SECRET|TOKEN|KEY|PASSWORD|DSN|WEBHOOK)/i;
const allowedPlaceholderValues = new Set(["", "changeme", "example", "placeholder"]);
const failures = [];

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function checkTrackedEnvFiles() {
  const trackedEnvFiles = runGit(["ls-files", ".env*", ".next/**/.env"]).filter(
    (path) => path !== ".env.example",
  );

  if (trackedEnvFiles.length > 0) {
    failures.push(`Tracked env files are not allowed: ${trackedEnvFiles.join(", ")}`);
  }
}

function checkGeneratedEnvArtifacts() {
  const generatedEnvArtifacts = runGit(["status", "--ignored", "--short", ".next"]).filter((line) =>
    line.endsWith("/.env"),
  );

  if (generatedEnvArtifacts.length > 0) {
    failures.push(
      "Generated .next env artifacts must be removed before packaging: " +
        generatedEnvArtifacts.join(", "),
    );
  }
}

function checkEnvExample() {
  if (!existsSync(".env.example")) {
    failures.push(".env.example is missing");
    return;
  }

  const lines = readFileSync(".env.example", "utf8").split("\n");

  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [name, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").trim();

    if (secretNamePattern.test(name) && !allowedPlaceholderValues.has(value.toLowerCase())) {
      failures.push(`.env.example line ${index + 1} has a non-placeholder value for ${name}`);
    }
  }
}

checkTrackedEnvFiles();
checkGeneratedEnvArtifacts();
checkEnvExample();

if (failures.length > 0) {
  console.error("Secret hygiene check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Secret hygiene check passed.");
