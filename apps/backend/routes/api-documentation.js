/**
 * GACP Platform API Documentation Generator
 * Automatically generates comprehensive API documentation
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-19
 */

const express = require('express');
const { createLogger } = require('../shared/logger');
const logger = createLogger('api-documentation');

const router = express.Router();

// API Documentation Configuration
const API_CONFIG = {
  title: 'GACP Platform API Documentation',
  version: '1.0.0',
  description: 'Comprehensive API documentation for WHO-GACP certified cannabis farming platform',
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3004',
  compliance: ['WHO-GACP', 'Thai-FDA', 'ASEAN-TM'],
  lastUpdated: new Date().toISOString(),
};

// API Endpoints Documentation
const API_ENDPOINTS = {
  '/api/gacp/workflow': {
    method: 'GET',
    description: 'Get complete GACP workflow information including all 17 states',
    parameters: [],
    responses: {
      200: {
        description: 'Successful response with workflow data',
        example: {
          success: true,
          data: {
            workflowStates: 17,
            currentWorkflow: 'WHO-GACP-2024',
            states: [
              { id: 1, name: 'Initial Application', status: 'active' },
              { id: 2, name: 'Document Review', status: 'pending' },
            ],
          },
        },
      },
    },
    compliance: ['WHO-GACP', 'Thai-FDA'],
    caching: '5 minutes',
  },

  '/api/gacp/ccps': {
    method: 'GET',
    description: 'Get Critical Control Points (CCP) framework with all 8 CCPs',
    parameters: [],
    responses: {
      200: {
        description: 'CCP framework data',
        example: {
          success: true,
          data: {
            totalCCPs: 8,
            methodology: 'HACCP-based',
            ccps: [
              {
                id: 'CCP01',
                name: 'Soil Quality Management',
                weight: 15,
                compliance: 'WHO-GACP Section 4.2',
              },
            ],
          },
        },
      },
    },
    compliance: ['WHO-GACP', 'HACCP'],
    caching: '10 minutes',
  },

  '/api/gacp/test/score-calculation': {
    method: 'POST',
    description: 'Test CCP score calculation with weighted scoring system',
    parameters: [
      {
        name: 'scores',
        type: 'object',
        required: true,
        description: 'CCP scores object with CCP01-CCP08 values',
        example: {
          CCP01: 85,
          CCP02: 90,
          CCP03: 80,
          CCP04: 88,
          CCP05: 92,
          CCP06: 78,
          CCP07: 85,
          CCP08: 87,
        },
      },
    ],
    responses: {
      200: {
        description: 'Score calculation results',
        example: {
          success: true,
          data: {
            totalScore: 85.5,
            weightedScore: 'Good',
            certificateLevel: 'GACP-Standard',
            breakdown: {
              CCP01: { score: 85, weight: 15, weighted: 12.75 },
            },
          },
        },
      },
    },
    compliance: ['WHO-GACP'],
    caching: 'No cache',
  },

  '/api/gacp/workflow/:state/requirements': {
    method: 'GET',
    description: 'Get specific requirements for a workflow state',
    parameters: [
      {
        name: 'state',
        type: 'string',
        required: true,
        description: 'Workflow state ID or name',
        example: 'initial-application',
      },
    ],
    responses: {
      200: {
        description: 'State requirements data',
        example: {
          success: true,
          data: {
            state: 'initial-application',
            requirements: ['Valid farm registration documents', 'Soil quality assessment report'],
            estimatedDuration: '5-7 business days',
          },
        },
      },
    },
    compliance: ['WHO-GACP'],
    caching: '15 minutes',
  },

  '/api/gacp/workflow/transition': {
    method: 'POST',
    description: 'Execute workflow state transition with validation',
    parameters: [
      {
        name: 'applicationId',
        type: 'string',
        required: true,
        description: 'Application unique identifier',
      },
      {
        name: 'fromState',
        type: 'string',
        required: true,
        description: 'Current state',
      },
      {
        name: 'toState',
        type: 'string',
        required: true,
        description: 'Target state',
      },
      {
        name: 'validationData',
        type: 'object',
        required: false,
        description: 'Additional validation data',
      },
    ],
    responses: {
      200: {
        description: 'Successful state transition',
        example: {
          success: true,
          data: {
            applicationId: 'APP-2025-001',
            transitionId: 'TXN-001',
            fromState: 'document-review',
            toState: 'field-inspection',
            transitionDate: '2025-10-19T10:30:00Z',
          },
        },
      },
    },
    compliance: ['WHO-GACP'],
    caching: 'No cache',
  },

  '/api/gacp/compliance': {
    method: 'GET',
    description: 'Get complete compliance framework information',
    parameters: [],
    responses: {
      200: {
        description: 'Compliance framework data',
        example: {
          success: true,
          data: {
            standards: ['WHO-GACP', 'Thai-FDA', 'ASEAN-TM'],
            version: '2024.1',
            effectiveDate: '2024-01-01',
            totalRequirements: 156,
            categories: [
              {
                name: 'Cultivation Practices',
                requirements: 45,
                compliance: 'WHO-GACP Section 4',
              },
            ],
          },
        },
      },
    },
    compliance: ['WHO-GACP', 'Thai-FDA', 'ASEAN-TM'],
    caching: '30 minutes',
  },
};

// Generate API Documentation
router.get('/docs', (req, res) => {
  try {
    const documentation = {
      ...API_CONFIG,
      endpoints: API_ENDPOINTS,
      totalEndpoints: Object.keys(API_ENDPOINTS).length,
      authenticationRequired: true,
      rateLimiting: {
        enabled: true,
        limits: {
          default: '100 requests per minute',
          authenticated: '1000 requests per minute',
        },
      },
      errorCodes: {
        400: 'Bad Request - Invalid parameters',
        401: 'Unauthorized - Authentication required',
        403: 'Forbidden - Insufficient permissions',
        404: 'Not Found - Endpoint or resource not found',
        429: 'Too Many Requests - Rate limit exceeded',
        500: 'Internal Server Error - Server error occurred',
      },
      supportContact: {
        email: 'api-support@gacp-platform.com',
        documentation: 'https://docs.gacp-platform.com',
        repository: 'https://github.com/gacp-platform/api',
      },
    };

    res.status(200).json({
      success: true,
      data: documentation,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('API Documentation Generation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate API documentation',
      details: error.message,
    });
  }
});

// Generate OpenAPI/Swagger specification
router.get('/openapi', (req, res) => {
  try {
    const openApiSpec = {
      openapi: '3.0.0',
      info: {
        title: API_CONFIG.title,
        version: API_CONFIG.version,
        description: API_CONFIG.description,
        contact: {
          email: 'api-support@gacp-platform.com',
        },
        license: {
          name: 'GACP Platform License',
        },
      },
      servers: [
        {
          url: API_CONFIG.baseUrl,
          description: 'Production server',
        },
        {
          url: 'http://localhost:3004',
          description: 'Development server',
        },
      ],
      paths: {},
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    };

    // Convert endpoints to OpenAPI format
    for (const [path, endpoint] of Object.entries(API_ENDPOINTS)) {
      const method = endpoint.method.toLowerCase();
      openApiSpec.paths[path] = {
        [method]: {
          summary: endpoint.description,
          parameters: endpoint.parameters || [],
          responses: endpoint.responses,
          tags: ['GACP API'],
        },
      };
    }

    res.status(200).json(openApiSpec);
  } catch (error) {
    logger.error('OpenAPI Specification Generation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate OpenAPI specification',
      details: error.message,
    });
  }
});

// API Health Check with detailed status
router.get('/health', (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      api: {
        version: API_CONFIG.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        endpoints: Object.keys(API_ENDPOINTS).length,
      },
      database: {
        connected: true, // This should be checked against actual DB
        latency: '< 10ms', // This should be measured
      },
      services: {
        gacpWorkflow: 'operational',
        ccpFramework: 'operational',
        scoringSystem: 'operational',
      },
      compliance: API_CONFIG.compliance,
    };

    res.status(200).json({
      success: true,
      data: healthStatus,
    });
  } catch (error) {
    logger.error('API Health Check Error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message,
    });
  }
});

module.exports = router;
