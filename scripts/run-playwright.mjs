import { spawn } from "node:child_process";
import net from "node:net";

const env = { ...process.env };
delete env.NO_COLOR;
const extraArgs = process.argv.slice(2);

function onceExit(child) {
  return new Promise((resolve) => {
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "127.0.0.1");
  });
}

async function choosePort(preferredPort = 3100, maxOffset = 20) {
  for (let offset = 0; offset <= maxOffset; offset += 1) {
    const candidate = preferredPort + offset;
    if (await isPortFree(candidate)) {
      return candidate;
    }
  }

  throw new Error(`No free port found in range ${preferredPort}-${preferredPort + maxOffset}.`);
}

function waitForServer(url, timeoutMs = 120_000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = fetch(url, { redirect: "manual" });

      request
        .then(() => resolve())
        .catch(() => {
          if (Date.now() - start >= timeoutMs) {
            reject(new Error(`Timed out waiting for test server at ${url}.`));
            return;
          }

          setTimeout(attempt, 250);
        });
    };

    attempt();
  });
}

async function main() {
  const port = await choosePort();
  const baseURL = `http://127.0.0.1:${port}`;
  const sharedEnv = {
    ...env,
    PLAYWRIGHT_BASE_URL: baseURL,
    PLAYWRIGHT_EXTERNAL_SERVER: "1",
    PLAYWRIGHT_PORT: String(port)
  };

  const server = spawn(process.execPath, ["scripts/start-test-server.mjs"], {
    cwd: process.cwd(),
    env: sharedEnv,
    stdio: "inherit"
  });

  const teardown = () => {
    if (!server.killed) {
      server.kill("SIGTERM");
    }
  };

  process.once("SIGINT", teardown);
  process.once("SIGTERM", teardown);

  try {
    await waitForServer(baseURL);
  } catch (error) {
    teardown();
    throw error;
  }

  const child = spawn(
    process.execPath,
    ["./node_modules/@playwright/test/cli.js", "test", "--workers=1", ...extraArgs],
    {
      cwd: process.cwd(),
      env: sharedEnv,
      stdio: "inherit"
    }
  );

  const result = await onceExit(child);
  teardown();
  await onceExit(server);

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
