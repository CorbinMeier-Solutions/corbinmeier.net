import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  {
    ignores: ["build/**", ".react-router/**", "node_modules/**", ".wrangler/**", "public/**", ".claude/worktrees/**"],
  },

  // Browser-side application code.
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // Route modules export meta beside their component.
      "react-refresh/only-export-components": [
        "error",
        {
          allowExportNames: [
            "meta", "links", "loader", "action", "clientLoader", "clientAction",
            "handle", "shouldRevalidate", "ErrorBoundary", "HydrateFallback",
          ],
        },
      ],
      // Underscore prefix marks a deliberately unused binding.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // Cloudflare Pages Functions: worker runtime, no React Fast Refresh.
  {
    files: ["functions/**/*.ts"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.worker,
    },
  },

  // Build/tooling scripts that run under Node.
  {
    files: ["scripts/**/*.{mjs,ts}", "*.config.{ts,mjs}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
    },
  },
);
