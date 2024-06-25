/** @type {import('jest').Config} */
const config = {
  verbose: true,
  testEnvironment: "./jest-environment-jsdom.ts",
  testTimeout: 1000 * 60,
};

module.exports = config;
