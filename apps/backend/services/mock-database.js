const { PrismaClient } = require('@prisma/client');

// Create in-memory test database for development
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  },
  log: ['query', 'info', 'warn', 'error'],
});

// Test users in memory
const testUsers = [
  {
    id: 'test-user-1',
    email: 'farmer@test.com',
    password: '$2a$10$K8Y8Z8Z8Z8Z8Z8Z8Z8O', // password123
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    phoneNumber: '0801234567',
    idCard: '1234567890123',
    accountType: 'INDIVIDUAL',
    role: 'FARMER',
    status: 'ACTIVE',
    verificationStatus: 'APPROVED',
  }
];

// Mock database operations
class MockPrismaService {
  constructor() {
    this.users = testUsers;
  }

  user = {
    findFirst: async (params) => {
      console.log('[MockDB] Find user:', params);
      
      if (params.where.OR) {
        for (const condition of params.where.OR) {
          if (condition.email) {
            const user = this.users.find(u => u.email === condition.email);
            if (user) return user;
          }
          if (condition.idCard) {
            const user = this.users.find(u => u.idCard === condition.idCard);
            if (user) return user;
          }
        }
      }
      
      return null;
    },

    findUnique: async (params) => {
      console.log('[MockDB] Find unique:', params);
      return this.users.find(u => u.id === params.where.id);
    },

    create: async (params) => {
      console.log('[MockDB] Create user:', params);
      const newUser = {
        id: 'user-' + Date.now(),
        ...params.data,
      };
      this.users.push(newUser);
      return newUser;
    },

    update: async (params) => {
      console.log('[MockDB] Update user:', params);
      const index = this.users.findIndex(u => u.id === params.where.id);
      if (index !== -1) {
        this.users[index] = { ...this.users[index], ...params.data };
        return this.users[index];
      }
      throw new Error('User not found');
    }
  };

  async $connect() {
    console.log('✅ Connected to Mock Database (In-Memory)');
  }

  async $disconnect() {
    console.log('✅ Disconnected from Mock Database');
  }
}

const mockPrisma = new MockPrismaService();

// Export mock prisma for development
module.exports = { prisma: mockPrisma };
