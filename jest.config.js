// jest.config.js
/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: "node",
  
    // only run backend tests inside /tests
    testMatch: ["<rootDir>/tests/**/*.test.js"],
  
    // ignore frontend completely (Vitest handles it)
    testPathIgnorePatterns: [
      "/node_modules/",
      "<rootDir>/frontend/"
    ],
  
    // no Babel transforms needed for backend
    transform: {},
  
    // give Mongo/containers some breathing room
    testTimeout: 30000,
  };