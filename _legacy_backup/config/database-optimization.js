// Database Optimization and Connection Management
const mongoose = require('mongoose');
const redis = require('redis');

class DatabaseManager {
  constructor() {
    this.mongoConnection = null;
    this.redisClient = null;
    this.connectionRetries = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  // MongoDB Connection with Optimization
  async connectMongoDB() {
    const options = {
      // Connection Pool Settings
      maxPoolSize: 10, // Maximum number of connections
      minPoolSize: 2, // Minimum number of connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long a send or receive on a socket can take

      // Buffering Settings
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering

      // Monitoring and Logging
      monitorCommands: true,

      // Compression
      compressors: ['zlib'],
      zlibCompressionLevel: 6,

      // Auto Index
      autoIndex: false, // Don't build indexes in production
      autoCreate: false // Don't automatically create collections
    };

    try {
      await mongoose.connect(process.env.MONGODB_URI, options);

      this.mongoConnection = mongoose.connection;
      this.setupMongoEventHandlers();
      this.connectionRetries = 0;

      console.log('✅ MongoDB connected successfully');
      return this.mongoConnection;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      await this.handleConnectionError();
      throw error;
    }
  }

  // MongoDB Event Handlers
  setupMongoEventHandlers() {
    this.mongoConnection.on('connected', () => {
      console.log('📡 MongoDB connected');
    });

    this.mongoConnection.on('error', err => {
      console.error('❌ MongoDB connection error:', err);
    });

    this.mongoConnection.on('disconnected', () => {
      console.log('📴 MongoDB disconnected');
      this.handleConnectionError();
    });

    this.mongoConnection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
      this.connectionRetries = 0;
    });

    // Monitor slow queries
    if (process.env.NODE_ENV !== 'production') {
      mongoose.set('debug', true);
    }
  }

  // Connection Error Handling with Retry Logic
  async handleConnectionError() {
    if (this.connectionRetries >= this.maxRetries) {
      console.error('💀 Max reconnection attempts reached. Exiting...');
      process.exit(1);
    }

    this.connectionRetries++;
    console.log(`🔄 Attempting to reconnect (${this.connectionRetries}/${this.maxRetries})...`);

    setTimeout(() => {
      this.connectMongoDB().catch(console.error);
    }, this.retryDelay * this.connectionRetries);
  }

  // Redis Connection for Caching
  async connectRedis() {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4, // IPv4
      connectTimeout: 10000,
      commandTimeout: 5000
    };

    try {
      this.redisClient = redis.createClient(redisConfig);

      this.redisClient.on('error', err => {
        console.error('❌ Redis Client Error:', err);
      });

      this.redisClient.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });

      this.redisClient.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      await this.redisClient.connect();
      return this.redisClient;
    } catch (error) {
      console.error('❌ Redis connection error:', error);
      // Redis is optional, continue without it
      this.redisClient = null;
      return null;
    }
  }

  // Graceful Shutdown
  async disconnect() {
    console.log('🔄 Closing database connections...');

    try {
      if (this.mongoConnection) {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
      }

      if (this.redisClient) {
        await this.redisClient.quit();
        console.log('✅ Redis connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing database connections:', error);
    }
  }

  // Health Check
  async healthCheck() {
    const health = {
      mongodb: { status: 'disconnected', latency: null },
      redis: { status: 'disconnected', latency: null }
    };

    // MongoDB Health Check
    try {
      const startTime = Date.now();
      await mongoose.connection.db.admin().ping();
      health.mongodb = {
        status: 'connected',
        latency: Date.now() - startTime,
        readyState: mongoose.connection.readyState
      };
    } catch (error) {
      health.mongodb.error = error.message;
    }

    // Redis Health Check
    if (this.redisClient) {
      try {
        const startTime = Date.now();
        await this.redisClient.ping();
        health.redis = {
          status: 'connected',
          latency: Date.now() - startTime
        };
      } catch (error) {
        health.redis.error = error.message;
      }
    } else {
      health.redis.status = 'not_configured';
    }

    return health;
  }
}

// Caching Layer
class CacheManager {
  constructor(redisClient) {
    this.redis = redisClient;
    this.defaultTTL = 3600; // 1 hour
    this.memoryCache = new Map();
    this.maxMemoryCacheSize = 1000;
  }

  // Get from cache (Redis first, then memory)
  async get(key) {
    try {
      // Try Redis first
      if (this.redis) {
        const value = await this.redis.get(key);
        if (value) {
          return JSON.parse(value);
        }
      }

      // Fallback to memory cache
      if (this.memoryCache.has(key)) {
        const cached = this.memoryCache.get(key);
        if (cached.expiry > Date.now()) {
          return cached.value;
        } else {
          this.memoryCache.delete(key);
        }
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Set cache (Redis and memory)
  async set(key, value, ttl = this.defaultTTL) {
    try {
      const serialized = JSON.stringify(value);

      // Set in Redis
      if (this.redis) {
        await this.redis.setEx(key, ttl, serialized);
      }

      // Set in memory cache (with size limit)
      if (this.memoryCache.size >= this.maxMemoryCacheSize) {
        // Remove oldest entries
        const firstKey = this.memoryCache.keys().next().value;
        this.memoryCache.delete(firstKey);
      }

      this.memoryCache.set(key, {
        value,
        expiry: Date.now() + ttl * 1000
      });

      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Delete from cache
  async del(key) {
    try {
      if (this.redis) {
        await this.redis.del(key);
      }
      this.memoryCache.delete(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Clear all cache
  async clear() {
    try {
      if (this.redis) {
        await this.redis.flushDb();
      }
      this.memoryCache.clear();
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  // Get cache statistics
  getStats() {
    return {
      memoryCache: {
        size: this.memoryCache.size,
        maxSize: this.maxMemoryCacheSize
      },
      redis: {
        connected: !!this.redis
      }
    };
  }
}

// Database Indexes for Optimization
const createIndexes = async () => {
  try {
    console.log('🔄 Creating database indexes...');

    // Standards Collection Indexes
    const Standards = mongoose.model('Standards');
    await Standards.collection.createIndex({ source: 1, category: 1 });
    await Standards.collection.createIndex({ standard_code: 1 }, { unique: true });
    await Standards.collection.createIndex({ status: 1 });
    await Standards.collection.createIndex({ last_updated: -1 });
    await Standards.collection.createIndex({
      title: 'text',
      description: 'text',
      'requirements.requirement_text': 'text'
    });

    // Assessments Collection Indexes
    const Assessment = mongoose.model('Assessment');
    await Assessment.collection.createIndex({ assessment_id: 1 }, { unique: true });
    await Assessment.collection.createIndex({ user_id: 1 });
    await Assessment.collection.createIndex({ status: 1 });
    await Assessment.collection.createIndex({ start_date: -1 });
    await Assessment.collection.createIndex({ standard_id: 1 });

    // Comparisons Collection Indexes
    const Comparison = mongoose.model('Comparison');
    await Comparison.collection.createIndex({ comparison_id: 1 }, { unique: true });
    await Comparison.collection.createIndex({ base_standard: 1 });
    await Comparison.collection.createIndex({ compare_standards: 1 });
    await Comparison.collection.createIndex({ createdAt: -1 });

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
};

// Query Optimization Helpers
const queryHelpers = {
  // Paginated query helper
  paginate: (query, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
  },

  // Search with caching
  searchWithCache: async (cacheManager, cacheKey, queryFn, ttl = 3600) => {
    // Try cache first
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Execute query
    const result = await queryFn();

    // Cache result
    await cacheManager.set(cacheKey, result, ttl);

    return result;
  },

  // Aggregation with timeout
  aggregateWithTimeout: (model, pipeline, timeout = 30000) => {
    return model.aggregate(pipeline).maxTimeMS(timeout);
  }
};

// Database Transaction Helper
const withTransaction = async operations => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const result = await operations(session);

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Connection Pool Monitoring
const monitorConnectionPool = connection => {
  if (process.env.NODE_ENV !== 'production') {
    setInterval(() => {
      const stats = {
        totalConnections: connection.db?.serverConfig?.connections?.length || 0,
        availableConnections: connection.db?.serverConfig?.availableConnections?.length || 0,
        currentOp: connection.db?.serverConfig?.currentOp || 0
      };

      console.log('📊 Connection Pool Stats:', stats);
    }, 60000); // Every minute
  }
};

module.exports = {
  DatabaseManager,
  CacheManager,
  createIndexes,
  queryHelpers,
  withTransaction,
  monitorConnectionPool
};
