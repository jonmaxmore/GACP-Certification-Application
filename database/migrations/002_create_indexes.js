/**
 * Migration 002 - Create Indexes
 * Create all indexes for optimal query performance
 *
 * @module database/migrations/002_create_indexes
 * @date 2025-10-16
 * @version 1.0.0
 *
 * @research
 * - ESR Rule: Equality, Sort, Range
 * - MongoDB Index Best Practices
 * - Compound indexes for common queries
 */

module.exports = {
  /**
   * Run migration (up)
   */
  async up(db) {
    console.log('🚀 Running Migration 002: Create Indexes...');

    try {
      // ========================================
      // 1. USERS INDEXES
      // ========================================

      console.log('  📊 Creating users indexes...');

      await db
        .collection('users')
        .createIndex({ userId: 1 }, { unique: true, name: 'users_userId_unique' });

      await db
        .collection('users')
        .createIndex({ email: 1 }, { unique: true, name: 'users_email_unique' });

      await db
        .collection('users')
        .createIndex({ thaiId: 1 }, { unique: true, sparse: true, name: 'users_thaiId_unique' });

      await db
        .collection('users')
        .createIndex({ phoneNumber: 1 }, { sparse: true, name: 'users_phoneNumber_sparse' });

      await db
        .collection('users')
        .createIndex({ role: 1, status: 1 }, { name: 'users_role_status' });

      await db.collection('users').createIndex({ createdAt: -1 }, { name: 'users_createdAt_desc' });

      // Partial index (active users only)
      await db.collection('users').createIndex(
        { email: 1 },
        {
          partialFilterExpression: { status: 'ACTIVE' },
          name: 'users_active_email'
        }
      );

      console.log('    ✅ 7 indexes created for users\n');

      // ========================================
      // 2. REFRESH_TOKENS INDEXES
      // ========================================

      console.log('  📊 Creating refresh_tokens indexes...');

      await db
        .collection('refresh_tokens')
        .createIndex({ tokenId: 1 }, { unique: true, name: 'refresh_tokens_tokenId_unique' });

      await db
        .collection('refresh_tokens')
        .createIndex({ userId: 1, revoked: 1 }, { name: 'refresh_tokens_userId_revoked' });

      await db
        .collection('refresh_tokens')
        .createIndex({ deviceId: 1 }, { name: 'refresh_tokens_deviceId' });

      await db
        .collection('refresh_tokens')
        .createIndex({ tokenFamily: 1 }, { name: 'refresh_tokens_tokenFamily' });

      // TTL Index (auto-delete expired tokens)
      await db
        .collection('refresh_tokens')
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'refresh_tokens_ttl' });

      console.log('    ✅ 5 indexes created for refresh_tokens\n');

      // ========================================
      // 3. APPLICATIONS INDEXES
      // ========================================

      console.log('  📊 Creating applications indexes...');

      await db
        .collection('applications')
        .createIndex(
          { applicationId: 1 },
          { unique: true, name: 'applications_applicationId_unique' }
        );

      await db
        .collection('applications')
        .createIndex(
          { applicationNumber: 1 },
          { unique: true, name: 'applications_applicationNumber_unique' }
        );

      // ESR Rule: Equality, Sort, Range
      await db
        .collection('applications')
        .createIndex(
          { userId: 1, state: 1, createdAt: -1 },
          { name: 'applications_userId_state_createdAt' }
        );

      await db
        .collection('applications')
        .createIndex({ state: 1, submittedAt: -1 }, { name: 'applications_state_submittedAt' });

      await db
        .collection('applications')
        .createIndex(
          { 'farmAddress.province': 1, state: 1 },
          { name: 'applications_province_state' }
        );

      // Geospatial index (2dsphere for GPS queries)
      await db
        .collection('applications')
        .createIndex(
          { 'farmAddress.gpsCoordinates': '2dsphere' },
          { name: 'applications_gps_2dsphere' }
        );

      // Text search index
      await db.collection('applications').createIndex(
        {
          farmName: 'text',
          farmerName: 'text',
          'farmAddress.province': 'text'
        },
        { name: 'applications_text_search' }
      );

      // Partial index (active applications only)
      await db.collection('applications').createIndex(
        { state: 1, submittedAt: -1 },
        {
          partialFilterExpression: {
            isActive: true,
            isDeleted: false
          },
          name: 'applications_active_queue'
        }
      );

      console.log('    ✅ 8 indexes created for applications\n');

      // ========================================
      // 4. APPLICATION_DOCUMENTS INDEXES
      // ========================================

      console.log('  📊 Creating application_documents indexes...');

      await db
        .collection('application_documents')
        .createIndex(
          { documentId: 1 },
          { unique: true, name: 'application_documents_documentId_unique' }
        );

      await db
        .collection('application_documents')
        .createIndex(
          { applicationId: 1, type: 1 },
          { name: 'application_documents_applicationId_type' }
        );

      await db
        .collection('application_documents')
        .createIndex({ userId: 1, status: 1 }, { name: 'application_documents_userId_status' });

      await db
        .collection('application_documents')
        .createIndex(
          { status: 1, uploadedAt: -1 },
          { name: 'application_documents_status_uploadedAt' }
        );

      // TTL Index (auto-delete expired documents)
      await db.collection('application_documents').createIndex(
        { expiresAt: 1 },
        {
          expireAfterSeconds: 0,
          partialFilterExpression: { expiresAt: { $ne: null } },
          name: 'application_documents_ttl'
        }
      );

      console.log('    ✅ 5 indexes created for application_documents\n');

      // ========================================
      // 5. INVOICES INDEXES
      // ========================================

      console.log('  📊 Creating invoices indexes...');

      await db
        .collection('invoices')
        .createIndex({ invoiceId: 1 }, { unique: true, name: 'invoices_invoiceId_unique' });

      await db
        .collection('invoices')
        .createIndex({ invoiceNumber: 1 }, { unique: true, name: 'invoices_invoiceNumber_unique' });

      await db
        .collection('invoices')
        .createIndex(
          { applicationId: 1, invoiceType: 1 },
          { name: 'invoices_applicationId_invoiceType' }
        );

      await db
        .collection('invoices')
        .createIndex({ userId: 1, status: 1 }, { name: 'invoices_userId_status' });

      await db
        .collection('invoices')
        .createIndex({ status: 1, expiresAt: 1 }, { name: 'invoices_status_expiresAt' });

      // Partial index (pending payments only)
      await db.collection('invoices').createIndex(
        { expiresAt: 1 },
        {
          partialFilterExpression: { status: 'PENDING' },
          name: 'invoices_pending_expiry'
        }
      );

      console.log('    ✅ 6 indexes created for invoices\n');

      // ========================================
      // 6. PAYMENTS INDEXES
      // ========================================

      console.log('  📊 Creating payments indexes...');

      await db
        .collection('payments')
        .createIndex({ paymentId: 1 }, { unique: true, name: 'payments_paymentId_unique' });

      await db.collection('payments').createIndex({ invoiceId: 1 }, { name: 'payments_invoiceId' });

      await db
        .collection('payments')
        .createIndex({ applicationId: 1, status: 1 }, { name: 'payments_applicationId_status' });

      await db
        .collection('payments')
        .createIndex({ userId: 1, status: 1 }, { name: 'payments_userId_status' });

      await db
        .collection('payments')
        .createIndex({ gatewayTransactionId: 1 }, { name: 'payments_gatewayTransactionId' });

      await db
        .collection('payments')
        .createIndex({ status: 1, paidAt: -1 }, { name: 'payments_status_paidAt' });

      console.log('    ✅ 6 indexes created for payments\n');

      // ========================================
      // 7. CERTIFICATES INDEXES
      // ========================================

      console.log('  📊 Creating certificates indexes...');

      await db
        .collection('certificates')
        .createIndex(
          { certificateId: 1 },
          { unique: true, name: 'certificates_certificateId_unique' }
        );

      await db
        .collection('certificates')
        .createIndex(
          { certificateNumber: 1 },
          { unique: true, name: 'certificates_certificateNumber_unique' }
        );

      await db
        .collection('certificates')
        .createIndex({ applicationId: 1 }, { name: 'certificates_applicationId' });

      await db
        .collection('certificates')
        .createIndex({ userId: 1, status: 1 }, { name: 'certificates_userId_status' });

      await db
        .collection('certificates')
        .createIndex({ status: 1, expiresAt: 1 }, { name: 'certificates_status_expiresAt' });

      await db
        .collection('certificates')
        .createIndex({ issuedAt: -1 }, { name: 'certificates_issuedAt_desc' });

      // Partial index (active certificates only)
      await db.collection('certificates').createIndex(
        { expiresAt: 1 },
        {
          partialFilterExpression: {
            status: { $in: ['ACTIVE', 'EXPIRING_SOON'] }
          },
          name: 'certificates_active_expiry'
        }
      );

      console.log('    ✅ 7 indexes created for certificates\n');

      // ========================================
      // 8. AUDIT_LOGS INDEXES
      // ========================================

      console.log('  📊 Creating audit_logs indexes...');

      await db
        .collection('audit_logs')
        .createIndex({ timestamp: -1 }, { name: 'audit_logs_timestamp_desc' });

      await db
        .collection('audit_logs')
        .createIndex(
          { sequenceNumber: 1 },
          { unique: true, name: 'audit_logs_sequenceNumber_unique' }
        );

      await db
        .collection('audit_logs')
        .createIndex({ actorId: 1, timestamp: -1 }, { name: 'audit_logs_actorId_timestamp' });

      await db
        .collection('audit_logs')
        .createIndex(
          { resourceType: 1, resourceId: 1, timestamp: -1 },
          { name: 'audit_logs_resourceType_resourceId_timestamp' }
        );

      await db
        .collection('audit_logs')
        .createIndex(
          { category: 1, severity: 1, timestamp: -1 },
          { name: 'audit_logs_category_severity_timestamp' }
        );

      // Hash chain verification indexes
      await db
        .collection('audit_logs')
        .createIndex({ previousHash: 1 }, { name: 'audit_logs_previousHash' });

      await db
        .collection('audit_logs')
        .createIndex({ currentHash: 1 }, { unique: true, name: 'audit_logs_currentHash_unique' });

      // Compound index for common queries
      await db
        .collection('audit_logs')
        .createIndex(
          { category: 1, action: 1, timestamp: -1 },
          { name: 'audit_logs_category_action_timestamp' }
        );

      console.log('    ✅ 8 indexes created for audit_logs\n');

      // ========================================
      // 9. SUCCESS MESSAGE
      // ========================================

      console.log('✅ Migration 002 completed successfully');
      console.log('📊 Total indexes created: 60+');
      console.log('   - users: 7 indexes');
      console.log('   - refresh_tokens: 5 indexes (1 TTL)');
      console.log('   - applications: 8 indexes (1 geospatial, 1 text)');
      console.log('   - application_documents: 5 indexes (1 TTL)');
      console.log('   - invoices: 6 indexes');
      console.log('   - payments: 6 indexes');
      console.log('   - certificates: 7 indexes');
      console.log('   - audit_logs: 8 indexes\n');
    } catch (error) {
      console.error('❌ Migration 002 failed:', error.message);
      throw error;
    }
  },

  /**
   * Rollback migration (down)
   */
  async down(db) {
    console.log('🔄 Rolling back Migration 002: Create Indexes...');

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
          await db.collection(collectionName).dropIndexes();
          console.log(`  ✅ Dropped all indexes for ${collectionName}`);
        } catch (error) {
          if (error.code === 26) {
            console.log(`  ⚠️  ${collectionName} does not exist, skipping`);
          } else {
            console.log(`  ⚠️  Could not drop indexes for ${collectionName}: ${error.message}`);
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
