import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100"
  },
  webServer: {
    // Serve o export estático (pasta out/) — reflete o deploy real do frontend.
    // `next start` não funciona com output: 'export'. Requer `npm run build` antes.
    command: "npx serve out -l 3100 --no-clipboard",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120_000
  }
});
