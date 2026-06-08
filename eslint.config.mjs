import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".aiox/**",
      ".aiox-core/**",
      ".claude/**",
      ".codex/**",
      ".cursor/**",
      ".gemini/**",
      "legacy/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "supabase/functions/**",
      "next-env.d.ts"
    ]
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/set-state-in-effect": "off"
    }
  }
];

export default eslintConfig;
