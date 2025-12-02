/**
 * 🗄️ Enhanced MongoDB Schema for GACP Platform
 * โครงสร้างฐานข้อมูล MongoDB ที่ปรับปรุงแล้วสำหรับระบบ GACP
 *
 * Support for:
 * - Phase 1: Intelligent Wizard Enhancement
 * - Phase 2: Virtual Inspector Enablement
 * - Phase 3: Future-Ready Data Ecosystem
 * - Traceability Graphs & Immutable Records
 * - IoT Integration & Predictive Analytics
 */

const { ObjectId } = require('mongodb');

// Enhanced Farm Management Schema
const FarmSchema = {
  _id: ObjectId,
  farmNumber: String, // FARM-2024-001

  // Basic Information
  basicInfo: {
    farmName: String,
    ownerName: String,
    ownerType: String, // 'individual', 'community_enterprise', 'juristic_person'
    registrationNumber: String,
    establishedDate: Date,

    // AI-extracted data from documents
    extractedData: {
      nationalId: String,
      businessRegistration: String,
      landCertificate: String,
      extractionMetadata: {
        processedAt: Date,
        confidence: Number, // 0-100
        verificationStatus: String, // 'verified', 'pending', 'failed'
        ocrEngine: String,
        nlpEngine: String
      }
    }
  },

  // Location & Geographic Data
  location: {
    address: {
      houseNumber: String,
      village: String,
      subDistrict: String,
      district: String,
      province: String,
      postalCode: String,
      country: { type: String, default: 'Thailand' }
    },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    },
    elevationMeters: Number,
    landSize: {
      totalArea: Number, // square meters
      cultivationArea: Number,
      storageArea: Number,
      processingArea: Number
    },
    boundaries: {
      type: String, // GeoJSON Polygon
      coordinates: [[Number]] // Array of coordinate arrays
    }
  },

  // Enhanced Cultivation Data
  cultivation: {
    cropTypes: [
      {
        cropId: ObjectId,
        scientificName: String,
        commonName: String,
        variety: String,
        cultivationMethod: String, // 'indoor', 'outdoor', 'greenhouse'
        organicCertified: Boolean,
        seedSource: {
          supplier: String,
          certificationNumber: String,
          batchNumber: String,
          purchaseDate: Date
        }
      }
    ],

    // Cultivation Systems
    systems: [
      {
        systemId: String,
        systemType: String, // 'hydroponic', 'soil', 'aeroponic'
        capacity: Number,
        installationDate: Date,
        specifications: Object
      }
    ],

    // Production Planning
    productionPlan: [
      {
        planId: String,
        season: String,
        expectedYield: Number,
        plantingSchedule: Date,
        harvestSchedule: Date,
        marketTarget: String
      }
    ]
  },

  // IoT Integration (Phase 3)
  iotDevices: [
    {
      deviceId: String,
      deviceType: String, // 'soil_moisture', 'temperature', 'ph_meter', 'camera'
      manufacturer: String,
      model: String,
      serialNumber: String,
      installationDate: Date,
      location: {
        area: String,
        coordinates: [Number]
      },
      calibrationData: {
        lastCalibration: Date,
        nextCalibration: Date,
        calibrationCertificate: String
      },
      dataEndpoint: String, // API endpoint for real-time data
      status: String // 'active', 'maintenance', 'offline'
    }
  ],

  // Compliance & Certifications
  compliance: {
    gacpStatus: String, // 'pending', 'certified', 'expired', 'revoked'
    certificationHistory: [
      {
        certificateId: String,
        issueDate: Date,
        expiryDate: Date,
        issuingBody: String,
        certificateType: String,
        status: String
      }
    ],

    // Compliance Scoring (AI-driven)
    complianceScore: {
      currentScore: Number, // 0-100
      lastCalculated: Date,
      categoryScores: {
        site: Number,
        cultivation: Number,
        harvesting: Number,
        storage: Number,
        processing: Number,
        quality: Number,
        documentation: Number
      },
      riskFactors: [
        {
          category: String,
          description: String,
          severity: String, // 'low', 'medium', 'high', 'critical'
          detectedAt: Date
        }
      ]
    }
  },

  // Audit Trail (Immutable Records)
  auditTrail: [
    {
      eventId: String,
      timestamp: Date,
      eventType: String, // 'creation', 'modification', 'inspection', 'certification'
      actor: {
        userId: ObjectId,
        name: String,
        role: String,
        ipAddress: String,
        userAgent: String
      },
      changes: {
        field: String,
        oldValue: Object,
        newValue: Object,
        changeReason: String
      },
      verification: {
        checksum: String,
        digitalSignature: String,
        blockchainHash: String // For future blockchain integration
      }
    }
  ],

  // System Metadata
  metadata: {
    createdAt: Date,
    updatedAt: Date,
    createdBy: ObjectId,
    lastModifiedBy: ObjectId,
    version: Number,
    dataIntegrity: {
      checksum: String,
      lastVerified: Date,
      verificationStatus: String
    }
  }
};

// Enhanced Application Schema
const ApplicationSchema = {
  _id: ObjectId,
  applicationNumber: String, // GACP-2024-001

  // Application Details
  applicationInfo: {
    farmId: ObjectId,
    applicantId: ObjectId,
    applicationType: String, // 'new', 'renewal', 'modification'
    submissionDate: Date,
    expectedProcessingTime: Number, // days
    priority: String, // 'standard', 'expedited', 'urgent'

    // Wizard Progress Tracking
    wizardProgress: {
      currentStep: Number,
      totalSteps: Number,
      completedSteps: [Number],
      stepProgress: [
        {
          stepNumber: Number,
          stepName: String,
          status: String, // 'pending', 'in_progress', 'completed', 'skipped'
          startedAt: Date,
          completedAt: Date,
          aiAssistance: {
            suggestionsProvided: Number,
            errorsDetected: Number,
            autoCompleteUsed: Boolean
          }
        }
      ]
    }
  },

  // AI-Enhanced Data Processing
  aiProcessing: {
    documentProcessing: [
      {
        documentId: String,
        documentType: String,
        processedAt: Date,
        ocrResults: {
          extractedText: String,
          confidence: Number,
          boundingBoxes: Object,
          recognizedEntities: [
            {
              entity: String,
              value: String,
              confidence: Number,
              position: Object
            }
          ]
        },
        nlpResults: {
          entities: Object,
          sentiment: Object,
          categories: [String],
          keyPhrases: [String]
        },
        validationStatus: String // 'valid', 'requires_review', 'invalid'
      }
    ],

    // Real-time Validation Results
    validationResults: [
      {
        fieldName: String,
        validationType: String, // 'format', 'consistency', 'plausibility'
        status: String, // 'pass', 'warning', 'error'
        message: String,
        suggestions: [String],
        validatedAt: Date,
        validator: String // AI model or rule engine
      }
    ],

    // Contextual Guidance History
    guidanceHistory: [
      {
        context: String,
        question: String,
        guidance: String,
        gacpReference: String,
        providedAt: Date,
        userFeedback: String // 'helpful', 'not_helpful', 'incorrect'
      }
    ]
  },

  // Application Status & Workflow
  status: {
    currentStatus: String,
    statusHistory: [
      {
        status: String,
        timestamp: Date,
        actor: ObjectId,
        comments: String,
        attachments: [String]
      }
    ],

    // Workflow Integration
    workflowState: {
      currentPhase: String,
      phaseProgress: Number, // 0-100
      estimatedCompletion: Date,
      bottlenecks: [
        {
          issue: String,
          detectedAt: Date,
          severity: String,
          resolution: String
        }
      ]
    }
  },

  // Documents & Evidence
  documents: [
    {
      documentId: String,
      documentType: String,
      fileName: String,
      fileSize: Number,
      mimeType: String,
      uploadedAt: Date,
      uploadedBy: ObjectId,

      // AI Processing Results
      aiProcessed: Boolean,
      extractedData: Object,
      verificationStatus: String,

      // Security & Integrity
      encryption: {
        encrypted: Boolean,
        algorithm: String,
        keyId: String
      },
      integrity: {
        checksum: String,
        digitalSignature: String,
        tamperDetected: Boolean
      }
    }
  ],

  // Fees & Payments
  financial: {
    totalFees: Number,
    paidAmount: Number,
    outstandingAmount: Number,
    paymentHistory: [
      {
        paymentId: String,
        amount: Number,
        paymentDate: Date,
        paymentMethod: String,
        transactionId: String,
        status: String
      }
    ],
    discounts: [
      {
        discountType: String,
        discountAmount: Number,
        reason: String,
        approvedBy: ObjectId
      }
    ]
  }
};

// Enhanced Batch Tracking Schema (Seed-to-Sale)
const BatchSchema = {
  _id: ObjectId,
  batchNumber: String, // BATCH-FARM001-2024-001

  // Batch Information
  batchInfo: {
    farmId: ObjectId,
    cropType: String,
    variety: String,
    plantingDate: Date,
    harvestDate: Date,
    expectedYield: Number,
    actualYield: Number,
    qualityGrade: String
  },

  // Traceability Graph
  traceabilityGraph: {
    // Seed/Seedling Source
    source: {
      seedId: String,
      supplier: String,
      certificationNumber: String,
      geneticProfile: Object,
      parentBatches: [String] // For breeding programs
    },

    // Production Journey
    productionStages: [
      {
        stageId: String,
        stageName: String, // 'germination', 'vegetative', 'flowering', 'harvest'
        startDate: Date,
        endDate: Date,
        location: String,
        conditions: {
          temperature: Object, // min, max, avg
          humidity: Object,
          lightCycle: String,
          nutrients: [Object],
          treatments: [Object]
        },

        // IoT Data Integration
        iotData: [
          {
            deviceId: String,
            measurements: [
              {
                timestamp: Date,
                parameter: String,
                value: Number,
                unit: String,
                quality: String // 'good', 'questionable', 'bad'
              }
            ]
          }
        ],

        // Quality Control
        qualityChecks: [
          {
            checkId: String,
            checkDate: Date,
            inspector: String,
            parameters: Object,
            results: Object,
            photos: [String],
            notes: String
          }
        ]
      }
    ],

    // Post-Harvest Processing
    processing: [
      {
        processId: String,
        processType: String, // 'drying', 'curing', 'trimming', 'packaging'
        processDate: Date,
        processedBy: String,
        inputWeight: Number,
        outputWeight: Number,
        lossPercentage: Number,
        conditions: Object,
        qualityTests: Object
      }
    ],

    // Distribution Chain
    distribution: [
      {
        distributionId: String,
        recipient: String,
        distributionDate: Date,
        quantity: Number,
        transportConditions: Object,
        deliveryStatus: String,
        trackingNumber: String
      }
    ]
  },

  // QR Code Information
  qrCode: {
    qrId: String,
    qrData: String, // JSON string with verification data
    generatedAt: Date,
    expiryDate: Date,
    scanCount: Number,
    lastScanned: Date,

    // Verification Chain
    verificationChain: [
      {
        scanId: String,
        scannedAt: Date,
        scannedBy: String,
        location: Object,
        verificationResult: String,
        additionalData: Object
      }
    ]
  },

  // Compliance Records
  compliance: {
    gacpCompliant: Boolean,
    complianceChecks: [
      {
        checkId: String,
        requirement: String,
        status: String, // 'compliant', 'non_compliant', 'conditional'
        evidence: [String],
        checkedBy: String,
        checkedAt: Date,
        notes: String
      }
    ],

    // Testing Results
    testingResults: [
      {
        testId: String,
        testType: String, // 'pesticide', 'heavy_metals', 'microbial', 'cannabinoid'
        testDate: Date,
        laboratory: String,
        sampleId: String,
        results: Object,
        passed: Boolean,
        certificate: String
      }
    ]
  },

  // Immutable Record Chain
  recordChain: [
    {
      recordId: String,
      timestamp: Date,
      eventType: String,
      actor: String,
      data: Object,
      previousHash: String,
      currentHash: String,
      digitalSignature: String
    }
  ]
};

// VRS Session Schema
const VRSSessionSchema = {
  _id: ObjectId,
  sessionNumber: String, // VRS-20241021-1430-001

  // Session Information
  sessionInfo: {
    farmId: ObjectId,
    applicationId: ObjectId,
    inspectionType: String,
    scheduledDate: Date,
    actualStartTime: Date,
    actualEndTime: Date,
    estimatedDuration: Number,
    actualDuration: Number
  },

  // Participants
  participants: [
    {
      participantId: String,
      userId: ObjectId,
      name: String,
      role: String, // 'auditor', 'farmer', 'witness'
      joinedAt: Date,
      leftAt: Date,
      connectionQuality: String,
      permissions: Object
    }
  ],

  // Inspection Checklist
  checklist: {
    checklistType: String,
    totalCheckpoints: Number,
    completedCheckpoints: Number,
    checkpoints: [
      {
        checkpointId: String,
        title: String,
        category: String,
        status: String, // 'pending', 'in_progress', 'completed', 'skipped'
        result: String, // 'pass', 'fail', 'conditional'
        startTime: Date,
        endTime: Date,
        findings: [String],
        evidence: [String],
        notes: String
      }
    ]
  },

  // Evidence Collection
  evidence: [
    {
      evidenceId: String,
      type: String, // 'photo', 'video', 'screenshot', 'document'
      checkpointId: String,
      title: String,
      description: String,
      capturedAt: Date,
      capturedBy: String,
      fileInfo: {
        fileName: String,
        fileSize: Number,
        mimeType: String,
        resolution: String,
        compression: String
      },
      metadata: {
        location: Object,
        cameraSettings: Object,
        deviceInfo: Object
      },
      security: {
        encrypted: Boolean,
        checksum: String,
        digitalSignature: String
      },
      annotations: [
        {
          annotationId: String,
          type: String,
          coordinates: Object,
          text: String,
          createdBy: String,
          createdAt: Date
        }
      ]
    }
  ],

  // AR Annotations
  arAnnotations: [
    {
      annotationId: String,
      type: String, // 'pointer', 'circle', 'rectangle', 'text', 'measurement'
      position: Object, // 3D coordinates
      data: Object,
      text: String,
      color: String,
      createdBy: String,
      createdAt: Date,
      visible: Boolean,
      persistent: Boolean
    }
  ],

  // Video Recordings
  recordings: [
    {
      recordingId: String,
      startTime: Date,
      endTime: Date,
      duration: Number,
      quality: String,
      compression: String,
      participants: [String],
      fileInfo: {
        videoFile: String,
        audioFile: String,
        metadataFile: String,
        totalSize: Number
      },
      security: {
        encrypted: Boolean,
        encryptionKey: String,
        accessControl: Object,
        retentionPolicy: Object
      }
    }
  ],

  // Session Results
  results: {
    overallResult: String, // 'pass', 'fail', 'conditional'
    complianceScore: Number, // 0-100
    findings: [String],
    recommendations: [String],
    followUpRequired: Boolean,
    reportGenerated: Boolean,
    reportId: String
  },

  // Technical Metadata
  technical: {
    connectionLog: [
      {
        timestamp: Date,
        participantId: String,
        event: String,
        data: Object
      }
    ],
    performanceMetrics: {
      averageLatency: Number,
      averageBandwidth: Number,
      connectionDrops: Number,
      qualityIssues: Number
    },
    systemVersion: String,
    clientVersions: Object
  }
};

// Predictive Analytics Schema (Phase 3)
const PredictiveAnalyticsSchema = {
  _id: ObjectId,
  farmId: ObjectId,

  // Prediction Models
  models: [
    {
      modelId: String,
      modelType: String, // 'yield_prediction', 'disease_risk', 'optimal_harvest'
      modelVersion: String,
      trainedAt: Date,
      accuracy: Number,
      features: [String],
      algorithm: String,
      hyperparameters: Object
    }
  ],

  // Historical Data
  historicalData: {
    environmentalData: [
      {
        timestamp: Date,
        temperature: Number,
        humidity: Number,
        rainfall: Number,
        sunlight: Number,
        windSpeed: Number,
        soilMoisture: Number,
        soilPH: Number
      }
    ],

    productionData: [
      {
        season: String,
        cropType: String,
        plantingDate: Date,
        harvestDate: Date,
        yield: Number,
        quality: String,
        costs: Object,
        revenue: Number
      }
    ],

    treatmentData: [
      {
        date: Date,
        treatmentType: String,
        product: String,
        dosage: Number,
        method: String,
        reason: String,
        effectiveness: Number
      }
    ]
  },

  // Predictions
  predictions: [
    {
      predictionId: String,
      modelId: String,
      predictionType: String,
      targetDate: Date,
      confidence: Number, // 0-100
      prediction: Object,

      // Scenarios
      scenarios: [
        {
          scenarioName: String,
          conditions: Object,
          predictedOutcome: Object,
          probability: Number
        }
      ],

      // Recommendations
      recommendations: [
        {
          action: String,
          timing: Date,
          expectedImpact: Object,
          priority: String
        }
      ]
    }
  ],

  // Risk Assessment
  riskAssessment: {
    currentRisks: [
      {
        riskType: String,
        severity: String,
        probability: Number,
        impact: String,
        mitigation: [String],
        monitoringRequired: Boolean
      }
    ],

    // Early Warning System
    alerts: [
      {
        alertId: String,
        alertType: String,
        severity: String,
        message: String,
        triggeredAt: Date,
        conditions: Object,
        recommendations: [String],
        acknowledged: Boolean
      }
    ]
  }
};

// Supply Chain Integration Schema (Phase 3)
const SupplyChainSchema = {
  _id: ObjectId,

  // Chain Information
  chainInfo: {
    chainId: String,
    chainName: String,
    participants: [
      {
        participantId: String,
        organizationName: String,
        role: String, // 'producer', 'processor', 'distributor', 'retailer'
        certifications: [String],
        contactInfo: Object
      }
    ]
  },

  // Product Journey
  productJourney: [
    {
      transactionId: String,
      fromParticipant: String,
      toParticipant: String,
      timestamp: Date,
      productDetails: {
        batchNumbers: [String],
        quantity: Number,
        unit: String,
        quality: String,
        packaging: String
      },

      // Documentation
      documentation: [
        {
          documentType: String,
          documentId: String,
          verificationStatus: String,
          digitalSignature: String
        }
      ],

      // Transportation
      transportation: {
        method: String,
        vehicle: String,
        driver: String,
        conditions: Object,
        tracking: [
          {
            timestamp: Date,
            location: Object,
            temperature: Number,
            humidity: Number
          }
        ]
      },

      // Verification
      verification: {
        verified: Boolean,
        verifiedBy: String,
        verificationMethod: String,
        verificationData: Object,
        blockchainHash: String
      }
    }
  ],

  // Consumer Interface
  consumerData: {
    productId: String,
    qrCode: String,
    publicInfo: {
      farmName: String,
      location: String,
      certifications: [String],
      harvestDate: Date,
      processingDate: Date,
      qualityTests: Object
    },

    // Transparency Score
    transparencyScore: Number, // 0-100
    traceabilityDepth: Number, // How far back traceability goes
    verificationLevel: String // 'basic', 'enhanced', 'premium'
  }
};

// Database Indexes for Performance
const DatabaseIndexes = {
  // Farm Collection Indexes
  farms: [
    { farmNumber: 1 }, // Unique
    { 'basicInfo.ownerType': 1 },
    { 'location.coordinates': '2dsphere' }, // Geospatial
    { 'compliance.gacpStatus': 1 },
    { 'metadata.createdAt': -1 },
    { 'iotDevices.deviceId': 1 }
  ],

  // Application Collection Indexes
  applications: [
    { applicationNumber: 1 }, // Unique
    { farmId: 1 },
    { 'status.currentStatus': 1 },
    { 'applicationInfo.submissionDate': -1 },
    { 'wizardProgress.currentStep': 1 }
  ],

  // Batch Collection Indexes
  batches: [
    { batchNumber: 1 }, // Unique
    { farmId: 1 },
    { 'batchInfo.harvestDate': -1 },
    { 'qrCode.qrId': 1 }, // Unique
    { 'compliance.gacpCompliant': 1 },
    { 'traceabilityGraph.source.seedId': 1 }
  ],

  // VRS Session Collection Indexes
  vrsSessions: [
    { sessionNumber: 1 }, // Unique
    { farmId: 1 },
    { 'sessionInfo.scheduledDate': -1 },
    { 'results.overallResult': 1 }
  ],

  // Predictive Analytics Indexes
  predictiveAnalytics: [
    { farmId: 1 },
    { 'predictions.targetDate': -1 },
    { 'riskAssessment.alerts.triggeredAt': -1 }
  ]
};

module.exports = {
  FarmSchema,
  ApplicationSchema,
  BatchSchema,
  VRSSessionSchema,
  PredictiveAnalyticsSchema,
  SupplyChainSchema,
  DatabaseIndexes
};
