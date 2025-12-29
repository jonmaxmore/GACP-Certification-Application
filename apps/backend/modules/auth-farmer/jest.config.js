/**
 * Jest Configuration for Auth Farmer Module
 */

module.exports = {
  displayName: 'auth-farmer',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.js', '**/__tests__/**/*.spec.js'],
  collectCoverageFrom: [
    'domain/**/*.js',
    'application/**/*.js',
    'infrastructure/**/*.js',
    'presentation/**/*.js',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/coverage/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],
  verbose: true,
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/../../jest.setup.js'],
  globalTeardown: '<rootDir>/../../jest.teardown.js',
};
