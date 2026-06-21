#!/usr/bin/env node

import { rmSync, existsSync } from "node:fs";

// After OpenNext builds, remove generated .env files from the bundle.
// These files should never be deployed; secrets are injected via wrangler secret put.

const pathsToRemove = [".open-next/server-functions/default/.env", ".next/standalone/.env"];

for (const path of pathsToRemove) {
  if (existsSync(path)) {
    console.log(`Removing ${path}...`);
    rmSync(path, { force: true });
  }
}

console.log("✅ Bundle secret cleanup complete.");
