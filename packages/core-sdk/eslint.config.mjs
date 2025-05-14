import config from "@story-protocol/eslint-config";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  //TODO: need to fix `e` which is not being used in generated files
  {
    ignores: ["./src/abi/generated.ts", "**/test/**/*.ts"],
  },
];
