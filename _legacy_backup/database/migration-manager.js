/**
 * 🔧 Database Migration Manager for Enhanced GACP Schema
 * จัดการการ Migrate ฐานข้อมูลจากโครงสร้างเดิมไปยัง Enhanced Schema
 *
 * Features:
 * - Version Control สำหรับ Database Schema
 * - Data Migration ที่ปลอดภัย
 * - Rollback Capability
 * - Data Integrity Verification
 * - Performance Optimization
 */

const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');
const { EventEmitter } = require('events');

// Migration Configuration
const MIGRATION_CONFIG = {
  sourceVersion: '1.0.0',
  targetVersion: '2.0.0',
  batchSize: 100,
  maxRetries: 3,
  backupEnabled: true,
  verificationEnabled: true
};

// Migration States
const MIGRATION_STATES = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ROLLING_BACK: 'rolling_back',
  ROLLED_BACK: 'rolled_back'
};

class DatabaseMigrationManager extends EventEmitter {
  constructor(mongoUri, databaseName) {
    super();
    this.mongoUri = mongoUri;
    this.databaseName = databaseName;
    this.client = null;
    this.db = null;
    this.migrationId = this.generateMigrationId();

    // Migration tracking
    this.migrations = new Map();
    this.currentMigration = null;

    console.log(`🔧 Database Migration Manager initialized: ${this.migrationId}`);
  }

  /**
   * สร้าง Migration ID
   */
  generateMigrationId() {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, '')
      .substring(0, 14);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `MIG-${timestamp}-${random}`;
  }

  /**
   * เชื่อมต่อฐานข้อมูล
   */
  async connect() {
    try {
      this.client = new MongoClient(this.mongoUri);
      await this.client.connect();
      this.db = this.client.db(this.databaseName);

      // สร้าง migration tracking collection
      await this.initializeMigrationTracking();

      console.log('✅ Connected to MongoDB for migration');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * ตั้งค่า Migration Tracking
   */
  async initializeMigrationTracking() {
    const migrationCollection = this.db.collection('_migrations');

    // สร้าง index สำหรับ migration tracking
    await migrationCollection.createIndex({ migrationId: 1 }, { unique: true });
    await migrationCollection.createIndex({ startedAt: -1 });
    await migrationCollection.createIndex({ status: 1 });

    console.log('✅ Migration tracking initialized');
  }

  /**
   * เริ่มต้น Migration Process
   */
  async startMigration() {
    if (this.currentMigration) {
      throw new Error('Migration already in progress');
    }

    const migration = {
      migrationId: this.migrationId,
      sourceVersion: MIGRATION_CONFIG.sourceVersion,
      targetVersion: MIGRATION_CONFIG.targetVersion,
      status: MIGRATION_STATES.PENDING,
      startedAt: new Date(),
      endedAt: null,
      steps: [],
      statistics: {
        totalRecords: 0,
        processedRecords: 0,
        successfulRecords: 0,
        failedRecords: 0,
        skippedRecords: 0
      },
      errors: []
    };

    this.currentMigration = migration;
    this.migrations.set(this.migrationId, migration);

    // บันทึก migration log
    await this.db.collection('_migrations').insertOne(migration);

    try {
      migration.status = MIGRATION_STATES.RUNNING;
      await this.updateMigrationStatus();

      // ขั้นตอนการ Migration
      await this.performPreMigrationCheck();
      await this.createBackup();
      await this.migrateCollections();
      await this.createIndexes();
      await this.verifyMigration();
      await this.postMigrationCleanup();

      migration.status = MIGRATION_STATES.COMPLETED;
      migration.endedAt = new Date();
      await this.updateMigrationStatus();

      this.emit('migration_completed', migration);
      console.log(`✅ Migration completed successfully: ${this.migrationId}`);

      return migration;
    } catch (error) {
      migration.status = MIGRATION_STATES.FAILED;
      migration.errors.push({
        step: 'migration_process',
        error: error.message,
        timestamp: new Date(),
        stack: error.stack
      });

      await this.updateMigrationStatus();
      this.emit('migration_failed', { migration, error });

      console.error(`❌ Migration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * ตรวจสอบก่อน Migration
   */
  async performPreMigrationCheck() {
    console.log('🔍 Performing pre-migration checks...');

    const step = {
      stepName: 'pre_migration_check',
      startedAt: new Date(),
      status: 'running'
    };

    this.currentMigration.steps.push(step);

    // ตรวจสอบ Collections ที่มีอยู่
    const collections = await this.db.listCollections().toArray();
    const existingCollections = collections.map(c => c.name);

    console.log(`📋 Existing collections: ${existingCollections.join(', ')}`);

    // นับจำนวน Records ทั้งหมด
    const collectionsToMigrate = ['farms', 'applications', 'batches'];
    let totalRecords = 0;

    for (const collectionName of collectionsToMigrate) {
      if (existingCollections.includes(collectionName)) {
        const count = await this.db.collection(collectionName).countDocuments();
        totalRecords += count;
        console.log(`📊 ${collectionName}: ${count} records`);
      }
    }

    this.currentMigration.statistics.totalRecords = totalRecords;

    // ตรวจสอบพื้นที่ว่าง
    const stats = await this.db.stats();
    const freeSpace = stats.freeStorageSize || 0;
    const requiredSpace = stats.dataSize * 1.5; // เผื่อไว้ 50%

    if (freeSpace < requiredSpace) {
      throw new Error(
        `Insufficient disk space. Required: ${requiredSpace}, Available: ${freeSpace}`
      );
    }

    step.status = 'completed';
    step.endedAt = new Date();

    console.log(`✅ Pre-migration check completed. Total records: ${totalRecords}`);
  }

  /**
   * สร้าง Backup
   */
  async createBackup() {
    if (!MIGRATION_CONFIG.backupEnabled) {
      console.log('⚠️ Backup disabled, skipping...');
      return;
    }

    console.log('💾 Creating backup...');

    const step = {
      stepName: 'create_backup',
      startedAt: new Date(),
      status: 'running'
    };

    this.currentMigration.steps.push(step);

    const backupSuffix = new Date()
      .toISOString()
      .replace(/[-:T.]/g, '')
      .substring(0, 14);
    const collectionsToBackup = ['farms', 'applications', 'batches'];

    for (const collectionName of collectionsToBackup) {
      const sourceCollection = this.db.collection(collectionName);
      const backupCollectionName = `${collectionName}_backup_${backupSuffix}`;
      const backupCollection = this.db.collection(backupCollectionName);

      // Copy all documents
      const cursor = sourceCollection.find({});
      let batchCount = 0;

      while (await cursor.hasNext()) {
        const batch = [];
        for (let i = 0; i < MIGRATION_CONFIG.batchSize && (await cursor.hasNext()); i++) {
          batch.push(await cursor.next());
        }

        if (batch.length > 0) {
          await backupCollection.insertMany(batch);
          batchCount++;
          console.log(`📦 Backup ${collectionName}: batch ${batchCount} (${batch.length} records)`);
        }
      }
    }

    step.status = 'completed';
    step.endedAt = new Date();

    console.log('✅ Backup created successfully');
  }

  /**
   * Migrate Collections
   */
  async migrateCollections() {
    console.log('🔄 Starting collection migration...');

    const step = {
      stepName: 'migrate_collections',
      startedAt: new Date(),
      status: 'running'
    };

    this.currentMigration.steps.push(step);

    // Migrate Farms Collection
    await this.migrateFarmsCollection();

    // Migrate Applications Collection
    await this.migrateApplicationsCollection();

    // Migrate Batches Collection (if exists)
    await this.migrateBatchesCollection();

    step.status = 'completed';
    step.endedAt = new Date();

    console.log('✅ Collection migration completed');
  }

  /**
   * Migrate Farms Collection
   */
  async migrateFarmsCollection() {
    console.log('🏭 Migrating farms collection...');

    const farmsCollection = this.db.collection('farms');
    const cursor = farmsCollection.find({});
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    while (await cursor.hasNext()) {
      const batch = [];

      // Process in batches
      for (let i = 0; i < MIGRATION_CONFIG.batchSize && (await cursor.hasNext()); i++) {
        const oldFarm = await cursor.next();
        const newFarm = await this.transformFarmDocument(oldFarm);
        batch.push(newFarm);
      }

      // Update documents
      for (const farm of batch) {
        try {
          await farmsCollection.replaceOne({ _id: farm._id }, farm, { upsert: true });
          successCount++;
        } catch (error) {
          console.error(`❌ Error migrating farm ${farm._id}:`, error.message);
          errorCount++;

          this.currentMigration.errors.push({
            step: 'migrate_farms',
            recordId: farm._id,
            error: error.message,
            timestamp: new Date()
          });
        }
        processedCount++;
      }

      // Update progress
      this.currentMigration.statistics.processedRecords += batch.length;
      this.currentMigration.statistics.successfulRecords = successCount;
      this.currentMigration.statistics.failedRecords = errorCount;

      if (processedCount % 100 === 0) {
        console.log(
          `📊 Farms migration progress: ${processedCount} processed, ${successCount} success, ${errorCount} errors`
        );
        await this.updateMigrationStatus();
      }
    }

    console.log(`✅ Farms migration completed: ${successCount} success, ${errorCount} errors`);
  }

  /**
   * Transform Farm Document
   */
  async transformFarmDocument(oldFarm) {
    const newFarm = {
      _id: oldFarm._id,
      farmNumber: oldFarm.farmNumber || this.generateFarmNumber(),

      // Basic Information
      basicInfo: {
        farmName: oldFarm.farmName || oldFarm.name || '',
        ownerName: oldFarm.ownerName || oldFarm.owner || '',
        ownerType: oldFarm.ownerType || 'individual',
        registrationNumber: oldFarm.registrationNumber || '',
        establishedDate: oldFarm.establishedDate || oldFarm.createdAt || new Date(),

        // AI-extracted data (empty for existing records)
        extractedData: {
          nationalId: oldFarm.nationalId || '',
          businessRegistration: oldFarm.businessRegistration || '',
          landCertificate: oldFarm.landCertificate || '',
          extractionMetadata: {
            processedAt: null,
            confidence: 0,
            verificationStatus: 'pending',
            ocrEngine: null,
            nlpEngine: null
          }
        }
      },

      // Location & Geographic Data
      location: {
        address: {
          houseNumber: oldFarm.address?.houseNumber || '',
          village: oldFarm.address?.village || '',
          subDistrict: oldFarm.address?.subDistrict || oldFarm.subDistrict || '',
          district: oldFarm.address?.district || oldFarm.district || '',
          province: oldFarm.address?.province || oldFarm.province || '',
          postalCode: oldFarm.address?.postalCode || oldFarm.postalCode || '',
          country: 'Thailand'
        },
        coordinates: {
          type: 'Point',
          coordinates: oldFarm.coordinates || [0, 0]
        },
        elevationMeters: oldFarm.elevation || 0,
        landSize: {
          totalArea: oldFarm.landSize?.total || oldFarm.totalArea || 0,
          cultivationArea: oldFarm.landSize?.cultivation || oldFarm.cultivationArea || 0,
          storageArea: oldFarm.landSize?.storage || 0,
          processingArea: oldFarm.landSize?.processing || 0
        },
        boundaries: {
          type: oldFarm.boundaries?.type || 'Polygon',
          coordinates: oldFarm.boundaries?.coordinates || [[]]
        }
      },

      // Enhanced Cultivation Data
      cultivation: {
        cropTypes: (oldFarm.cropTypes || []).map(crop => ({
          cropId: new ObjectId(),
          scientificName: crop.scientificName || '',
          commonName: crop.commonName || crop.name || '',
          variety: crop.variety || '',
          cultivationMethod: crop.method || 'outdoor',
          organicCertified: crop.organic || false,
          seedSource: {
            supplier: crop.seedSource?.supplier || '',
            certificationNumber: crop.seedSource?.certification || '',
            batchNumber: crop.seedSource?.batch || '',
            purchaseDate: crop.seedSource?.date || null
          }
        })),

        systems: oldFarm.systems || [],
        productionPlan: oldFarm.productionPlan || []
      },

      // IoT Integration (empty for existing records)
      iotDevices: [],

      // Compliance & Certifications
      compliance: {
        gacpStatus: oldFarm.gacpStatus || 'pending',
        certificationHistory: oldFarm.certifications || [],
        complianceScore: {
          currentScore: oldFarm.complianceScore || 0,
          lastCalculated: oldFarm.lastScored || null,
          categoryScores: oldFarm.categoryScores || {},
          riskFactors: []
        }
      },

      // Audit Trail
      auditTrail: [
        {
          eventId: this.generateEventId(),
          timestamp: new Date(),
          eventType: 'migration',
          actor: {
            userId: new ObjectId(),
            name: 'System Migration',
            role: 'system',
            ipAddress: '127.0.0.1',
            userAgent: 'DatabaseMigrationManager'
          },
          changes: {
            field: 'schema_version',
            oldValue: MIGRATION_CONFIG.sourceVersion,
            newValue: MIGRATION_CONFIG.targetVersion,
            changeReason: 'Database schema migration'
          },
          verification: {
            checksum: this.calculateChecksum(newFarm),
            digitalSignature: '',
            blockchainHash: ''
          }
        }
      ],

      // System Metadata
      metadata: {
        createdAt: oldFarm.createdAt || new Date(),
        updatedAt: new Date(),
        createdBy: oldFarm.createdBy || new ObjectId(),
        lastModifiedBy: new ObjectId(),
        version: 1,
        dataIntegrity: {
          checksum: this.calculateChecksum(newFarm),
          lastVerified: new Date(),
          verificationStatus: 'verified'
        }
      }
    };

    return newFarm;
  }

  /**
   * Migrate Applications Collection
   */
  async migrateApplicationsCollection() {
    console.log('📄 Migrating applications collection...');

    const applicationsCollection = this.db.collection('applications');
    const cursor = applicationsCollection.find({});
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    while (await cursor.hasNext()) {
      const batch = [];

      for (let i = 0; i < MIGRATION_CONFIG.batchSize && (await cursor.hasNext()); i++) {
        const oldApplication = await cursor.next();
        const newApplication = await this.transformApplicationDocument(oldApplication);
        batch.push(newApplication);
      }

      for (const application of batch) {
        try {
          await applicationsCollection.replaceOne({ _id: application._id }, application, {
            upsert: true
          });
          successCount++;
        } catch (error) {
          console.error(`❌ Error migrating application ${application._id}:`, error.message);
          errorCount++;
        }
        processedCount++;
      }

      if (processedCount % 100 === 0) {
        console.log(`📊 Applications migration progress: ${processedCount} processed`);
        await this.updateMigrationStatus();
      }
    }

    console.log(
      `✅ Applications migration completed: ${successCount} success, ${errorCount} errors`
    );
  }

  /**
   * Transform Application Document
   */
  async transformApplicationDocument(oldApplication) {
    const newApplication = {
      _id: oldApplication._id,
      applicationNumber: oldApplication.applicationNumber || this.generateApplicationNumber(),

      applicationInfo: {
        farmId: oldApplication.farmId || new ObjectId(),
        applicantId: oldApplication.applicantId || new ObjectId(),
        applicationType: oldApplication.type || 'new',
        submissionDate: oldApplication.submissionDate || oldApplication.createdAt || new Date(),
        expectedProcessingTime: oldApplication.expectedProcessingTime || 30,
        priority: oldApplication.priority || 'standard',

        wizardProgress: {
          currentStep: oldApplication.currentStep || 1,
          totalSteps: 7,
          completedSteps: oldApplication.completedSteps || [],
          stepProgress: []
        }
      },

      // AI Processing (empty for existing records)
      aiProcessing: {
        documentProcessing: [],
        validationResults: [],
        guidanceHistory: []
      },

      status: {
        currentStatus: oldApplication.status || 'pending',
        statusHistory: oldApplication.statusHistory || [],
        workflowState: {
          currentPhase: oldApplication.currentPhase || 'submission',
          phaseProgress: oldApplication.progress || 0,
          estimatedCompletion: oldApplication.estimatedCompletion || null,
          bottlenecks: []
        }
      },

      documents: (oldApplication.documents || []).map(doc => ({
        documentId: doc.id || this.generateDocumentId(),
        documentType: doc.type || 'unknown',
        fileName: doc.fileName || doc.name || '',
        fileSize: doc.fileSize || 0,
        mimeType: doc.mimeType || 'application/octet-stream',
        uploadedAt: doc.uploadedAt || new Date(),
        uploadedBy: doc.uploadedBy || new ObjectId(),

        aiProcessed: false,
        extractedData: {},
        verificationStatus: 'pending',

        encryption: {
          encrypted: false,
          algorithm: '',
          keyId: ''
        },
        integrity: {
          checksum: this.calculateChecksum(doc),
          digitalSignature: '',
          tamperDetected: false
        }
      })),

      financial: {
        totalFees: oldApplication.fees?.total || 0,
        paidAmount: oldApplication.fees?.paid || 0,
        outstandingAmount: oldApplication.fees?.outstanding || 0,
        paymentHistory: oldApplication.payments || [],
        discounts: oldApplication.discounts || []
      }
    };

    return newApplication;
  }

  /**
   * Migrate Batches Collection
   */
  async migrateBatchesCollection() {
    console.log('📦 Checking for batches collection...');

    const collections = await this.db.listCollections({ name: 'batches' }).toArray();
    if (collections.length === 0) {
      console.log('⚠️ Batches collection not found, skipping migration');
      return;
    }

    console.log('📦 Migrating batches collection...');

    const batchesCollection = this.db.collection('batches');
    const cursor = batchesCollection.find({});
    let processedCount = 0;

    while (await cursor.hasNext()) {
      const oldBatch = await cursor.next();
      const newBatch = await this.transformBatchDocument(oldBatch);

      try {
        await batchesCollection.replaceOne({ _id: newBatch._id }, newBatch, { upsert: true });
        processedCount++;
      } catch (error) {
        console.error(`❌ Error migrating batch ${oldBatch._id}:`, error.message);
      }
    }

    console.log(`✅ Batches migration completed: ${processedCount} processed`);
  }

  /**
   * Transform Batch Document
   */
  async transformBatchDocument(oldBatch) {
    return {
      _id: oldBatch._id,
      batchNumber: oldBatch.batchNumber || this.generateBatchNumber(),

      batchInfo: {
        farmId: oldBatch.farmId || new ObjectId(),
        cropType: oldBatch.cropType || '',
        variety: oldBatch.variety || '',
        plantingDate: oldBatch.plantingDate || null,
        harvestDate: oldBatch.harvestDate || null,
        expectedYield: oldBatch.expectedYield || 0,
        actualYield: oldBatch.actualYield || 0,
        qualityGrade: oldBatch.qualityGrade || 'A'
      },

      traceabilityGraph: {
        source: {
          seedId: oldBatch.seedId || '',
          supplier: oldBatch.seedSupplier || '',
          certificationNumber: oldBatch.seedCertification || '',
          geneticProfile: {},
          parentBatches: []
        },
        productionStages: [],
        processing: [],
        distribution: []
      },

      qrCode: {
        qrId: oldBatch.qrId || this.generateQRId(),
        qrData: oldBatch.qrData || '',
        generatedAt: oldBatch.qrGeneratedAt || new Date(),
        expiryDate: null,
        scanCount: oldBatch.scanCount || 0,
        lastScanned: oldBatch.lastScanned || null,
        verificationChain: []
      },

      compliance: {
        gacpCompliant: oldBatch.gacpCompliant || false,
        complianceChecks: [],
        testingResults: []
      },

      recordChain: [
        {
          recordId: this.generateRecordId(),
          timestamp: new Date(),
          eventType: 'migration',
          actor: 'system',
          data: { migrationId: this.migrationId },
          previousHash: '',
          currentHash: this.calculateChecksum(oldBatch),
          digitalSignature: ''
        }
      ]
    };
  }

  /**
   * สร้าง Database Indexes
   */
  async createIndexes() {
    console.log('📊 Creating database indexes...');

    const step = {
      stepName: 'create_indexes',
      startedAt: new Date(),
      status: 'running'
    };

    this.currentMigration.steps.push(step);

    const { DatabaseIndexes } = require('./enhanced-mongodb-schema');

    // Create indexes for each collection
    for (const [collectionName, indexes] of Object.entries(DatabaseIndexes)) {
      const collection = this.db.collection(collectionName);

      for (const indexSpec of indexes) {
        try {
          await collection.createIndex(indexSpec);
          console.log(`✅ Created index for ${collectionName}:`, indexSpec);
        } catch (error) {
          console.error(`❌ Failed to create index for ${collectionName}:`, error.message);
        }
      }
    }

    step.status = 'completed';
    step.endedAt = new Date();

    console.log('✅ Database indexes created');
  }

  /**
   * ตรวจสอบความถูกต้องหลัง Migration
   */
  async verifyMigration() {
    if (!MIGRATION_CONFIG.verificationEnabled) {
      console.log('⚠️ Verification disabled, skipping...');
      return;
    }

    console.log('🔍 Verifying migration...');

    const step = {
      stepName: 'verify_migration',
      startedAt: new Date(),
      status: 'running'
    };

    this.currentMigration.steps.push(step);

    const collectionsToVerify = ['farms', 'applications', 'batches'];
    const verificationResults = {};

    for (const collectionName of collectionsToVerify) {
      const collection = this.db.collection(collectionName);
      const count = await collection.countDocuments();

      // Sample verification - check first 10 documents
      const sampleDocs = await collection.find({}).limit(10).toArray();
      let validDocs = 0;

      for (const doc of sampleDocs) {
        if (this.verifyDocumentStructure(doc, collectionName)) {
          validDocs++;
        }
      }

      verificationResults[collectionName] = {
        totalCount: count,
        sampleSize: sampleDocs.length,
        validSamples: validDocs,
        validationRate: sampleDocs.length > 0 ? (validDocs / sampleDocs.length) * 100 : 0
      };

      console.log(
        `📊 ${collectionName} verification: ${validDocs}/${sampleDocs.length} valid samples`
      );
    }

    step.status = 'completed';
    step.endedAt = new Date();
    step.results = verificationResults;

    console.log('✅ Migration verification completed');
  }

  /**
   * ตรวจสอบโครงสร้างเอกสาร
   */
  verifyDocumentStructure(doc, collectionName) {
    try {
      switch (collectionName) {
        case 'farms':
          return doc.basicInfo && doc.location && doc.cultivation && doc.metadata;
        case 'applications':
          return doc.applicationInfo && doc.status && doc.documents !== undefined;
        case 'batches':
          return doc.batchInfo && doc.traceabilityGraph && doc.qrCode;
        default:
          return true;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * ทำความสะอาดหลัง Migration
   */
  async postMigrationCleanup() {
    console.log('🧹 Performing post-migration cleanup...');

    const step = {
      stepName: 'post_migration_cleanup',
      startedAt: new Date(),
      status: 'running'
    };

    this.currentMigration.steps.push(step);

    // อัพเดทเวอร์ชันของฐานข้อมูล
    await this.updateDatabaseVersion();

    // ล้าง temporary collections หากมี
    await this.cleanupTemporaryCollections();

    step.status = 'completed';
    step.endedAt = new Date();

    console.log('✅ Post-migration cleanup completed');
  }

  /**
   * อัพเดทเวอร์ชันฐานข้อมูล
   */
  async updateDatabaseVersion() {
    const versionCollection = this.db.collection('_database_version');

    await versionCollection.replaceOne(
      {},
      {
        version: MIGRATION_CONFIG.targetVersion,
        updatedAt: new Date(),
        migrationId: this.migrationId
      },
      { upsert: true }
    );

    console.log(`✅ Database version updated to ${MIGRATION_CONFIG.targetVersion}`);
  }

  /**
   * ล้าง Temporary Collections
   */
  async cleanupTemporaryCollections() {
    const collections = await this.db.listCollections().toArray();
    const tempCollections = collections
      .filter(c => c.name.includes('_temp_') || c.name.includes('_backup_'))
      .map(c => c.name);

    for (const collectionName of tempCollections) {
      // Keep backups, only remove temp collections
      if (collectionName.includes('_temp_')) {
        await this.db.collection(collectionName).drop();
        console.log(`🗑️ Dropped temporary collection: ${collectionName}`);
      }
    }
  }

  /**
   * อัพเดทสถานะ Migration
   */
  async updateMigrationStatus() {
    if (!this.currentMigration) return;

    await this.db.collection('_migrations').updateOne(
      { migrationId: this.migrationId },
      {
        $set: {
          status: this.currentMigration.status,
          steps: this.currentMigration.steps,
          statistics: this.currentMigration.statistics,
          errors: this.currentMigration.errors,
          endedAt: this.currentMigration.endedAt
        }
      }
    );
  }

  /**
   * Rollback Migration
   */
  async rollbackMigration() {
    if (!this.currentMigration) {
      throw new Error('No active migration to rollback');
    }

    console.log('🔙 Starting migration rollback...');

    this.currentMigration.status = MIGRATION_STATES.ROLLING_BACK;
    await this.updateMigrationStatus();

    try {
      // Restore from backup
      const backupSuffix = this.currentMigration.startedAt
        .toISOString()
        .replace(/[-:T.]/g, '')
        .substring(0, 14);

      const collectionsToRestore = ['farms', 'applications', 'batches'];

      for (const collectionName of collectionsToRestore) {
        const backupCollectionName = `${collectionName}_backup_${backupSuffix}`;
        const backupExists = await this.db
          .listCollections({ name: backupCollectionName })
          .hasNext();

        if (backupExists) {
          // Drop current collection
          await this.db.collection(collectionName).drop();

          // Rename backup to original
          await this.db.collection(backupCollectionName).rename(collectionName);

          console.log(`✅ Restored ${collectionName} from backup`);
        }
      }

      this.currentMigration.status = MIGRATION_STATES.ROLLED_BACK;
      this.currentMigration.endedAt = new Date();
      await this.updateMigrationStatus();

      console.log('✅ Migration rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }

  /**
   * Helper Methods
   */
  generateFarmNumber() {
    const now = new Date();
    const year = now.getFullYear() + 543; // Buddhist year
    const random = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0');
    return `FARM-${year}-${random}`;
  }

  generateApplicationNumber() {
    const now = new Date();
    const year = now.getFullYear() + 543;
    const random = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0');
    return `GACP-${year}-${random}`;
  }

  generateBatchNumber() {
    const now = new Date();
    const year = now.getFullYear() + 543;
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 999)
      .toString()
      .padStart(3, '0');
    return `BATCH-${year}${month}-${random}`;
  }

  generateEventId() {
    return `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  generateDocumentId() {
    return `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  generateQRId() {
    return `QR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  generateRecordId() {
    return `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  calculateChecksum(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex').substring(0, 16);
  }

  /**
   * ปิดการเชื่อมต่อ
   */
  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('✅ Disconnected from MongoDB');
    }
  }

  /**
   * รายงานสถานะ Migration
   */
  getMigrationReport() {
    if (!this.currentMigration) return null;

    return {
      migrationId: this.migrationId,
      status: this.currentMigration.status,
      progress: {
        totalRecords: this.currentMigration.statistics.totalRecords,
        processedRecords: this.currentMigration.statistics.processedRecords,
        successfulRecords: this.currentMigration.statistics.successfulRecords,
        failedRecords: this.currentMigration.statistics.failedRecords,
        percentage:
          this.currentMigration.statistics.totalRecords > 0
            ? (this.currentMigration.statistics.processedRecords /
                this.currentMigration.statistics.totalRecords) *
              100
            : 0
      },
      steps: this.currentMigration.steps,
      errors: this.currentMigration.errors,
      startedAt: this.currentMigration.startedAt,
      endedAt: this.currentMigration.endedAt,
      duration: this.currentMigration.endedAt
        ? this.currentMigration.endedAt - this.currentMigration.startedAt
        : Date.now() - this.currentMigration.startedAt
    };
  }
}

module.exports = {
  DatabaseMigrationManager,
  MIGRATION_CONFIG,
  MIGRATION_STATES
};
