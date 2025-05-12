import config from "@story-protocol/eslint-config";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.test.json"],
      },
    },
  },
  //TODO: need to fix `e` which is not being used in generated files
  {
    ignores: ["./src/abi/generated.ts", "**/test/**/*.ts"],
  },
];
