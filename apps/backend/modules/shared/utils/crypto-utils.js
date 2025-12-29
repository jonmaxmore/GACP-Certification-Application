/**
 * Crypto Utility Functions
 * Password hashing and token generation
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');

/**
 * Hash password
 * @param {String} password
 * @returns {Promise<String>}
 */
const hashPassword = async password => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare password
 * @param {String} password
 * @param {String} hashedPassword
 * @returns {Promise<Boolean>}
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate random token
 * @param {Number} length
 * @returns {String}
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate verification code
 * @param {Number} length
 * @returns {String}
 */
const generateVerificationCode = (length = 6) => {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
};

/**
 * Hash data with SHA256
 * @param {String} data
 * @returns {String}
 */
const sha256Hash = data => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateVerificationCode,
  sha256Hash,
};
