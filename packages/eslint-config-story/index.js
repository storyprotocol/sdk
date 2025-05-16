import js from "@eslint/js";
import tseslint from "typescript-eslint";
import turbo from "eslint-plugin-turbo";
import tsdocPlugin from "eslint-plugin-tsdoc";
import eslintConfigPrettier from "eslint-config-prettier";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";

export default [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    plugins: {
      turbo,
      tsdocPlugin,
    },
    settings: {
      "import/resolver": {
        // You will also need to install and configure the TypeScript resolver
        // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
        typescript: true,
        node: true,
      },
    },
    rules: {
      // eslint
      curly: "error",
      eqeqeq: "error",
      "no-implicit-coercion": ["error", { boolean: false }],
      "no-unused-expressions": "error",
      "no-useless-computed-key": "error",
      "no-console": "error",
      "func-style": ["error", "expression"],
      "no-duplicate-imports": "error",
      "default-case": "error",
      eqeqeq: "error",
      "prefer-const": "error",

      // Typescript
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-unsafe-argument": "off", // causing a lot of IDE false positives.
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: ["variable", "function", "parameter"],
          format: ["camelCase", "UPPER_CASE"],
        },
        {
          selector: ["enumMember", "enum"],
          format: ["UPPER_CASE", "PascalCase"],
        },
        {
          selector: ["typeLike"],
          format: ["PascalCase"],
        },
      ],
      // import rules
      "import/newline-after-import": "error",
      "import/no-cycle": "error",
      "import/no-useless-path-segments": "error",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal"],
          "newlines-between": "always",
          named: true,
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
