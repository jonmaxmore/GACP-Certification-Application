/**
 * ================================================================
 * MONGODB CONNECTION MANAGER
 * ================================================================
 *
 * ที่มาที่ไป (WHY):
 * - MongoDB connection ต้อง configure ให้เหมาะกับ production load
 * - Connection pool ช่วย reuse connections เพื่อ performance
 * - Auto-reconnect และ error handling สำหรับ stability
 * - Monitoring เพื่อรู้สถานะ connection ตลอดเวลา
 *
 * Logic การทำงาน (HOW):
 * 1. Load configuration จาก environment
 * 2. Setup connection options ตาม best practices
 * 3. Connect to MongoDB with retry logic
 * 4. Monitor connection events
 * 5. Handle errors gracefully
 * 6. Provide health check method
 *
 * Workflow:
 * ```
 * App Start → Load Config → Connect MongoDB →
 *   ├─ Success → Monitor Events → Ready for Queries
 *   └─ Fail → Retry (3 times) → Exit if all fail
 *
 * During Operation:
 * Query → Get Connection from Pool → Execute → Return to Pool
 *
 * On Error:
 * Error Detected → Log → Attempt Reconnect →
 *   ├─ Success → Continue
 *   └─ Fail → Alert + Graceful Shutdown
 * ```
 *
 * ผลลัพธ์ (RESULT):
 * - Stable database connections
 * - Efficient connection pooling
 * - Automatic error recovery
 * - Clear monitoring and logging
 *
 * ================================================================
 */

const mongoose = require('mongoose');

/**
 * Connection state tracking
 */
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * ตรวจสอบและโหลด MongoDB configuration
 *
 * Logic:
 * 1. ตรวจสอบ MONGODB_URI
 * 2. Parse configuration options
 * 3. Validate settings
 * 4. Return configuration object
 */
function loadDatabaseConfiguration() {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development' || env === 'test';

  console.log('\n' + '='.repeat(80));
  console.log('📊 MONGODB CONFIGURATION');
  console.log('='.repeat(80));
  console.log(`Environment: ${env}\n`);

  // =====================================
  // MONGODB URI
  // =====================================
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    if (isDevelopment) {
      const defaultUri = 'mongodb://localhost:27017/gacp_development';
      console.warn('⚠️  MONGODB_URI not set - using default:', defaultUri);
      console.warn('   Set MONGODB_URI in .env for custom configuration\n');
      return {
        uri: defaultUri,
        options: getMongooseOptions(isDevelopment)
      };
    } else {
      throw new Error(
        '🚨 DATABASE ERROR: MONGODB_URI is required in production\n' +
          '   \n' +
          '   Why: Application needs database connection to function\n' +
          '   \n' +
          '   How to fix:\n' +
          '   1. Set MONGODB_URI in your .env file:\n' +
          '      MONGODB_URI=mongodb://username:password@host:port/database\n' +
          '   \n' +
          '   2. For MongoDB Atlas:\n' +
          '      MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database\n' +
          '   \n' +
          '   3. Restart the application\n'
      );
    }
  }

  // แสดง connection info (ซ่อน password)
  const safeUri = mongodbUri.replace(/:([^:@]+)@/, ':****@');
  console.log('✅ MongoDB URI: ' + safeUri);

  // =====================================
  // CONNECTION OPTIONS
  // =====================================
  const options = getMongooseOptions(isDevelopment);

  console.log('\n📋 Connection Pool Settings:');
  console.log('   Max Pool Size:', options.maxPoolSize);
  console.log('   Min Pool Size:', options.minPoolSize);
  console.log('   Server Selection Timeout:', options.serverSelectionTimeoutMS, 'ms');
  console.log('   Socket Timeout:', options.socketTimeoutMS, 'ms');

  console.log('\n' + '='.repeat(80) + '\n');

  return {
    uri: mongodbUri,
    options
  };
}

/**
 * Get Mongoose connection options
 *
 * Explanation of each option:
 * - maxPoolSize: จำนวน connections สูงสุดใน pool
 * - minPoolSize: จำนวน connections ขั้นต่ำที่เก็บไว้
 * - serverSelectionTimeoutMS: timeout สำหรับเลือก server
 * - socketTimeoutMS: timeout สำหรับ socket operations
 * - family: ใช้ IPv4 (4) หรือ IPv6 (6)
 *
 * @param {boolean} isDevelopment - Is development environment
 * @returns {Object} Mongoose options
 */
function getMongooseOptions(isDevelopment) {
  const baseOptions = {
    // Connection Pool Settings
    // เหตุผล: Reuse connections แทนการสร้างใหม่ทุกครั้ง → faster queries
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10,
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 2,

    // Timeout Settings
    serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 5000,
    socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS) || 45000,

    // Connection Settings
    family: 4, // Use IPv4, skip trying IPv6

    // Monitoring
    autoIndex: isDevelopment, // Build indexes automatically (dev only)

    // Write Concern (สำหรับ production)
    w: isDevelopment ? 1 : 'majority', // Write concern
    wtimeout: isDevelopment ? 5000 : 10000
  };

  // Production-specific options
  if (!isDevelopment) {
    baseOptions.retryWrites = true;
    baseOptions.retryReads = true;
  }

  return baseOptions;
}

/**
 * Connect to MongoDB with retry logic
 *
 * Logic:
 * 1. Try to connect
 * 2. If fail and retries left → wait → retry
 * 3. If fail and no retries → throw error
 * 4. If success → setup event listeners → mark as connected
 *
 * @returns {Promise<void>}
 */
async function connectDatabase() {
  const config = loadDatabaseConfiguration();

  const connectWithRetry = async () => {
    try {
      console.log(
        `🔄 Attempting to connect to MongoDB (attempt ${connectionAttempts + 1}/${MAX_RETRY_ATTEMPTS})...`
      );

      await mongoose.connect(config.uri, config.options);

      isConnected = true;
      connectionAttempts = 0;

      console.log('✅ MongoDB connected successfully');
      console.log('   Database:', mongoose.connection.name);
      console.log('   Host:', mongoose.connection.host);
      console.log('   Port:', mongoose.connection.port);
      console.log('   Ready State:', getReadyStateText(mongoose.connection.readyState));

      // Setup event listeners
      setupEventListeners();
    } catch (error) {
      connectionAttempts++;

      console.error(
        `❌ MongoDB connection failed (attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}):`,
        error.message
      );

      if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
        console.log(`⏱️  Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return connectWithRetry();
      } else {
        throw new Error(
          `Failed to connect to MongoDB after ${MAX_RETRY_ATTEMPTS} attempts.\n` +
            `Last error: ${error.message}\n` +
            '\n' +
            'Troubleshooting:\n' +
            '1. Check if MongoDB server is running\n' +
            '2. Verify MONGODB_URI is correct\n' +
            '3. Check network connectivity\n' +
            '4. Verify database user credentials\n'
        );
      }
    }
  };

  return connectWithRetry();
}

/**
 * Setup MongoDB event listeners for monitoring
 */
function setupEventListeners() {
  // Connected event
  mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log('📡 [MongoDB] Connected event fired');
  });

  // Disconnected event
  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('⚠️  [MongoDB] Disconnected event fired');
    console.warn('   Attempting to reconnect...');
  });

  // Error event
  mongoose.connection.on('error', err => {
    console.error('❌ [MongoDB] Error event:', err.message);

    // Don't exit process, let mongoose handle reconnection
    if (!isConnected) {
      console.error('   Database is not connected. Waiting for reconnection...');
    }
  });

  // Reconnected event
  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    console.log('✅ [MongoDB] Reconnected successfully');
  });

  // Close event
  mongoose.connection.on('close', () => {
    isConnected = false;
    console.log('🔌 [MongoDB] Connection closed');
  });
}

/**
 * Get human-readable ready state text
 *
 * @param {number} state - Mongoose ready state
 * @returns {string} Ready state text
 */
function getReadyStateText(state) {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[state] || 'unknown';
}

/**
 * Check database health
 *
 * @returns {Promise<Object>} Health status
 */
async function checkHealth() {
  try {
    if (!isConnected || mongoose.connection.readyState !== 1) {
      return {
        status: 'unhealthy',
        connected: false,
        readyState: getReadyStateText(mongoose.connection.readyState),
        message: 'Database is not connected'
      };
    }

    // Ping database
    await mongoose.connection.db.admin().ping();

    // Get connection pool stats
    const poolStats = mongoose.connection.client.s?.pool?.totalConnectionCount || 0;

    return {
      status: 'healthy',
      connected: true,
      readyState: getReadyStateText(mongoose.connection.readyState),
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      poolSize: poolStats,
      message: 'Database is connected and responding'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      error: error.message,
      message: 'Database health check failed'
    };
  }
}

/**
 * Gracefully close database connection
 *
 * @returns {Promise<void>}
 */
async function closeDatabase() {
  if (mongoose.connection.readyState !== 0) {
    console.log('\n🔌 Closing MongoDB connection...');
    await mongoose.connection.close();
    isConnected = false;
    console.log('✅ MongoDB connection closed');
  }
}

/**
 * Get connection statistics
 *
 * @returns {Object} Connection stats
 */
function getConnectionStats() {
  return {
    isConnected,
    readyState: getReadyStateText(mongoose.connection.readyState),
    database: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    models: Object.keys(mongoose.models).length,
    collections: Object.keys(mongoose.connection.collections).length
  };
}

module.exports = {
  connectDatabase,
  closeDatabase,
  checkHealth,
  getConnectionStats,
  get isConnected() {
    return isConnected;
  },
  get connection() {
    return mongoose.connection;
  }
};
