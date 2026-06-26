import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      ".aiox/**",
      ".aiox-core/**",
      ".claude/**",
      ".codex/**",
      ".cursor/**",
      ".gemini/**",
      "legacy/**",
      "node_modules/**",
      "playwright-report/**",
      "storybook-static/**",
      "test-results/**",
      "supabase/functions/**",
      "next-env.d.ts"
    ]
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ["coverage/**", "dist/**"]
  },
  {
    rules: {
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/set-state-in-effect": "off",
      "@next/next/no-img-element": "off"
    }
  },
  {
    files: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/__tests__/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  }
];

export default eslintConfig;
