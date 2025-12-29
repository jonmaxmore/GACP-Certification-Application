/**
 * Prisma Repositories Index
 * 
 * Central export for all Prisma-based repositories
 */

const userRepository = require('./prisma-user-repository');
const applicationRepository = require('./prisma-application-repository');
const notificationRepository = require('./prisma-notification-repository');

module.exports = {
    userRepository,
    applicationRepository,
    notificationRepository,
};
