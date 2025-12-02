/**
 * Production Database Service
 * Connects to MongoDB Atlas instead of mongodb-memory-server
 */

const mongoose = require('mongoose');
const logger = require('../shared/logger');

class ProductionDatabaseService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Connect to MongoDB Atlas
   */
  async connect() {
    if (this.isConnected) {
      logger.info('Already connected to MongoDB');
      return this.connection;
    }

    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    try {
      logger.info('Connecting to MongoDB Atlas...');

      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        family: 4, // Use IPv4
      });

      this.connection = mongoose.connection;
      this.isConnected = true;
      this.reconnectAttempts = 0;

      logger.info('✅ Successfully connected to MongoDB Atlas');

      // Handle connection events
      this.setupEventHandlers();

      return this.connection;
    } catch (error) {
      logger.error('Failed to connect to MongoDB Atlas:', error);
      await this.handleReconnect();
      throw error;
    }
  }

  /**
   * Setup connection event handlers
   */
  setupEventHandlers() {
    this.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      this.isConnected = false;
      this.handleReconnect();
    });

    this.connection.on('error', error => {
      logger.error('MongoDB connection error:', error);
      this.isConnected = false;
    });

    this.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    // Graceful shutdown
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
   * Handle reconnection logic
   */
  async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached. Exiting...');
      process.exit(1);
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    logger.info(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        logger.error('Reconnection failed:', error);
      }
    }, delay);
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Check database health
   */
  async healthCheck() {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    try {
      await this.connection.db.admin().ping();
      return {
        status: 'healthy',
        connected: true,
        responseTime: Date.now(),
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      throw new Error(`Database health check failed: ${error.message}`);
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Singleton instance
const databaseService = new ProductionDatabaseService();

module.exports = databaseService;
