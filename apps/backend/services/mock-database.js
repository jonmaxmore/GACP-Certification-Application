/**
 * Mock Database Service for Development
 * Provides in-memory data storage when MongoDB is not available
 *
 * Features:
 * - In-memory storage with persistence simulation
 * - Mock collections for all GACP entities
 * - CRUD operations with MongoDB-like API
 * - Auto-generated sample data
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-19
 */

const { createLogger } = require('../shared/logger');
const logger = createLogger('mock-database');

class MockDatabaseService {
  constructor() {
    this.collections = new Map();
    this.isConnected = true;
    this.initializeCollections();
    this.generateSampleData();

    logger.info('[MockDB] 🗄️ Mock Database Service initialized');
    logger.info('[MockDB] Available collections:', Array.from(this.collections.keys()));
  }

  initializeCollections() {
    // Initialize all GACP collections
    const collectionNames = [
      'users',
      'applications',
      'inspections',
      'certificates',
      'documents',
      'notifications',
      'audit_logs',
      'farms',
      'crops',
    ];

    collectionNames.forEach(name => {
      this.collections.set(name, new Map());
    });
  }

  generateSampleData() {
    // Sample Users
    const users = this.collections.get('users');
    users.set('user001', {
      _id: 'user001',
      email: 'farmer@example.com',
      name: 'นายสมชาย เกษตรกร',
      role: 'farmer',
      nationalId: '1234567890123',
      createdAt: new Date(),
      isActive: true,
    });

    users.set('user002', {
      _id: 'user002',
      email: 'inspector@dtam.go.th',
      name: 'นายตรวจสอบ มาตรฐาน',
      role: 'inspector',
      nationalId: '1234567890124',
      createdAt: new Date(),
      isActive: true,
    });

    // Sample Applications
    const applications = this.collections.get('applications');
    applications.set('app001', {
      _id: 'app001',
      applicationNumber: 'GACP2025001',
      applicantId: 'user001',
      farmInformation: {
        farmName: 'ฟาร์มทดสอบ',
        location: {
          address: '123 หมู่ 1 ตำบลทดสอบ',
          province: 'เชียงใหม่',
          coordinates: { lat: 18.7883, lng: 98.9853 },
        },
        farmSize: 10.5,
      },
      cropInformation: {
        crops: [
          {
            scientificName: 'Curcuma longa',
            commonName: 'ขมิ้นชัน',
            cultivationArea: 5.0,
          },
        ],
      },
      status: 'submitted',
      submittedAt: new Date(),
      createdAt: new Date(),
    });

    // Sample Inspections
    const inspections = this.collections.get('inspections');
    inspections.set('insp001', {
      _id: 'insp001',
      applicationId: 'app001',
      inspectorId: 'user002',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'scheduled',
      controlPoints: {},
      createdAt: new Date(),
    });

    logger.info('[MockDB] ✅ Sample data generated');
  }

  // MongoDB-like API methods
  async collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map());
    }

    return {
      findOne: async query => {
        const collection = this.collections.get(name);
        if (query._id) {
          return collection.get(query._id) || null;
        }

        // Simple query matching
        for (const [_id, doc] of collection.entries()) {
          let matches = true;
          for (const [key, value] of Object.entries(query)) {
            if (doc[key] !== value) {
              matches = false;
              break;
            }
          }
          if (matches) {
            return doc;
          }
        }
        return null;
      },

      find: async (query = {}) => {
        const collection = this.collections.get(name);
        const results = [];

        for (const [_id, doc] of collection.entries()) {
          let matches = true;
          for (const [key, value] of Object.entries(query)) {
            if (doc[key] !== value) {
              matches = false;
              break;
            }
          }
          if (matches) {
            results.push(doc);
          }
        }

        return {
          toArray: async () => results,
          limit: n => ({ toArray: async () => results.slice(0, n) }),
          skip: n => ({ toArray: async () => results.slice(n) }),
          sort: sortObj => ({
            toArray: async () => {
              const sortKey = Object.keys(sortObj)[0];
              const sortOrder = sortObj[sortKey];
              return results.sort((a, b) => {
                const aVal = a[sortKey];
                const bVal = b[sortKey];
                if (sortOrder === 1) {
                  return aVal > bVal ? 1 : -1;
                }
                return aVal < bVal ? 1 : -1;
              });
            },
          }),
        };
      },

      insertOne: async doc => {
        const collection = this.collections.get(name);
        const id = doc._id || `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newDoc = { ...doc, _id: id, createdAt: new Date() };
        collection.set(id, newDoc);
        return { insertedId: id };
      },

      updateOne: async (query, update) => {
        const collection = this.collections.get(name);
        const doc = await this.collection(name).findOne(query);
        if (doc) {
          const updatedDoc = { ...doc, ...update.$set, updatedAt: new Date() };
          collection.set(doc._id, updatedDoc);
          return { modifiedCount: 1 };
        }
        return { modifiedCount: 0 };
      },

      deleteOne: async query => {
        const collection = this.collections.get(name);
        const doc = await this.collection(name).findOne(query);
        if (doc) {
          collection.delete(doc._id);
          return { deletedCount: 1 };
        }
        return { deletedCount: 0 };
      },

      countDocuments: async (query = {}) => {
        const docs = await this.collection(name).find(query);
        const results = await docs.toArray();
        return results.length;
      },
    };
  }

  // Database operations
  async listCollections() {
    return Array.from(this.collections.keys()).map(name => ({ name }));
  }

  async stats() {
    const stats = {};
    for (const [name, collection] of this.collections.entries()) {
      stats[name] = collection.size;
    }
    return stats;
  }

  async close() {
    logger.info('[MockDB] 🗄️ Mock Database Service closed');
    this.isConnected = false;
  }

  // Health check
  async ping() {
    return { ok: 1, mock: true };
  }
}

module.exports = MockDatabaseService;
