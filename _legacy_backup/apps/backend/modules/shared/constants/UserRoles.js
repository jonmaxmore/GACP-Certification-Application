/**
 * User Roles Constants
 */

module.exports = {
  // Farmer roles
  FARMER: 'farmer',
  PREMIUM_FARMER: 'premium_farmer',

  // DTAM Staff roles
  DTAM_ADMIN: 'admin',
  DTAM_REVIEWER: 'reviewer',
  DTAM_MANAGER: 'manager',
  DTAM_INSPECTOR: 'inspector',

  // All roles array
  ALL_FARMER_ROLES: ['farmer', 'premium_farmer'],
  ALL_DTAM_ROLES: ['admin', 'reviewer', 'manager', 'inspector'],
  ALL_ROLES: ['farmer', 'premium_farmer', 'admin', 'reviewer', 'manager', 'inspector'],

  // Role permissions
  PERMISSIONS: {
    farmer: ['read:own', 'write:own'],
    premium_farmer: ['read:own', 'write:own', 'advanced:features'],
    admin: ['read:all', 'write:all', 'delete:all', 'manage:users'],
    reviewer: ['read:all', 'write:review', 'approve:applications'],
    manager: ['read:all', 'write:all', 'reports:view'],
    inspector: ['read:inspections', 'write:inspections'],
  },
};
