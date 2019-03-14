module.exports = {
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec|e2e))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage: true,
  globalSetup: __dirname + "/src/testing/global-setup.ts",
  globalTeardown: __dirname + "/src/testing/global-teardown.ts",
  setupFilesAfterEnv: [__dirname + "/src/testing/setup-after-env.ts"]
};
