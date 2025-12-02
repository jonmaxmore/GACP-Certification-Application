module.exports = {
  projects: [
    '<rootDir>/apps/admin-portal/jest.config.js',
    '<rootDir>/apps/certificate-portal/jest.config.js',
    '<rootDir>/apps/farmer-portal/jest.config.js',
    '<rootDir>/apps/backend/jest.config.cjs'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/frontend-nextjs/tests/e2e/',
    '<rootDir>/frontend-nextjs/test-results/',
    '<rootDir>/frontend-nextjs/playwright-report/'
  ],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverage: false,
  coverageProvider: 'v8'
};
