import { mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const storageDir = path.resolve(".vitest");
mkdirSync(storageDir, { recursive: true });

const storageFile = path.join(storageDir, "localstorage");
const flag = `--localstorage-file=${storageFile}`;
const currentNodeOptions = process.env.NODE_OPTIONS?.trim() ?? "";
const nodeOptions = currentNodeOptions.length > 0 ? `${currentNodeOptions} ${flag}` : flag;

const vitestBin = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(vitestBin, ["vitest", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_OPTIONS: nodeOptions,
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
