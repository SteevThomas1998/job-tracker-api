// eslint.config.mjs (repo root)
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,

  // Backend defaults
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**", "coverage/**", "frontend/**"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
    rules: {
      // allow unused args that start with underscore, e.g. `_err`
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      semi: ["error", "always"],
      quotes: ["error", "double"],
    },
  },

  // Jest test files (backend)
  {
    files: ["tests/**/*.test.js"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
  },
];