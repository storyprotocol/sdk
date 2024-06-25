/** @type {import('jest').Config} */
const config = {
  verbose: true,
  testEnvironment: "./jest-environment-jsdom.ts",
  testTimeout: 10000,
};

module.exports = config;
