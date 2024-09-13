module.exports = {
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  extends: ["@story-protocol/eslint-config"],
  overrides: [
    // Skip the rule "@typescript-eslint/no-unsafe-assignment" for test files in order to pass "expect.any()".
    {
      files: ["test/**/*.test.ts"],
      rules: {
        "@typescript-eslint/no-unsafe-assignment": "off",
      },
    },
  ],
};
