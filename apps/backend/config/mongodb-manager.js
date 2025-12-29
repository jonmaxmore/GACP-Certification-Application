/**
 * MongoDB Connection Manager
 * MIS Team Solution for Server Stability
 *
 * Features:
 * - Auto-reconnect on connection loss
 * - Connection pooling
 * - Health checks
 * - Graceful shutdown
 * - Error handling
 */

// Load environment variables FIRST (before any config reading)
require('dotenv').config();

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const logger = require('../shared').logger;
const dbLogger = logger.createLogger('mongodb');

let config;
try {
  // Try to load config from file
  const configPath = path.join(__dirname, 'app-config.json');
  const configFile = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(configFile);
  dbLogger.info('Loaded MongoDB config from app-config.json');
} catch (error) {
  // Fallback to environment variables (dotenv already loaded at top of file)
  dbLogger.warn(
    `Could not load MongoDB config from file: ${error.message}. Using environment variables.`,
  );

  // Read MONGODB_URI from environment (should be loaded by dotenv at top)
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/botanical-audit';

  dbLogger.info(
    `Using MongoDB URI from environment: ${mongoUri.includes('mongodb+srv') ? 'Atlas' : 'Local'}`,
  );

  config = {
    mongodb: {
      uri: mongoUri,
      options: {
        // Connection Pool Configuration (Phase 2 Performance Optimization)
        // OPTIMIZED for high concurrency and queue processing
        maxPoolSize: 100, // Handle 1000+ requests/day with queue system
        minPoolSize: 10, // Keep warm connections ready
        serverSelectionTimeoutMS: 5000, // Fail fast if server unreachable
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        maxIdleTimeMS: 60000, // Close idle connections after 60s
        waitQueueTimeoutMS: 10000, // Fail if can't get connection in 10s

        // Performance optimizations
        compressors: ['zlib'], // Compress network traffic
        zlibCompressionLevel: 6, // Balance between speed and compression

        // Read/Write concerns
        readPreference: 'primaryPreferred', // Prefer primary but allow secondary reads
        w: 'majority', // Write to majority of replica set
        journal: true, // Ensure writes are journaled
      },
      reconnectInterval: 5000,
      reconnectAttempts: 5,
    },
  };
}

function applyRuntimeOverrides(overrides = {}) {
  config.mongodb = config.mongodb || {};
  config.mongodb.options = config.mongodb.options || {};

  if (overrides.uri) {
    config.mongodb.uri = overrides.uri;
  }

  if (overrides.options) {
    config.mongodb.options = {
      ...config.mongodb.options,
      ...overrides.options,
    };
  }

  if (typeof overrides.reconnectInterval === 'number') {
    config.mongodb.reconnectInterval = overrides.reconnectInterval;
  }

  if (typeof overrides.reconnectAttempts === 'number') {
    config.mongodb.reconnectAttempts = overrides.reconnectAttempts;
  }
}

// Allow environment variable override (used by tests and dynamic environments)
const envMongoUri = process.env.MONGODB_URI;
if (envMongoUri) {
  applyRuntimeOverrides({ uri: envMongoUri });

  const source = process.env.NODE_ENV === 'test' ? 'test environment' : 'environment variable';
  dbLogger.info(`Overriding MongoDB URI from ${source}`);
}

dbLogger.info(`MongoDB manager initialized with URI: ${maskUri(config.mongodb.uri)}`);

// Connection state
let isConnected = false;
let isConnecting = false;
let reconnectTimer = null;
let reconnectAttempts = 0;
let hasAttachedListeners = false;

/**
 * Initialize MongoDB connection
 */
async function connect() {
  if (isConnected || isConnecting) {
    return;
  }

  isConnecting = true;
  const runtimeUri = process.env.MONGODB_URI || config.mongodb.uri;
  const runtimeOptions = {
    ...(config.mongodb.options || {}),
  };

  if (process.env.NODE_ENV === 'test') {
    runtimeOptions.serverSelectionTimeoutMS = runtimeOptions.serverSelectionTimeoutMS || 5000;
    runtimeOptions.socketTimeoutMS = runtimeOptions.socketTimeoutMS || 20000;
    runtimeOptions.maxPoolSize = runtimeOptions.maxPoolSize || 10;
    runtimeOptions.minPoolSize = runtimeOptions.minPoolSize || 1;
    runtimeOptions.directConnection = runtimeOptions.directConnection ?? true;
  }

  dbLogger.info(`Connecting to MongoDB: ${maskUri(runtimeUri)}`);

  try {
    await mongoose.connect(runtimeUri, runtimeOptions);
    isConnected = true;
    isConnecting = false;
    reconnectAttempts = 0;
    dbLogger.info('Successfully connected to MongoDB');
  } catch (error) {
    isConnecting = false;
    dbLogger.error(`MongoDB connection error: ${error.message}`);
    scheduleReconnect();
    throw error;
  }

  // Set up event listeners
  if (!hasAttachedListeners) {
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      dbLogger.warn('MongoDB disconnected');
      scheduleReconnect();
    });

    mongoose.connection.on('error', error => {
      dbLogger.error(`MongoDB connection error: ${error.message}`);
      if (isConnected) {
        isConnected = false;
        scheduleReconnect();
      }
    });

    hasAttachedListeners = true;
  }

  return mongoose.connection;
}

/**
 * Schedule reconnection attempt
 */
function scheduleReconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }

  const maxAttempts = config.mongodb.reconnectAttempts || 5;
  if (reconnectAttempts >= maxAttempts) {
    dbLogger.error(`Maximum reconnect attempts (${maxAttempts}) reached. Giving up.`);
    return;
  }

  reconnectAttempts++;
  const interval = config.mongodb.reconnectInterval || 5000;
  dbLogger.info(
    `Scheduling MongoDB reconnection attempt ${reconnectAttempts}/${maxAttempts} in ${interval}ms`,
  );

  reconnectTimer = setTimeout(async () => {
    try {
      dbLogger.info(
        `Attempting to reconnect to MongoDB (attempt ${reconnectAttempts}/${maxAttempts})`,
      );
      await connect();
    } catch (error) {
      dbLogger.error(`Reconnection attempt failed: ${error.message}`);
    }
  }, interval);
}

/**
 * Force reconnection
 */
async function forceReconnect() {
  dbLogger.info('Forced reconnection requested');

  if (isConnected) {
    try {
      await mongoose.connection.close();
    } catch (error) {
      dbLogger.error(`Error closing existing connection: ${error.message}`);
    }
    isConnected = false;
  }

  clearTimeout(reconnectTimer);
  reconnectAttempts = 0;

  try {
    await connect();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get connection status
 */
function getStatus() {
  return {
    isConnected,
    isConnecting,
    readyState: mongoose.connection.readyState,
    reconnectAttempts,
    dbName: mongoose.connection.name || null,
  };
}

/**
 * Health check
 */
async function healthCheck() {
  if (!isConnected) {
    return {
      status: 'unhealthy',
      message: 'Not connected to MongoDB',
      details: {
        readyState: mongoose.connection.readyState,
        reconnectAttempts,
      },
    };
  }

  try {
    // Simple ping to check connection
    await mongoose.connection.db.admin().ping();
    return {
      status: 'healthy',
      message: 'Connected to MongoDB',
      details: {
        dbName: mongoose.connection.name,
        host: mongoose.connection.host,
        readyState: mongoose.connection.readyState,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `MongoDB health check failed: ${error.message}`,
      details: {
        readyState: mongoose.connection.readyState,
        error: error.message,
      },
    };
  }
}

// Utility to mask sensitive information in URI
function maskUri(uri) {
  if (!uri) {
    return 'undefined';
  }
  try {
    const parsedUri = new URL(uri);
    if (parsedUri.password) {
      parsedUri.password = '******';
    }
    return parsedUri.toString();
  } catch (error) {
    return uri.replace(/:([^@/]+)@/, ':******@');
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (isConnected || mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close();
      isConnected = false;
      isConnecting = false;
      dbLogger.info('MongoDB connection closed');
    } catch (error) {
      dbLogger.error(`Error closing MongoDB connection: ${error.message}`);
      throw error;
    }
  }
}

function configure(overrides = {}) {
  applyRuntimeOverrides(overrides);
  dbLogger.info(`MongoDB runtime configuration updated: ${maskUri(config.mongodb.uri)}`);
}

async function reset(overrides = {}) {
  try {
    await disconnect();
  } catch (error) {
    dbLogger.warn(`Reset disconnect warning: ${error.message}`);
  }

  reconnectAttempts = 0;
  isConnecting = false;
  isConnected = false;

  try {
    mongoose.connection.removeAllListeners();
  } catch (error) {
    dbLogger.debug(`No listeners to remove during reset: ${error.message}`);
  }

  hasAttachedListeners = false;
  if (overrides && Object.keys(overrides).length > 0) {
    applyRuntimeOverrides(overrides);
  }
}

module.exports = {
  connect,
  disconnect,
  forceReconnect,
  getStatus,
  healthCheck,
  configure,
  reset,
  isConnected: () => isConnected,
  connection: mongoose.connection,
};
