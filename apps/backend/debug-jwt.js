/**
 * JWT Debug Script - Verify that token generation and verification use the same secret
 */
require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('\n=== JWT Secret Debug ===\n');

// Check environment
console.log('Environment Variables:');
console.log('  - JWT_SECRET:', process.env.JWT_SECRET ? `"${process.env.JWT_SECRET}"` : 'NOT SET');
console.log('  - FARMER_JWT_SECRET:', process.env.FARMER_JWT_SECRET || 'NOT SET');
console.log('  - DTAM_JWT_SECRET:', process.env.DTAM_JWT_SECRET || 'NOT SET');

// Load configuration from both sources
const jwtSecurity = require('./config/jwt-security');
const config = jwtSecurity.getJWTConfiguration();

console.log('\njwt-security.js Configuration:');
console.log('  - public.secret:', config.public.secret);
console.log('  - dtam.secret:', config.dtam.secret);

// Check prisma-auth-service's secret
const getJwtSecret = () => process.env.JWT_SECRET || 'default-dev-secret-do-not-use-in-prod';
console.log('\nprisma-auth-service.js getJwtSecret():');
console.log('  - Secret:', getJwtSecret());

// Compare secrets
console.log('\n=== Secret Comparison ===');
const authServiceSecret = getJwtSecret();
const jwtSecuritySecret = config.public.secret;

if (authServiceSecret === jwtSecuritySecret) {
    console.log('✅ Secrets MATCH - Token signing and verification will work');
} else {
    console.log('❌ Secrets MISMATCH - This will cause "invalid signature" errors!');
    console.log('   Token signing uses:', authServiceSecret);
    console.log('   Token verification uses:', jwtSecuritySecret);
}

// Test token roundtrip
console.log('\n=== Token Roundtrip Test ===');
const testPayload = { id: 1, uuid: 'test-uuid', role: 'FARMER' };

try {
    // Sign with auth service secret
    const token = jwt.sign(testPayload, authServiceSecret, { expiresIn: '1h' });
    console.log('Token created successfully with auth service secret');
    console.log('Token prefix:', token.substring(0, 30) + '...');

    // Verify with jwt-security secret
    try {
        const decoded = jwt.verify(token, jwtSecuritySecret);
        console.log('✅ Token verified successfully with jwt-security secret');
        console.log('   Decoded payload:', decoded);
    } catch (e) {
        console.log('❌ Token verification FAILED:', e.message);
    }

    // Also test using jwtSecurity.verifyToken
    try {
        const decoded2 = jwtSecurity.verifyToken(token, 'public', config);
        console.log('✅ jwtSecurity.verifyToken() succeeded');
    } catch (e) {
        console.log('❌ jwtSecurity.verifyToken() FAILED:', e.message);
    }
} catch (e) {
    console.log('Token creation failed:', e.message);
}

console.log('\n=== Debug Complete ===\n');
