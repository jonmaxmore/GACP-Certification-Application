/**
 * ================================================================
 * ENVIRONMENT VARIABLES VALIDATOR
 * ================================================================
 *
 * ที่มาที่ไป (WHY):
 * - ป้องกันการรัน production โดยไม่มี security secrets ที่จำเป็น
 * - Fail-fast principle: หยุดทันทีถ้าพบปัญหา แทนที่จะรันและเกิด security breach
 * - ทำให้ deployment process มี checklist ที่ชัดเจน
 *
 * Logic การทำงาน (HOW):
 * 1. ตรวจสอบ environment variables ที่จำเป็นตาม NODE_ENV
 * 2. ถ้าขาดตัวใดตัวหนึ่ง → แสดง error พร้อมรายการที่ขาด → exit process
 * 3. ถ้าครบ → แสดง success message → อนุญาตให้ app เริ่มต้น
 *
 * ผลลัพธ์ (RESULT):
 * - Production จะไม่สามารถ start ได้ถ้าไม่มี JWT_SECRET
 * - ทีม DevOps จะได้รับ clear error message ว่าต้องตั้งค่าอะไรเพิ่ม
 * - ลดความเสี่ยงจาก misconfiguration
 *
 * ================================================================
 */

const chalk = require('chalk') || {
  green: t => t,
  red: t => t,
  yellow: t => t,
  cyan: t => t
};

/**
 * ตรวจสอบว่า environment variable มีค่าหรือไม่
 * และไม่ใช่ค่า default ที่ไม่ปลอดภัย
 */
function isValidEnvVar(value, envName) {
  if (!value) return false;

  // ตรวจสอบว่าไม่ใช่ค่า default ที่ไม่ปลอดภัย
  const unsafeDefaults = [
    'your-secret-key',
    'your-super-secret',
    'change-in-production',
    'gacp-secret-key',
    'gacp-dtam-secret-key',
    'gacp-platform-secret-key'
  ];

  const lowerValue = value.toLowerCase();
  for (const unsafe of unsafeDefaults) {
    if (lowerValue.includes(unsafe)) {
      return false;
    }
  }

  return true;
}

/**
 * Required environment variables สำหรับแต่ละ environment
 */
const REQUIRED_ENV_VARS = {
  // ทุก environment ต้องมี
  all: [{ name: 'NODE_ENV', description: 'Environment mode (development, staging, production)' }],

  // Development environment
  development: [
    { name: 'MONGODB_URI', description: 'MongoDB connection string' },
    { name: 'PORT', description: 'Server port number', defaultOk: true }
  ],

  // Staging environment (คล้าย production แต่ยอมให้บาง config ยืดหยุ่นกว่า)
  staging: [
    { name: 'MONGODB_URI', description: 'MongoDB connection string' },
    { name: 'JWT_SECRET', description: 'JWT signing secret (must be secure)' },
    { name: 'DTAM_JWT_SECRET', description: 'DTAM JWT signing secret (must be secure)' },
    { name: 'PORT', description: 'Server port number', defaultOk: true }
  ],

  // Production environment (เข้มงวดที่สุด)
  production: [
    { name: 'MONGODB_URI', description: 'MongoDB connection string' },
    {
      name: 'JWT_SECRET',
      description: 'JWT signing secret (MUST BE SECURE - no defaults allowed)'
    },
    {
      name: 'DTAM_JWT_SECRET',
      description: 'DTAM JWT signing secret (MUST BE SECURE - no defaults allowed)'
    },
    { name: 'JWT_EXPIRY', description: 'JWT token expiration time', defaultOk: true },
    { name: 'DTAM_JWT_EXPIRY', description: 'DTAM JWT token expiration time', defaultOk: true },
    { name: 'BCRYPT_ROUNDS', description: 'Password hashing rounds', defaultOk: true },
    { name: 'PORT', description: 'Server port number', defaultOk: true },
    { name: 'ALLOWED_ORIGINS', description: 'CORS allowed origins' }
  ],

  // Test environment
  test: [{ name: 'MONGODB_URI', description: 'Test MongoDB connection string', defaultOk: true }]
};

/**
 * ตรวจสอบ environment variables
 *
 * @returns {Object} { valid: boolean, missing: Array, insecure: Array }
 */
function validateEnvironment() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 ENVIRONMENT VARIABLES VALIDATION');
  console.log('='.repeat(80));

  const env = process.env.NODE_ENV || 'development';
  console.log(`\n📌 Environment: ${chalk.cyan(env.toUpperCase())}\n`);

  // รวม required vars จาก 'all' และ environment ปัจจุบัน
  const requiredVars = [...(REQUIRED_ENV_VARS.all || []), ...(REQUIRED_ENV_VARS[env] || [])];

  const missing = [];
  const insecure = [];
  const valid = [];

  // ตรวจสอบแต่ละตัว
  for (const varConfig of requiredVars) {
    const { name, description, defaultOk } = varConfig;
    const value = process.env[name];

    if (!value) {
      missing.push({ name, description });
    } else if (!defaultOk && !isValidEnvVar(value, name)) {
      insecure.push({ name, description, value });
    } else {
      valid.push({ name, description });
    }
  }

  // แสดงผลลัพธ์
  if (valid.length > 0) {
    console.log(chalk.green('✅ Valid Environment Variables:'));
    valid.forEach(v => {
      const displayValue =
        v.name.includes('SECRET') || v.name.includes('PASSWORD')
          ? '****** (hidden)'
          : process.env[v.name];
      console.log(`   ✓ ${v.name.padEnd(25)} = ${displayValue}`);
    });
    console.log('');
  }

  if (insecure.length > 0) {
    console.log(chalk.yellow('⚠️  Insecure Environment Variables (using unsafe defaults):'));
    insecure.forEach(v => {
      console.log(`   ⚠  ${v.name.padEnd(25)} - ${v.description}`);
      console.log(`      Current: "${v.value}"`);
      console.log('      Problem: Contains unsafe default value');
    });
    console.log('');
  }

  if (missing.length > 0) {
    console.log(chalk.red('❌ Missing Required Environment Variables:'));
    missing.forEach(v => {
      console.log(`   ✗ ${v.name.padEnd(25)} - ${v.description}`);
    });
    console.log('');
  }

  // คำนวณสถานะ
  const isValid = missing.length === 0 && (env === 'development' || insecure.length === 0);

  console.log('='.repeat(80));
  if (isValid) {
    console.log(
      chalk.green('✅ VALIDATION PASSED - All required environment variables are properly set')
    );
  } else {
    console.log(chalk.red('❌ VALIDATION FAILED - Please fix the issues above'));

    // แนะนำวิธีแก้
    console.log('\n📝 How to fix:');
    console.log('   1. Create or update your .env file');
    console.log('   2. Set the missing/insecure variables with secure values');
    console.log(
      "   3. For JWT secrets, use: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
    );
    console.log('   4. Restart the application');
  }
  console.log('='.repeat(80) + '\n');

  return {
    valid: isValid,
    environment: env,
    missing,
    insecure,
    validCount: valid.length,
    totalChecked: requiredVars.length
  };
}

/**
 * ตรวจสอบและ exit ถ้าไม่ผ่าน (ใช้สำหรับ startup)
 */
function validateOrExit() {
  const result = validateEnvironment();

  if (!result.valid) {
    console.error('\n' + chalk.red('🛑 APPLICATION STARTUP BLOCKED'));
    console.error(chalk.red('   Cannot start application with invalid environment configuration'));
    console.error(chalk.red('   Please fix the issues above and try again.\n'));

    // Exit with error code
    process.exit(1);
  }

  return result;
}

/**
 * สร้าง JWT secret แบบปลอดภัย (helper function)
 */
function generateSecureSecret() {
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex');
}

/**
 * แสดงคำแนะนำสำหรับการตั้งค่า
 */
function showSetupGuide() {
  console.log('\n' + '='.repeat(80));
  console.log('📚 ENVIRONMENT SETUP GUIDE');
  console.log('='.repeat(80) + '\n');

  console.log('1. Create .env file in project root:');
  console.log('   cp .env.example .env\n');

  console.log('2. Generate secure JWT secrets:');
  console.log("   node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"\n");

  console.log('3. Required variables for PRODUCTION:');
  REQUIRED_ENV_VARS.production.forEach(v => {
    console.log(`   - ${v.name.padEnd(25)} : ${v.description}`);
  });

  console.log('\n' + '='.repeat(80) + '\n');
}

module.exports = {
  validateEnvironment,
  validateOrExit,
  generateSecureSecret,
  showSetupGuide,
  isValidEnvVar
};
