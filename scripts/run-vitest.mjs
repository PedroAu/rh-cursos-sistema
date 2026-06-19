import { spawn } from "node:child_process";

const vitestBin = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(vitestBin, ["vitest", ...process.argv.slice(2)], {
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
