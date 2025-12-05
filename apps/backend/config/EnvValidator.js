const REQUIRED_SECRETS = {
  production: ['FARMER_JWT_SECRET', 'DTAM_JWT_SECRET', 'MONGODB_URI', 'REDIS_URL'],
  development: ['FARMER_JWT_SECRET', 'DTAM_JWT_SECRET'],
};

function validateEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const required = REQUIRED_SECRETS[env] || REQUIRED_SECRETS.development;
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log('✅ Environment validation passed');
}

function getSecret(key, defaultValue = null) {
  const value = process.env[key];
  if (!value && defaultValue === null) {
    throw new Error(`Required secret ${key} not found`);
  }
  return value || defaultValue;
}

module.exports = { validateEnvironment, getSecret };
