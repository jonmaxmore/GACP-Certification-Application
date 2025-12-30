/**
 * 🍎 Apple-Standard Centralized Configuration
 * 
 * Single source of truth for all environment variables
 * Type-safe with validation at startup
 * 
 * Usage:
 * import { config } from '@/shared/config';
 * console.log(config.database.url);
 */

// Environment validation
const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
] as const;

const optionalEnvVars = [
    'NODE_ENV',
    'PORT',
    'REDIS_HOST',
    'REDIS_PORT',
    'ENCRYPTION_KEY',
    'CORS_ORIGINS',
    'BACKEND_URL',
] as const;

// Validate required environment variables
function validateEnv(): void {
    const missing: string[] = [];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    }

    if (missing.length > 0) {
        console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
        if (process.env.NODE_ENV === 'production') {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }
}

// Type-safe configuration object
export const config = {
    // Environment
    env: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV !== 'production',

    // Server
    server: {
        port: parseInt(process.env.PORT || '3000', 10),
        host: process.env.HOST || '0.0.0.0',
    },

    // Database (PostgreSQL via Prisma)
    database: {
        url: process.env.DATABASE_URL || '',
    },

    // Redis Cache
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },

    // Authentication
    auth: {
        jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
        cookieName: 'gacp_auth_token',
        cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    },

    // Security
    security: {
        encryptionKey: process.env.ENCRYPTION_KEY || '',
        bcryptRounds: 12,
    },

    // CORS
    cors: {
        origins: (process.env.CORS_ORIGINS || 'http://localhost:3001').split(','),
    },

    // API URLs
    api: {
        backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
        version: '2.6.0',
    },

    // GACP Business Constants
    gacp: {
        // Application statuses
        statuses: {
            DRAFT: 'draft',
            SUBMITTED: 'submitted',
            UNDER_REVIEW: 'under_review',
            PENDING_PAYMENT: 'pending_payment',
            PAYMENT_CONFIRMED: 'payment_confirmed',
            APPROVED: 'approved',
            REJECTED: 'rejected',
            CANCELLED: 'cancelled',
        },

        // Service types
        serviceTypes: {
            NEW_APPLICATION: 'new',
            RENEWAL: 'renewal',
            AMENDMENT: 'amendment',
            REPLACEMENT: 'replacement',
        },

        // User roles
        roles: {
            FARMER: 'FARMER',
            REVIEWER_AUDITOR: 'REVIEWER_AUDITOR',
            SCHEDULER: 'SCHEDULER',
            ACCOUNTANT: 'ACCOUNTANT',
            ADMIN: 'ADMIN',
            SUPER_ADMIN: 'SUPER_ADMIN',
        },

        // Legal retention period (5 years per DTAM regulations)
        retentionYears: 5,
    },
} as const;

// Export type for type-safe usage
export type Config = typeof config;

// Validate on import (in production)
if (typeof window === 'undefined') {
    validateEnv();
}

export default config;
