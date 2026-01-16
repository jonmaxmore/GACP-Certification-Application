/**
 * GACP Platform - Centralized Configuration
 * 
 * SINGLE SOURCE OF TRUTH for all URLs and ports
 * Change values here once → affects entire application
 */

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Environment detection
const isDevelopment = process.env.NODE_ENV !== 'production';

// Port Configuration
const PORTS = {
    FRONTEND: 3000,
    BACKEND: 3001,
} as const;

// Base URLs
const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST || 'localhost';
const BACKEND_PORT = process.env.NEXT_PUBLIC_BACKEND_PORT || PORTS.BACKEND;

// API Configuration
export const API_CONFIG = {
    // Frontend runs on port 3000
    frontendUrl: `http://localhost:${PORTS.FRONTEND}`,

    // Backend API base URL
    backendUrl: process.env.NEXT_PUBLIC_API_URL || `http://${BACKEND_HOST}:${BACKEND_PORT}`,

    // API endpoints
    apiBase: '/api',
    // Legacy v2Base removed - unified to /api

    // Health check endpoint
    healthEndpoint: '/health',

    // Timeouts
    timeout: 15000,
    retryAttempts: 3,
};

// Get full API URL
export const getApiUrl = (path: string = ''): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_CONFIG.backendUrl}${API_CONFIG.apiBase}${cleanPath}`;
};

// Get backend URL for direct calls
export const getBackendUrl = (path: string = ''): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_CONFIG.backendUrl}${cleanPath}`;
};

// Environment info
export const ENV = {
    isDevelopment,
    isProduction: !isDevelopment,
    ports: PORTS,
};

export default API_CONFIG;

