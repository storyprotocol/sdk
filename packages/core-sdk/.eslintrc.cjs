module.exports = {
  // We shouldn't ignore linting for tests. Add it back once we customize the linting rules for tests.
  ignorePatterns: ["**/*.cjs", "**/test/**/*.ts"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  extends: ["@story-protocol/eslint-config"],
};
