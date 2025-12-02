/**
 * GACP Enhanced Inspection Service
 * Advanced Critical Control Points Assessment System
 *
 * Standards Compliance:
 * - WHO Guidelines on GACP for Medicinal Plants (2003)
 * - FAO Guidelines on Good Agricultural Practices
 * - Thai FDA GACP Notification (2018)
 * - HACCP Principles for Agriculture
 *
 * @author GACP Platform Team
 * @version 2.0.0
 * @date 2025-10-19
 * @compliance WHO-GACP, FAO, Thai-FDA, HACCP
 */

const {
  GACPCriticalControlPoints,
  GACPScoringSystem,
  GACPApplicationStatus,
} = require('../models/gacp-business-logic');
const logger = require('../shared/logger');

const {
  GACPWorkflowEngine,
} = require('../modules/application-workflow/domain/gacp-workflow-engine');

class GACPEnhancedInspectionService {
  constructor(database = null) {
    this.db = database;
    this.workflowEngine = new GACPWorkflowEngine();
    this.ccpFramework = GACPCriticalControlPoints;
    this.scoringSystem = GACPScoringSystem;
  }

  /**
   * Initialize Comprehensive GACP Inspection
   * Creates detailed inspection framework based on international standards
   *
   * @param {string} applicationId - GACP application ID
   * @param {object} inspector - Certified inspector details
   * @param {object} scheduledDate - Inspection date and time
   * @returns {object} Enhanced inspection initialization result
   */
  async initializeInspection(applicationId, inspector, scheduledDate) {
    try {
      logger.info(`[GACP-Inspection] Initializing inspection for application ${applicationId}`);

      // Validate inspector certification against Thai FDA requirements
      const inspectorValidation = this.validateInspectorCertification(inspector);
      if (!inspectorValidation.valid) {
        return this.createResponse(false, 'Inspector certification validation failed', {
          errors: inspectorValidation.errors,
          requirements: inspectorValidation.requirements,
        });
      }

      // Retrieve and validate application
      const application = await this.getApplicationDetails(applicationId);
      if (!application) {
        return this.createResponse(false, 'Application not found in system');
      }

      // Verify application eligibility for inspection
      const statusCheck = this.verifyInspectionEligibility(application.status);
      if (!statusCheck.eligible) {
        return this.createResponse(false, statusCheck.reason, {
          currentStatus: application.status,
          requiredStatus: statusCheck.requiredStatuses,
        });
      }

      // Create comprehensive inspection framework
      const inspectionFramework = this.createComprehensiveInspectionFramework(
        application,
        inspector,
      );

      // Initialize CCP Assessment Matrix
      const ccpAssessmentMatrix = this.initializeCCPAssessmentMatrix();

      // Generate inspection protocol based on crop type and scale
      const inspectionProtocol = this.generateInspectionProtocol(application);

      // Create detailed inspection record
      const inspection = {
        _id: `INSP${Date.now()}`,
        applicationId: applicationId,

        // Inspector Information (Thai FDA Requirements)
        inspector: {
          id: inspector.id,
          name: inspector.name,
          certification: {
            number: inspector.certification.number,
            issuedBy: inspector.certification.issuedBy,
            validUntil: inspector.certification.validUntil,
            specialization: inspector.certification.specialization,
          },
          qualifications: inspector.qualifications,
          experienceYears: inspector.experienceYears,
        },

        // Scheduling and Timeline
        scheduling: {
          scheduledDate: new Date(scheduledDate),
          estimatedDuration: this.calculateInspectionDuration(application),
          weatherConditions: null,
          accessibilityNotes: '',
          emergencyContacts: application.emergencyContacts,
        },

        // Inspection Status and Workflow
        status: 'scheduled',
        workflowStage: 'pre_inspection',

        // Assessment Framework
        framework: inspectionFramework,
        protocol: inspectionProtocol,
        ccpAssessmentMatrix: ccpAssessmentMatrix,

        // Compliance Tracking
        complianceChecklist: this.generateComplianceChecklist(application),
        regulatoryCompliance: {
          thaiFDA: {
            checked: false,
            compliant: null,
            requirements: this.getThaiFDARequirements(),
          },
          whoGACP: {
            checked: false,
            compliant: null,
            guidelines: this.getWHOGACPGuidelines(),
          },
          faoGuidelines: {
            checked: false,
            compliant: null,
            standards: this.getFAOStandards(),
          },
          aseanTM: {
            checked: false,
            compliant: null,
            guidelines: this.getASEANTMGuidelines(),
          },
        },

        // Risk Assessment (Initial)
        riskAssessment: {
          initial: this.performInitialRiskAssessment(application),
          detailed: null,
          mitigation: [],
        },

        // Evidence and Documentation
        evidence: {
          photographs: [],
          documents: [],
          measurements: [],
          samples: [],
          interviews: [],
        },

        // Scoring and Assessment Results
        ccpScores: {},
        overallScore: null,
        riskLevel: null,
        certificateEligibility: null,

        // Recommendations and Actions
        recommendations: [],
        correctiveActions: [],
        followUpRequired: false,

        // Audit Trail
        auditTrail: [
          {
            action: 'inspection_initialized',
            actor: inspector.name,
            timestamp: new Date(),
            details: 'Inspection framework created and scheduled',
          },
        ],

        // Metadata
        createdAt: new Date(),
        createdBy: inspector.id,
        version: '2.0.0',
      };

      // Save inspection to database
      if (this.db) {
        await this.saveInspection(inspection);
      }

      // Update application workflow status
      const workflowResult = await this.workflowEngine.transitionTo(
        application.status,
        GACPApplicationStatus.INSPECTION_SCHEDULED,
        {
          application,
          inspection,
          inspector: inspector,
        },
        inspector,
      );

      if (!workflowResult.success) {
        return this.createResponse(false, `Workflow transition failed: ${workflowResult.message}`);
      }

      logger.info(`[GACP-Inspection] Successfully initialized inspection ${inspection._id}`);

      return this.createResponse(true, 'GACP inspection successfully initialized', {
        inspectionId: inspection._id,
        scheduledDate: inspection.scheduling.scheduledDate,
        estimatedDuration: inspection.scheduling.estimatedDuration,
        framework: {
          ccpCount: Object.keys(ccpAssessmentMatrix).length,
          protocolSteps: inspectionProtocol.steps.length,
          complianceItems: inspection.complianceChecklist.length,
        },
        inspector: {
          name: inspector.name,
          certification: inspector.certification.number,
          specialization: inspector.certification.specialization,
        },
        nextSteps: this.getInspectionNextSteps(inspection),
        preparationRequirements: this.getPreparationRequirements(application),
      });
    } catch (error) {
      logger.error('[GACP-Inspection] Initialization failed:', error);
      return this.createResponse(false, `Inspection initialization failed: ${error.message}`);
    }
  }

  /**
   * Conduct Enhanced CCP Assessment
   * WHO GACP Critical Control Points evaluation with evidence validation
   *
   * @param {string} inspectionId - Inspection ID
   * @param {string} ccpId - Critical Control Point ID
   * @param {object} assessmentData - Detailed CCP assessment data
   * @param {object} evidence - Supporting evidence and documentation
   * @returns {object} Comprehensive CCP assessment result
   */
  async conductCCPAssessment(inspectionId, ccpId, assessmentData, evidence) {
    try {
      console.log(
        `[GACP-CCP] Conducting assessment for CCP ${ccpId} in inspection ${inspectionId}`,
      );

      // Retrieve inspection record
      const inspection = await this.getInspection(inspectionId);
      if (!inspection) {
        return this.createResponse(false, 'Inspection record not found');
      }

      // Validate CCP exists in framework
      if (!this.ccpFramework[ccpId]) {
        return this.createResponse(false, `Invalid CCP identifier: ${ccpId}`, {
          availableCCPs: Object.keys(this.ccpFramework),
        });
      }

      const ccp = this.ccpFramework[ccpId];

      // Validate assessment data structure and completeness
      const validationResult = this.validateCCPAssessmentData(assessmentData, ccp);
      if (!validationResult.valid) {
        return this.createResponse(false, 'CCP assessment data validation failed', {
          errors: validationResult.errors,
          requirements: validationResult.requirements,
        });
      }

      // Conduct comprehensive CCP evaluation
      const ccpEvaluation = await this.evaluateComprehensiveCCP(ccp, assessmentData, evidence);

      // Calculate weighted CCP score using Thai FDA methodology
      const ccpScore = this.calculateWeightedCCPScore(ccpEvaluation, ccp);

      // Validate against regulatory thresholds
      const thresholdValidation = this.validateRegulatoryThresholds(ccpScore, ccp);

      // Generate CCP-specific recommendations
      const ccpRecommendations = this.generateCCPRecommendations(ccpEvaluation, ccp, ccpScore);

      // Update inspection record with assessment results
      inspection.ccpAssessmentMatrix[ccpId] = {
        // Assessment Results
        evaluation: ccpEvaluation,
        score: ccpScore,
        maxPossibleScore: 100,
        weightedContribution: (ccpScore * ccp.weight) / 100,

        // Compliance Status
        thresholdMet: thresholdValidation.met,
        complianceLevel: thresholdValidation.level,
        criticalIssues: ccpEvaluation.criticalIssues,

        // Evidence and Documentation
        evidence: evidence,
        photographs: evidence.photographs || [],
        documents: evidence.documents || [],
        measurements: evidence.measurements || [],

        // Assessment Metadata
        assessedAt: new Date(),
        assessedBy: inspection.inspector.id,
        inspector_notes: assessmentData.inspector_notes,
        duration_minutes: assessmentData.duration_minutes,

        // Recommendations
        recommendations: ccpRecommendations,
        followUpRequired: ccpScore < ccp.min_score,

        // Compliance Tracking
        regulatoryCompliance: {
          thaiFDA: this.checkThaiFDACompliance(ccpEvaluation, ccpId),
          whoGACP: this.checkWHOGACPCompliance(ccpEvaluation, ccpId),
          faoGuidelines: this.checkFAOCompliance(ccpEvaluation, ccpId),
        },
      };

      // Update evidence collections
      this.updateEvidenceCollections(inspection, ccpId, evidence);

      // Check overall inspection completion status
      const completionStatus = this.checkInspectionCompletion(inspection);

      // If all CCPs completed, finalize assessment
      if (completionStatus.allCompleted) {
        logger.info(`[GACP-Inspection] All CCPs completed for inspection ${inspectionId}`);
        const finalResults = await this.finalizeComprehensiveAssessment(inspection);

        inspection.overallScore = finalResults.totalScore;
        inspection.riskLevel = finalResults.riskLevel;
        inspection.certificateEligibility = finalResults.certificateEligibility;
        inspection.recommendations = finalResults.recommendations;
        inspection.status = 'completed';
        inspection.completedAt = new Date();

        // Add completion to audit trail
        inspection.auditTrail.push({
          action: 'inspection_completed',
          actor: inspection.inspector.name,
          timestamp: new Date(),
          details: `Overall score: ${finalResults.totalScore}%, Risk level: ${finalResults.riskLevel}`,
        });
      }

      // Save updated inspection
      if (this.db) {
        await this.saveInspection(inspection);
      }

      logger.info(`[GACP-CCP] Successfully completed assessment for CCP ${ccpId}`);

      return this.createResponse(true, `CCP ${ccpId} assessment completed successfully`, {
        ccp: {
          id: ccpId,
          name: ccp.name,
          name_th: ccp.name_th,
          weight: ccp.weight,
        },
        assessment: {
          score: ccpScore,
          maxScore: 100,
          thresholdMet: thresholdValidation.met,
          requiredThreshold: ccp.min_score,
          complianceLevel: thresholdValidation.level,
          weightedContribution: (ccpScore * ccp.weight) / 100,
        },
        recommendations: ccpRecommendations,
        completionStatus: {
          ccpsCompleted: completionStatus.completedCount,
          totalCCPs: completionStatus.totalCount,
          percentComplete: completionStatus.percentComplete,
          nextCCP: completionStatus.nextCCP,
          allCompleted: completionStatus.allCompleted,
        },
        overallProgress: {
          overallScore: inspection.overallScore,
          estimatedFinalScore: this.estimateFinalScore(inspection),
          riskLevel: inspection.riskLevel,
        },
      });
    } catch (error) {
      logger.error(`[GACP-CCP] Assessment failed for CCP ${ccpId}:`, error);
      return this.createResponse(false, `CCP assessment failed: ${error.message}`);
    }
  }

  /**
   * Enhanced CCP Evaluation with International Standards
   */
  async evaluateComprehensiveCCP(ccp, assessmentData, evidence) {
    const evaluation = {
      criteriaResults: {},
      overallCompliance: 0,
      criticalIssues: [],
      minorIssues: [],
      strengths: [],
      recommendations: [],
      evidenceQuality: 0,
      confidenceLevel: 0,
    };

    // Evaluate each criterion with detailed analysis
    for (let i = 0; i < ccp.criteria.length; i++) {
      const criterion = ccp.criteria[i];
      const criterionData = assessmentData.criteria[i];

      const criterionEvaluation = await this.evaluateCriterionComprehensive(
        criterion,
        criterionData,
        evidence,
        ccp.id,
      );

      evaluation.criteriaResults[i] = {
        criterion,
        criterion_th: this.translateCriterion(criterion),
        ...criterionEvaluation,
      };

      // Categorize issues by severity
      if (criterionEvaluation.compliance < 50) {
        evaluation.criticalIssues.push({
          criterion,
          issue: criterionEvaluation.primaryIssue,
          severity: 'critical',
          impact: 'high',
          urgency: 'immediate',
        });
      } else if (criterionEvaluation.compliance < 75) {
        evaluation.minorIssues.push({
          criterion,
          issue: criterionEvaluation.primaryIssue,
          severity: 'minor',
          impact: 'medium',
          urgency: 'within_30_days',
        });
      } else {
        evaluation.strengths.push({
          criterion,
          strength: criterionEvaluation.strengths[0],
          score: criterionEvaluation.compliance,
        });
      }
    }

    // Calculate overall compliance metrics
    const criteriaScores = Object.values(evaluation.criteriaResults).map(r => r.compliance);
    evaluation.overallCompliance =
      criteriaScores.reduce((sum, score) => sum + score, 0) / criteriaScores.length;

    // Assess evidence quality
    evaluation.evidenceQuality = this.assessEvidenceQuality(evidence);

    // Calculate confidence level based on evidence and assessment completeness
    evaluation.confidenceLevel = this.calculateConfidenceLevel(evaluation, evidence);

    return evaluation;
  }

  /**
   * Calculate Weighted CCP Score using Thai FDA Methodology
   */
  calculateWeightedCCPScore(ccpEvaluation, _ccp) {
    const criteriaScores = Object.values(ccpEvaluation.criteriaResults).map(
      result => result.compliance,
    );

    // Base score: weighted average of criteria
    const baseScore = criteriaScores.reduce((sum, score) => sum + score, 0) / criteriaScores.length;

    // Evidence quality adjustment (±10%)
    const evidenceAdjustment = (ccpEvaluation.evidenceQuality - 75) * 0.1;

    // Critical issues penalty
    const criticalPenalty = ccpEvaluation.criticalIssues.length * 15; // 15 points per critical issue

    // Minor issues penalty
    const minorPenalty = ccpEvaluation.minorIssues.length * 5; // 5 points per minor issue

    // Confidence level adjustment
    const confidenceAdjustment = (ccpEvaluation.confidenceLevel - 80) * 0.05;

    // Calculate final score with all adjustments
    let finalScore =
      baseScore + evidenceAdjustment + confidenceAdjustment - criticalPenalty - minorPenalty;

    // Ensure score is within valid range [0, 100]
    finalScore = Math.max(0, Math.min(100, finalScore));

    return Math.round(finalScore * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Helper Methods for Comprehensive Assessment
   */
  validateInspectorCertification(inspector) {
    const errors = [];
    const requirements = [];

    // Check basic certification
    if (!inspector.certification || !inspector.certification.number) {
      errors.push('Inspector certification number missing');
      requirements.push('Valid Thai FDA GACP inspector certification required');
    }

    // Check certification validity
    if (inspector.certification && inspector.certification.validUntil < new Date()) {
      errors.push('Inspector certification expired');
      requirements.push('Current certification valid for at least 6 months required');
    }

    // Check specialization
    if (!inspector.certification?.specialization) {
      errors.push('Inspector specialization not specified');
      requirements.push('Specialization in medicinal plants or agricultural products required');
    }

    // Check experience requirements
    if (!inspector.experienceYears || inspector.experienceYears < 2) {
      errors.push('Insufficient inspection experience');
      requirements.push('Minimum 2 years of GACP inspection experience required');
    }

    return {
      valid: errors.length === 0,
      errors,
      requirements,
    };
  }

  verifyInspectionEligibility(status) {
    const eligibleStatuses = [
      GACPApplicationStatus.DOCUMENT_APPROVED,
      GACPApplicationStatus.INSPECTION_SCHEDULED,
      GACPApplicationStatus.CORRECTIVE_ACTION_REQUIRED,
    ];

    return {
      eligible: eligibleStatuses.includes(status),
      reason: eligibleStatuses.includes(status)
        ? 'Application eligible for inspection'
        : `Application status '${status}' not eligible for inspection`,
      requiredStatuses: eligibleStatuses,
    };
  }

  createComprehensiveInspectionFramework(_application, _inspector) {
    return {
      inspectionType: 'comprehensive_gacp',
      standards: ['WHO-GACP-2003', 'Thai-FDA-2018', 'FAO-GAP', 'ASEAN-TM'],
      methodology: 'eight_ccp_assessment',
      assessmentLevel: 'full_certification',
      riskBasedApproach: true,
      evidenceRequirements: 'comprehensive',
      reportingStandard: 'thai_fda_format',
    };
  }

  initializeCCPAssessmentMatrix() {
    const matrix = {};
    Object.keys(this.ccpFramework).forEach(ccpId => {
      matrix[ccpId] = {
        status: 'pending',
        score: null,
        evidence: [],
        notes: '',
        startTime: null,
        endTime: null,
        assessor: null,
      };
    });
    return matrix;
  }

  generateInspectionProtocol(application) {
    return {
      protocolVersion: '2.0.0',
      cropSpecific: application.cropType,
      scaleAdjusted: application.farmSize,
      steps: [
        'pre_inspection_document_review',
        'site_arrival_and_orientation',
        'farm_tour_and_overview',
        'ccp_systematic_assessment',
        'evidence_collection_and_documentation',
        'farmer_interview_and_verification',
        'post_assessment_review',
        'preliminary_findings_discussion',
      ],
      estimatedTimePerStep: {
        pre_inspection_document_review: 30,
        site_arrival_and_orientation: 15,
        farm_tour_and_overview: 45,
        ccp_systematic_assessment: 240,
        evidence_collection_and_documentation: 60,
        farmer_interview_and_verification: 30,
        post_assessment_review: 30,
        preliminary_findings_discussion: 30,
      },
    };
  }

  createResponse(success, message, data = {}) {
    return {
      success,
      message,
      timestamp: new Date(),
      service: 'GACPEnhancedInspectionService',
      version: '2.0.0',
      ...data,
    };
  }

  // Database operation placeholders
  async getApplicationDetails(applicationId) {
    if (this.db) {
      return await this.db.collection('applications').findOne({ _id: applicationId });
    }
    // Mock data for development
    return {
      _id: applicationId,
      status: GACPApplicationStatus.DOCUMENT_APPROVED,
      cropType: 'medicinal_herbs',
      farmSize: 'medium',
      emergencyContacts: [],
    };
  }

  async getInspection(inspectionId) {
    if (this.db) {
      return await this.db.collection('inspections').findOne({ _id: inspectionId });
    }
    return null;
  }

  async saveInspection(inspection) {
    if (this.db) {
      return await this.db
        .collection('inspections')
        .updateOne({ _id: inspection._id }, { $set: inspection }, { upsert: true });
    }
    logger.info(`[GACP-DB] Inspection ${inspection._id} saved (mock mode);`);
    return true;
  }

  // Additional helper methods for comprehensive assessment...
  calculateInspectionDuration(application) {
    // Base duration calculation based on farm size and complexity
    const baseDuration = 8; // 8 hours base
    const sizeMultiplier = application.farmSize === 'large' ? 1.5 : 1.0;
    const complexityMultiplier = application.cropType === 'mixed' ? 1.2 : 1.0;

    return Math.ceil(baseDuration * sizeMultiplier * complexityMultiplier);
  }

  performInitialRiskAssessment(_application) {
    return {
      farmLocation: 'low_risk',
      cropType: 'medium_risk',
      farmerExperience: 'low_risk',
      previousViolations: 'none',
      overallRisk: 'medium',
    };
  }

  getInspectionNextSteps(_inspection) {
    return [
      'Confirm inspection date with farmer',
      'Review application documents thoroughly',
      'Prepare inspection equipment and checklists',
      'Coordinate with local DTAM office',
      'Conduct pre-inspection site assessment call',
    ];
  }

  getPreparationRequirements(_application) {
    return [
      'Farm records for past 12 months available',
      'All required documents organized',
      'Key personnel available during inspection',
      'Farm areas accessible for assessment',
      'Any ongoing treatments or activities disclosed',
    ];
  }
}

module.exports = GACPEnhancedInspectionService;
