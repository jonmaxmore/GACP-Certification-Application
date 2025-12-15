// config/database-mongo-only.js
/**
 * Pure MongoDB Configuration for Thai Herbal GACP Platform
 * Department of Thai Traditional and Alternative Medicine (DTAM)
 *
 * Architecture: 100% MongoDB NoSQL Database
 * - All data: users, applications, certificates, payments, surveys, tracking
 * - MongoDB Transactions for ACID compliance where needed
 * - MongoDB Atlas or self-hosted MongoDB 6.0+
 * - Redis for caching (optional)
 */

module.exports = {
  // Primary MongoDB for all data
  mongodb: {
    // Flexible MongoDB URI - production will use authenticated connection, development can use simple connection
    uri:
      process.env.MONGODB_URI || process.env.NODE_ENV === 'production'
        ? 'mongodb://admin:gacp2025secure@localhost:27017/gacp_db?authSource=admin'
        : 'mongodb://localhost:27017/gacp_db',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Enhanced MongoDB settings for performance and security
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority', j: true, wtimeout: 5000 },

      // Connection Pool Optimization
      maxPoolSize: 100, // Increased for high concurrency
      minPoolSize: 10, // Increased minimum pool
      maxIdleTimeMS: 30000,
      waitQueueTimeoutMS: 10000,

      // Connection Timeouts
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,

      // Buffer Settings
      bufferCommands: false,
      bufferMaxEntries: 0,

      // Monitoring and Compression
      monitorCommands: true,
      compressors: ['snappy', 'zlib'],

      // Authentication and Security
      authSource: 'admin',
      ssl: process.env.NODE_ENV === 'production',
      sslValidate: process.env.NODE_ENV === 'production',

      // Read Preference for Performance
      readPreference: 'primaryPreferred',

      // Heartbeat Frequency
      heartbeatFrequencyMS: 10000,

      // App Name for monitoring
      appName: 'GACP-Platform'
    }
  },

  // Redis for caching (optional)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: 0,
    keyPrefix: 'gacp:',
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3
  },

  // MongoDB Collections Schema
  collections: {
    // User Management
    users: {
      indexes: [
        { key: { email: 1 }, unique: true },
        { key: { username: 1 }, unique: true },
        { key: { role: 1 } },
        { key: { isActive: 1 } }
      ]
    },

    // Certification Module
    applications: {
      indexes: [
        { key: { applicationNumber: 1 }, unique: true },
        { key: { userId: 1 } },
        { key: { status: 1 } },
        { key: { submittedAt: 1 } },
        { key: { farmLocation: '2dsphere' } }
      ]
    },

    certificates: {
      indexes: [
        { key: { certificateNumber: 1 }, unique: true },
        { key: { applicationId: 1 } },
        { key: { issuedDate: 1 } },
        { key: { expiryDate: 1 } },
        { key: { status: 1 } }
      ]
    },

    // Survey Module
    surveys: {
      indexes: [
        { key: { title: 1 } },
        { key: { category: 1 } },
        { key: { status: 1 } },
        { key: { createdAt: 1 } }
      ]
    },

    surveyResponses: {
      indexes: [
        { key: { surveyId: 1 } },
        { key: { userId: 1 } },
        { key: { submittedAt: 1 } },
        { key: { surveyId: 1, userId: 1 }, unique: true }
      ]
    },

    // Tracking Module
    products: {
      indexes: [
        { key: { productCode: 1 }, unique: true },
        { key: { batchNumber: 1 } },
        { key: { farmerId: 1 } },
        { key: { productType: 1 } },
        { key: { harvestDate: 1 } }
      ]
    },

    trackingEvents: {
      indexes: [
        { key: { productId: 1 } },
        { key: { eventType: 1 } },
        { key: { timestamp: 1 } },
        { key: { location: '2dsphere' } }
      ]
    },

    // Financial Records
    payments: {
      indexes: [
        { key: { transactionId: 1 }, unique: true },
        { key: { applicationId: 1 } },
        { key: { userId: 1 } },
        { key: { status: 1 } },
        { key: { createdAt: 1 } }
      ]
    },

    // Document Management
    documents: {
      indexes: [
        { key: { applicationId: 1 } },
        { key: { documentType: 1 } },
        { key: { uploadedBy: 1 } },
        { key: { uploadedAt: 1 } }
      ]
    },

    // Audit Logs
    auditLogs: {
      indexes: [
        { key: { userId: 1 } },
        { key: { action: 1 } },
        { key: { timestamp: 1 } },
        { key: { resourceType: 1 } },
        { key: { resourceId: 1 } }
      ]
    }
  },

  // Environment-specific configurations
  development: {
    mongodb: {
      uri: 'mongodb://localhost:27017/gacp_dev',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        minPoolSize: 2
      }
    }
  },

  test: {
    mongodb: {
      uri: 'mongodb://localhost:27017/gacp_test',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 5,
        minPoolSize: 1
      }
    }
  },

  production: {
    mongodb: {
      uri: process.env.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority', j: true },
        maxPoolSize: 100,
        minPoolSize: 10,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        ssl: true,
        retryWrites: true
      }
    }
  }
};
