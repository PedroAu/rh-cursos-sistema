import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    exclude: [
      "**/node_modules/**",
      "**/e2e/**",
      "**/.agent/**",
      "**/.aiox/**",
      "**/.aiox-core/**",
      "**/.antigravity/**",
      "**/.claude/**",
      "**/.codex/**",
      "**/.cursor/**",
      "**/.gemini/**",
      "**/.kimi/**",
    ],
    coverage: {
      reporter: ["text", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "./src/test/server-only.ts"),
    },
  },
});
