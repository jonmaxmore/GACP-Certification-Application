/**
 * Enhanced Application Module Configuration
 *
 * Central configuration management for the enhanced GACP application processing system.
 * This configuration provides comprehensive settings for all application processing
 * components including FSM workflow, government integration, document management,
 * analytics, and performance monitoring.
 *
 * Configuration Structure & Business Logic:
 * 1. Core Application Settings - Database, authentication, and basic configurations
 * 2. FSM Workflow Configuration - State machine rules and transition logic
 * 3. Government Integration Settings - Multi-ministry API configurations
 * 4. Document Management Configuration - Storage, processing, and validation
 * 5. Analytics and Monitoring - Performance metrics and health monitoring
 * 6. Security and Compliance - Authentication, authorization, and audit settings
 *
 * Workflow Integration:
 * All configurations support environment-specific overrides, comprehensive
 * validation, and real-time configuration updates for operational flexibility.
 *
 * Process Enhancement:
 * - Environment-aware configuration with validation
 * - Service-specific configuration sections
 * - Performance and scalability settings
 * - Security and compliance configurations
 * - Monitoring and alerting settings
 */

const logger = require('../../../shared/logger/logger');
const path = require('path');
/**
 * Enhanced Application Module Configuration Class
 */
class EnhancedApplicationModuleConfig {
  constructor(environment = 'development') {
    this.environment = environment;
    this.configPath = path.join(__dirname, 'configs');
    this.loadConfigurations();
  }

  /**
   * Load and merge configurations based on environment
   */
  loadConfigurations() {
    // Base configuration
    const baseConfig = {
      // ========================================================================
      // CORE APPLICATION SETTINGS
      // ========================================================================
      application: {
        name: 'GACP Enhanced Application Processing System',
        version: '2.0.0',
        description: 'Advanced GACP application processing with government integration',
        environment: this.environment,

        // Application-specific settings
        settings: {
          applicationIdFormat: 'GACP-{YEAR}-{SEQUENCE:8}',
          maxApplicationsPerFarmer: 3,
          applicationExpiryDays: 365,
          autoSaveInterval: 30000, // 30 seconds
          maxConcurrentProcessing: 10,
          enableRealTimeUpdates: true,
          enablePerformanceMonitoring: true,
        },

        // Service health check configuration
        healthCheck: {
          enabled: true,
          interval: 30000, // 30 seconds
          timeout: 5000, // 5 seconds
          endpoints: {
            database: true,
            governmentAPIs: true,
            documentStorage: true,
            analytics: true,
          },
        },
      },

      // ========================================================================
      // DATABASE CONFIGURATION
      // ========================================================================
      database: {
        mongodb: {
          uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_enhanced',
          options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Pool
            maxPoolSize: 50,
            minPoolSize: 5,
            // Timeouts
            maxIdleTimeMS: 30000,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            // Network
            family: 4, // Use IPv4
            // Retry
            retryWrites: true,
            w: 'majority',
          },

          // Collection configurations
          collections: {
            applications: {
              name: 'enhanced_applications',
              indexes: [
                { fields: { applicationId: 1 }, unique: true },
                { fields: { farmerCitizenId: 1 } },
                { fields: { currentState: 1 } },
                { fields: { createdAt: -1 } },
                { fields: { farmAddress: '2dsphere' } }, // Geospatial index
                { fields: { searchText: 'text' } }, // Text search index
              ],
            },

            documents: {
              name: 'application_documents',
              indexes: [
                { fields: { applicationId: 1, documentType: 1 } },
                { fields: { uploadedAt: -1 } },
                { fields: { processingStatus: 1 } },
              ],
            },

            auditLogs: {
              name: 'application_audit_logs',
              indexes: [
                { fields: { applicationId: 1, timestamp: -1 } },
                { fields: { actionType: 1 } },
                { fields: { userId: 1 } },
              ],
            },

            analytics: {
              name: 'application_analytics',
              indexes: [
                { fields: { timestamp: -1 } },
                { fields: { metricType: 1, timestamp: -1 } },
              ],
            },
          },
        },
      },

      // ========================================================================
      // FSM WORKFLOW CONFIGURATION
      // ========================================================================
      workflow: {
        // FSM State definitions with business logic
        states: {
          DRAFT: {
            name: 'DRAFT',
            displayName: 'ร่าง',
            description: 'Application in draft state, being prepared by farmer',
            allowedTransitions: ['SUBMITTED', 'CANCELLED'],
            permissions: ['farmer', 'dtam_staff', 'dtam_manager', 'admin'],
            autoTransitions: [],
            notifications: ['farmer'],
            validations: ['basicInfo', 'farmDetails'],
            timeoutDays: null,
            color: '#6B7280',
          },

          SUBMITTED: {
            name: 'SUBMITTED',
            displayName: 'ส่งแล้ว',
            description: 'Application submitted and awaiting initial review',
            allowedTransitions: ['UNDER_REVIEW', 'REJECTED'],
            permissions: ['dtam_staff', 'dtam_manager', 'admin'],
            autoTransitions: [
              {
                condition: 'all_required_documents_uploaded',
                targetState: 'UNDER_REVIEW',
                delay: 3600000, // 1 hour
              },
            ],
            notifications: ['farmer', 'dtam_staff'],
            validations: ['completeApplication', 'requiredDocuments'],
            timeoutDays: 7,
            color: '#3B82F6',
          },

          UNDER_REVIEW: {
            name: 'UNDER_REVIEW',
            displayName: 'อยู่ระหว่างตรวจสอบ',
            description: 'Application under review by DTAM staff',
            allowedTransitions: [
              'DOCUMENT_REQUEST',
              'INSPECTION_SCHEDULED',
              'REJECTED',
              'APPROVED',
            ],
            permissions: ['dtam_staff', 'dtam_manager', 'admin'],
            autoTransitions: [
              {
                condition: 'government_verification_complete',
                targetState: 'INSPECTION_SCHEDULED',
                delay: 7200000, // 2 hours
              },
            ],
            notifications: ['farmer', 'dtam_staff'],
            validations: ['documentQuality', 'eligibilityChecks'],
            timeoutDays: 14,
            color: '#F59E0B',
          },

          DOCUMENT_REQUEST: {
            name: 'DOCUMENT_REQUEST',
            displayName: 'ต้องการเอกสารเพิ่มเติม',
            description: 'Additional documents required from farmer',
            allowedTransitions: ['DOCUMENT_SUBMITTED', 'CANCELLED'],
            permissions: ['farmer'],
            autoTransitions: [],
            notifications: ['farmer'],
            validations: ['missingDocuments'],
            timeoutDays: 30,
            color: '#EF4444',
          },

          DOCUMENT_SUBMITTED: {
            name: 'DOCUMENT_SUBMITTED',
            displayName: 'ส่งเอกสารเพิ่มเติมแล้ว',
            description: 'Additional documents submitted, awaiting review',
            allowedTransitions: ['UNDER_REVIEW', 'DOCUMENT_REQUEST'],
            permissions: ['dtam_staff', 'dtam_manager', 'admin'],
            autoTransitions: [
              {
                condition: 'new_documents_processed',
                targetState: 'UNDER_REVIEW',
                delay: 1800000, // 30 minutes
              },
            ],
            notifications: ['farmer', 'dtam_staff'],
            validations: ['newDocumentQuality'],
            timeoutDays: 7,
            color: '#8B5CF6',
          },

          INSPECTION_SCHEDULED: {
            name: 'INSPECTION_SCHEDULED',
            displayName: 'นัดหมายตรวจสอบแล้ว',
            description: 'Farm inspection scheduled',
            allowedTransitions: ['INSPECTION_COMPLETED', 'UNDER_REVIEW'],
            permissions: ['dtam_staff', 'dtam_manager', 'admin'],
            autoTransitions: [],
            notifications: ['farmer', 'inspector', 'dtam_staff'],
            validations: ['inspectionSchedule'],
            timeoutDays: 21,
            color: '#06B6D4',
          },

          INSPECTION_COMPLETED: {
            name: 'INSPECTION_COMPLETED',
            displayName: 'ตรวจสอบเสร็จแล้ว',
            description: 'Farm inspection completed, results being processed',
            allowedTransitions: ['COMPLIANCE_REVIEW', 'REJECTED'],
            permissions: ['dtam_manager', 'admin'],
            autoTransitions: [
              {
                condition: 'inspection_results_uploaded',
                targetState: 'COMPLIANCE_REVIEW',
                delay: 3600000, // 1 hour
              },
            ],
            notifications: ['farmer', 'dtam_staff', 'dtam_manager'],
            validations: ['inspectionResults'],
            timeoutDays: 7,
            color: '#10B981',
          },

          COMPLIANCE_REVIEW: {
            name: 'COMPLIANCE_REVIEW',
            displayName: 'ตรวจสอบการปฏิบัติตาม',
            description: 'Final compliance review in progress',
            allowedTransitions: ['APPROVED', 'REJECTED'],
            permissions: ['dtam_manager', 'admin'],
            autoTransitions: [],
            notifications: ['farmer', 'dtam_manager'],
            validations: ['complianceCheck', 'finalReview'],
            timeoutDays: 14,
            color: '#F59E0B',
          },

          APPROVED: {
            name: 'APPROVED',
            displayName: 'อนุมัติแล้ว',
            description: 'Application approved, certificate being generated',
            allowedTransitions: ['CERTIFICATE_ISSUED'],
            permissions: ['dtam_manager', 'admin'],
            autoTransitions: [
              {
                condition: 'certificate_generation_complete',
                targetState: 'CERTIFICATE_ISSUED',
                delay: 1800000, // 30 minutes
              },
            ],
            notifications: ['farmer', 'all_dtam_staff'],
            validations: ['finalApproval'],
            timeoutDays: null,
            color: '#10B981',
          },

          CERTIFICATE_ISSUED: {
            name: 'CERTIFICATE_ISSUED',
            displayName: 'ออกใบรับรองแล้ว',
            description: 'Certificate issued and delivered to farmer',
            allowedTransitions: [],
            permissions: ['view_only'],
            autoTransitions: [],
            notifications: ['farmer'],
            validations: ['certificateDelivery'],
            timeoutDays: null,
            color: '#059669',
          },

          REJECTED: {
            name: 'REJECTED',
            displayName: 'ไม่อนุมัติ',
            description: 'Application rejected',
            allowedTransitions: ['APPEAL_SUBMITTED'],
            permissions: ['farmer'],
            autoTransitions: [],
            notifications: ['farmer'],
            validations: ['rejectionReason'],
            timeoutDays: null,
            color: '#DC2626',
          },

          APPEAL_SUBMITTED: {
            name: 'APPEAL_SUBMITTED',
            displayName: 'ส่งอุทธรณ์แล้ว',
            description: 'Appeal submitted, under review',
            allowedTransitions: ['UNDER_REVIEW', 'REJECTED'],
            permissions: ['dtam_manager', 'admin'],
            autoTransitions: [],
            notifications: ['farmer', 'dtam_manager'],
            validations: ['appealDocuments'],
            timeoutDays: 30,
            color: '#7C3AED',
          },

          CANCELLED: {
            name: 'CANCELLED',
            displayName: 'ยกเลิก',
            description: 'Application cancelled by farmer',
            allowedTransitions: [],
            permissions: ['view_only'],
            autoTransitions: [],
            notifications: ['farmer'],
            validations: ['cancellationReason'],
            timeoutDays: null,
            color: '#6B7280',
          },
        },

        // Workflow automation settings
        automation: {
          enableAutoTransitions: true,
          checkInterval: 300000, // 5 minutes
          maxRetries: 3,
          retryDelay: 60000, // 1 minute

          // Notification settings
          notifications: {
            enabled: true,
            channels: ['email', 'sms', 'push'],
            templates: {
              stateChange: 'application_state_changed',
              documentRequired: 'document_required',
              inspectionScheduled: 'inspection_scheduled',
              approved: 'application_approved',
              rejected: 'application_rejected',
            },
          },
        },
      },

      // ========================================================================
      // GOVERNMENT INTEGRATION CONFIGURATION
      // ========================================================================
      governmentIntegration: {
        // Service configurations for different ministries
        services: {
          nationalId: {
            name: 'National ID Verification Service',
            endpoint: process.env.NATIONAL_ID_API_URL || 'https://api.nida.go.th/v1',
            authentication: {
              type: 'API_KEY',
              apiKey: process.env.NATIONAL_ID_API_KEY,
              headers: {
                'X-API-Key': process.env.NATIONAL_ID_API_KEY,
                'Content-Type': 'application/json',
              },
            },
            rateLimit: {
              requests: 100,
              window: 3600000, // 1 hour
            },
            timeout: 10000, // 10 seconds
            retries: 3,
            circuitBreaker: {
              failureThreshold: 5,
              resetTimeout: 60000,
              monitoringPeriod: 300000,
            },
          },

          landDepartment: {
            name: 'Department of Lands API',
            endpoint: process.env.LAND_DEPT_API_URL || 'https://api.dol.go.th/v1',
            authentication: {
              type: 'OAUTH2',
              clientId: process.env.LAND_DEPT_CLIENT_ID,
              clientSecret: process.env.LAND_DEPT_CLIENT_SECRET,
              tokenEndpoint: 'https://auth.dol.go.th/oauth/token',
            },
            rateLimit: {
              requests: 50,
              window: 3600000, // 1 hour
            },
            timeout: 15000, // 15 seconds
            retries: 3,
            circuitBreaker: {
              failureThreshold: 3,
              resetTimeout: 120000,
              monitoringPeriod: 300000,
            },
          },

          moac: {
            name: 'Ministry of Agriculture and Cooperatives',
            endpoint: process.env.MOAC_API_URL || 'https://api.moac.go.th/v2',
            authentication: {
              type: 'JWT',
              secret: process.env.MOAC_JWT_SECRET,
              issuer: 'gacp-system',
            },
            rateLimit: {
              requests: 200,
              window: 3600000, // 1 hour
            },
            timeout: 12000, // 12 seconds
            retries: 3,
            circuitBreaker: {
              failureThreshold: 5,
              resetTimeout: 180000,
              monitoringPeriod: 300000,
            },
          },

          doa: {
            name: 'Department of Agriculture',
            endpoint: process.env.DOA_API_URL || 'https://api.doa.go.th/v1',
            authentication: {
              type: 'HMAC',
              accessKey: process.env.DOA_ACCESS_KEY,
              secretKey: process.env.DOA_SECRET_KEY,
            },
            rateLimit: {
              requests: 150,
              window: 3600000, // 1 hour
            },
            timeout: 10000, // 10 seconds
            retries: 3,
            circuitBreaker: {
              failureThreshold: 4,
              resetTimeout: 90000,
              monitoringPeriod: 300000,
            },
          },

          fda: {
            name: 'Food and Drug Administration',
            endpoint: process.env.FDA_API_URL || 'https://api.fda.moph.go.th/v1',
            authentication: {
              type: 'MUTUAL_TLS',
              certPath: process.env.FDA_CLIENT_CERT_PATH,
              keyPath: process.env.FDA_CLIENT_KEY_PATH,
              caPath: process.env.FDA_CA_CERT_PATH,
            },
            rateLimit: {
              requests: 75,
              window: 3600000, // 1 hour
            },
            timeout: 20000, // 20 seconds
            retries: 2,
            circuitBreaker: {
              failureThreshold: 3,
              resetTimeout: 300000,
              monitoringPeriod: 600000,
            },
          },
        },

        // Global government integration settings
        global: {
          maxConcurrentRequests: 20,
          defaultTimeout: 15000,
          enableCaching: true,
          cacheTimeout: 1800000, // 30 minutes
          enableRetry: true,
          enableCircuitBreaker: true,
          healthCheckInterval: 60000, // 1 minute

          // Data transformation settings
          dataTransformation: {
            enabled: true,
            validateInput: true,
            validateOutput: true,
            logTransformations: true,
          },

          // Monitoring and alerting
          monitoring: {
            enabled: true,
            metricsCollection: true,
            alertThresholds: {
              responseTime: 10000, // 10 seconds
              errorRate: 5, // 5%
              failureRate: 10, // 10%
            },
          },
        },
      },

      // ========================================================================
      // DOCUMENT MANAGEMENT CONFIGURATION
      // ========================================================================
      documentManagement: {
        // Storage configuration
        storage: {
          type: process.env.STORAGE_TYPE || 'S3', // S3, LOCAL, GCS, AZURE

          s3: {
            bucket: process.env.S3_BUCKET || 'gacp-application-documents',
            region: process.env.S3_REGION || 'ap-southeast-1',
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            encryption: 'AES256',
            storageClass: 'STANDARD_IA',
          },

          local: {
            path: process.env.LOCAL_STORAGE_PATH || './uploads/applications',
            permissions: 0o755,
          },

          // File management settings
          files: {
            maxSize: 50 * 1024 * 1024, // 50MB
            allowedTypes: [
              'application/pdf',
              'image/jpeg',
              'image/png',
              'image/gif',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ],
            compression: {
              enabled: true,
              quality: 0.8,
            },
            virusScanning: {
              enabled: process.env.NODE_ENV === 'production',
              provider: 'clamav',
            },
          },
        },

        // Document processing configuration
        processing: {
          ocr: {
            enabled: true,
            provider: 'tesseract', // tesseract, azure, aws
            languages: ['tha', 'eng'],
            confidence: 0.7,

            // AI enhancement settings
            aiEnhancement: {
              enabled: true,
              model: 'claude-3',
              extractEntities: true,
              validateContent: true,
            },
          },

          // Quality assurance settings
          qualityAssurance: {
            enabled: true,
            checks: ['readability', 'completeness', 'authenticity', 'compliance'],
            thresholds: {
              readability: 0.8,
              completeness: 0.9,
              authenticity: 0.7,
              compliance: 0.95,
            },
          },

          // Document validation rules
          validation: {
            strictMode: process.env.NODE_ENV === 'production',
            rules: {
              FARMER_ID: {
                required: ['citizenId', 'name', 'address'],
                format: 'government_id',
                expiry: true,
              },
              LAND_OWNERSHIP: {
                required: ['titleDeed', 'area', 'location'],
                format: 'legal_document',
                verification: 'land_department',
              },
              FARM_REGISTRATION: {
                required: ['registrationNumber', 'farmName', 'owner'],
                format: 'registration_document',
                verification: 'doa',
              },
            },
          },
        },

        // Document workflow settings
        workflow: {
          autoProcessing: true,
          processingTimeout: 300000, // 5 minutes
          retryAttempts: 3,
          retryDelay: 60000, // 1 minute

          // Version control
          versioning: {
            enabled: true,
            maxVersions: 10,
            autoCleanup: true,
            retentionDays: 1095, // 3 years
          },
        },
      },

      // ========================================================================
      // ANALYTICS AND MONITORING CONFIGURATION
      // ========================================================================
      analytics: {
        // Performance monitoring
        performance: {
          enabled: true,
          metricsCollection: {
            responseTime: true,
            throughput: true,
            errorRate: true,
            resourceUsage: true,
            userActivity: true,
          },

          // Real-time metrics
          realtime: {
            enabled: true,
            updateInterval: 5000, // 5 seconds
            retentionPeriod: 3600000, // 1 hour

            dashboards: {
              system: true,
              applications: true,
              documents: true,
              government: true,
            },
          },

          // Historical analytics
          historical: {
            enabled: true,
            aggregationPeriods: ['1h', '1d', '1w', '1m'],
            retentionPeriods: {
              raw: 7, // 7 days
              hourly: 30, // 30 days
              daily: 365, // 1 year
              monthly: 1095, // 3 years
            },
          },
        },

        // Business intelligence
        businessIntelligence: {
          enabled: true,
          reports: {
            applicationTrends: true,
            processingEfficiency: true,
            governmentIntegration: true,
            documentQuality: true,
            farmerSatisfaction: true,
          },

          // Predictive analytics
          predictive: {
            enabled: true,
            models: ['processing_time', 'approval_probability', 'resource_demand'],
            updateFrequency: 'daily',
          },
        },

        // Alerting configuration
        alerting: {
          enabled: true,
          channels: ['email', 'slack', 'webhook'],

          rules: [
            {
              name: 'high_error_rate',
              condition: 'error_rate > 5%',
              severity: 'critical',
              channels: ['email', 'slack'],
            },
            {
              name: 'slow_response_time',
              condition: 'avg_response_time > 5000ms',
              severity: 'warning',
              channels: ['email'],
            },
            {
              name: 'government_api_failure',
              condition: 'government_api_error_rate > 10%',
              severity: 'high',
              channels: ['email', 'slack', 'webhook'],
            },
          ],
        },
      },

      // ========================================================================
      // SECURITY AND COMPLIANCE CONFIGURATION
      // ========================================================================
      security: {
        // Authentication settings
        authentication: {
          jwt: {
            secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
            expiresIn: process.env.JWT_EXPIRES_IN || '24h',
            issuer: 'gacp-enhanced-system',
            algorithm: 'HS256',
          },

          // Session management
          session: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 86400000, // 24 hours
            sameSite: 'strict',
          },

          // Multi-factor authentication
          mfa: {
            enabled: process.env.ENABLE_MFA === 'true',
            methods: ['totp', 'sms'],
            requiredRoles: ['admin', 'dtam_manager'],
          },
        },

        // Authorization settings
        authorization: {
          roleBasedAccess: true,

          roles: {
            farmer: {
              permissions: [
                'application:create',
                'application:read:own',
                'application:update:own',
                'document:upload:own',
                'document:read:own',
              ],
            },

            dtam_staff: {
              permissions: [
                'application:read:assigned',
                'application:update:assigned',
                'document:read:assigned',
                'government:verify',
                'inspection:schedule',
              ],
            },

            dtam_manager: {
              permissions: [
                'application:read:all',
                'application:update:all',
                'application:approve',
                'application:reject',
                'document:read:all',
                'government:submit',
                'analytics:view',
                'system:monitor',
              ],
            },

            admin: {
              permissions: ['*'], // Full access
            },
          },
        },

        // Data protection settings
        dataProtection: {
          encryption: {
            enabled: true,
            algorithm: 'aes-256-gcm',
            keyRotation: {
              enabled: true,
              frequency: 'monthly',
            },
          },

          // Personal data handling
          personalData: {
            anonymization: {
              enabled: true,
              retentionPeriod: 2555, // 7 years in days
            },

            gdprCompliance: {
              enabled: true,
              rightToForget: true,
              dataPortability: true,
              consentManagement: true,
            },
          },
        },

        // Audit and compliance
        audit: {
          enabled: true,
          logLevel: 'detailed', // basic, detailed, comprehensive

          events: [
            'authentication',
            'authorization',
            'data_access',
            'data_modification',
            'system_events',
            'security_events',
          ],

          retention: {
            logRetentionDays: 2555, // 7 years
            archiveAfterDays: 365, // 1 year
            compressionEnabled: true,
          },

          // Compliance reporting
          compliance: {
            enabled: true,
            standards: ['ISO27001', 'SOC2', 'GDPR'],
            reportingFrequency: 'monthly',
            autoGeneration: true,
          },
        },
      },
    };

    // Environment-specific overrides
    const envOverrides = this.getEnvironmentOverrides();
    this.config = this.mergeConfigurations(baseConfig, envOverrides);

    // Validate configuration
    this.validateConfiguration();

    console.log(
      `[EnhancedApplicationConfig] Configuration loaded for environment: ${this.environment}`,
    );
  }

  /**
   * Get environment-specific configuration overrides
   */
  getEnvironmentOverrides() {
    const overrides = {};

    switch (this.environment) {
      case 'development':
        Object.assign(overrides, {
          database: {
            mongodb: {
              uri: 'mongodb://localhost:27017/gacp_enhanced_dev',
            },
          },

          governmentIntegration: {
            global: {
              enableCaching: false,
              enableRetry: false,
            },

            // Use mock services in development
            services: {
              nationalId: { endpoint: 'http://localhost:8080/mock/national-id' },
              landDepartment: { endpoint: 'http://localhost:8080/mock/land-dept' },
              moac: { endpoint: 'http://localhost:8080/mock/moac' },
              doa: { endpoint: 'http://localhost:8080/mock/doa' },
              fda: { endpoint: 'http://localhost:8080/mock/fda' },
            },
          },

          documentManagement: {
            storage: {
              type: 'LOCAL',
              local: {
                path: './uploads/dev',
              },
            },

            processing: {
              ocr: {
                enabled: false, // Disable OCR in development
              },
            },
          },

          security: {
            authentication: {
              jwt: {
                expiresIn: '7d', // Longer expiry for development
              },
            },

            dataProtection: {
              encryption: {
                enabled: false, // Disable encryption in development
              },
            },
          },
        });
        break;

      case 'testing':
        Object.assign(overrides, {
          database: {
            mongodb: {
              uri: 'mongodb://localhost:27017/gacp_enhanced_test',
            },
          },

          application: {
            settings: {
              enableRealTimeUpdates: false,
              enablePerformanceMonitoring: false,
            },
          },

          analytics: {
            performance: {
              enabled: false,
            },
          },

          security: {
            audit: {
              enabled: false,
            },
          },
        });
        break;

      case 'staging':
        Object.assign(overrides, {
          database: {
            mongodb: {
              uri: process.env.MONGODB_URI_STAGING,
            },
          },

          documentManagement: {
            storage: {
              s3: {
                bucket: 'gacp-staging-documents',
              },
            },
          },
        });
        break;

      case 'production':
        Object.assign(overrides, {
          application: {
            settings: {
              maxConcurrentProcessing: 50,
            },
          },

          analytics: {
            performance: {
              realtime: {
                updateInterval: 1000, // More frequent updates in production
              },
            },
          },

          security: {
            authentication: {
              mfa: {
                enabled: true,
              },
            },

            dataProtection: {
              encryption: {
                enabled: true,
              },
            },
          },
        });
        break;
    }

    return overrides;
  }

  /**
   * Deep merge configuration objects
   */
  mergeConfigurations(base, override) {
    const result = { ...base };

    for (const key in override) {
      if (Object.prototype.hasOwnProperty.call(override, key)) {
        if (
          typeof override[key] === 'object' &&
          !Array.isArray(override[key]) &&
          override[key] !== null
        ) {
          result[key] = this.mergeConfigurations(result[key] || {}, override[key]);
        } else {
          result[key] = override[key];
        }
      }
    }

    return result;
  }

  /**
   * Validate configuration for completeness and correctness
   */
  validateConfiguration() {
    const requiredPaths = [
      'database.mongodb.uri',
      'security.authentication.jwt.secret',
      'governmentIntegration.services.nationalId.endpoint',
      'documentManagement.storage.type',
    ];

    for (const path of requiredPaths) {
      const value = this.getConfigValue(path);
      if (!value) {
        throw new Error(`Required configuration missing: ${path}`);
      }
    }

    logger.info('[EnhancedApplicationConfig] Configuration validation passed');
  }

  /**
   * Get configuration value by path
   */
  getConfigValue(path) {
    return path.split('.').reduce((obj, key) => obj && obj[key], this.config);
  }

  /**
   * Update configuration value by path
   */
  setConfigValue(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key]) {
        obj[key] = {};
      }
      return obj[key];
    }, this.config);

    target[lastKey] = value;
  }

  /**
   * Get complete configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Get specific section of configuration
   */
  getSection(section) {
    return this.config[section];
  }
}

// Export singleton instance
const enhancedApplicationConfig = new EnhancedApplicationModuleConfig(
  process.env.NODE_ENV || 'development',
);

module.exports = {
  EnhancedApplicationModuleConfig,
  config: enhancedApplicationConfig.getConfig(),
  getConfig: () => enhancedApplicationConfig.getConfig(),
  getSection: section => enhancedApplicationConfig.getSection(section),
  getConfigValue: path => enhancedApplicationConfig.getConfigValue(path),
  setConfigValue: (path, value) => enhancedApplicationConfig.setConfigValue(path, value),
};
