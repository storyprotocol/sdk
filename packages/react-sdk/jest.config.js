/** @type {import('jest').Config} */
const config = {
  verbose: true,
  testEnvironment: "./test/jest-environment-jsdom.ts",
  setupFiles: ["./test/jest-setup.ts"],
  testTimeout: 1000 * 60 * 60,
};

module.exports = config;
