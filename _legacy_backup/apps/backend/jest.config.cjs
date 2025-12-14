/**
 * Jest configuration for Backend (Node.js) - NOT Next.js
 * Prevents Next.js config from interfering with backend tests
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/modules', '<rootDir>/services', '<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.js', '**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/dist/', '/build/'],
  moduleFileExtensions: ['js', 'ts', 'json'],
  verbose: true,
  maxWorkers: 1, // Run tests serially to avoid DB conflicts
  detectOpenHandles: true, // Detect async operations that prevent Jest from exiting
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  globalTeardown: '<rootDir>/jest.teardown.js',
  collectCoverageFrom: [
    'modules/**/domain/**/*.js',
    'modules/**/application/**/*.js',
    'modules/**/infrastructure/**/*.js',
    'services/**/*.js', // Added services directory for coverage
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },
};
