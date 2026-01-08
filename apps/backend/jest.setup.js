/**
 * Jest test harness setup for the backend service.
 * - Normalises environment variables for integration tests
 * - Registers deterministic clean-up hooks for Prisma (PostgreSQL), Redis, and Express servers
 * - Reduces noisy console output while preserving warnings/errors
 */

const cleanupTasks = [];

function safeRequire(modulePath) {
  try {
    return require(modulePath);
  } catch (error) {
    const message = error && error.code === 'MODULE_NOT_FOUND' ? 'not found' : error.message;
    console.warn(`[jest-setup] Optional module load skipped (${modulePath}): ${message}`);
    return null;
  }
}

function registerCleanup(task) {
  if (typeof task === 'function') {
    cleanupTasks.push(task);
  }
}

async function runCleanupTasks() {
  while (cleanupTasks.length) {
    const task = cleanupTasks.pop();
    try {
      // eslint-disable-next-line no-await-in-loop
      await task();
    } catch (error) {
      console.warn(`[jest-setup] Cleanup task failed: ${error.message}`);
    }
  }
}

globalThis.registerBackendCleanup = registerCleanup;

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.STORAGE_TYPE = 'local';
process.env.STORAGE_LOCAL_PATH = './test-uploads';
process.env.ENABLE_QUEUE = 'false';
process.env.ENABLE_CACHE = 'false';

// Prisma (PostgreSQL) cleanup
const prisma = safeRequire('@prisma/client');
const redisService = safeRequire('./services/redis-service');

if (prisma) {
  registerCleanup(async () => {
    try {
      const { PrismaClient } = prisma;
      const client = new PrismaClient();
      await client.$disconnect();
    } catch (e) {
      console.warn(`[jest-setup] Prisma cleanup: ${e.message}`);
    }
  });
}

if (redisService && typeof redisService.disconnect === 'function') {
  registerCleanup(async () => {
    await redisService.disconnect();
  });
}

registerCleanup(async () => {
  const server = global.__APP_SERVER__;
  if (server && typeof server.close === 'function') {
    await new Promise(resolve => server.close(resolve));
  }
});

const originalConsole = { ...console };

global.console = {
  ...console,
  error: originalConsole.error,
  warn: originalConsole.warn,
  info: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
};

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

afterAll(async () => {
  await runCleanupTasks();
  global.console = originalConsole;
  jest.useRealTimers();
  jest.clearAllTimers();
  jest.clearAllMocks();
  await new Promise(resolve => setTimeout(resolve, 250));
});

jest.setTimeout(30000);
