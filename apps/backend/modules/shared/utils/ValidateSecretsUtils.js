/**
 * Secret Validation Utility
 * Validates JWT secrets and other sensitive configuration before server starts
 * CRITICAL: This prevents weak secrets from being used in production
 */

const crypto = require('crypto');

// List of WEAK/EXAMPLE secrets that MUST NOT be used
const FORBIDDEN_SECRETS = [
  'development-jwt-secret-key-not-for-production',
  'sprint1-jwt-secret-key-min-32-characters-change-in-prod-2025',
  'gacpSecretKey2025ThailandSecure123456789abcdefghijklmnop',
  'sprint1-refresh-token-secret-min-32-chars-change-2025',
  'sprint1-session-secret-min-32-characters-change-in-production',
  'your-secret-key',
  'change-me',
  'secret',
  '123456',
  'password',
  // Add any other development/example secrets here
];

/**
 * Validate JWT Secret
 * @param {string} secret - JWT secret to validate
 * @param {string} secretName - Name of the secret (for error messages)
 * @throws {Error} If secret is invalid
 */
function validateJWTSecret(secret, secretName = 'JWT_SECRET') {
  // 1. Check if secret exists
  if (!secret) {
    throw new Error(
      `❌ SECURITY ERROR: ${secretName} is required but not set!\n` +
        `   Generate a strong secret with: openssl rand -base64 64\n` +
        `   Then add it to your .env file.`,
    );
  }

  // 2. Check minimum length (64 characters recommended)
  if (secret.length < 64) {
    throw new Error(
      `❌ SECURITY ERROR: ${secretName} is too short (${secret.length} characters)!\n` +
        `   Minimum: 64 characters\n` +
        `   Current: ${secret.length} characters\n` +
        `   Generate a strong secret with: openssl rand -base64 64`,
    );
  }

  // 3. Check if it's a forbidden/weak secret
  const secretLower = secret.toLowerCase();
  for (const forbidden of FORBIDDEN_SECRETS) {
    if (secret === forbidden || secretLower.includes(forbidden.toLowerCase())) {
      throw new Error(
        `❌ SECURITY ERROR: ${secretName} is using a known weak/example secret!\n` +
          `   Detected: "${forbidden}"\n` +
          `   This secret is either from development or commonly known.\n` +
          `   Generate a NEW strong secret with: openssl rand -base64 64`,
      );
    }
  }

  // 4. Check for common weak patterns
  if (/^(secret|password|key|token|dev|test|demo)/i.test(secret)) {
    throw new Error(
      `❌ SECURITY ERROR: ${secretName} starts with a common weak pattern!\n` +
        `   Avoid: secret*, password*, key*, token*, dev*, test*, demo*\n` +
        `   Generate a strong secret with: openssl rand -base64 64`,
    );
  }

  // 5. Check entropy (randomness)
  const uniqueChars = new Set(secret).size;
  const entropyRatio = uniqueChars / secret.length;

  if (entropyRatio < 0.5) {
    // At least 50% unique characters
    console.warn(
      `⚠️  WARNING: ${secretName} has low entropy (${Math.round(entropyRatio * 100)}%)!\n` +
        `   This secret might not be random enough.\n` +
        `   Consider generating a new one with: openssl rand -base64 64`,
    );
  }

  // 6. Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    // Check if secret contains obvious patterns
    if (/sprint|sprint1|sprint2|dev|development|test|localhost/i.test(secret)) {
      throw new Error(
        `❌ SECURITY ERROR: ${secretName} contains development-related keywords!\n` +
          `   Found: sprint, dev, test, or localhost\n` +
          `   This is NOT safe for production!\n` +
          `   Generate a production secret with: openssl rand -base64 64`,
      );
    }
  }

  return true;
}

/**
 * Validate Session Secret
 * @param {string} secret - Session secret to validate
 * @throws {Error} If secret is invalid
 */
function validateSessionSecret(secret) {
  if (!secret) {
    throw new Error(
      `❌ SECURITY ERROR: SESSION_SECRET is required!\n` +
        `   Generate with: openssl rand -base64 32`,
    );
  }

  if (secret.length < 32) {
    throw new Error(
      `❌ SECURITY ERROR: SESSION_SECRET is too short (${secret.length} characters)!\n` +
        `   Minimum: 32 characters\n` +
        `   Generate with: openssl rand -base64 32`,
    );
  }

  // Check forbidden secrets
  for (const forbidden of FORBIDDEN_SECRETS) {
    if (secret === forbidden) {
      throw new Error(
        `❌ SECURITY ERROR: SESSION_SECRET is using a known weak secret!\n` +
          `   Generate a NEW strong secret with: openssl rand -base64 32`,
      );
    }
  }

  return true;
}

/**
 * Validate that two secrets are different
 * @param {string} secret1 - First secret
 * @param {string} secret2 - Second secret
 * @param {string} name1 - Name of first secret
 * @param {string} name2 - Name of second secret
 * @throws {Error} If secrets are the same
 */
function validateSecretsAreDifferent(secret1, secret2, name1, name2) {
  if (secret1 === secret2) {
    throw new Error(
      `❌ SECURITY ERROR: ${name1} and ${name2} must be different!\n` +
        `   Using the same secret for both defeats the purpose of having two secrets.\n` +
        `   Generate different secrets with: openssl rand -base64 64`,
    );
  }
  return true;
}

/**
 * Validate ALL secrets before starting the server
 * @throws {Error} If any secret is invalid
 */
function validateAllSecrets() {
  console.log('\n🔒 Validating security configuration...\n');

  try {
    // 1. Validate JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET;
    validateJWTSecret(jwtSecret, 'JWT_SECRET');
    console.log('✅ JWT_SECRET: Valid');

    // 2. Validate JWT_REFRESH_SECRET
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (jwtRefreshSecret) {
      validateJWTSecret(jwtRefreshSecret, 'JWT_REFRESH_SECRET');
      console.log('✅ JWT_REFRESH_SECRET: Valid');

      // 3. Ensure JWT secrets are different
      validateSecretsAreDifferent(jwtSecret, jwtRefreshSecret, 'JWT_SECRET', 'JWT_REFRESH_SECRET');
      console.log('✅ JWT secrets are different');
    } else {
      console.warn('⚠️  JWT_REFRESH_SECRET not set (using same as JWT_SECRET)');
    }

    // 4. Validate DTAM_JWT_SECRET if present
    const dtamJwtSecret = process.env.DTAM_JWT_SECRET;
    if (dtamJwtSecret) {
      validateJWTSecret(dtamJwtSecret, 'DTAM_JWT_SECRET');
      console.log('✅ DTAM_JWT_SECRET: Valid');

      // Ensure DTAM secret is different from Farmer secret
      validateSecretsAreDifferent(jwtSecret, dtamJwtSecret, 'JWT_SECRET', 'DTAM_JWT_SECRET');
      console.log('✅ DTAM_JWT_SECRET is different from JWT_SECRET');
    }

    // 5. Validate SESSION_SECRET
    const sessionSecret = process.env.SESSION_SECRET;
    if (sessionSecret) {
      validateSessionSecret(sessionSecret);
      console.log('✅ SESSION_SECRET: Valid');
    } else {
      console.warn('⚠️  SESSION_SECRET not set');
    }

    // 6. Production-specific validations
    if (process.env.NODE_ENV === 'production') {
      console.log('\n🏭 Production environment detected - Additional checks...\n');

      // Ensure MongoDB password is strong
      const mongoUri = process.env.MONGODB_URI;
      if (mongoUri && (mongoUri.includes('admin:admin') || mongoUri.includes('password'))) {
        throw new Error(
          `❌ SECURITY ERROR: MONGODB_URI contains weak credentials!\n` +
            `   Do not use 'admin:admin' or 'password' in production.`,
        );
      }

      // Ensure Redis password is strong
      const redisPassword = process.env.REDIS_PASSWORD;
      if (
        redisPassword &&
        (redisPassword === 'password' || redisPassword === 'redis' || redisPassword.length < 16)
      ) {
        throw new Error(
          `❌ SECURITY ERROR: REDIS_PASSWORD is too weak!\n` +
            `   Minimum: 16 characters\n` +
            `   Generate with: openssl rand -base64 24`,
        );
      }

      console.log('✅ Production security checks passed');
    }

    console.log('\n✅ ALL SECRETS VALIDATED SUCCESSFULLY\n');
    return true;
  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('🚨 SECURITY VALIDATION FAILED');
    console.error('='.repeat(80));
    console.error(error.message);
    console.error('='.repeat(80));
    console.error('\n❌ Server startup aborted for security reasons.\n');

    // Exit process - DO NOT start server with invalid secrets
    process.exit(1);
  }
}

/**
 * Generate a strong secret (helper function)
 * @param {number} length - Length in bytes (default: 64)
 * @returns {string} - Base64 encoded random secret
 */
function generateStrongSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64');
}

module.exports = {
  validateJWTSecret,
  validateSessionSecret,
  validateSecretsAreDifferent,
  validateAllSecrets,
  generateStrongSecret,
};
