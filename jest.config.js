module.exports = {
  roots: [
    "<rootDir>"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
  ],
  collectCoverageFrom: [
    "./src/**/*.ts"
  ],
  coveragePathIgnorePatterns: [
    "/src/bin/"
  ],
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  testMatch: ["**/test/**/*.spec.unit.[jt]s"],
  transform: { "^.+\\.[tj]sx?$": "ts-jest" },
  transformIgnorePatterns: ["/node_modules/(?!(@companieshouse/web-security-node|uuid))"],
  globals: {
    "ts-jest": {
      diagnostics: false
    }
  },
  globalSetup: "./test/global.setup.ts",
  setupFiles: ["<rootDir>/test/global.setup.ts"],
  moduleNameMapper: {
    '^@opentelemetry/([^/]+)/(.+)$': '<rootDir>/node_modules/@opentelemetry/$1/build/src/index-$2',
    "^axios$": "axios/dist/node/axios.cjs"
  }
};
