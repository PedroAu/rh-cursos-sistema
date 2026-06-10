import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100"
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
    // Usa o bundle de produção do Next.js já gerado por `npm run build`.
    command: "node scripts/start-test-server.mjs",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120_000
  }
});
