module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm start",
      startServerReadyPattern: "Local:",
      url: ["http://localhost:3000/", "http://localhost:3000/cursos", "http://localhost:3000/login"],
      numberOfRuns: 1,
      settings: {
        // Per-route resource and timing performance budgets.
        budgetsPath: "./budgets.json"
      }
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
        // Enforce the per-route budgets defined in budgets.json.
        "performance-budget": "warn",
        "timing-budget": "warn"
      }
    },
    upload: {
      target: "temporary-public-storage"
    }
  }
};
