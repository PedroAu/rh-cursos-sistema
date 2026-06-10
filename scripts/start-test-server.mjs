import { spawn } from "node:child_process";

const env = { ...process.env };
delete env.NO_COLOR;

const child = spawn(
  process.execPath,
  ["./node_modules/next/dist/bin/next", "start", "-p", "3100"],
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
