import { randomBytes } from "node:crypto";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const functionsEnvPath = resolve("supabase/functions/.env");

function readValue(source, key) {
  const match = source.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match?.[1]?.trim() ?? "";
}

function upsertValue(source, key, value) {
  const line = `${key}=${value}`;
  const expression = new RegExp(`^${key}=.*$`, "m");

  if (expression.test(source)) {
    return source.replace(expression, line);
  }

  const prefix = source.trimEnd();
  return prefix ? `${prefix}\n${line}\n` : `${line}\n`;
}

async function main() {
  let source = "";

  try {
    source = await readFile(functionsEnvPath, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const currentSecret = readValue(source, "AUTH_SESSION_SECRET");
  const authSessionSecret =
    currentSecret.length >= 32 ? currentSecret : randomBytes(32).toString("hex");

  source = upsertValue(source, "ALLOW_LOCALHOST", "true");
  source = upsertValue(source, "AUTH_SESSION_SECRET", authSessionSecret);

  await mkdir(dirname(functionsEnvPath), { recursive: true });
  await writeFile(functionsEnvPath, source, { encoding: "utf8", mode: 0o600 });
  await chmod(functionsEnvPath, 0o600);

  console.log(`Secrets locais das Edge Functions configurados em ${functionsEnvPath} (modo 0600).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
