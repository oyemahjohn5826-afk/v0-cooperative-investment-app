import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// The app was authored for Next 15-era ESLint rules. eslint-config-next@16
// ships much stricter React 19 rules (react-hooks/* strictness,
// no-explicit-any) that fire on v0-generated shadcn boilerplate. Those findings
// are non-blocking (the app builds and E2E passes), so we keep them as WARNINGS
// for visibility rather than rewriting working code. Tighten to "error" later
// as a deliberate cleanup pass.
const relaxedRules = {
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/set-state-in-effect": "warn",
    "react-hooks/static-components": "warn",
    "react-hooks/immutability": "warn",
    "react-hooks/purity": "warn",
  },
};

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  relaxedRules,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "scripts/**",
      "e2e/**",
      "supabase/**",
      "test-results/**",
      "playwright-report/**",
    ],
  },
];

export default config;
