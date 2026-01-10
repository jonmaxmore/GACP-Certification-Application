/**
 * Prisma Client - Database Connection
 * 
 * Provides a singleton Prisma client instance for the application.
 * Uses PostgreSQL as the database.
 */

const { PrismaClient } = require('@prisma/client');

// Singleton pattern for Prisma Client
if (!global.prisma) {
    global.prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });
}
const prisma = global.prisma;

/**
 * Connect to the database
 */
async function connect() {
    try {
        await prisma.$connect();
        console.log('✅ Connected to PostgreSQL via Prisma');
        return true;
    } catch (error) {
        console.error('❌ Failed to connect to PostgreSQL:', error.message);
        return false;
    }
}

/**
 * Disconnect from the database
 */
async function disconnect() {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from PostgreSQL');
}

/**
 * Health check
 */
async function healthCheck() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return { status: 'connected', type: 'postgresql' };
    } catch (error) {
        return { status: 'disconnected', error: error.message };
    }
}

module.exports = {
    prisma,
    connect,
    disconnect,
    healthCheck,
};

