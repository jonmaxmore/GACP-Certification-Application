/**
 * Migration 001 - Initial Schema Setup
 * Create all collections for GACP Platform Phase 1
 *
 * @module database/migrations/001_initial_schema
 * @date 2025-10-16
 * @version 1.0.0
 */

const mongoose = require('mongoose');

module.exports = {
  /**
   * Run migration (up)
   */
  async up(db) {
    console.log('🚀 Running Migration 001: Initial Schema Setup...');

    try {
      // ========================================
      // 1. CREATE COLLECTIONS
      // ========================================

      console.log('  📁 Creating collections...');

      // Users collection
      await db.createCollection('users', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['userId', 'email', 'passwordHash', 'fullName', 'role', 'status'],
            properties: {
              userId: {
                bsonType: 'string',
                pattern: '^USR-[0-9]{4}-[A-Z0-9]{8}$'
              },
              email: {
                bsonType: 'string',
                pattern: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$'
              },
              thaiId: {
                bsonType: ['string', 'null'],
                pattern: '^[0-9]{13}$'
              },
              phoneNumber: {
                bsonType: ['string', 'null'],
                pattern: '^0[0-9]{9}$'
              },
              role: {
                enum: ['FARMER', 'DTAM', 'ADMIN']
              },
              status: {
                enum: ['ACTIVE', 'SUSPENDED', 'DELETED']
              }
            }
          }
        },
        validationLevel: 'strict',
        validationAction: 'error'
      });
      console.log('    ✅ users collection created');

      // Refresh tokens collection
      await db.createCollection('refresh_tokens');
      console.log('    ✅ refresh_tokens collection created');

      // Applications collection
      await db.createCollection('applications', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['applicationId', 'applicationNumber', 'userId', 'farmName', 'state'],
            properties: {
              applicationId: {
                bsonType: 'string',
                pattern: '^APP-[0-9]{4}-[A-Z0-9]{8}$'
              },
              applicationNumber: {
                bsonType: 'string',
                pattern: '^GACP-[0-9]{4}-[0-9]{6}$'
              },
              state: {
                enum: [
                  'DRAFT',
                  'SUBMITTED',
                  'UNDER_REVIEW',
                  'PAYMENT_PENDING',
                  'PAYMENT_VERIFIED',
                  'INSPECTION_SCHEDULED',
                  'INSPECTION_COMPLETED',
                  'PHASE2_PAYMENT_PENDING',
                  'PHASE2_PAYMENT_VERIFIED',
                  'APPROVED',
                  'CERTIFICATE_ISSUED',
                  'REJECTED',
                  'REVISION_REQUIRED',
                  'EXPIRED'
                ]
              },
              farmSize: {
                bsonType: 'number',
                minimum: 0.1,
                maximum: 10000
              }
            }
          }
        },
        validationLevel: 'strict',
        validationAction: 'error'
      });
      console.log('    ✅ applications collection created');

      // Application documents collection
      await db.createCollection('application_documents');
      console.log('    ✅ application_documents collection created');

      // Invoices collection
      await db.createCollection('invoices', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['invoiceId', 'applicationId', 'userId', 'invoiceType', 'amount', 'status'],
            properties: {
              invoiceId: {
                bsonType: 'string',
                pattern: '^INV-[0-9]{4}-[0-9]{6}$'
              },
              invoiceType: {
                enum: ['PHASE1_FEE', 'PHASE2_FEE']
              },
              amount: {
                bsonType: 'number',
                minimum: 0
              },
              status: {
                enum: ['PENDING', 'PAID', 'EXPIRED']
              }
            }
          }
        },
        validationLevel: 'strict',
        validationAction: 'error'
      });
      console.log('    ✅ invoices collection created');

      // Payments collection
      await db.createCollection('payments');
      console.log('    ✅ payments collection created');

      // Certificates collection
      await db.createCollection('certificates', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['certificateId', 'certificateNumber', 'applicationId', 'userId', 'status'],
            properties: {
              certificateId: {
                bsonType: 'string',
                pattern: '^CERT-[0-9]{4}-[A-Z0-9]{8}$'
              },
              certificateNumber: {
                bsonType: 'string',
                pattern: '^GACP-CERT-[0-9]{4}-[0-9]{6}$'
              },
              status: {
                enum: ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'REVOKED']
              }
            }
          }
        },
        validationLevel: 'strict',
        validationAction: 'error'
      });
      console.log('    ✅ certificates collection created');

      // Audit logs collection (Time-Series - MongoDB 5.0+)
      try {
        await db.createCollection('audit_logs', {
          timeseries: {
            timeField: 'timestamp',
            metaField: 'metadata',
            granularity: 'seconds'
          },
          expireAfterSeconds: 220752000 // 7 years (Thai tax law)
        });
        console.log('    ✅ audit_logs time-series collection created (7-year retention)');
      } catch (error) {
        // Fallback for older MongoDB versions
        await db.createCollection('audit_logs');
        console.log('    ✅ audit_logs collection created (fallback mode)');
      }

      console.log('  ✅ All collections created successfully\n');

      // ========================================
      // 2. SUCCESS MESSAGE
      // ========================================

      console.log('✅ Migration 001 completed successfully');
      console.log('📊 Collections created: 8');
      console.log('   - users');
      console.log('   - refresh_tokens');
      console.log('   - applications');
      console.log('   - application_documents');
      console.log('   - invoices');
      console.log('   - payments');
      console.log('   - certificates');
      console.log('   - audit_logs (time-series)\n');
    } catch (error) {
      console.error('❌ Migration 001 failed:', error.message);
      throw error;
    }
  },

  /**
   * Rollback migration (down)
   */
  async down(db) {
    console.log('🔄 Rolling back Migration 001: Initial Schema Setup...');

    try {
      const collections = [
        'users',
        'refresh_tokens',
        'applications',
        'application_documents',
        'invoices',
        'payments',
        'certificates',
        'audit_logs'
      ];

      for (const collectionName of collections) {
        try {
          await db.dropCollection(collectionName);
          console.log(`  ✅ Dropped ${collectionName}`);
        } catch (error) {
          if (error.code === 26) {
            console.log(`  ⚠️  ${collectionName} does not exist, skipping`);
          } else {
            throw error;
          }
        }
      }

      console.log('✅ Rollback completed successfully\n');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    }
  }
};
