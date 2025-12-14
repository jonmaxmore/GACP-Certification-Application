/**
 * Real-time Compliance Monitoring System
 *
 * Automated compliance monitoring and violation detection system
 * with real-time alerts and regulatory reporting capabilities.
 *
 * Business Logic:
 * - Monitor all system activities for compliance violations
 * - Generate real-time alerts for critical compliance events
 * - Provide automated regulatory reports
 * - Track compliance scores and trends
 *
 * Process Flow:
 * 1. Monitor system events in real-time
 * 2. Check against compliance rules
 * 3. Detect violations automatically
 * 4. Generate alerts and notifications
 * 5. Update compliance scores
 * 6. Generate regulatory reports
 *
 * Workflow Integration:
 * - Integrates with all system modules
 * - Provides compliance dashboard
 * - Automates government reporting
 * - Tracks corrective actions
 */

const logger = require('../../../shared/logger/logger');
const EventEmitter = require('events');

class ComplianceMonitoringSystem extends EventEmitter {
  constructor(dependencies = {}) {
    super();

    this.database = dependencies.database;
    this.auditService = dependencies.auditService;
    this.notificationService = dependencies.notificationService;
    this.reportingService = dependencies.reportingService;

    // Compliance rules configuration
    this.complianceRules = this.initializeComplianceRules();
    this.monitoringConfig = this.initializeMonitoringConfig();
    this.alertThresholds = this.initializeAlertThresholds();

    // Real-time monitoring state
    this.activeMonitors = new Map();
    this.complianceScores = new Map();
    this.violationQueue = [];

    // Performance metrics
    this.metrics = {
      eventsProcessed: 0,
      violationsDetected: 0,
      alertsSent: 0,
      reportsGenerated: 0,
    };
  }

  /**
   * Initialize compliance rules for different areas
   */
  initializeComplianceRules() {
    return {
      // GACP_COMPLIANCE Rules
      gacp: {
        documentRetention: {
          rule: 'Documents must be retained for minimum 5 years',
          threshold: 5 * 365 * 24 * 60 * 60 * 1000, // 5 years in milliseconds
          severity: 'HIGH',
          category: 'DOCUMENT_MANAGEMENT',
        },
        paymentProcessing: {
          rule: 'Payments must be processed within 24 hours of receipt',
          threshold: 24 * 60 * 60 * 1000, // 24 hours
          severity: 'MEDIUM',
          category: 'FINANCIAL',
        },
        certificateValidity: {
          rule: 'Certificates must not be issued with expired documents',
          threshold: 0,
          severity: 'CRITICAL',
          category: 'CERTIFICATE_MANAGEMENT',
        },
      },

      // Data Privacy Compliance (PDPA_COMPLIANCE)
      privacy: {
        dataAccess: {
          rule: 'Personal data access must be logged and authorized',
          threshold: 0,
          severity: 'HIGH',
          category: 'DATA_PRIVACY',
        },
        dataRetention: {
          rule: 'Personal data retention must not exceed legal requirements',
          threshold: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
          severity: 'HIGH',
          category: 'DATA_PRIVACY',
        },
        consentTracking: {
          rule: 'User consent must be tracked and verifiable',
          threshold: 0,
          severity: 'CRITICAL',
          category: 'DATA_PRIVACY',
        },
      },

      // Security Compliance - SECURITY_COMPLIANCE
      security: {
        failedLogins: {
          rule: 'More than 5 failed login attempts require security review',
          threshold: 5,
          severity: 'MEDIUM',
          category: 'SECURITY',
        },
        privilegeEscalation: {
          rule: 'Role changes must be approved and logged',
          threshold: 0,
          severity: 'HIGH',
          category: 'SECURITY',
        },
        dataExport: {
          rule: 'Data exports must be authorized and logged',
          threshold: 0,
          severity: 'HIGH',
          category: 'SECURITY',
        },
      },

      // Government Regulatory Compliance
      regulatory: {
        applicationProcessingTime: {
          rule: 'Applications must be processed within 30 days',
          threshold: 30 * 24 * 60 * 60 * 1000, // 30 days
          severity: 'HIGH',
          category: 'REGULATORY',
        },
        inspectionScheduling: {
          rule: 'Inspections must be scheduled within 14 days of payment',
          threshold: 14 * 24 * 60 * 60 * 1000, // 14 days
          severity: 'MEDIUM',
          category: 'REGULATORY',
        },
        certificateIssuance: {
          rule: 'Certificates must be issued within 7 days of approval',
          threshold: 7 * 24 * 60 * 60 * 1000, // 7 days
          severity: 'HIGH',
          category: 'REGULATORY',
        },
      },
    };
  }

  /**
   * Initialize monitoring configuration
   */
  initializeMonitoringConfig() {
    return {
      realTimeMonitoring: {
        enabled: true,
        checkInterval: 60000, // 1 minute
        batchSize: 100,
      },
      alerting: {
        enabled: true,
        channels: ['email', 'sms', 'dashboard'],
        escalationLevels: 3,
      },
      reporting: {
        enabled: true,
        schedules: {
          daily: '0 8 * * *', // 8 AM daily
          weekly: '0 8 * * 1', // 8 AM Monday
          monthly: '0 8 1 * *', // 8 AM 1st of month
        },
      },
    };
  }

  /**
   * Initialize alert thresholds
   */
  initializeAlertThresholds() {
    return {
      CRITICAL: {
        immediateAlert: true,
        escalationTime: 15 * 60 * 1000, // 15 minutes
        recipients: ['compliance_officer', 'system_admin', 'cto'],
      },
      HIGH: {
        immediateAlert: true,
        escalationTime: 60 * 60 * 1000, // 1 hour
        recipients: ['compliance_officer', 'system_admin'],
      },
      MEDIUM: {
        immediateAlert: false,
        escalationTime: 4 * 60 * 60 * 1000, // 4 hours
        recipients: ['compliance_officer'],
      },
      LOW: {
        immediateAlert: false,
        escalationTime: 24 * 60 * 60 * 1000, // 24 hours
        recipients: ['compliance_officer'],
      },
    };
  }

  /**
   * Start real-time compliance monitoring
   */
  async startMonitoring() {
    logger.info('[ComplianceMonitoring] Starting real-time compliance monitoring...');

    try {
      // Start event listeners for different compliance areas
      await this.setupEventListeners();

      // Start periodic compliance checks
      this.startPeriodicChecks();

      // Initialize compliance scoring
      await this.initializeComplianceScoring();

      // Start violation processing
      this.startViolationProcessing();

      logger.info('[ComplianceMonitoring] Real-time monitoring started successfully');

      this.emit('monitoring_started', {
        timestamp: new Date(),
        rules: Object.keys(this.complianceRules).length,
        monitors: this.activeMonitors.size,
      });
    } catch (error) {
      logger.error('[ComplianceMonitoring] Failed to start monitoring:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners for system activities
   */
  async setupEventListeners() {
    // Application workflow events
    this.on('application_submitted', this.checkApplicationCompliance.bind(this));
    this.on('application_approved', this.checkApprovalCompliance.bind(this));
    this.on('application_rejected', this.checkRejectionCompliance.bind(this));

    // Payment events
    this.on('payment_processed', this.checkPaymentCompliance.bind(this));
    this.on('payment_failed', this.checkPaymentFailureCompliance.bind(this));

    // Document events
    this.on('document_uploaded', this.checkDocumentCompliance.bind(this));
    this.on('document_accessed', this.checkDataAccessCompliance.bind(this));

    // Certificate events
    this.on('certificate_issued', this.checkCertificateCompliance.bind(this));
    this.on('certificate_revoked', this.checkRevocationCompliance.bind(this));

    // User management events
    this.on('user_role_changed', this.checkSecurityCompliance.bind(this));
    this.on('login_failed', this.checkLoginCompliance.bind(this));

    // System events
    this.on('data_exported', this.checkDataExportCompliance.bind(this));
    this.on('system_error', this.checkSystemCompliance.bind(this));
  }

  /**
   * Check application workflow compliance
   */
  async checkApplicationCompliance(eventData) {
    try {
      const { applicationId, _timestamp, actor } = eventData;

      // Check processing time compliance
      const application = await this.database.collection('applications').findOne({
        _id: applicationId,
      });

      if (application) {
        const submissionTime = new Date(application.submittedAt);
        const currentTime = new Date();
        const processingTime = currentTime - submissionTime;

        // Check if processing time exceeds regulatory limits
        const rule = this.complianceRules.regulatory.applicationProcessingTime;
        if (processingTime > rule.threshold) {
          await this.reportViolation({
            ruleId: 'application_processing_time',
            rule: rule.rule,
            severity: rule.severity,
            category: rule.category,
            entityType: 'application',
            entityId: applicationId,
            violationData: {
              processingTime: processingTime,
              threshold: rule.threshold,
              exceedsBy: processingTime - rule.threshold,
            },
            detectedAt: currentTime,
            actor,
          });
        }

        // Update compliance score
        await this.updateComplianceScore('application_workflow', applicationId);
      }
    } catch (error) {
      logger.error('[ComplianceMonitoring] Application compliance check failed:', error);
    }
  }

  /**
   * Check payment processing compliance
   */
  async checkPaymentCompliance(eventData) {
    try {
      const { paymentId, _timestamp, actor } = eventData;

      const payment = await this.database.collection('payments').findOne({
        _id: paymentId,
      });

      if (payment) {
        const receivedTime = new Date(payment.receivedAt);
        const processedTime = new Date(payment.processedAt);
        const processingDelay = processedTime - receivedTime;

        // Check payment processing time
        const rule = this.complianceRules.gacp.paymentProcessing;
        if (processingDelay > rule.threshold) {
          await this.reportViolation({
            ruleId: 'payment_processing_time',
            rule: rule.rule,
            severity: rule.severity,
            category: rule.category,
            entityType: 'payment',
            entityId: paymentId,
            violationData: {
              processingDelay: processingDelay,
              threshold: rule.threshold,
              exceedsBy: processingDelay - rule.threshold,
            },
            detectedAt: new Date(),
            actor,
          });
        }
      }
    } catch (error) {
      logger.error('[ComplianceMonitoring] Payment compliance check failed:', error);
    }
  }

  /**
   * Check data access compliance
   */
  async checkDataAccessCompliance(eventData) {
    try {
      const { userId, dataType, accessType, timestamp } = eventData;

      // Check if access to personal data is properly authorized
      if (dataType === 'personal_data') {
        const user = await this.database.collection('users').findOne({
          _id: userId,
        });

        if (user) {
          // Check if user has proper authorization for personal data access
          const hasAuthorization = await this.checkDataAccessAuthorization(
            user,
            dataType,
            accessType,
          );

          if (!hasAuthorization) {
            const rule = this.complianceRules.privacy.dataAccess;
            await this.reportViolation({
              ruleId: 'unauthorized_data_access',
              rule: rule.rule,
              severity: rule.severity,
              category: rule.category,
              entityType: 'data_access',
              entityId: `${userId}_${timestamp}`,
              violationData: {
                userId: userId,
                userRole: user.role,
                dataType: dataType,
                accessType: accessType,
                unauthorized: true,
              },
              detectedAt: new Date(),
              actor: { userId, role: user.role },
            });
          }
        }
      }
    } catch (error) {
      logger.error('[ComplianceMonitoring] Data access compliance check failed:', error);
    }
  }

  /**
   * Check certificate issuance compliance
   */
  async checkCertificateCompliance(eventData) {
    try {
      const { certificateId, applicationId, _timestamp, actor } = eventData;

      // Get application data
      const application = await this.database.collection('applications').findOne({
        _id: applicationId,
      });

      if (application) {
        // Check if certificate is issued with expired documents
        const hasExpiredDocuments = await this.checkDocumentExpiry(application.documents);

        if (hasExpiredDocuments) {
          const rule = this.complianceRules.gacp.certificateValidity;
          await this.reportViolation({
            ruleId: 'certificate_with_expired_docs',
            rule: rule.rule,
            severity: rule.severity,
            category: rule.category,
            entityType: 'certificate',
            entityId: certificateId,
            violationData: {
              certificateId: certificateId,
              applicationId: applicationId,
              expiredDocuments: hasExpiredDocuments,
            },
            detectedAt: new Date(),
            actor,
          });
        }

        // Check certificate issuance timeline
        const approvedTime = new Date(application.approvedAt);
        const issuedTime = new Date();
        const issuanceDelay = issuedTime - approvedTime;

        const rule = this.complianceRules.regulatory.certificateIssuance;
        if (issuanceDelay > rule.threshold) {
          await this.reportViolation({
            ruleId: 'certificate_issuance_delay',
            rule: rule.rule,
            severity: rule.severity,
            category: rule.category,
            entityType: 'certificate',
            entityId: certificateId,
            violationData: {
              issuanceDelay: issuanceDelay,
              threshold: rule.threshold,
              exceedsBy: issuanceDelay - rule.threshold,
            },
            detectedAt: new Date(),
            actor,
          });
        }
      }
    } catch (error) {
      logger.error('[ComplianceMonitoring] Certificate compliance check failed:', error);
    }
  }

  /**
   * Report compliance violation
   */
  async reportViolation(violationData) {
    try {
      logger.info(`[ComplianceMonitoring] Violation detected: ${violationData.ruleId}`);

      // Store violation in database
      const violation = {
        ...violationData,
        id: require('crypto').randomUUID(),
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.database.collection('compliance_violations').insertOne(violation);

      // Add to violation queue for processing
      this.violationQueue.push(violation);

      // Update metrics
      this.metrics.violationsDetected++;

      // Send immediate alert if required
      const threshold = this.alertThresholds[violation.severity];
      if (threshold.immediateAlert) {
        await this.sendComplianceAlert(violation);
      }

      // Log audit entry
      if (this.auditService) {
        await this.auditService.logAction(
          'COMPLIANCE_VIOLATION_DETECTED',
          violation.actor,
          violation.entityType,
          violation.entityId,
          {
            ruleId: violation.ruleId,
            severity: violation.severity,
            category: violation.category,
          },
        );
      }

      // Emit violation event
      this.emit('violation_detected', violation);
    } catch (error) {
      logger.error('[ComplianceMonitoring] Failed to report violation:', error);
    }
  }

  /**
   * Send compliance alert
   */
  async sendComplianceAlert(violation) {
    try {
      const threshold = this.alertThresholds[violation.severity];

      const alertData = {
        type: 'COMPLIANCE_VIOLATION',
        severity: violation.severity,
        title: `Compliance Violation: ${violation.ruleId}`,
        message: `Rule violated: ${violation.rule}`,
        violation: violation,
        recipients: threshold.recipients,
        channels: this.monitoringConfig.alerting.channels,
      };

      if (this.notificationService) {
        await this.notificationService.sendAlert(alertData);
      }

      this.metrics.alertsSent++;

      logger.info(`[ComplianceMonitoring] Alert sent for violation: ${violation.ruleId}`);
    } catch (error) {
      logger.error('[ComplianceMonitoring] Failed to send alert:', error);
    }
  }

  /**
   * Start periodic compliance checks
   */
  startPeriodicChecks() {
    const interval = this.monitoringConfig.realTimeMonitoring.checkInterval;

    this.periodicCheckInterval = setInterval(async () => {
      try {
        await this.runPeriodicChecks();
      } catch (error) {
        logger.error('[ComplianceMonitoring] Periodic check failed:', error);
      }
    }, interval);

    logger.info(`[ComplianceMonitoring] Periodic checks started (interval: ${interval}ms);`);
  }

  /**
   * Run periodic compliance checks
   */
  async runPeriodicChecks() {
    // Check document retention compliance
    await this.checkDocumentRetention();

    // Check data retention compliance
    await this.checkDataRetention();

    // Check processing timeline compliance
    await this.checkProcessingTimelines();

    // Update compliance scores
    await this.updateOverallComplianceScores();

    this.metrics.eventsProcessed++;
  }

  /**
   * Update compliance score for an entity
   */
  async updateComplianceScore(category, entityId) {
    try {
      // Calculate compliance score based on violations
      const violations = await this.database
        .collection('compliance_violations')
        .find({
          category: category,
          entityId: entityId,
          status: 'OPEN',
        })
        .toArray();

      const totalRules = Object.keys(this.complianceRules[category] || {}).length;
      const violationCount = violations.length;
      const complianceScore = Math.max(0, ((totalRules - violationCount) / totalRules) * 100);

      // Store compliance score
      this.complianceScores.set(`${category}_${entityId}`, {
        score: complianceScore,
        violations: violationCount,
        totalRules: totalRules,
        lastUpdated: new Date(),
      });

      // Store in database for persistence
      await this.database.collection('compliance_scores').updateOne(
        { category: category, entityId: entityId },
        {
          $set: {
            score: complianceScore,
            violations: violationCount,
            totalRules: totalRules,
            lastUpdated: new Date(),
          },
        },
        { upsert: true },
      );
    } catch (error) {
      logger.error('[ComplianceMonitoring] Failed to update compliance score:', error);
    }
  }

  /**
   * Generate compliance dashboard data
   */
  async getComplianceDashboard() {
    try {
      // Get recent violations
      const recentViolations = await this.database
        .collection('compliance_violations')
        .find({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();

      // Get compliance scores by category
      const complianceScores = await this.database
        .collection('compliance_scores')
        .find({})
        .toArray();

      // Calculate overall compliance score
      const overallScore =
        complianceScores.length > 0
          ? complianceScores.reduce((sum, score) => sum + score.score, 0) / complianceScores.length
          : 0;

      // Get violation trends
      const violationTrends = await this.getViolationTrends();

      return {
        summary: {
          overallComplianceScore: Math.round(overallScore),
          totalViolations: await this.database.collection('compliance_violations').countDocuments(),
          openViolations: await this.database
            .collection('compliance_violations')
            .countDocuments({ status: 'OPEN' }),
          criticalViolations: await this.database
            .collection('compliance_violations')
            .countDocuments({
              status: 'OPEN',
              severity: 'CRITICAL',
            }),
        },
        recentViolations: recentViolations,
        complianceScores: complianceScores,
        violationTrends: violationTrends,
        metrics: this.metrics,
        lastUpdated: new Date(),
      };
    } catch (error) {
      logger.error('[ComplianceMonitoring] Failed to generate dashboard:', error);
      throw error;
    }
  }

  /**
   * Get violation trends for analytics
   */
  async getViolationTrends() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const trends = await this.database
        .collection('compliance_violations')
        .aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                category: '$category',
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.date': 1 } },
        ])
        .toArray();

      return trends;
    } catch (error) {
      logger.error('[ComplianceMonitoring] Failed to get violation trends:', error);
      return [];
    }
  }

  /**
   * Helper methods
   */
  async checkDataAccessAuthorization(user, dataType, _accessType) {
    // Implementation of data access authorization check
    const authorizedRoles = {
      personal_data: ['admin', 'compliance_officer', 'dtam_staff'],
      financial_data: ['admin', 'finance_officer', 'dtam_staff'],
      application_data: ['admin', 'dtam_staff', 'qc_inspector'],
    };

    return authorizedRoles[dataType]?.includes(user.role) || false;
  }

  async checkDocumentExpiry(documents) {
    if (!documents || documents.length === 0) {
      return false;
    }

    const currentTime = new Date();
    return documents.some(doc => {
      return doc.expiryDate && new Date(doc.expiryDate) < currentTime;
    });
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.periodicCheckInterval) {
      clearInterval(this.periodicCheckInterval);
    }

    this.removeAllListeners();
    this.activeMonitors.clear();

    logger.info('[ComplianceMonitoring] Monitoring stopped');
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus() {
    return {
      isActive: !!this.periodicCheckInterval,
      activeMonitors: this.activeMonitors.size,
      metrics: this.metrics,
      queueSize: this.violationQueue.length,
      complianceScores: this.complianceScores.size,
    };
  }

  /**
   * Alias for checkApplicationCompliance for backward compatibility
   */
  async checkCompliance(eventData) {
    return await this.checkApplicationCompliance(eventData);
  }

  /**
   * Detect violation based on compliance rules
   */
  async detectViolation(eventData, rule) {
    const violation = {
      id: require('crypto').randomUUID(),
      type: rule.category,
      severity: rule.severity,
      rule: rule.rule,
      eventData: eventData,
      timestamp: new Date(),
    };

    await this.reportViolation(violation);
    return violation;
  }

  /**
   * Get compliance score for entity
   */
  getComplianceScore(entityId, category = null) {
    const key = category ? `${entityId}:${category}` : entityId;
    return this.complianceScores.get(key) || 100; // Default perfect score
  }
}

module.exports = ComplianceMonitoringSystem;
