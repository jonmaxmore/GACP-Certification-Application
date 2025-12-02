/**
 * GACP Business Logic Routes
 * Main routing handler for GACP certification workflow
 *
 * Features:
 * - Complete GACP application lifecycle management
 * - Real-time workflow state transitions
 * - Payment processing integration
 * - Document review and approval workflow
 * - Farm inspection scheduling and management
 * - Certificate generation and delivery
 * - Status tracking and notifications
 * - Analytics and reporting
 *
 * @author GACP Platform Team
 * @version 2.0.0
 * @date 2025-10-20
 * @compliance Thai-FDA-GACP-2018
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');

// Import core business logic
const {
  GACPWorkflowEngine,
} = require('../modules/application-workflow/domain/gacp-workflow-engine');

// Import GACP Business Logic Models
const {
  GACPApplicationStatus,
  GACPCriticalControlPoints,
  GACPScoringSystem,
  GACPComplianceFramework,
  getWorkflowSteps,
  getCCPList,
  calculateTotalScore,
  getCertificateLevel,
  validateCCPScores,
} = require('../models/gacp-business-logic');

// Initialize workflow engine
const workflowEngine = new GACPWorkflowEngine();

/**
 * GET /api/gacp/workflow
 * Get complete GACP workflow information
 */
router.get('/workflow', async (req, res) => {
  try {
    const workflowGraph = workflowEngine.getWorkflowGraph();
    const workflowSteps = getWorkflowSteps();

    res.json({
      success: true,
      data: {
        framework: 'Thai FDA GACP Certification Process (2018)',
        workflowStates: workflowSteps.length,
        transitions: workflowGraph.edges.length,
        compliance: [
          'WHO-GACP',
          'Thai-FDA-GACP-2018',
          'ASEAN-TM-Guidelines',
          'FAO-Agricultural-Practices',
        ],
        states: workflowSteps,
        stateDefinitions: Object.keys(GACPApplicationStatus).map(key => ({
          key,
          value: GACPApplicationStatus[key],
          description: getStatusDescription(GACPApplicationStatus[key]),
        })),
        workflowGraph: workflowGraph,
        businessRules: {
          minimumPassingScore: GACPScoringSystem.OVERALL_PASSING_SCORE,
          certificateLevels: GACPScoringSystem.CERTIFICATE_LEVELS,
          riskLevels: GACPScoringSystem.RISK_LEVELS,
        },
      },
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalStates: workflowSteps.length,
        totalTransitions: workflowGraph.edges.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve workflow information',
      message: error.message,
      code: 'GACP_WORKFLOW_ERROR',
    });
  }
});

/**
 * GET /api/gacp/ccps
 * Get Critical Control Points framework
 */
router.get('/ccps', async (req, res) => {
  try {
    const ccpList = getCCPList();
    const ccpDetails = Object.entries(GACPCriticalControlPoints).map(([key, ccp]) => ({
      id: key,
      ...ccp,
      weightPercentage: `${ccp.weight}%`,
      minScorePercentage: `${ccp.min_score}%`,
    }));

    res.json({
      success: true,
      data: {
        framework: '8 Critical Control Points for Medicinal Plants',
        methodology: 'HACCP-based Assessment',
        totalCCPs: ccpList.length,
        totalWeight: ccpDetails.reduce((sum, ccp) => sum + ccp.weight, 0),
        ccps: ccpDetails,
        scoringSystem: {
          totalMaxScore: GACPScoringSystem.TOTAL_SCORE_MAX,
          passingScore: GACPScoringSystem.OVERALL_PASSING_SCORE,
          certificateLevels: GACPScoringSystem.CERTIFICATE_LEVELS,
        },
        complianceRequirements: GACPComplianceFramework.REQUIRED_DOCUMENTS,
      },
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        ccpCount: ccpList.length,
        methodology: 'HACCP-adapted-for-medicinal-plants',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve CCP framework',
      message: error.message,
      code: 'GACP_CCP_ERROR',
    });
  }
});

/**
 * POST /api/gacp/test/score-calculation
 * Test score calculation logic
 */
router.post('/test/score-calculation', async (req, res) => {
  try {
    const { scores } = req.body;

    if (!scores || typeof scores !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid input: scores object required',
        code: 'INVALID_INPUT',
      });
    }

    // Calculate total score
    const totalScore = calculateTotalScore(scores);

    // Get certificate level
    const certificateLevel = getCertificateLevel(totalScore);

    // Validate CCP scores
    const violations = validateCCPScores(scores);

    // Calculate individual CCP contributions
    const ccpContributions = Object.entries(scores)
      .map(([ccpKey, score]) => {
        const ccp = GACPCriticalControlPoints[ccpKey];
        if (!ccp) {
          return null;
        }

        return {
          ccp: ccpKey,
          name: ccp.name,
          name_th: ccp.name_th,
          score: score,
          weight: ccp.weight,
          weightedScore: (score * ccp.weight) / 100,
          minScore: ccp.min_score,
          passed: score >= ccp.min_score,
        };
      })
      .filter(Boolean);

    const result = {
      totalScore: Math.round(totalScore * 100) / 100,
      certificateLevel,
      ccpContributions,
      violations,
      passed: totalScore >= GACPScoringSystem.OVERALL_PASSING_SCORE && violations.length === 0,
      calculation: {
        method: 'weighted-average',
        formula: 'Σ(CCP_Score × CCP_Weight) / Σ(CCP_Weight)',
        totalWeight: ccpContributions.reduce((sum, ccp) => sum + ccp.weight, 0),
      },
    };

    res.json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        inputScores: scores,
        calculationMethod: 'GACP-weighted-scoring-system',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Score calculation failed',
      message: error.message,
      code: 'SCORE_CALCULATION_ERROR',
    });
  }
});

/**
 * GET /api/gacp/workflow/:state/requirements
 * Get requirements for a specific workflow state
 */
router.get('/workflow/:state/requirements', async (req, res) => {
  try {
    const { state } = req.params;

    if (!GACPApplicationStatus[state.toUpperCase()]) {
      return res.status(404).json({
        success: false,
        error: 'Invalid workflow state',
        code: 'INVALID_STATE',
      });
    }

    const stateValue = GACPApplicationStatus[state.toUpperCase()];
    const requirements = workflowEngine.getStateRequirements(stateValue);

    if (!requirements) {
      return res.status(404).json({
        success: false,
        error: 'Requirements not found for this state',
        code: 'REQUIREMENTS_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: {
        state: stateValue,
        stateName: state.toUpperCase(),
        description: getStatusDescription(stateValue),
        ...requirements,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestedState: state,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve state requirements',
      message: error.message,
      code: 'STATE_REQUIREMENTS_ERROR',
    });
  }
});

/**
 * POST /api/gacp/workflow/transition
 * Test workflow state transition
 */
router.post('/workflow/transition', async (req, res) => {
  try {
    const { currentState, targetState, context, actor } = req.body;

    if (!currentState || !targetState) {
      return res.status(400).json({
        success: false,
        error: 'currentState and targetState are required',
        code: 'MISSING_PARAMETERS',
      });
    }

    const result = await workflowEngine.transitionTo(
      currentState,
      targetState,
      context || {},
      actor || { role: 'system' },
    );

    res.json({
      success: result.success,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        transition: `${currentState} → ${targetState}`,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Workflow transition failed',
      message: error.message,
      code: 'WORKFLOW_TRANSITION_ERROR',
    });
  }
});

/**
 * GET /api/gacp/compliance
 * Get compliance framework information
 */
router.get('/compliance', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        framework: 'GACP Compliance Framework',
        regulations: GACPComplianceFramework.THAI_REGULATIONS,
        internationalStandards: GACPComplianceFramework.INTERNATIONAL_STANDARDS,
        requiredDocuments: GACPComplianceFramework.REQUIRED_DOCUMENTS,
        documentCategories: {
          legal: ['Land ownership or lease agreement', 'Business registration documents'],
          technical: [
            'Soil analysis report',
            'Water quality test results',
            'Seed/planting material certificates',
          ],
          operational: [
            'Pesticide usage records',
            'Harvesting and processing records',
            'Staff training certificates',
          ],
          quality: ['Internal audit reports', 'Quality control procedures'],
        },
      },
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalDocuments: GACPComplianceFramework.REQUIRED_DOCUMENTS.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve compliance information',
      message: error.message,
      code: 'COMPLIANCE_ERROR',
    });
  }
});

/**
 * Helper function to get status description
 */
function getStatusDescription(status) {
  const descriptions = {
    draft: 'ร่าง - เกษตรกรเริ่มกรอกข้อมูล',
    submitted: 'ยื่นแล้ว - ส่งให้ DTAM ตรวจสอบ',
    under_review: 'กำลังตรวจสอบ - DTAM ตรวจสอบเอกสาร',
    document_incomplete: 'เอกสารไม่ครบ - ต้องแก้ไขเพิ่มเติม',
    document_approved: 'เอกสารผ่าน - พร้อมตรวจประเมิน',
    inspection_scheduled: 'กำหนดวันตรวจ - นัดหมายผู้ตรวจ',
    inspection_in_progress: 'กำลังตรวจ - ผู้ตรวจอยู่ในพื้นที่',
    inspection_completed: 'ตรวจเสร็จ - ผู้ตรวจส่งรายงาน',
    inspection_passed: 'ผ่านการตรวจ - คะแนนเกินเกณฑ์',
    inspection_failed: 'ไม่ผ่านการตรวจ - ต้องแก้ไข',
    corrective_action_required: 'ต้องแก้ไข - ภายใน 90 วัน',
    approved: 'อนุมัติ - ได้รับใบรับรอง GACP',
    rejected: 'ปฏิเสธ - ไม่ผ่านเกณฑ์',
    certificate_issued: 'ออกใบรับรอง - ใช้ได้ 3 ปี',
    certificate_suspended: 'ระงับใบรับรอง - ชั่วคราว',
    certificate_revoked: 'เพิกถอนใบรับรอง - ถาวร',
    certificate_expired: 'หมดอายุ - ต้องต่ออายุ',
  };

  return descriptions[status] || status;
}

module.exports = router;
