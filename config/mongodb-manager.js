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

const mongoose = require('mongoose');

class MongoDBManager {
  constructor() {
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000; // 5 seconds
  }

  /**
   * Connect to MongoDB with retry logic
   */
  async connect() {
    const MONGODB_URI =
      process.env.MONGODB_URI_SIMPLE || process.env.MONGODB_URI || process.env.MONGODB_URL;

    if (!MONGODB_URI) {
      throw new Error(
        'MongoDB URI is required. Please set MONGODB_URI_SIMPLE, MONGODB_URI, or MONGODB_URL environment variable.'
      );
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
      maxPoolSize: 10, // Connection pool size
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      retryReads: true
    };

    try {
      console.log('[MongoDB] Attempting to connect...');
      console.log('[MongoDB] URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password

      await mongoose.connect(MONGODB_URI, options);

      this.isConnected = true;
      this.reconnectAttempts = 0;

      console.log('[MongoDB] ✅ Connected successfully');
      console.log('[MongoDB] Database:', mongoose.connection.db.databaseName);

      // Setup event listeners
      this.setupEventListeners();

      return true;
    } catch (error) {
      console.error('[MongoDB] ❌ Connection failed:', error.message);

      // Auto-retry logic
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(
          `[MongoDB] Retrying connection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
        );

        await new Promise(resolve => setTimeout(resolve, this.reconnectInterval));
        return this.connect(); // Recursive retry
      }

      console.error('[MongoDB] ❌ Max reconnection attempts reached');
      console.error('[MongoDB] Server will continue WITHOUT database');
      console.error('[MongoDB] Using mock data mode');

      return false;
    }
  }

  /**
   * Setup MongoDB event listeners
   */
  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      console.log('[MongoDB] Event: Connected');
      this.isConnected = true;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('[MongoDB] Event: Disconnected');
      this.isConnected = false;

      // Auto-reconnect
      console.log('[MongoDB] Attempting auto-reconnect...');
      this.connect();
    });

    mongoose.connection.on('error', err => {
      console.error('[MongoDB] Event: Error -', err.message);
      this.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB] Event: Reconnected');
      this.isConnected = true;
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Disconnect from MongoDB gracefully
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('[MongoDB] Disconnected gracefully');
      this.isConnected = false;
    } catch (error) {
      console.error('[MongoDB] Error during disconnect:', error.message);
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return {
          status: 'unhealthy',
          connected: false,
          message: 'Not connected to MongoDB'
        };
      }

      // Ping database
      await mongoose.connection.db.admin().ping();

      return {
        status: 'healthy',
        connected: true,
        database: mongoose.connection.db.databaseName,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        readyState: mongoose.connection.readyState,
        collections: await this.getCollectionStats()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats() {
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const stats = {};

      for (const coll of collections) {
        const collStats = await mongoose.connection.db.collection(coll.name).stats();
        stats[coll.name] = {
          documents: collStats.count,
          size: collStats.size,
          indexes: collStats.nindexes
        };
      }

      return stats;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      isConnected: this.isConnected,
      readyState: states[mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.db?.databaseName || 'N/A'
    };
  }
}

// Export singleton instance
const mongoManager = new MongoDBManager();

module.exports = mongoManager;
