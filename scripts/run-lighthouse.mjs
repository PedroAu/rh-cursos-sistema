import { spawn } from "node:child_process";

function onceExit(child) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const finishResolve = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const finishReject = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    child.once("error", finishReject);
    child.once("exit", (code, signal) => finishResolve({ code, signal }));
    child.once("close", (code, signal) => finishResolve({ code, signal }));
  });
}

async function main() {
  const env = {
    ...process.env,
    LHCI_PORT: process.env.LHCI_PORT ?? "3001",
  };

  const child = spawn("./node_modules/.bin/lhci", ["autorun", "--config=./lighthouserc.cjs"], {
    cwd: process.cwd(),
    env,
    stdio: "inherit",
    shell: true,
  });

  const result = await onceExit(child);

  if (result.signal) {
    process.kill(process.pid, result.signal);
    return;
  }

  process.exit(result.code ?? 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
