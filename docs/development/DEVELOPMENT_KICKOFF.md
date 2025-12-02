# GACP Platform Upgrade - Development Kickoff

**วันที่:** 5 พฤศจิกายน 2025
**Sprint 0:** Preparation Phase
**Duration:** 2 weeks

---

## 🎯 Development Goals

### Sprint 0 (Week 1-2): Foundation Setup
- ✅ Set up development environments
- ✅ Deploy database migrations
- ✅ Create base module structure
- ✅ Set up CI/CD pipeline
- ✅ Establish coding standards

### Sprint 1-4 (Month 1-2): QC Layer
- Build QC Officer dashboard
- Implement pre-screening workflow
- Integrate with existing application system
- User acceptance testing

### Sprint 5-8 (Month 3-4): AI Pre-Check
- Develop AI Pre-Check module
- Integrate OCR services
- Train and test AI models
- Deploy to staging

### Sprint 9-12 (Month 5-6): Smart Router
- Build Smart Router module
- Implement routing algorithm
- Inspector assignment automation
- Performance testing

---

## 📁 Project Structure

### New Modules to Create

```
apps/backend/modules/
├── ai-precheck/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── AIPreCheckResult.js
│   │   ├── services/
│   │   │   ├── DocumentValidationService.js
│   │   │   ├── RiskScoringService.js
│   │   │   └── OCRService.js
│   │   └── repositories/
│   │       └── AIPreCheckRepository.js
│   ├── application/
│   │   └── use-cases/
│   │       ├── ValidateApplicationDocuments.js
│   │       └── CalculateRiskScore.js
│   ├── infrastructure/
│   │   ├── models/
│   │   │   └── AIConfig.js
│   │   ├── repositories/
│   │   │   └── MongoAIPreCheckRepository.js
│   │   └── services/
│   │       ├── GoogleVisionClient.js
│   │       └── OpenAIClient.js
│   ├── presentation/
│   │   ├── controllers/
│   │   │   └── AIPreCheckController.js
│   │   ├── routes/
│   │   │   └── aiPrecheck.routes.js
│   │   ├── middleware/
│   │   │   └── aiPreCheckAuth.js
│   │   └── validators/
│   │       └── aiPreCheckValidator.js
│   ├── __tests__/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── container.js
│   └── index.js
│
├── smart-router/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── RoutingDecision.js
│   │   ├── services/
│   │   │   ├── RoutingService.js
│   │   │   ├── WorkloadBalancer.js
│   │   │   └── PriorityCalculator.js
│   │   └── repositories/
│   │       └── RoutingRepository.js
│   ├── application/
│   │   └── use-cases/
│   │       ├── RouteApplication.js
│   │       ├── AssignInspector.js
│   │       └── RebalanceWorkload.js
│   ├── infrastructure/
│   │   ├── models/
│   │   │   └── RoutingConfig.js
│   │   ├── repositories/
│   │   │   └── MongoRoutingRepository.js
│   │   └── services/
│   │       └── InspectorMatchingService.js
│   ├── presentation/
│   │   ├── controllers/
│   │   │   └── RoutingController.js
│   │   ├── routes/
│   │   │   └── routing.routes.js
│   │   └── validators/
│   │       └── routingValidator.js
│   ├── __tests__/
│   └── index.js
│
└── qa-verification/
    ├── domain/
    │   ├── entities/
    │   │   └── QAVerification.js
    │   ├── services/
    │   │   ├── QAVerificationService.js
    │   │   ├── SamplingService.js
    │   │   └── QualityScoreService.js
    │   └── repositories/
    │       └── QAVerificationRepository.js
    ├── application/
    │   └── use-cases/
    │       ├── PerformQACheck.js
    │       ├── RequestReinspection.js
    │       └── GenerateQAReport.js
    ├── infrastructure/
    │   ├── models/
    │   │   └── QAConfig.js
    │   ├── repositories/
    │   │   └── MongoQAVerificationRepository.js
    │   └── services/
    │       └── IssueDetectionService.js
    ├── presentation/
    │   ├── controllers/
    │   │   └── QAVerificationController.js
    │   ├── routes/
    │   │   └── qaVerification.routes.js
    │   └── validators/
    │       └── qaVerificationValidator.js
    ├── __tests__/
    └── index.js
```

---

## 🗄️ Database Migration Scripts

### Migration 001: Add New Roles

**File:** `scripts/migrations/001-add-new-roles.js`

```javascript
/**
 * Migration 001: Add new roles to DTAMStaff
 * Date: 2025-11-05
 * Author: GACP Platform Team
 */

const mongoose = require('mongoose');
const DTAMStaff = require('../../apps/backend/modules/auth-dtam/models/DTAMStaff');

async function up() {
  console.log('Starting migration 001: Add new roles...');

  try {
    // 1. Update DTAMStaff schema to accept new roles
    await mongoose.connection.db.command({
      collMod: 'dtam_staff',
      validator: {
        $jsonSchema: {
          properties: {
            role: {
              enum: [
                'admin',
                'qc_officer',
                'reviewer',
                'inspector',
                'qa_verifier',
                'approver',
                'manager',
                'operator'
              ]
            }
          }
        }
      }
    });

    // 2. Add new fields to all existing staff
    await DTAMStaff.updateMany(
      {},
      {
        $set: {
          workloadMetrics: {
            assignedCases: 0,
            completedToday: 0,
            completedThisMonth: 0,
            averageCompletionTime: 0,
            qualityScore: 100,
            lastAssignedAt: null
          },
          specializations: [],
          aiAssistanceEnabled: true
        }
      }
    );

    console.log('✅ Migration 001 completed successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Migration 001 failed:', error);
    throw error;
  }
}

async function down() {
  console.log('Rolling back migration 001...');

  try {
    // Remove new fields
    await DTAMStaff.updateMany(
      {},
      {
        $unset: {
          workloadMetrics: '',
          specializations: '',
          aiAssistanceEnabled: ''
        }
      }
    );

    // Revert enum validation
    await mongoose.connection.db.command({
      collMod: 'dtam_staff',
      validator: {
        $jsonSchema: {
          properties: {
            role: {
              enum: ['admin', 'reviewer', 'manager', 'inspector', 'operator']
            }
          }
        }
      }
    });

    console.log('✅ Rollback 001 completed');
    return { success: true };
  } catch (error) {
    console.error('❌ Rollback 001 failed:', error);
    throw error;
  }
}

module.exports = { up, down };
```

### Migration 002: Add Application Workflow Fields

**File:** `scripts/migrations/002-add-application-workflow-fields.js`

```javascript
/**
 * Migration 002: Add new workflow fields to Application model
 * Date: 2025-11-05
 */

const mongoose = require('mongoose');
const Application = require('../../apps/backend/models/Application');

async function up() {
  console.log('Starting migration 002: Add application workflow fields...');

  try {
    // Add new fields to all applications
    await Application.updateMany(
      {},
      {
        $set: {
          aiPreCheck: {
            completenessScore: null,
            riskLevel: null,
            flags: [],
            recommendation: null,
            checkedAt: null,
            processingTimeMs: null
          },
          qcReview: {
            officerId: null,
            preScore: null,
            classification: null,
            issues: [],
            recommendation: null,
            reviewedAt: null,
            timeSpentMinutes: null
          },
          routing: {
            priority: 'NORMAL',
            inspectionType: null,
            assignedInspectorId: null,
            estimatedDuration: null,
            routedAt: null,
            routingReason: null
          },
          qaVerification: {
            verifierId: null,
            samplingType: null,
            verificationStatus: null,
            issues: [],
            verifiedAt: null,
            needsReinspection: false
          },
          metrics: {
            totalProcessingDays: null,
            aiCheckDuration: null,
            qcReviewDuration: null,
            reviewerDuration: null,
            inspectionDuration: null,
            qaVerificationDuration: null,
            approvalDuration: null
          }
        }
      }
    );

    console.log('✅ Migration 002 completed successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Migration 002 failed:', error);
    throw error;
  }
}

async function down() {
  console.log('Rolling back migration 002...');

  try {
    await Application.updateMany(
      {},
      {
        $unset: {
          aiPreCheck: '',
          qcReview: '',
          routing: '',
          qaVerification: '',
          metrics: ''
        }
      }
    );

    console.log('✅ Rollback 002 completed');
    return { success: true };
  } catch (error) {
    console.error('❌ Rollback 002 failed:', error);
    throw error;
  }
}

module.exports = { up, down };
```

### Migration 003: Create AI Config Collection

**File:** `scripts/migrations/003-create-ai-config.js`

```javascript
/**
 * Migration 003: Create AI Config collection
 * Date: 2025-11-05
 */

const mongoose = require('mongoose');
const AIConfig = require('../../apps/backend/modules/ai-precheck/infrastructure/models/AIConfig');

async function up() {
  console.log('Starting migration 003: Create AI Config...');

  try {
    // Create default AI Pre-Check config
    await AIConfig.create({
      module: 'PRE_CHECK',
      enabled: true,
      config: {
        thresholds: {
          autoReject: 50,
          fastTrack: 90,
          complexCase: 70
        },
        weights: {
          documentCompleteness: 30,
          farmerHistory: 20,
          farmSize: 15,
          cropType: 10,
          paymentStatus: 25
        },
        routingRules: []
      },
      performance: {
        accuracy: 0,
        totalProcessed: 0,
        correctPredictions: 0,
        falsePositives: 0,
        falseNegatives: 0
      },
      version: '1.0.0'
    });

    // Create Smart Router config
    await AIConfig.create({
      module: 'SMART_ROUTER',
      enabled: true,
      config: {
        thresholds: {
          videoOnly: 90,
          hybrid: 70,
          fullOnsite: 0
        },
        weights: {
          reviewScore: 40,
          farmerHistory: 30,
          farmSize: 20,
          cropType: 10
        },
        routingRules: [
          {
            condition: 'reviewScore >= 90 AND farmerHistory.previousCertified',
            action: 'VIDEO_ONLY',
            priority: 1
          },
          {
            condition: 'reviewScore >= 70',
            action: 'HYBRID',
            priority: 2
          },
          {
            condition: 'reviewScore < 70',
            action: 'FULL_ONSITE',
            priority: 3
          }
        ]
      },
      performance: {
        accuracy: 0,
        totalProcessed: 0,
        correctPredictions: 0,
        falsePositives: 0,
        falseNegatives: 0
      },
      version: '1.0.0'
    });

    console.log('✅ Migration 003 completed successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Migration 003 failed:', error);
    throw error;
  }
}

async function down() {
  console.log('Rolling back migration 003...');

  try {
    await AIConfig.deleteMany({});
    console.log('✅ Rollback 003 completed');
    return { success: true };
  } catch (error) {
    console.error('❌ Rollback 003 failed:', error);
    throw error;
  }
}

module.exports = { up, down };
```

---

## 🧪 Testing Strategy

### Unit Testing

**Framework:** Jest
**Coverage Target:** 80%+

**Example Test: DocumentValidationService**

```javascript
// __tests__/unit/DocumentValidationService.test.js

const DocumentValidationService = require('../../../domain/services/DocumentValidationService');

describe('DocumentValidationService', () => {
  let service;
  let mockOCRService;
  let mockAIConfigRepository;

  beforeEach(() => {
    mockOCRService = {
      extractDocumentData: jest.fn()
    };
    mockAIConfigRepository = {
      getConfig: jest.fn().mockReturnValue({
        weights: {
          documentCompleteness: 30,
          farmerHistory: 20,
          farmSize: 15,
          cropType: 10,
          paymentStatus: 25
        }
      })
    };

    service = new DocumentValidationService({
      ocrService: mockOCRService,
      aiConfigRepository: mockAIConfigRepository,
      logger: console
    });
  });

  describe('checkCompleteness', () => {
    it('should return 100% score when all documents present', async () => {
      const application = {
        documents: [
          { type: 'NATIONAL_ID' },
          { type: 'FARM_LICENSE' },
          { type: 'FARM_MAP' },
          { type: 'LAND_DEED' },
          { type: 'PAYMENT_RECEIPT' }
        ]
      };

      const result = await service.checkCompleteness(application);

      expect(result.score).toBe(100);
      expect(result.missing).toHaveLength(0);
    });

    it('should return 60% score when 3/5 documents present', async () => {
      const application = {
        documents: [
          { type: 'NATIONAL_ID' },
          { type: 'FARM_LICENSE' },
          { type: 'FARM_MAP' }
        ]
      };

      const result = await service.checkCompleteness(application);

      expect(result.score).toBe(60);
      expect(result.missing).toContain('LAND_DEED');
      expect(result.missing).toContain('PAYMENT_RECEIPT');
    });
  });

  describe('calculateRiskScore', () => {
    it('should calculate high score for complete docs + good history', () => {
      const data = {
        completeness: { score: 100 },
        validation: { paymentVerified: true },
        farmerHistory: { previousCertified: true, previousRejected: false },
        farmSize: 3,
        cropType: 'turmeric'
      };

      const result = service.calculateRiskScore(data);

      expect(result.score).toBeGreaterThan(85);
      expect(result.level).toBe('LOW');
    });

    it('should calculate low score for incomplete docs + no history', () => {
      const data = {
        completeness: { score: 40 },
        validation: { paymentVerified: false },
        farmerHistory: { previousCertified: false, previousRejected: false },
        farmSize: 15,
        cropType: 'cannabis'
      };

      const result = service.calculateRiskScore(data);

      expect(result.score).toBeLessThan(60);
      expect(result.level).toBe('HIGH');
    });
  });
});
```

### Integration Testing

**Test complete workflow:**

```javascript
// __tests__/integration/upgraded-workflow.test.js

describe('Upgraded Workflow Integration', () => {
  it('should process high-score application through fast track', async () => {
    // 1. Create test application
    const application = await createTestApplication({
      documents: allRequiredDocuments,
      payment: verifiedPayment,
      farmer: { history: { previousCertified: true } },
      farm: { size: 3, crop: 'cannabis' }
    });

    // 2. AI Pre-Check
    const aiResult = await aiPreCheckService.validate(application._id);
    expect(aiResult.completenessScore).toBeGreaterThan(90);
    expect(aiResult.recommendation).toBe('FAST_TRACK');

    // 3. QC Review
    const qcResult = await qcService.review(application._id, qcOfficer._id);
    expect(qcResult.classification).toBe('FAST_TRACK');

    // 4. Smart Router
    const routing = await smartRouterService.route(application._id);
    expect(routing.inspectionType).toBe('VIDEO_ONLY');
    expect(routing.estimatedDuration).toBe('2 hours');

    // 5. Verify total processing time
    const updatedApp = await Application.findById(application._id);
    expect(updatedApp.metrics.totalProcessingDays).toBeLessThan(10);
  });
});
```

### Load Testing

**Framework:** Artillery

```yaml
# artillery-config.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 300
      arrivalRate: 50
      name: 'Sustained load'

scenarios:
  - name: 'Complete Workflow'
    flow:
      - post:
          url: '/api/applications/submit'
          json:
            farmerId: '{{ $randomString() }}'
            cropType: 'cannabis'
            documents: []
      - think: 1
      - post:
          url: '/api/ai-precheck/validate'
          json:
            applicationId: '{{ applicationId }}'
      - think: 2
      - post:
          url: '/api/qc/review/{{ applicationId }}'
          json:
            preScore: 85
            classification: 'NORMAL'
      - think: 1
      - post:
          url: '/api/routing/route/{{ applicationId }}'
```

---

## 🔧 Development Environment Setup

### Prerequisites

```bash
# Node.js
node --version  # >= 18.0.0

# pnpm
pnpm --version  # >= 8.0.0

# MongoDB
mongod --version  # >= 6.0.0

# Redis
redis-cli --version  # >= 5.0.0
```

### Setup Steps

```bash
# 1. Clone repository (if not already)
cd /path/to/Botanical-Audit-Framework

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp apps/backend/.env.example apps/backend/.env
# Edit .env with your configs

# 4. Run database migrations
node scripts/migrations/run-all-migrations.js

# 5. Seed test data
node scripts/seed-test-data.js

# 6. Start development servers
pnpm run dev:backend
pnpm run dev:admin-portal
```

### Environment Variables

**apps/backend/.env:**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/gacp-platform
MONGODB_TEST_URI=mongodb://localhost:27017/gacp-platform-test

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-farmer-jwt-secret
DTAM_JWT_SECRET=your-dtam-jwt-secret

# AI Services
GOOGLE_VISION_API_KEY=your-google-vision-key
OPENAI_API_KEY=your-openai-key

# Feature Flags
ENABLE_AI_PRECHECK=true
ENABLE_SMART_ROUTER=true
ENABLE_QA_VERIFICATION=true

# Thresholds (AI)
AI_THRESHOLD_AUTO_REJECT=50
AI_THRESHOLD_FAST_TRACK=90
AI_THRESHOLD_COMPLEX_CASE=70
```

---

## 📋 Sprint Planning

### Sprint 0 (Week 1-2): Foundation

**Goals:**
- Set up dev environments
- Deploy database migrations
- Create module scaffolding

**Tasks:**

| Task | Assignee | Est. | Priority |
|------|----------|------|----------|
| Run migrations 001-003 | Backend Dev 1 | 4h | P0 |
| Create AI Pre-Check module structure | Backend Dev 2 | 8h | P0 |
| Create Smart Router module structure | Backend Dev 1 | 8h | P0 |
| Create QA Verification module structure | Backend Dev 2 | 8h | P0 |
| Set up test framework | QA Engineer | 4h | P0 |
| Update CI/CD pipeline | DevOps | 8h | P0 |
| Code review guidelines | Tech Lead | 2h | P0 |

**Definition of Done:**
- ✅ All migrations run successfully
- ✅ Module directories created
- ✅ Tests pass (empty tests OK)
- ✅ CI/CD green

### Sprint 1 (Week 3-4): QC Dashboard MVP

**Goals:**
- Build QC Officer dashboard
- Implement basic QC workflow

**Tasks:**

| Task | Assignee | Est. | Priority |
|------|----------|------|----------|
| Design QC dashboard UI | Frontend Dev 1 | 8h | P0 |
| Build QC queue API | Backend Dev 1 | 12h | P0 |
| Build QC review API | Backend Dev 2 | 12h | P0 |
| Integrate with Application model | Backend Dev 1 | 8h | P0 |
| Build QC dashboard frontend | Frontend Dev 1 | 16h | P0 |
| Write unit tests | All Devs | 8h | P0 |
| Integration testing | QA Engineer | 8h | P0 |
| UAT with QC Officers | Product Owner | 4h | P0 |

**Definition of Done:**
- ✅ QC Officers can see queue
- ✅ QC Officers can review applications
- ✅ Test coverage > 70%
- ✅ UAT approved

---

## 🚀 Deployment Strategy

### Staging Environment

**Deploy after each sprint:**
- staging.gacp.go.th
- Test with sample data
- QA team testing

### Production Deployment

**Phased rollout:**
- Week 1: 10% of applications
- Week 2: 30% of applications
- Week 3: 50% of applications
- Week 4: 100% of applications

**Monitoring:**
- Error rate < 1%
- Response time < 500ms
- Success rate > 99%

**Rollback Triggers:**
- Error rate > 5%
- Response time > 2s
- Success rate < 95%

---

## 📞 Team Communication

### Daily Standup
- **Time:** 9:30 AM
- **Duration:** 15 minutes
- **Format:** What did you do? What will you do? Blockers?

### Sprint Planning
- **Frequency:** Every 2 weeks
- **Duration:** 2 hours
- **Output:** Sprint backlog

### Sprint Review
- **Frequency:** End of sprint
- **Duration:** 1 hour
- **Attendees:** Team + Stakeholders

### Sprint Retrospective
- **Frequency:** End of sprint
- **Duration:** 45 minutes
- **Format:** What went well? What didn't? Actions?

---

## ✅ Checklist Before Starting

**Tech Lead:**
- [ ] Review all technical documents
- [ ] Approve architecture
- [ ] Assign developers to modules
- [ ] Set up project tracking (Jira/Trello)

**Backend Developers:**
- [ ] Dev environment set up
- [ ] Can run existing codebase
- [ ] Understand Clean Architecture
- [ ] Reviewed module structure

**Frontend Developers:**
- [ ] Dev environment set up
- [ ] Can run admin portal
- [ ] Reviewed UI mockups
- [ ] Understand component library

**QA Engineer:**
- [ ] Test environment set up
- [ ] Test framework configured
- [ ] Test data prepared
- [ ] Test cases drafted

**DevOps:**
- [ ] CI/CD pipeline ready
- [ ] Staging environment ready
- [ ] Monitoring configured
- [ ] Backup strategy defined

---

## 🎉 Let's Build!

**Kickoff Meeting:** Week 1, Day 1, 10:00 AM
**Location:** Conference Room A / Zoom

**Agenda:**
1. Project overview (30 min)
2. Technical walkthrough (45 min)
3. Sprint 0 planning (30 min)
4. Q&A (15 min)

**มาสร้างระบบที่ดีที่สุดด้วยกัน!** 🚀

---

**เอกสารฉบับนี้:**
- Version: 1.0
- วันที่: 5 พฤศจิกายน 2025
- สถานะ: ✅ พร้อม Kickoff
