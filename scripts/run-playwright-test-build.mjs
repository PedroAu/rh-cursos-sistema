import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

if (existsSync(".env.e2e.local")) {
  loadEnvFile(".env.e2e.local");
}

const child = spawn(
  process.execPath,
  ["scripts/run-playwright.mjs", ...process.argv.slice(2)],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NEXT_DIST_DIR: ".next-playwright",
      PLAYWRIGHT_TEST_BUILD: "1",
    },
    stdio: "inherit",
  }
);

child.once("error", (error) => {
  console.error("Falha ao iniciar o Playwright com o bundle dedicado:", error.message);
  process.exit(1);
});

child.once("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
