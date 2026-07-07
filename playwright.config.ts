import { defineConfig, devices } from "@playwright/test";

const playwrightPort = process.env.PLAYWRIGHT_PORT ?? "3100";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${playwrightPort}`;
const useExternalServer = process.env.PLAYWRIGHT_EXTERNAL_SERVER === "1";

export default defineConfig({
  testDir: "./tests",
  reporter: "list",
  // Reuse the committed visual baselines across local macOS and CI Linux runs.
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}-{projectName}-darwin.png",
  metadata: {
    harnessMode: "production-build + local webServer",
    smokeProject: "functional",
    baselineProjects: ["baseline-desktop", "baseline-mobile"],
    adminFixture: "tests/fixtures/admin-store.ts",
  },
  use: {
    baseURL
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
  webServer: useExternalServer
    ? undefined
    : {
        // Usa o bundle de produção do Next.js já gerado por `npm run build`.
        command: "node scripts/start-test-server.mjs",
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000
      }
});
