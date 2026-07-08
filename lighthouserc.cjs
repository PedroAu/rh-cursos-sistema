const port = Number(process.env.LHCI_PORT ?? "3001");
const baseUrl = `http://localhost:${port}`;

module.exports = {
  ci: {
    collect: {
      startServerCommand: `npm start -- -p ${port}`,
      startServerReadyPattern: "Local:",
      url: [`${baseUrl}/`, `${baseUrl}/cursos`, `${baseUrl}/login`],
      numberOfRuns: 1,
      settings: {
        // Per-route resource and timing performance budgets.
        budgetsPath: "./budgets.json"
      }
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.75 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
        // Enforce the per-route budgets defined in budgets.json.
        "performance-budget": "warn"
      }
    },
    upload: {
      target: "temporary-public-storage"
    }
  }
};
