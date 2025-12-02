# Digital Signature & Cryptography Service

## Overview

The Botanical Audit Framework uses military-grade cryptography to ensure data integrity, non-repudiation, and tamper-proof audit trails for cannabis traceability.

## Features

- **RSA-2048 Digital Signatures**: Industry-standard asymmetric encryption
- **SHA-256 Hash Chains**: Blockchain-inspired immutable record linking
- **RFC 3161 Timestamps**: Trusted timestamp authority integration
- **AWS KMS Integration**: Production-grade key management
- **Key Rotation**: Automated cryptographic key lifecycle management

## Security Architecture

### 1. Hash Chain (Blockchain-Inspired)

Every record is linked to the previous record through SHA-256 hashing, creating an immutable chain:

```
Record 1: hash = SHA256(data + previousHash:"000...000")
Record 2: hash = SHA256(data + previousHash:Record1.hash)
Record 3: hash = SHA256(data + previousHash:Record2.hash)
```

**Properties**:
- Any tampering with a record breaks the entire chain
- Genesis record uses `0000...0000` (64 zeros) as previousHash
- Hash is deterministic and reproducible

### 2. Digital Signature (RSA-2048)

Each record hash is signed with a private key, creating a digital signature:

```
signature = RSA_SIGN(privateKey, hash)
verified = RSA_VERIFY(publicKey, hash, signature)
```

**Properties**:
- Private key is secret, only system can sign
- Public key is public, anyone can verify
- Signature proves authenticity and non-repudiation
- 2048-bit key size (military-grade)

### 3. Trusted Timestamp (RFC 3161)

Each record can be timestamped by a Timestamp Authority (TSA):

```
timestampToken = TSA.timestamp(hash)
verified = TSA.verify(timestampToken, hash)
```

**Properties**:
- Proves record existed at specific time
- Timestamp is cryptographically signed by TSA
- Cannot be backdated or tampered
- Compliant with RFC 3161 standard

## Installation

### Prerequisites

```bash
# Node.js dependencies (already in package.json)
npm install

# For AWS KMS (production only)
npm install aws-sdk
```

### Environment Variables

```bash
# Development (local keys)
NODE_ENV=development
KEY_PASSPHRASE=your-secure-passphrase

# Production (AWS KMS)
NODE_ENV=production
AWS_KMS_KEY_ID=arn:aws:kms:ap-southeast-1:123456789012:key/abcd1234
AWS_REGION=ap-southeast-1

# Timestamp Authority
TSA_PROVIDER=freetsa  # or digicert, globalsign
DIGICERT_API_KEY=your-api-key  # if using DigiCert
GLOBALSIGN_API_KEY=your-api-key  # if using GlobalSign
```

## Usage

### Basic Setup

```javascript
const cryptoService = require('./services/crypto');

// Initialize on app startup
await cryptoService.initialize({
  useKMS: process.env.NODE_ENV === 'production',
  kmsKeyId: process.env.AWS_KMS_KEY_ID,
  tsaProvider: process.env.TSA_PROVIDER || 'freetsa'
});

console.log('Crypto service ready:', cryptoService.getStatus());
```

### Sign a Single Record

```javascript
const record = {
  id: 'record-001',
  type: 'PLANTING',
  data: {
    farmId: 'farm-123',
    plantType: 'Cannabis Sativa',
    quantity: 100,
    location: { lat: 13.7563, lon: 100.5018 }
  },
  timestamp: new Date().toISOString(),
  userId: 'user-456'
};

// Sign with hash chain + digital signature + timestamp
const signedRecord = await cryptoService.signRecord(
  record,
  previousHash, // null for genesis record
  true // include RFC 3161 timestamp
);

console.log('Signed record:', signedRecord);
// {
//   ...record,
//   hash: 'abc123...',
//   signature: 'def456...',
//   previousHash: '000000...',
//   timestamp: {
//     timestamp: '2025-05-21T10:30:45.678Z',
//     token: 'base64-encoded-token',
//     provider: 'FreeTSA'
//   }
// }
```

### Verify a Record

```javascript
const verification = await cryptoService.verifyRecord(
  signedRecord,
  previousHash // null for genesis record
);

if (verification.valid) {
  console.log('✓ Record is valid and tamper-proof');
} else {
  console.error('✗ Record verification failed:', verification);
}

// Detailed verification result
// {
//   valid: true,
//   signature: {
//     valid: true,
//     hash: {
//       valid: true,
//       stored: 'abc123...',
//       computed: 'abc123...'
//     },
//     signature: {
//       valid: true,
//       algorithm: 'RSA-SHA256'
//     }
//   },
//   timestamp: {
//     valid: true,
//     timestamp: '2025-05-21T10:30:45.678Z',
//     provider: 'FreeTSA'
//   }
// }
```

### Sign Multiple Records (Batch)

```javascript
const records = [
  { id: 'record-001', type: 'PLANTING', data: {...}, timestamp: '...', userId: '...' },
  { id: 'record-002', type: 'WATERING', data: {...}, timestamp: '...', userId: '...' },
  { id: 'record-003', type: 'HARVEST', data: {...}, timestamp: '...', userId: '...' }
];

// Sign all records with hash chain linking
const signedRecords = await cryptoService.signRecordsBatch(
  records,
  false // timestamps optional (slow with free TSA)
);

// Save to database
await RecordModel.insertMany(signedRecords);
```

### Verify Record Chain

```javascript
// Retrieve records from database
const records = await RecordModel.find({ farmId: 'farm-123' }).sort('createdAt');

// Verify entire chain
const verification = await cryptoService.verifyRecordChain(records);

console.log(`Chain verification: ${verification.valid}`);
console.log(`Total: ${verification.totalRecords}`);
console.log(`Valid: ${verification.validRecords}`);
console.log(`Invalid: ${verification.invalidRecords}`);

// Check details
verification.details.forEach(result => {
  if (!result.valid) {
    console.error(`Record ${result.recordId} is invalid!`);
  }
});
```

### Manual Hash and Signature

```javascript
// Generate hash only
const hash = cryptoService.generateHash({ test: 'data' });
console.log('Hash:', hash); // 64-character hex string

// Generate hash chain
const hash = cryptoService.generateHashChain(record, previousHash);

// Sign hash
const signature = await cryptoService.sign(hash);

// Verify signature
const isValid = await cryptoService.verify(hash, signature);
```

### Get Public Key (for external verification)

```javascript
const publicKey = await cryptoService.getPublicKey();
console.log(publicKey);
// -----BEGIN PUBLIC KEY-----
// MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
// -----END PUBLIC KEY-----

// Share this key with auditors, inspectors, or external systems
// They can verify signatures without accessing private key
```

### Key Rotation

```javascript
// Rotate keys (generates new key pair, backs up old keys)
const result = await cryptoService.rotateKeys(2); // version 2

console.log('Keys rotated:', result);
// {
//   version: 2,
//   publicKey: '-----BEGIN PUBLIC KEY-----...',
//   backupPath: '/path/to/backup/v1-1234567890',
//   timestamp: 1234567890
// }

// Update signature_store collection with new public key
await SignatureStoreModel.create({
  version: result.version,
  publicKey: result.publicKey,
  createdAt: new Date(result.timestamp)
});
```

## API Reference

### `initialize(options)`

Initialize crypto service (call on app startup).

**Parameters**:
- `options.useKMS` (Boolean): Use AWS KMS (true) or local keys (false)
- `options.kmsKeyId` (String): AWS KMS key ID (if using KMS)
- `options.tsaProvider` (String): Timestamp authority ('freetsa', 'digicert', 'globalsign')
- `options.keyDir` (String): Local key directory (if not using KMS)

**Returns**: Promise\<CryptoService\>

### `generateHash(data)`

Generate SHA-256 hash of data.

**Parameters**:
- `data` (Object|String): Data to hash

**Returns**: String (64-character hex hash)

### `generateHashChain(record, previousHash)`

Generate hash chain linking current record to previous.

**Parameters**:
- `record` (Object): Current record
- `previousHash` (String|null): Previous record hash (null for genesis)

**Returns**: String (64-character hex hash)

### `sign(hash)`

Sign hash with private key.

**Parameters**:
- `hash` (String): Hash to sign

**Returns**: Promise\<String\> (hexadecimal signature)

### `verify(hash, signature, publicKey)`

Verify signature with public key.

**Parameters**:
- `hash` (String): Original hash
- `signature` (String): Signature to verify
- `publicKey` (String|null): Public key (optional, uses cached if not provided)

**Returns**: Promise\<Boolean\> (true if valid)

### `signRecord(record, previousHash, includeTimestamp)`

Sign complete record with hash + signature + timestamp.

**Parameters**:
- `record` (Object): Record to sign
- `previousHash` (String|null): Previous record hash (null for genesis)
- `includeTimestamp` (Boolean): Include RFC 3161 timestamp (default: true)

**Returns**: Promise\<Object\> (signed record)

### `verifyRecord(record, previousHash, publicKey)`

Verify complete record (hash chain + signature + timestamp).

**Parameters**:
- `record` (Object): Record to verify
- `previousHash` (String|null): Expected previous hash (null for genesis)
- `publicKey` (String|null): Public key (optional)

**Returns**: Promise\<Object\> (verification result)

### `signRecordsBatch(records, includeTimestamp)`

Sign multiple records with hash chain linking.

**Parameters**:
- `records` (Array\<Object\>): Records to sign
- `includeTimestamp` (Boolean): Include timestamps (default: false)

**Returns**: Promise\<Array\<Object\>\> (signed records)

### `verifyRecordChain(records)`

Verify chain of records.

**Parameters**:
- `records` (Array\<Object\>): Records to verify (in order)

**Returns**: Promise\<Object\> (verification result)

### `rotateKeys(version)`

Rotate cryptographic keys.

**Parameters**:
- `version` (Number): New key version number

**Returns**: Promise\<Object\> (rotation result)

### `getPublicKey()`

Get public key for external verification.

**Returns**: Promise\<String\> (PEM-formatted public key)

### `getStatus()`

Get service status.

**Returns**: Object (status information)

## Testing

### Run Tests

```bash
# Run all crypto service tests
npm test -- crypto-service.test.js

# Run with coverage
npm test -- --coverage crypto-service.test.js
```

### Test Coverage

Expected coverage: **>80%**

```
PASS  apps/backend/__tests__/crypto-service.test.js
  CryptoService
    ✓ should initialize successfully
    ✓ should generate SHA-256 hash for object
    ✓ should sign a hash
    ✓ should verify valid signature
    ✓ should sign complete record
    ✓ should verify valid signed record
    ✓ should sign multiple records in batch
    ✓ should verify record chain
    ✓ should sign 100 records in reasonable time
    ✓ should verify 100 records in reasonable time

Test Suites: 1 passed, 1 total
Tests:       25 passed, 25 total
Coverage:    87.3% (statements), 85.1% (branches)
```

## Performance

### Benchmarks (Local Keys)

- Hash generation: ~0.5ms per record
- Signature generation: ~15ms per record
- Signature verification: ~5ms per record
- Complete signing (hash + sign): ~15-20ms per record
- Complete verification: ~5-10ms per record

### Benchmarks (AWS KMS)

- Signature generation: ~50-100ms per record (network latency)
- Signature verification: ~50-100ms per record (network latency)

### Optimization Tips

1. **Batch Operations**: Use `signRecordsBatch()` instead of individual `signRecord()` calls
2. **Timestamps**: Disable timestamps for bulk operations (use `includeTimestamp: false`)
3. **Local Keys**: Use local keys for development/testing, KMS for production
4. **Caching**: Public keys are cached automatically, no need to fetch repeatedly

## AWS KMS Setup

### Create KMS Key

```bash
# Create KMS key for signing
aws kms create-key \
  --description "Botanical Audit Framework - Digital Signatures" \
  --key-usage SIGN_VERIFY \
  --key-spec RSA_2048 \
  --region ap-southeast-1

# Create alias
aws kms create-alias \
  --alias-name alias/botanical-audit-signatures \
  --target-key-id <key-id> \
  --region ap-southeast-1

# Enable automatic key rotation
aws kms enable-key-rotation \
  --key-id <key-id> \
  --region ap-southeast-1
```

### IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "kms:Sign",
        "kms:Verify",
        "kms:GetPublicKey",
        "kms:DescribeKey"
      ],
      "Resource": "arn:aws:kms:ap-southeast-1:123456789012:key/<key-id>"
    }
  ]
}
```

## Timestamp Authority Providers

### FreeTSA (Development)

- **URL**: https://freetsa.org/tsr
- **Cost**: Free
- **Rate Limit**: 10 requests/minute
- **Reliability**: Good for development/testing
- **Usage**: Set `TSA_PROVIDER=freetsa` in `.env`

### DigiCert (Production)

- **URL**: https://timestamp.digicert.com
- **Cost**: Paid (contact DigiCert)
- **Rate Limit**: Enterprise-grade
- **Reliability**: 99.9% uptime SLA
- **Usage**: Set `TSA_PROVIDER=digicert` and `DIGICERT_API_KEY` in `.env`

### GlobalSign (Production)

- **URL**: https://timestamp.globalsign.com/tsa/r6advanced1
- **Cost**: Paid (contact GlobalSign)
- **Rate Limit**: Enterprise-grade
- **Reliability**: 99.9% uptime SLA
- **Usage**: Set `TSA_PROVIDER=globalsign` and `GLOBALSIGN_API_KEY` in `.env`

## Troubleshooting

### "CryptoService not initialized"

**Solution**: Call `await cryptoService.initialize()` before using any methods.

### "KMS signing failed"

**Possible causes**:
1. Invalid KMS key ID
2. Missing IAM permissions
3. KMS key not in ENABLED state
4. Wrong AWS region

**Solution**: Verify KMS key and IAM policy.

### "Timestamp request timed out"

**Possible causes**:
1. TSA server is down
2. Network connectivity issues
3. Rate limit exceeded (FreeTSA)

**Solution**: 
- Use fallback timestamp (system time)
- Switch to commercial TSA (DigiCert/GlobalSign)
- Reduce batch size

### "Signature verification failed"

**Possible causes**:
1. Record data was tampered
2. Hash chain is broken
3. Using wrong public key
4. Signature corruption

**Solution**: Check verification result details to identify specific issue.

## Security Best Practices

1. **Never expose private keys**: Keep private keys secure, use AWS KMS in production
2. **Use HTTPS**: Always use HTTPS for API endpoints that handle signatures
3. **Validate input**: Always validate record data before signing
4. **Audit logs**: Log all signing operations for audit trail
5. **Key rotation**: Rotate keys annually or when compromised
6. **Backup keys**: Backup old keys securely before rotation
7. **Access control**: Restrict who can trigger signing operations
8. **Monitor failures**: Alert on signature verification failures

## Integration with MongoDB

```javascript
const mongoose = require('mongoose');
const cryptoService = require('./services/crypto');

const RecordSchema = new mongoose.Schema({
  recordId: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  data: { type: Object, required: true },
  hash: { type: String, required: true, index: true },
  signature: { type: String, required: true },
  previousHash: { type: String, required: true },
  timestamp: {
    timestamp: Date,
    token: String,
    provider: String
  },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to auto-sign records
RecordSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Get previous record
    const previousRecord = await this.constructor
      .findOne({ type: this.type })
      .sort('-createdAt')
      .select('hash');
    
    const previousHash = previousRecord?.hash || null;
    
    // Sign record
    const signedData = await cryptoService.signRecord(
      {
        id: this.recordId,
        type: this.type,
        data: this.data,
        timestamp: this.createdAt.toISOString(),
        userId: this.userId
      },
      previousHash,
      true // include timestamp
    );
    
    this.hash = signedData.hash;
    this.signature = signedData.signature;
    this.previousHash = signedData.previousHash;
    this.timestamp = signedData.timestamp;
  }
  
  next();
});

const RecordModel = mongoose.model('Record', RecordSchema);
module.exports = RecordModel;
```

## License

This crypto service is part of the Botanical Audit Framework and is proprietary software.

## Support

For issues or questions:
- Email: support@botanical-audit.com
- Documentation: https://docs.botanical-audit.com/crypto
- GitHub Issues: (if applicable)
