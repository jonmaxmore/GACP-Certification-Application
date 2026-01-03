/**
 * Data Access Layer (DAL)
 * 
 * 🛡️ Security: This module runs ONLY on the server
 * All data access goes through this layer to ensure:
 * 1. Authorization is always checked
 * 2. Only safe DTOs are returned (no sensitive fields)
 * 3. No direct database access from client components
 */

import 'server-only';

// Re-export safe data access functions
export * from './users';
export * from './applications';
export * from './types';
