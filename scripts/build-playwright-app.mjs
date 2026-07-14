import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const child = spawn(npmCommand, ["run", "build"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NEXT_DIST_DIR: ".next-playwright",
    NEXT_PUBLIC_PLAYWRIGHT_TEST_BASELINE: "1",
    PLAYWRIGHT_TEST_BUILD: "1",
  },
  stdio: "inherit",
});

child.once("error", (error) => {
  console.error("Falha ao iniciar o build dedicado do Playwright:", error.message);
  process.exit(1);
});

child.once("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
