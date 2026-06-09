import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000"
  },
  webServer: {
    // Serve o export estático (pasta out/) — reflete o deploy real do frontend.
    // `next start` não funciona com output: 'export'. Requer `npm run build` antes.
    command: "npx serve out -l 3000 --no-clipboard",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
