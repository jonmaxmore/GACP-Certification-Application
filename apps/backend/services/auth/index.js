/**
 * Auth Services - Grouped
 */
module.exports = {
    authService: require('./auth-service'),
    prismaAuthService: require('./prisma-auth-service'),
    tokenRotation: require('./token-rotation'),
};
