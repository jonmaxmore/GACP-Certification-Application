/**
 * MongoDB Connection Manager
 * Centralized database connection for all modules
 */

const logger = require('../../../shared/logger');
const mongoose = require('mongoose');
const config = require('../config/environment');

class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  /**
   * Connect to MongoDB
   * @returns {Promise<mongoose.Connection>}
   */
  async connect() {
    if (this.isConnected) {
      logger.info('✅ Using existing MongoDB connection');
      return this.connection;
    }

    try {
      const conn = await mongoose.connect(
        config.database.mongodb.uri,
        config.database.mongodb.options,
      );

      this.connection = conn.connection;
      this.isConnected = true;

      logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
      logger.info(`📊 Database: ${conn.connection.name}`);

      // Handle connection events
      this.connection.on('error', err => {
        logger.error('❌ MongoDB connection error:', err);
        this.isConnected = false;
      });

      this.connection.on('disconnected', () => {
        logger.info('⚠️  MongoDB disconnected');
        this.isConnected = false;
      });

      this.connection.on('reconnected', () => {
        logger.info('✅ MongoDB reconnected');
        this.isConnected = true;
      });

      return this.connection;
    } catch (error) {
      logger.error('❌ MongoDB connection failed:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      this.connection = null;
      logger.info('✅ MongoDB disconnected successfully');
    } catch (error) {
      logger.error('❌ MongoDB disconnect error:', error.message);
      throw error;
    }
  }

  /**
   * Get connection status
   * @returns {Boolean}
   */
  getStatus() {
    return this.isConnected;
  }

  /**
   * Get connection instance
   * @returns {mongoose.Connection}
   */
  getConnection() {
    return this.connection;
  }

  /**
   * Get database statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    if (!this.isConnected) {
      return { connected: false };
    }

    try {
      const db = this.connection.db;
      const stats = await db.stats();

      return {
        connected: true,
        database: this.connection.name,
        collections: stats.collections,
        dataSize: stats.dataSize,
        indexSize: stats.indexSize,
        storageSize: stats.storageSize,
      };
    } catch (error) {
      logger.error('Error getting database stats:', error);
      return { connected: true, error: error.message };
    }
  }
}

// Singleton instance
const dbConnection = new DatabaseConnection();

module.exports = dbConnection;
