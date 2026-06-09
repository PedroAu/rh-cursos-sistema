import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000"
  },
  projects: [
    // Specs funcionais existentes (auth, rotas) — rodam uma vez, viewport padrão.
    {
      name: "functional",
      testIgnore: /baseline\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] }
    },
    // Baseline visual/a11y — capturado em desktop e mobile.
    {
      name: "baseline-desktop",
      testMatch: /baseline\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "baseline-mobile",
      testMatch: /baseline\.spec\.ts/,
      use: { ...devices["Pixel 5"] }
    }
  ],
  webServer: {
    // Serve o export estático (pasta out/) — reflete o deploy real do frontend.
    // `next start` não funciona com output: 'export'. Requer `npm run build` antes.
    command: "npx serve out -l 3000 --no-clipboard",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
