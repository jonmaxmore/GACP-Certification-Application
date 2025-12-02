/**
 * Test User Factory
 * Provides consistent test fixtures with all required fields including phoneNumber
 */

/**
 * Valid user registration payload with all required fields
 */
const validUserPayload = {
  email: 'alice@example.com',
  password: 'Str0ngP@ssw0rd!',
  firstName: 'Alice',
  lastName: 'Wonderland',
  idCard: '1234567890123',
  phoneNumber: '+66812345678',
  address: '123 Test Street',
  province: 'Bangkok',
  district: 'Bang Khen',
  subDistrict: 'Anusawari',
  postalCode: '10220',
};

/**
 * Another valid user for testing duplicates
 */
const validUserPayload2 = {
  email: 'bob@example.com',
  password: 'Str0ngPass123!',
  firstName: 'Bob',
  lastName: 'Builder',
  idCard: '9876543210987',
  phoneNumber: '+66876543210',
  address: '456 Builder Ave',
  province: 'Chiang Mai',
  district: 'Mueang',
  subDistrict: 'Suthep',
  postalCode: '50200',
};

/**
 * Minimal valid user (only required fields)
 */
const minimalValidUserPayload = {
  email: 'minimal@example.com',
  password: 'M1n!malPass',
  firstName: 'Min',
  lastName: 'Imal',
  idCard: '1111111111111',
  phoneNumber: '+66811111111',
};

/**
 * User with weak password (for error testing)
 */
const userWithWeakPassword = {
  email: 'weak@example.com',
  password: 'weak',
  firstName: 'Weak',
  lastName: 'Password',
  idCard: '2222222222222',
  phoneNumber: '+66822222222',
};

/**
 * User with invalid email (for error testing)
 */
const userWithInvalidEmail = {
  email: 'invalid-email',
  password: 'ValidP@ssw0rd123',
  firstName: 'Invalid',
  lastName: 'Email',
  idCard: '3333333333333',
  phoneNumber: '+66833333333',
};

/**
 * User missing required fields (for error testing)
 */
const userMissingFields = {
  email: 'missing@example.com',
  password: 'ValidP@ssw0rd123',
  // Missing firstName, lastName, idCard, phoneNumber
};

/**
 * Create custom user payload with overrides
 * @param {Object} overrides - Fields to override in base payload
 * @returns {Object} User payload
 */
function createUserPayload(overrides = {}) {
  return {
    ...validUserPayload,
    ...overrides,
  };
}

/**
 * Create user with unique email
 * @param {string} prefix - Email prefix
 * @returns {Object} User payload
 */
function createUniqueUserPayload(prefix = 'user') {
  const timestamp = Date.now();
  return createUserPayload({
    email: `${prefix}-${timestamp}@example.com`,
    idCard: `${timestamp}`.padEnd(13, '0').slice(0, 13),
    phoneNumber: `+668${timestamp}`.slice(0, 12),
  });
}

module.exports = {
  validUserPayload,
  validUserPayload2,
  minimalValidUserPayload,
  userWithWeakPassword,
  userWithInvalidEmail,
  userMissingFields,
  createUserPayload,
  createUniqueUserPayload,
};
