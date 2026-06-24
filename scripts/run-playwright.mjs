import { spawn } from "node:child_process";

const env = { ...process.env };
delete env.NO_COLOR;

// Visual/axe baseline tests are sensitive to concurrent browser load.
const child = spawn(
  process.execPath,
  ["./node_modules/@playwright/test/cli.js", "test", "--workers=1"],
  {
    cwd: process.cwd(),
    env,
    stdio: "inherit"
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
