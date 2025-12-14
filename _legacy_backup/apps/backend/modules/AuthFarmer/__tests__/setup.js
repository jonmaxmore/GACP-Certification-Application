/**
 * Jest Setup File
 * Runs before all tests
 */

// Suppress console logs during tests unless DEBUG is set
if (!process.env.DEBUG) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-unit-tests';
process.env.FARMER_JWT_SECRET = 'test-farmer-jwt-secret-key';

// Mock logger to avoid file I/O during tests
jest.mock(
  '../infrastructure/logging/logger',
  () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
  { virtual: true },
);

// Also mock the backend shared logger
jest.mock(
  '../../shared/logger/logger',
  () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
  { virtual: true },
);
