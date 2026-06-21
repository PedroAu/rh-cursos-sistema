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
  // Use find instead of git status, which collapses ignored dirs
  // Scan both .next/ and .open-next/ for generated .env files
  const dirsToCheck = [".next", ".open-next"];
  const foundEnvFiles = [];

  for (const dir of dirsToCheck) {
    try {
      const envFiles = execFileSync("find", [dir, "-path", "*/.env", "-type", "f"], {
        encoding: "utf8",
      })
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      foundEnvFiles.push(...envFiles);
    } catch {
      // find returns error if dir doesn't exist, which is OK
    }
  }

  if (foundEnvFiles.length > 0) {
    failures.push(
      "Generated .env artifacts must be removed before packaging: " + foundEnvFiles.join(", "),
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
