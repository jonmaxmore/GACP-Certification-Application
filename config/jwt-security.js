/**
 * ================================================================
 * SECURE JWT CONFIGURATION MODULE
 * ================================================================
 *
 * ที่มาที่ไป (WHY):
 * - JWT secret ต้องไม่มี fallback เพื่อป้องกัน security breach
 * - แยก JWT secret ระหว่าง Farmer (public) และ DTAM (government staff)
 * - ใช้ fail-fast principle: ถ้าไม่มี secret ให้หยุดทันทีแทนที่จะใช้ค่า default
 *
 * Logic การทำงาน (HOW):
 * 1. อ่าน JWT secrets จาก environment variables
 * 2. ตรวจสอบว่ามีค่าและไม่ใช่ default value ที่ไม่ปลอดภัย
 * 3. ถ้าไม่ผ่าน → throw Error พร้อมคำแนะนำ → app ไม่ start
 * 4. ถ้าผ่าน → return configuration object
 *
 * Workflow:
 * ```
 * App Start → Load .env → validateJWTSecrets() →
 *   ├─ Valid → Continue app initialization
 *   └─ Invalid → Throw Error → Process Exit
 * ```
 *
 * ผลลัพธ์ (RESULT):
 * - ไม่มีทางที่ app จะรันใน production ด้วย default secret
 * - Developer จะได้ clear error message ว่าต้องตั้งค่าอะไร
 * - แยก security context ระหว่าง public และ government ชัดเจน
 *
 * ================================================================
 */

const crypto = require('crypto');

/**
 * Cache configuration to ensure a single source of truth across modules.
 */
let cachedConfig = null;

/**
 * ตรวจสอบว่าค่าที่ได้มาเป็น unsafe default หรือไม่
 *
 * @param {string} value - ค่าที่ต้องการตรวจสอบ
 * @returns {boolean} - true ถ้าเป็น unsafe default
 */
function isUnsafeDefault(value) {
  if (!value || typeof value !== 'string') {
    return true;
  }

  const unsafePatterns = [
    'your-secret',
    'your-super-secret',
    'change-in-production',
    'change-this',
    'gacp-secret-key',
    'gacp-dtam-secret',
    'gacp-platform-secret',
    'example-secret',
    'test-secret',
    'secret-key-here'
  ];

  const lowerValue = value.toLowerCase();

  // ตรวจสอบว่ามี pattern ที่ไม่ปลอดภัยหรือไม่
  for (const pattern of unsafePatterns) {
    if (lowerValue.includes(pattern)) {
      return true;
    }
  }

  // ตรวจสอบความยาว (secret ควรยาวพอสมควร)
  if (value.length < 32) {
    return true;
  }

  return false;
}

/**
 * สร้าง secure random secret (สำหรับ development เท่านั้น)
 *
 * @returns {string} - Random hex string
 */
function generateSecureSecret() {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * ตรวจสอบและโหลด JWT configuration
 *
 * Logic:
 * 1. ตรวจสอบ NODE_ENV
 * 2. สำหรับ development: อนุญาตให้ auto-generate secret
 * 3. สำหรับ production/staging: บังคับให้ตั้งค่า secret เอง
 * 4. ตรวจสอบว่าไม่ใช่ unsafe default
 *
 * @throws {Error} ถ้าไม่มี secret หรือเป็น unsafe default ใน production
 * @returns {Object} JWT configuration
 */
function loadJWTConfiguration(options = {}) {
  const forceReload =
    typeof options === 'boolean' ? options : Boolean(options && options.forceReload);

  if (!forceReload && cachedConfig) {
    return cachedConfig;
  }

  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development' || env === 'test';

  console.log(`\n${'='.repeat(80)}`);
  console.log('🔐 JWT SECURITY CONFIGURATION');
  console.log(`${'='.repeat(80)}\n`);
  console.log(`Environment: ${env}`);
  console.log(
    `Security Level: ${isDevelopment ? 'Development (Relaxed)' : 'Production (Strict)'}\n`
  );

  // =====================================
  // PUBLIC JWT SECRET (สำหรับ Farmers)
  // =====================================
  const publicSecretSource = process.env.FARMER_JWT_SECRET
    ? 'FARMER_JWT_SECRET'
    : process.env.JWT_SECRET
    ? 'JWT_SECRET'
    : 'FARMER_JWT_SECRET/JWT_SECRET';
  let jwtSecret = process.env.FARMER_JWT_SECRET || process.env.JWT_SECRET;

  if (!jwtSecret) {
    if (isDevelopment) {
      // Development: auto-generate และแจ้งเตือน
      jwtSecret = generateSecureSecret();
      console.warn(
        `⚠️  ${publicSecretSource} not set - Generated temporary public JWT secret for DEVELOPMENT`
      );
      console.warn('   Secret:', jwtSecret.substring(0, 16) + '...');
      console.warn('   ⚠️  DO NOT use this in production!\n');

      // Persist generated secret so other modules share the same value
      process.env.FARMER_JWT_SECRET = jwtSecret;
    } else {
      // Production: throw error
      throw new Error(
        '🚨 SECURITY ERROR: FARMER_JWT_SECRET or JWT_SECRET is required in production\n' +
          '   \n' +
          '   Why: JWT tokens secure farmer sessions. Without a secret, anyone can forge tokens.\n' +
          '   \n' +
          '   How to fix:\n' +
          '   1. Generate a secure secret:\n' +
          "      node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"\n" +
          '   \n' +
          '   2. Set it in your .env file:\n' +
          '      FARMER_JWT_SECRET=<your-generated-secret>\n' +
          '      # หรือใช้ JWT_SECRET หากต้องการใช้คีย์ร่วม\n' +
          '   \n' +
          '   3. Restart the application\n'
      );
    }
  } else if (isUnsafeDefault(jwtSecret)) {
    // ถ้าเป็น unsafe default
    if (isDevelopment) {
      console.warn(
        `⚠️  ${publicSecretSource} appears to be an unsafe default (short/placeholder value)`
      );
      console.warn('   Consider generating a secure secret even for development\n');
    } else {
      throw new Error(
        `🚨 SECURITY ERROR: ${publicSecretSource} contains unsafe default value\n` +
          '   \n' +
          '   Current value: ' +
          jwtSecret.substring(0, 30) +
          '...\n' +
          '   \n' +
          '   Problem: This secret is insecure and should not be used in production\n' +
          '   \n' +
          '   How to fix:\n' +
          '   1. Generate a NEW secure secret:\n' +
          "      node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"\n" +
          '   \n' +
          '   2. Update your .env file with the new secret\n' +
          '   3. Restart the application\n'
      );
    }
  } else {
    console.log(
      `✅ Public JWT secret (${publicSecretSource}) configured (length: ${jwtSecret.length} characters)`
    );

    // Ensure env mirrors validated secret for downstream modules
    if (!process.env.FARMER_JWT_SECRET) {
      process.env.FARMER_JWT_SECRET = jwtSecret;
    }
  }

  // =====================================
  // DTAM JWT SECRET (สำหรับ Government Staff)
  // =====================================
  let dtamJwtSecret = process.env.DTAM_JWT_SECRET;

  if (!dtamJwtSecret) {
    if (isDevelopment) {
      // Development: auto-generate และแจ้งเตือน
      dtamJwtSecret = generateSecureSecret();
      console.warn('⚠️  DTAM_JWT_SECRET not set - Generated temporary secret for DEVELOPMENT');
      console.warn('   Secret:', dtamJwtSecret.substring(0, 16) + '...');
      console.warn('   ⚠️  DO NOT use this in production!\n');

      process.env.DTAM_JWT_SECRET = dtamJwtSecret;
    } else {
      // Production: throw error
      throw new Error(
        '🚨 SECURITY ERROR: DTAM_JWT_SECRET is required in production\n' +
          '   \n' +
          '   Why: DTAM staff tokens must use a separate secret from public users.\n' +
          '        This ensures government staff sessions are isolated and more secure.\n' +
          '   \n' +
          '   How to fix:\n' +
          '   1. Generate a DIFFERENT secure secret (not same as JWT_SECRET):\n' +
          "      node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"\n" +
          '   \n' +
          '   2. Set it in your .env file:\n' +
          '      DTAM_JWT_SECRET=<your-generated-secret>\n' +
          '   \n' +
          '   3. Restart the application\n'
      );
    }
  } else if (isUnsafeDefault(dtamJwtSecret)) {
    if (isDevelopment) {
      console.warn('⚠️  DTAM_JWT_SECRET appears to be an unsafe default');
      console.warn('   Consider generating a secure secret even for development\n');
    } else {
      throw new Error(
        '🚨 SECURITY ERROR: DTAM_JWT_SECRET contains unsafe default value\n' +
          '   \n' +
          '   Current value: ' +
          dtamJwtSecret.substring(0, 30) +
          '...\n' +
          '   \n' +
          '   Problem: This secret is insecure and should not be used in production\n' +
          '   \n' +
          '   How to fix: (same as JWT_SECRET above)\n'
      );
    }
  } else {
    console.log('✅ DTAM_JWT_SECRET: Configured (length: ' + dtamJwtSecret.length + ' characters)');

    if (!process.env.DTAM_JWT_SECRET) {
      process.env.DTAM_JWT_SECRET = dtamJwtSecret;
    }
  }

  // ตรวจสอบว่า JWT_SECRET และ DTAM_JWT_SECRET ไม่เหมือนกัน
  if (jwtSecret === dtamJwtSecret && !isDevelopment) {
    throw new Error(
      '🚨 SECURITY ERROR: JWT_SECRET and DTAM_JWT_SECRET must be different\n' +
        '   \n' +
        '   Why: Using the same secret for public and government staff tokens\n' +
        '        creates a security risk. If one is compromised, both are compromised.\n' +
        '   \n' +
        '   How to fix:\n' +
        '   1. Generate TWO different secrets\n' +
        '   2. Set them separately in .env file\n'
    );
  }

  // =====================================
  // JWT EXPIRY CONFIGURATION
  // =====================================
  const jwtExpiry = process.env.JWT_EXPIRY || '24h';
  const dtamJwtExpiry = process.env.DTAM_JWT_EXPIRY || '8h'; // DTAM ใช้เวลาสั้นกว่าเพื่อความปลอดภัย

  console.log('✅ JWT_EXPIRY: ' + jwtExpiry);
  console.log('✅ DTAM_JWT_EXPIRY: ' + dtamJwtExpiry);

  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ JWT CONFIGURATION LOADED SUCCESSFULLY');
  console.log(`${'='.repeat(80)}\n`);

  // Return configuration object
  cachedConfig = {
    public: {
      secret: jwtSecret,
      expiry: jwtExpiry,
      algorithm: 'HS256',
      issuer: 'gacp-platform',
      audience: 'gacp-public-users'
    },
    dtam: {
      secret: dtamJwtSecret,
      expiry: dtamJwtExpiry,
      algorithm: 'HS256',
      issuer: 'gacp-platform',
      audience: 'gacp-dtam-staff'
    },
    environment: env,
    isDevelopment
  };
  return cachedConfig;
}

function getJWTConfiguration() {
  return cachedConfig || loadJWTConfiguration();
}

function refreshJWTConfiguration() {
  cachedConfig = null;
  return loadJWTConfiguration({ forceReload: true });
}

/**
 * ตรวจสอบ JWT token ด้วย secret ที่ถูกต้อง
 *
 * @param {string} token - JWT token
 * @param {string} type - 'public' หรือ 'dtam'
 * @param {Object} config - JWT configuration from loadJWTConfiguration()
 * @returns {Object} Decoded token payload
 * @throws {Error} ถ้า token ไม่ถูกต้อง
 */
function verifyToken(token, type, config) {
  const jwt = require('jsonwebtoken');

  const jwtConfig = type === 'dtam' ? config.dtam : config.public;

  try {
    return jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      algorithms: [jwtConfig.algorithm]
    });
  } catch (error) {
    // Enhanced error messages
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Token has expired');
      err.code = 'TOKEN_EXPIRED';
      err.expiredAt = error.expiredAt;
      throw err;
    }

    if (error.name === 'JsonWebTokenError') {
      const err = new Error('Invalid token');
      err.code = 'INVALID_TOKEN';
      throw err;
    }

    throw error;
  }
}

/**
 * สร้าง JWT token
 *
 * @param {Object} payload - ข้อมูลที่จะเข้ารหัสใน token
 * @param {string} type - 'public' หรือ 'dtam'
 * @param {Object} config - JWT configuration
 * @returns {string} JWT token
 */
function signToken(payload, type, config) {
  const jwt = require('jsonwebtoken');

  const jwtConfig = type === 'dtam' ? config.dtam : config.public;

  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiry,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
    algorithm: jwtConfig.algorithm
  });
}

module.exports = {
  loadJWTConfiguration,
  getJWTConfiguration,
  refreshJWTConfiguration,
  verifyToken,
  signToken,
  generateSecureSecret,
  isUnsafeDefault
};
