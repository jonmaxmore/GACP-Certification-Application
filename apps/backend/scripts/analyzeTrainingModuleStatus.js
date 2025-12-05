/**
 * Training Module Validation Script
 *
 * วิเคราะห์สถานะปัจจุบันของ Training Module และแนวทางการพัฒนาต่อไป
 * มุ่งเน้นให้มี logic, workflow และ process ที่ชัดเจน
 */

const logger = require('../shared/logger');
const fs = require('fs');
const path = require('path');

class TrainingModuleStatusAnalyzer {
  constructor() {
    this.results = {
      currentStatus: {},
      missingComponents: [],
      businessLogicGaps: [],
      workflowIssues: [],
      recommendations: [],
    };

    this.trainingModulePath = path.join(__dirname, '../modules/training');
  }

  /**
   * วิเคราะห์สถานะปัจจุบันของ Training Module
   */
  async analyzeCurrentStatus() {
    logger.info('🔍 TRAINING MODULE STATUS ANALYSIS');
    logger.info('='.repeat(60));

    // 1. ตรวจสอบโครงสร้างไฟล์
    logger.info('\n📁 Analyzing File Structure...');
    await this.analyzeFileStructure();

    // 2. ตรวจสอบ Business Logic Implementation
    logger.info('\n🔧 Analyzing Business Logic...');
    await this.analyzeBusinessLogic();

    // 3. ตรวจสอบ Workflow Integration
    logger.info('\n🔄 Analyzing Workflow Integration...');
    await this.analyzeWorkflowIntegration();

    // 4. ตรวจสอบ API Routes และ Controllers
    logger.info('\n🛣️ Analyzing API Implementation...');
    await this.analyzeAPIImplementation();

    // 5. วิเคราะห์ช่องว่างและข้อเสนอแนะ
    logger.info('\n🎯 Generating Recommendations...');
    this.generateRecommendations();

    // 6. สร้างรายงานสรุป
    logger.info('\n📊 Generating Status Report...');
    this.generateStatusReport();

    return this.results;
  }

  /**
   * ตรวจสอบโครงสร้างไฟล์
   */
  async analyzeFileStructure() {
    const requiredStructure = {
      'domain/entities': ['Course.js', 'Enrollment.js'],
      'domain/services': ['EnhancedTrainingServiceIntegration.js'],
      'application/use-cases': [
        'CreateCourseUseCase.js',
        'EnrollInCourseUseCase.js',
        'UpdateProgressUseCase.js',
        'CompleteCourseUseCase.js',
      ],
      'infrastructure/repositories': ['CourseRepository.js', 'EnrollmentRepository.js'],
      'presentation/controllers': ['EnhancedTrainingController.js'],
      'presentation/routes': ['enhanced-training.routes.js'],
      services: [
        'AdvancedTrainingAnalyticsSystem.js',
        'CertificationTrackingIntegrationSystem.js',
        'PerformanceAssessmentToolsSystem.js',
      ],
      '__tests__/integration': ['enhanced-training-module.integration.test.js'],
    };

    let totalFiles = 0;
    let existingFiles = 0;

    for (const [folder, files] of Object.entries(requiredStructure)) {
      logger.info(`  📂 ${folder}:`);

      for (const file of files) {
        totalFiles++;
        const filePath = path.join(this.trainingModulePath, folder, file);

        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          const sizeKB = Math.round(stats.size / 1024);
          logger.info(`    ✅ ${file} (${sizeKB} KB);`);
          existingFiles++;
        } else {
          logger.info(`    ❌ ${file} - MISSING`);
          this.results.missingComponents.push(`${folder}/${file}`);
        }
      }
    }

    const completionRate = Math.round((existingFiles / totalFiles) * 100);
    console.log(
      `\n  📊 File Structure Completion: ${completionRate}% (${existingFiles}/${totalFiles})`,
    );

    this.results.currentStatus.fileStructure = {
      completionRate,
      existingFiles,
      totalFiles,
      missingFiles: totalFiles - existingFiles,
    };
  }

  /**
   * ตรวจสอบ Business Logic Implementation
   */
  async analyzeBusinessLogic() {
    const businessLogicChecks = [
      {
        name: 'Course Management Logic',
        file: 'domain/entities/Course.js',
        keywords: ['validate', 'business rules', 'status', 'prerequisites'],
      },
      {
        name: 'Enrollment Workflow',
        file: 'domain/entities/Enrollment.js',
        keywords: ['progress tracking', 'completion', 'assessment', 'certificate'],
      },
      {
        name: 'Enhanced Service Integration',
        file: 'domain/services/EnhancedTrainingServiceIntegration.js',
        keywords: ['analytics integration', 'certification tracking', 'performance assessment'],
      },
      {
        name: 'Analytics System',
        file: 'services/AdvancedTrainingAnalyticsSystem.js',
        keywords: ['predictive analytics', 'learning patterns', 'performance metrics'],
      },
    ];

    let implementedLogic = 0;

    for (const check of businessLogicChecks) {
      const filePath = path.join(this.trainingModulePath, check.file);

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasBusinessLogic = check.keywords.some(keyword =>
          content.toLowerCase().includes(keyword.toLowerCase()),
        );

        if (hasBusinessLogic) {
          logger.info(`    ✅ ${check.name}`);
          implementedLogic++;
        } else {
          logger.info(`    ⚠️  ${check.name} - Limited business logic`);
          this.results.businessLogicGaps.push(check.name);
        }
      } else {
        logger.info(`    ❌ ${check.name} - File missing`);
        this.results.businessLogicGaps.push(check.name);
      }
    }

    const businessLogicScore = Math.round((implementedLogic / businessLogicChecks.length) * 100);
    logger.info(`\n  📊 Business Logic Implementation: ${businessLogicScore}%`);

    this.results.currentStatus.businessLogic = {
      score: businessLogicScore,
      implementedChecks: implementedLogic,
      totalChecks: businessLogicChecks.length,
    };
  }

  /**
   * ตรวจสอบ Workflow Integration
   */
  async analyzeWorkflowIntegration() {
    const workflowChecks = [
      {
        name: 'Enrollment Workflow',
        description: 'Complete enrollment process from registration to completion',
        components: ['enrollment creation', 'progress tracking', 'completion certification'],
      },
      {
        name: 'Assessment Workflow',
        description: 'Assessment and certification process',
        components: ['assessment creation', 'scoring logic', 'certificate generation'],
      },
      {
        name: 'Analytics Integration',
        description: 'Integration with analytics and performance systems',
        components: ['data collection', 'analytics processing', 'reporting dashboard'],
      },
      {
        name: 'Government Integration',
        description: 'Integration with government certification systems',
        components: ['compliance reporting', 'certificate submission', 'status tracking'],
      },
    ];

    let implementedWorkflows = 0;

    for (const workflow of workflowChecks) {
      let workflowImplemented = true;
      const missingComponents = [];

      // ตรวจสอบว่ามี component ที่จำเป็นครบหรือไม่
      for (const component of workflow.components) {
        const found = await this.searchInTrainingModule(component);
        if (!found) {
          workflowImplemented = false;
          missingComponents.push(component);
        }
      }

      if (workflowImplemented) {
        logger.info(`    ✅ ${workflow.name}`);
        implementedWorkflows++;
      } else {
        logger.info(`    ❌ ${workflow.name} - Missing: ${missingComponents.join(', ')}`);
        this.results.workflowIssues.push({
          workflow: workflow.name,
          missingComponents,
        });
      }
    }

    const workflowScore = Math.round((implementedWorkflows / workflowChecks.length) * 100);
    logger.info(`\n  📊 Workflow Integration: ${workflowScore}%`);

    this.results.currentStatus.workflowIntegration = {
      score: workflowScore,
      implementedWorkflows,
      totalWorkflows: workflowChecks.length,
    };
  }

  /**
   * ตรวจสอบ API Implementation
   */
  async analyzeAPIImplementation() {
    const apiComponents = [
      {
        name: 'Enhanced Training Controller',
        file: 'presentation/controllers/EnhancedTrainingController.js',
        expectedMethods: [
          'createCourse',
          'enrollInCourse',
          'updateProgress',
          'completeCourse',
          'getAnalytics',
          'getCertificationStatus',
          'getSystemStatus',
        ],
      },
      {
        name: 'Enhanced Training Routes',
        file: 'presentation/routes/enhanced-training.routes.js',
        expectedRoutes: [
          'POST /courses',
          'POST /enrollments',
          'PUT /progress',
          'GET /analytics',
          'GET /certifications',
          'GET /system/status',
        ],
      },
    ];

    let implementedAPIs = 0;

    for (const api of apiComponents) {
      const filePath = path.join(this.trainingModulePath, api.file);

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const sizeKB = Math.round(fs.statSync(filePath).size / 1024);

        // ตรวจสอบว่ามี methods/routes ที่ต้องการ
        const hasExpectedFeatures = api.expectedMethods
          ? api.expectedMethods.some(method => content.includes(method))
          : api.expectedRoutes.some(route => content.includes(route.split(' ')[1]));

        if (hasExpectedFeatures && sizeKB > 10) {
          logger.info(`    ✅ ${api.name} (${sizeKB} KB);`);
          implementedAPIs++;
        } else {
          logger.info(`    ⚠️  ${api.name} - Limited implementation (${sizeKB} KB);`);
        }
      } else {
        logger.info(`    ❌ ${api.name} - File missing`);
      }
    }

    const apiScore = Math.round((implementedAPIs / apiComponents.length) * 100);
    logger.info(`\n  📊 API Implementation: ${apiScore}%`);

    this.results.currentStatus.apiImplementation = {
      score: apiScore,
      implementedAPIs,
      totalAPIs: apiComponents.length,
    };
  }

  /**
   * ค้นหาคำสำคัญใน Training Module
   */
  async searchInTrainingModule(keyword) {
    try {
      const searchDirs = ['domain', 'application', 'infrastructure', 'presentation', 'services'];

      for (const dir of searchDirs) {
        const dirPath = path.join(this.trainingModulePath, dir);
        if (fs.existsSync(dirPath)) {
          const found = await this.searchInDirectory(dirPath, keyword);
          if (found) {
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * ค้นหาในโฟลเดอร์
   */
  async searchInDirectory(dirPath, keyword) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        const found = await this.searchInDirectory(filePath, keyword);
        if (found) {
          return true;
        }
      } else if (file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * สร้างข้อเสนอแนะ
   */
  generateRecommendations() {
    // คำนวณคะแนนรวม
    const scores = this.results.currentStatus;
    const overallScore = Math.round(
      ((scores.fileStructure?.completionRate || 0) +
        (scores.businessLogic?.score || 0) +
        (scores.workflowIntegration?.score || 0) +
        (scores.apiImplementation?.score || 0)) /
        4,
    );

    this.results.currentStatus.overallScore = overallScore;

    // สร้างข้อเสนะแนะตามความต้องการ
    if (overallScore >= 90) {
      this.results.recommendations = [
        'Training Module มีความสมบูรณ์สูง - พร้อม Production',
        'ควรทำการ Integration Testing เพื่อยืนยันการทำงาน',
        'เพิ่ม Performance Optimization และ Monitoring',
      ];
    } else if (overallScore >= 75) {
      this.results.recommendations = [
        'Training Module ใกล้เสร็จสมบูรณ์ - ต้องการการพัฒนาเพิ่มเติม',
        'เพิ่มเติม Business Logic ที่ขาดหายไป',
        'ปรับปรุง Workflow Integration ให้สมบูรณ์',
        'เสริม API Implementation ให้ครบถ้วน',
      ];
    } else {
      this.results.recommendations = [
        'Training Module ต้องการการพัฒนาเพิ่มเติมอย่างมาก',
        'เริ่มจากการสร้าง Missing Components ที่จำเป็น',
        'พัฒนา Business Logic และ Workflow Integration',
        'สร้าง API Layer ที่สมบูรณ์',
      ];
    }

    // เพิ่มข้อเสนะแนะเฉพาะ
    if (this.results.missingComponents.length > 0) {
      this.results.recommendations.push(
        `สร้างไฟล์ที่ขาดหายไป: ${this.results.missingComponents.length} ไฟล์`,
      );
    }

    if (this.results.businessLogicGaps.length > 0) {
      this.results.recommendations.push(
        'เสริม Business Logic ใน: ' + this.results.businessLogicGaps.join(', '),
      );
    }

    if (this.results.workflowIssues.length > 0) {
      this.results.recommendations.push(
        'แก้ไข Workflow Issues: ' + this.results.workflowIssues.length + ' workflow',
      );
    }
  }

  /**
   * สร้างรายงานสรุป
   */
  generateStatusReport() {
    const status = this.results.currentStatus;

    logger.info('\n📊 TRAINING MODULE STATUS SUMMARY');
    logger.info('='.repeat(60));

    logger.info(`\n🎯 Overall Completion: ${status.overallScore}%`);

    logger.info('\n📈 Component Breakdown:');
    logger.info(`  📁 File Structure: ${status.fileStructure?.completionRate || 0}%`);
    logger.info(`  🔧 Business Logic: ${status.businessLogic?.score || 0}%`);
    logger.info(`  🔄 Workflow Integration: ${status.workflowIntegration?.score || 0}%`);
    logger.info(`  🛣️ API Implementation: ${status.apiImplementation?.score || 0}%`);

    if (this.results.missingComponents.length > 0) {
      logger.info(`\n❌ Missing Components (${this.results.missingComponents.length});:`);
      this.results.missingComponents.forEach(component => {
        logger.info(`  - ${component}`);
      });
    }

    if (this.results.workflowIssues.length > 0) {
      logger.info(`\n⚠️  Workflow Issues (${this.results.workflowIssues.length});:`);
      this.results.workflowIssues.forEach(issue => {
        logger.info(`  - ${issue.workflow}: Missing ${issue.missingComponents.join(', ')}`);
      });
    }

    logger.info('\n🎯 Recommendations:');
    this.results.recommendations.forEach((rec, index) => {
      logger.info(`  ${index + 1}. ${rec}`);
    });

    logger.info('\n🎖️ Next Steps:');
    if (status.overallScore >= 85) {
      logger.info('  ✅ Ready for final enhancement to 100%');
      logger.info('  🚀 Focus on testing and optimization');
    } else {
      logger.info('  🔧 Complete missing components first');
      logger.info('  📋 Implement business logic workflows');
      logger.info('  🔄 Ensure process integration');
    }

    logger.info('='.repeat(60));
  }
}

// Main execution
async function main() {
  const analyzer = new TrainingModuleStatusAnalyzer();
  const results = await analyzer.analyzeCurrentStatus();

  // Export results for further use
  const reportPath = path.join(__dirname, '../TRAINING_MODULE_STATUS_ANALYSIS.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  logger.info(`\n📄 Detailed analysis saved to: ${reportPath}`);

  return results;
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TrainingModuleStatusAnalyzer };
