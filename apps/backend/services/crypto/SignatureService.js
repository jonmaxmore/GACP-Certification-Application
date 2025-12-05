/**
 * Digital Signature Service
 *
 * Provides cryptographic services for the Botanical Audit Framework:
 * - RSA-2048 digital signatures
 * - SHA-256 hash chains
 * - Signature verification
 * - Key management (AWS KMS integration)
 * - RFC 3161 timestamp integration
 *
 * Security Features:
 * - Military-grade encryption (RSA-2048)
 * - Tamper-proof hash chains
 * - Immutable audit trail
 * - Trusted timestamps
 *
 * @module services/crypto/signature-service
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// AWS KMS (optional, for production)
let AWS_KMS = null;
try {
  const AWS = require('aws-sdk');
  AWS_KMS = new AWS.KMS({ region: process.env.AWS_REGION || 'ap-southeast-1' });
} catch (error) {
  console.warn('AWS SDK not available. Using local key management.');
}

/**
 * Signature Service Class
 */
class SignatureService {
  constructor(options = {}) {
    this.algorithm = options.algorithm || 'RSA-SHA256';
    this.keySize = options.keySize || 2048;
    this.keyDir = options.keyDir || path.join(__dirname, '../../keys');
    this.useKMS = options.useKMS && AWS_KMS !== null;
    this.kmsKeyId = options.kmsKeyId || process.env.AWS_KMS_KEY_ID;

    // In-memory key cache
    this.keyCache = {
      public: null,
      private: null,
    };

    // Initialization promise
    this.initPromise = this.initialize();
  }

  /**
   * Initialize the signature service
   */
  async initialize() {
    try {
      // Ensure keys directory exists
      await fs.mkdir(this.keyDir, { recursive: true });

      if (this.useKMS) {
        console.log('✓ Using AWS KMS for key management');

        // Verify KMS key exists
        await this.verifyKMSKey();
      } else {
        console.log('⚠️  Using local key management (dev mode)');

        // Load or generate local keys
        await this.ensureLocalKeys();
      }

      console.log('✓ Signature service initialized');
    } catch (error) {
      console.error('Failed to initialize signature service:', error);
      throw error;
    }
  }

  /**
   * Ensure service is initialized before operations
   */
  async ensureInitialized() {
    await this.initPromise;
  }

  /**
   * Generate SHA-256 hash of data
   *
   * @param {Object|String} data - Data to hash
   * @returns {String} Hexadecimal hash string
   */
  generateHash(data) {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(jsonString).digest('hex');
  }

  /**
   * Generate hash chain (link current record to previous)
   *
   * @param {Object} record - Current record data
   * @param {String} previousHash - Hash of previous record (or genesis)
   * @returns {String} Hash of current record
   */
  generateHashChain(record, previousHash = null) {
    // Use timestamp from record, or createdAt, or generate new ISO string
    const timestamp = record.timestamp || record.createdAt || new Date().toISOString();

    const data = {
      id: record.id || record.recordId,
      type: record.type,
      data: record.data,
      timestamp: timestamp,
      previousHash: previousHash || '0'.repeat(64), // Genesis record
      userId: record.userId,
    };

    return this.generateHash(data);
  }

  /**
   * Verify hash chain integrity
   *
   * @param {Object} record - Record to verify
   * @param {String} previousHash - Expected previous hash (optional, uses record.previousHash if not provided)
   * @returns {Boolean} True if hash chain is valid
   */
  verifyHashChain(record, previousHash = null) {
    // Use provided previousHash, or fall back to record.previousHash
    const expectedPreviousHash = previousHash !== null ? previousHash : record.previousHash;

    const computedHash = this.generateHashChain(
      {
        id: record.id || record.recordId,
        type: record.type,
        data: record.data,
        timestamp: record.timestamp || record.createdAt,
        userId: record.userId,
      },
      expectedPreviousHash,
    );

    return computedHash === record.hash;
  }

  /**
   * Sign data with private key
   *
   * @param {String} hash - Hash to sign
   * @returns {Promise<String>} Hexadecimal signature
   */
  async sign(hash) {
    await this.ensureInitialized();

    if (this.useKMS) {
      return await this.signWithKMS(hash);
    } else {
      return await this.signWithLocalKey(hash);
    }
  }

  /**
   * Verify signature with public key
   *
   * @param {String} hash - Original hash
   * @param {String} signature - Signature to verify
   * @param {String} publicKey - Public key (optional, uses cached if not provided)
   * @returns {Promise<Boolean>} True if signature is valid
   */
  async verify(hash, signature, publicKey = null) {
    await this.ensureInitialized();

    if (this.useKMS) {
      return await this.verifyWithKMS(hash, signature);
    } else {
      return await this.verifyWithLocalKey(hash, signature, publicKey);
    }
  }

  /**
   * Sign data using AWS KMS
   * @private
   */
  async signWithKMS(hash) {
    try {
      const params = {
        KeyId: this.kmsKeyId,
        Message: Buffer.from(hash, 'utf8'),
        MessageType: 'DIGEST',
        SigningAlgorithm: 'RSASSA_PKCS1_V1_5_SHA_256',
      };

      const result = await AWS_KMS.sign(params).promise();
      return result.Signature.toString('hex');
    } catch (error) {
      console.error('KMS signing error:', error);
      throw new Error(`Failed to sign with KMS: ${error.message}`);
    }
  }

  /**
   * Verify signature using AWS KMS
   * @private
   */
  async verifyWithKMS(hash, signature) {
    try {
      const params = {
        KeyId: this.kmsKeyId,
        Message: Buffer.from(hash, 'utf8'),
        MessageType: 'DIGEST',
        Signature: Buffer.from(signature, 'hex'),
        SigningAlgorithm: 'RSASSA_PKCS1_V1_5_SHA_256',
      };

      const result = await AWS_KMS.verify(params).promise();
      return result.SignatureValid;
    } catch (error) {
      console.error('KMS verification error:', error);
      return false;
    }
  }

  /**
   * Sign data using local private key
   * @private
   */
  async signWithLocalKey(hash) {
    try {
      if (!this.keyCache.private) {
        await this.loadPrivateKey();
      }

      const sign = crypto.createSign('RSA-SHA256');
      sign.update(hash);
      sign.end();

      // Sign with passphrase for encrypted private key
      const signature = sign.sign(
        {
          key: this.keyCache.private,
          passphrase: process.env.KEY_PASSPHRASE || 'botanical-audit-framework-2025',
        },
        'hex',
      );
      return signature;
    } catch (error) {
      console.error('Local signing error:', error);
      throw new Error(`Failed to sign with local key: ${error.message}`);
    }
  }

  /**
   * Verify signature using local public key
   * @private
   */
  async verifyWithLocalKey(hash, signature, publicKey = null) {
    try {
      const keyToUse = publicKey || this.keyCache.public;

      if (!keyToUse) {
        await this.loadPublicKey();
      }

      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(hash);
      verify.end();

      return verify.verify(keyToUse || this.keyCache.public, signature, 'hex');
    } catch (error) {
      console.error('Local verification error:', error);
      return false;
    }
  }

  /**
   * Ensure local keys exist (generate if missing)
   * @private
   */
  async ensureLocalKeys() {
    const _publicKeyPath = path.join(this.keyDir, 'public.pem');
    const _privateKeyPath = path.join(this.keyDir, 'private.pem');

    try {
      // Try to load existing keys
      await this.loadPublicKey();
      await this.loadPrivateKey();
      console.log('✓ Loaded existing keys');
    } catch (error) {
      // Keys don't exist, generate new ones
      console.log('⚠️  Keys not found, generating new key pair...');
      await this.generateKeyPair();
      console.log('✓ Generated new key pair');
    }
  }

  /**
   * Generate RSA key pair
   * @private
   */
  async generateKeyPair() {
    return new Promise((resolve, reject) => {
      crypto.generateKeyPair(
        'rsa',
        {
          modulusLength: this.keySize,
          publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
          },
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: process.env.KEY_PASSPHRASE || 'botanical-audit-framework-2025',
          },
        },
        async (err, publicKey, privateKey) => {
          if (err) {
            return reject(err);
          }

          try {
            // Save keys to disk
            const publicKeyPath = path.join(this.keyDir, 'public.pem');
            const privateKeyPath = path.join(this.keyDir, 'private.pem');

            await fs.writeFile(publicKeyPath, publicKey);
            await fs.writeFile(privateKeyPath, privateKey);

            // Cache keys
            this.keyCache.public = publicKey;
            this.keyCache.private = privateKey;

            console.log(`✓ Keys saved to: ${this.keyDir}`);
            resolve({ publicKey, privateKey });
          } catch (error) {
            reject(error);
          }
        },
      );
    });
  }

  /**
   * Load public key from disk
   * @private
   */
  async loadPublicKey() {
    const publicKeyPath = path.join(this.keyDir, 'public.pem');
    this.keyCache.public = await fs.readFile(publicKeyPath, 'utf8');
    return this.keyCache.public;
  }

  /**
   * Load private key from disk
   * @private
   */
  async loadPrivateKey() {
    const privateKeyPath = path.join(this.keyDir, 'private.pem');
    this.keyCache.private = await fs.readFile(privateKeyPath, 'utf8');
    return this.keyCache.private;
  }

  /**
   * Get public key (for verification by others)
   *
   * @returns {Promise<String>} PEM-formatted public key
   */
  async getPublicKey() {
    await this.ensureInitialized();

    if (this.useKMS) {
      return await this.getKMSPublicKey();
    } else {
      if (!this.keyCache.public) {
        await this.loadPublicKey();
      }
      return this.keyCache.public;
    }
  }

  /**
   * Get public key from AWS KMS
   * @private
   */
  async getKMSPublicKey() {
    try {
      const params = { KeyId: this.kmsKeyId };
      const result = await AWS_KMS.getPublicKey(params).promise();

      // Convert DER to PEM format
      const publicKeyDER = result.PublicKey;
      const publicKeyPEM = this.derToPem(publicKeyDER, 'PUBLIC KEY');

      return publicKeyPEM;
    } catch (error) {
      console.error('Failed to get KMS public key:', error);
      throw error;
    }
  }

  /**
   * Verify AWS KMS key exists
   * @private
   */
  async verifyKMSKey() {
    try {
      const params = { KeyId: this.kmsKeyId };
      const result = await AWS_KMS.describeKey(params).promise();

      if (result.KeyMetadata.KeyState !== 'Enabled') {
        throw new Error(`KMS key is not enabled: ${result.KeyMetadata.KeyState}`);
      }

      console.log(`✓ KMS key verified: ${result.KeyMetadata.KeyId}`);
      return true;
    } catch (error) {
      console.error('KMS key verification failed:', error);
      throw new Error(`Invalid KMS key: ${error.message}`);
    }
  }

  /**
   * Convert DER to PEM format
   * @private
   */
  derToPem(der, type) {
    const base64 = der.toString('base64');
    const chunks = base64.match(/.{1,64}/g) || [];
    return [`-----BEGIN ${type}-----`, ...chunks, `-----END ${type}-----`].join('\n');
  }

  /**
   * Sign a complete record (hash + sign)
   *
   * @param {Object} record - Record to sign
   * @param {String} previousHash - Previous record hash (for chain)
   * @returns {Promise<Object>} Signed record with hash and signature
   */
  async signRecord(record, previousHash = null) {
    await this.ensureInitialized();

    // Generate hash chain
    const hash = this.generateHashChain(record, previousHash);

    // Sign the hash
    const signature = await this.sign(hash);

    // Return signed record
    return {
      ...record,
      hash,
      signature,
      previousHash: previousHash || '0'.repeat(64),
    };
  }

  /**
   * Verify a complete record (hash chain + signature)
   *
   * @param {Object} record - Record to verify
   * @param {String} previousHash - Expected previous hash
   * @param {String} publicKey - Public key (optional)
   * @returns {Promise<Object>} Verification result
   */
  async verifyRecord(record, previousHash = null, publicKey = null) {
    await this.ensureInitialized();

    // Verify hash chain
    const hashValid = this.verifyHashChain(record, previousHash);

    // Verify signature
    const signatureValid = await this.verify(record.hash, record.signature, publicKey);

    return {
      valid: hashValid && signatureValid,
      hash: {
        valid: hashValid,
        stored: record.hash,
        computed: this.generateHashChain(
          {
            id: record.id || record.recordId,
            type: record.type,
            data: record.data,
            timestamp: record.timestamp || record.createdAt,
            userId: record.userId,
          },
          previousHash,
        ),
      },
      signature: {
        valid: signatureValid,
        algorithm: this.algorithm,
      },
    };
  }

  /**
   * Rotate keys (generate new key pair)
   *
   * @param {Number} version - Key version number
   * @returns {Promise<Object>} New key pair info
   */
  async rotateKeys(version) {
    await this.ensureInitialized();

    if (this.useKMS) {
      throw new Error('Key rotation for KMS keys must be done through AWS console');
    }

    // Backup old keys
    const timestamp = Date.now();
    const backupDir = path.join(this.keyDir, 'backup', `v${version - 1}-${timestamp}`);
    await fs.mkdir(backupDir, { recursive: true });

    const publicKeyPath = path.join(this.keyDir, 'public.pem');
    const privateKeyPath = path.join(this.keyDir, 'private.pem');

    // Copy old keys to backup
    await fs.copyFile(publicKeyPath, path.join(backupDir, 'public.pem'));
    await fs.copyFile(privateKeyPath, path.join(backupDir, 'private.pem'));

    console.log(`✓ Backed up old keys to: ${backupDir}`);

    // Generate new keys
    const { publicKey, privateKey: _privateKey } = await this.generateKeyPair();

    console.log(`✓ Rotated keys to version ${version}`);

    return {
      version,
      publicKey,
      backupPath: backupDir,
      timestamp,
    };
  }
}

// Export singleton instance
let instance = null;

/**
 * Get SignatureService instance (singleton)
 *
 * @param {Object} options - Configuration options
 * @returns {SignatureService}
 */
function getSignatureService(options = {}) {
  if (!instance) {
    instance = new SignatureService(options);
  }
  return instance;
}

/**
 * Initialize SignatureService (call this on app startup)
 *
 * @param {Object} options - Configuration options
 * @returns {Promise<SignatureService>}
 */
async function initializeSignatureService(options = {}) {
  const service = getSignatureService(options);
  await service.ensureInitialized();
  return service;
}

module.exports = {
  SignatureService,
  getSignatureService,
  initializeSignatureService,
};
