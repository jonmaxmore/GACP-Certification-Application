const { createLogger } = require('../../shared/logger');
const logger = createLogger('business-rules-engine');

/**
 * Business Rules Engine
 *
 * Purpose: จัดการ business rules และ validation logic สำหรับระบบ GACP
 *
 * Business Rules Categories:
 * 1. Farmer Eligibility Rules
 * 2. Farm Requirements Rules
 * 3. Document Validation Rules
 * 4. Payment Processing Rules
 * 5. Certification Standards Rules
 * 6. Geographic Compliance Rules
 *
 * Rule Execution Flow:
 * 1. Rule Selection based on context
 * 2. Data Validation and Preparation
 * 3. Rule Execution with dependency handling
 * 4. Result Aggregation and Reporting
 * 5. Violation Handling and Remediation
 */

class BusinessRulesEngine {
  constructor({ configService, dataValidationService, geoService }) {
    this.configService = configService;
    this.dataValidationService = dataValidationService;
    this.geoService = geoService;

    // Initialize rule registry
    this.rules = new Map();
    this.ruleGroups = new Map();
    this.ruleDependencies = new Map();

    this._initializeRules();
    logger.info('⚖️ Business Rules Engine initialized');
  }

  /**
   * Execute business rules for specific context
   * @param {string} context - Rule execution context (SUBMISSION, APPROVAL, etc.)
   * @param {Object} data - Data to validate against rules
   * @param {Object} options - Execution options
   * @returns {Object} Validation results
   */
  async executeRules(context, data, options = {}) {
    try {
      logger.info(`⚖️ Executing business rules for context: ${context}`);

      // 1. Get applicable rules for context
      const applicableRules = this._getApplicableRules(context, data);
      logger.info(`📋 Found ${applicableRules.length} applicable rules`);

      // 2. Sort rules by priority and dependencies
      const sortedRules = this._sortRulesByDependencies(applicableRules);

      // 3. Execute rules
      const results = {
        context,
        executedAt: new Date(),
        totalRules: sortedRules.length,
        passed: 0,
        failed: 0,
        warnings: 0,
        violations: [],
        metadata: {},
      };

      for (const rule of sortedRules) {
        try {
          logger.info(`🔍 Executing rule: ${rule.name}`);

          const ruleResult = await this._executeRule(rule, data, results.metadata);

          if (ruleResult.passed) {
            results.passed++;
            logger.info(`✅ Rule passed: ${rule.name}`);
          } else {
            results.failed++;
            results.violations.push({
              rule: rule.name,
              severity: rule.severity,
              message: ruleResult.message,
              field: ruleResult.field,
              correctionHint: ruleResult.correctionHint,
              timestamp: new Date(),
            });
            logger.info(`❌ Rule failed: ${rule.name} - ${ruleResult.message}`);
          }

          // Add warnings if any
          if (ruleResult.warnings && ruleResult.warnings.length > 0) {
            results.warnings.push(
              ...ruleResult.warnings.map(warning => ({
                rule: rule.name,
                message: warning,
                timestamp: new Date(),
              })),
            );
            results.warnings++;
          }

          // Store metadata for dependent rules
          if (ruleResult.metadata) {
            results.metadata[rule.name] = ruleResult.metadata;
          }
        } catch (error) {
          logger.error(`❌ Rule execution error: ${rule.name}`, error);
          results.failed++;
          results.violations.push({
            rule: rule.name,
            severity: 'HIGH',
            message: `Rule execution failed: ${error.message}`,
            field: 'system',
            timestamp: new Date(),
          });
        }
      }

      // 4. Calculate overall result
      const criticalViolations = results.violations.filter(v => v.severity === 'CRITICAL');
      const highViolations = results.violations.filter(v => v.severity === 'HIGH');

      results.overallResult = {
        passed: criticalViolations.length === 0 && highViolations.length === 0,
        canProceed: criticalViolations.length === 0,
        requiresReview: highViolations.length > 0,
        score: this._calculateComplianceScore(results),
      };

      logger.info(`📊 Rules execution completed: ${results.passed}/${results.totalRules} passed`);
      return results;
    } catch (error) {
      logger.error(`❌ Business rules execution failed for context: ${context}`, error);
      throw error;
    }
  }

  /**
   * Initialize business rules
   */
  _initializeRules() {
    // FARMER ELIGIBILITY RULES
    this._registerRule({
      name: 'FARMER_MINIMUM_AGE',
      group: 'FARMER_ELIGIBILITY',
      context: ['SUBMISSION'],
      severity: 'CRITICAL',
      description: 'Farmer must be at least 18 years old',
      dependencies: [],
      executor: async data => {
        const birthDate = data.farmerProfile?.birthDate;
        if (!birthDate) {
          return {
            passed: false,
            message: 'Birth date is required',
            field: 'farmerProfile.birthDate',
            correctionHint: 'Please provide valid birth date',
          };
        }

        const age = this._calculateAge(birthDate);
        return {
          passed: age >= 18,
          message: age < 18 ? `Farmer age is ${age}, must be at least 18` : null,
          field: 'farmerProfile.birthDate',
          correctionHint: age < 18 ? 'Farmer must be at least 18 years old to apply' : null,
          metadata: { farmerAge: age },
        };
      },
    });

    this._registerRule({
      name: 'FARMER_MAXIMUM_AGE',
      group: 'FARMER_ELIGIBILITY',
      context: ['SUBMISSION'],
      severity: 'MEDIUM',
      description: 'Warning for farmers over 70 years old',
      dependencies: ['FARMER_MINIMUM_AGE'],
      executor: async (data, metadata) => {
        const age = metadata.FARMER_MINIMUM_AGE?.farmerAge;
        if (!age) {
          return { passed: true };
        }

        return {
          passed: true,
          warnings:
            age > 70 ? [`Farmer age is ${age}, consider additional support requirements`] : [],
          metadata: { seniorFarmer: age > 70 },
        };
      },
    });

    this._registerRule({
      name: 'FARMER_THAI_NATIONALITY',
      group: 'FARMER_ELIGIBILITY',
      context: ['SUBMISSION'],
      severity: 'HIGH',
      description: 'Farmer must be Thai national or have valid work permit',
      dependencies: [],
      executor: async data => {
        const nationality = data.farmerProfile?.nationality;
        const hasWorkPermit = data.farmerProfile?.hasWorkPermit;

        if (nationality === 'THAI') {
          return { passed: true };
        }

        if (nationality !== 'THAI' && hasWorkPermit) {
          return {
            passed: true,
            warnings: [
              'Non-Thai farmer with work permit - additional verification may be required',
            ],
          };
        }

        return {
          passed: false,
          message: 'Farmer must be Thai national or have valid work permit',
          field: 'farmerProfile.nationality',
          correctionHint: 'Please provide Thai nationality or valid work permit documentation',
        };
      },
    });

    // FARM REQUIREMENTS RULES
    this._registerRule({
      name: 'FARM_MINIMUM_SIZE',
      group: 'FARM_REQUIREMENTS',
      context: ['SUBMISSION'],
      severity: 'CRITICAL',
      description: 'Farm must meet minimum size requirements',
      dependencies: [],
      executor: async data => {
        const totalArea = data.farmProfile?.totalArea;
        const cropType = data.farmProfile?.cropDetails?.primaryCrop;

        if (!totalArea) {
          return {
            passed: false,
            message: 'Farm total area is required',
            field: 'farmProfile.totalArea',
            correctionHint: 'Please specify total farm area in rai',
          };
        }

        // Different minimum sizes for different crops
        const minimumSizes = {
          CANNABIS: 0.25, // 0.25 rai for cannabis
          HERB: 0.5, // 0.5 rai for herbs
          VEGETABLE: 1.0, // 1 rai for vegetables
          DEFAULT: 0.25,
        };

        const minSize = minimumSizes[cropType] || minimumSizes.DEFAULT;

        return {
          passed: totalArea >= minSize,
          message:
            totalArea < minSize
              ? `Farm area ${totalArea} rai is below minimum ${minSize} rai for ${cropType}`
              : null,
          field: 'farmProfile.totalArea',
          correctionHint:
            totalArea < minSize ? `Minimum farm size for ${cropType} is ${minSize} rai` : null,
          metadata: { farmArea: totalArea, minimumRequired: minSize },
        };
      },
    });

    this._registerRule({
      name: 'FARM_MAXIMUM_SIZE',
      group: 'FARM_REQUIREMENTS',
      context: ['SUBMISSION'],
      severity: 'MEDIUM',
      description: 'Large farms require additional documentation',
      dependencies: ['FARM_MINIMUM_SIZE'],
      executor: async (data, metadata) => {
        const farmArea = metadata.FARM_MINIMUM_SIZE?.farmArea;
        if (!farmArea) {
          return { passed: true };
        }

        const maxSizeThreshold = 50; // 50 rai

        return {
          passed: true,
          warnings:
            farmArea > maxSizeThreshold
              ? [`Large farm (${farmArea} rai) may require additional environmental assessment`]
              : [],
          metadata: { isLargeFarm: farmArea > maxSizeThreshold },
        };
      },
    });

    this._registerRule({
      name: 'FARM_LOCATION_VALID',
      group: 'FARM_REQUIREMENTS',
      context: ['SUBMISSION'],
      severity: 'CRITICAL',
      description: 'Farm location must be in authorized provinces',
      dependencies: [],
      executor: async data => {
        const location = data.farmProfile?.location;
        if (!location?.province) {
          return {
            passed: false,
            message: 'Farm province is required',
            field: 'farmProfile.location.province',
            correctionHint: 'Please specify farm province',
          };
        }

        // Get authorized provinces from config
        const authorizedProvinces = await this.configService.getAuthorizedProvinces();
        const isAuthorized = authorizedProvinces.includes(location.province);

        return {
          passed: isAuthorized,
          message: !isAuthorized
            ? `${location.province} is not authorized for GACP certification`
            : null,
          field: 'farmProfile.location.province',
          correctionHint: !isAuthorized
            ? `Authorized provinces: ${authorizedProvinces.join(', ')}`
            : null,
          metadata: { farmProvince: location.province, isAuthorized },
        };
      },
    });

    // GEOGRAPHIC COMPLIANCE RULES
    this._registerRule({
      name: 'FARM_WATER_SOURCE_PROXIMITY',
      group: 'GEOGRAPHIC_COMPLIANCE',
      context: ['SUBMISSION'],
      severity: 'HIGH',
      description: 'Farm must not be too close to water sources',
      dependencies: ['FARM_LOCATION_VALID'],
      executor: async (data, _metadata) => {
        const coordinates = data.farmProfile?.location?.coordinates;
        if (!coordinates) {
          return {
            passed: false,
            message: 'Farm coordinates are required for location verification',
            field: 'farmProfile.location.coordinates',
            correctionHint: 'Please provide accurate GPS coordinates',
          };
        }

        // Check proximity to water sources using geo service
        const waterSourceCheck = await this.geoService.checkWaterSourceProximity(coordinates);
        const minimumDistance = 500; // 500 meters

        return {
          passed: !waterSourceCheck.tooClose,
          message: waterSourceCheck.tooClose
            ? `Farm is ${waterSourceCheck.distance}m from water source (minimum: ${minimumDistance}m)`
            : null,
          field: 'farmProfile.location.coordinates',
          correctionHint: waterSourceCheck.tooClose
            ? 'Farm must be at least 500m from major water sources'
            : null,
          metadata: {
            distanceToWater: waterSourceCheck.distance,
            nearestWaterSource: waterSourceCheck.nearestSource,
          },
        };
      },
    });

    this._registerRule({
      name: 'FARM_SCHOOL_PROXIMITY',
      group: 'GEOGRAPHIC_COMPLIANCE',
      context: ['SUBMISSION'],
      severity: 'CRITICAL',
      description: 'Farm must not be within 1km of schools',
      dependencies: ['FARM_LOCATION_VALID'],
      executor: async (data, _metadata) => {
        const coordinates = data.farmProfile?.location?.coordinates;
        if (!coordinates) {
          return { passed: true };
        } // Will be caught by coordinate requirement rule

        const schoolCheck = await this.geoService.checkSchoolProximity(coordinates);
        const minimumDistance = 1000; // 1 kilometer

        return {
          passed: !schoolCheck.tooClose,
          message: schoolCheck.tooClose
            ? `Farm is ${schoolCheck.distance}m from school (minimum: ${minimumDistance}m)`
            : null,
          field: 'farmProfile.location.coordinates',
          correctionHint: schoolCheck.tooClose
            ? 'Farm must be at least 1km from educational institutions'
            : null,
          metadata: {
            distanceToSchool: schoolCheck.distance,
            nearestSchool: schoolCheck.nearestSchool,
          },
        };
      },
    });

    // CROP SPECIFIC RULES
    this._registerRule({
      name: 'CANNABIS_THC_COMPLIANCE',
      group: 'CROP_STANDARDS',
      context: ['SUBMISSION'],
      severity: 'CRITICAL',
      description: 'Cannabis must comply with THC content regulations',
      dependencies: [],
      executor: async data => {
        const cropDetails = data.farmProfile?.cropDetails;
        if (cropDetails?.primaryCrop !== 'CANNABIS') {
          return { passed: true }; // Rule not applicable
        }

        const thcContent = cropDetails?.expectedTHC;
        const maxTHC = 0.2; // 0.2% THC maximum

        if (thcContent === undefined) {
          return {
            passed: false,
            message: 'Expected THC content must be specified for cannabis cultivation',
            field: 'farmProfile.cropDetails.expectedTHC',
            correctionHint: `Cannabis must have THC content ≤ ${maxTHC}%`,
          };
        }

        return {
          passed: thcContent <= maxTHC,
          message:
            thcContent > maxTHC
              ? `Expected THC content ${thcContent}% exceeds maximum ${maxTHC}%`
              : null,
          field: 'farmProfile.cropDetails.expectedTHC',
          correctionHint: thcContent > maxTHC ? `THC content must not exceed ${maxTHC}%` : null,
          metadata: { thcContent, maxAllowed: maxTHC },
        };
      },
    });

    logger.info(`📋 Initialized ${this.rules.size} business rules`);
  }

  /**
   * Register a business rule
   */
  _registerRule(ruleDefinition) {
    const rule = {
      ...ruleDefinition,
      id: ruleDefinition.name,
      registeredAt: new Date(),
    };

    this.rules.set(rule.name, rule);

    // Add to group
    if (!this.ruleGroups.has(rule.group)) {
      this.ruleGroups.set(rule.group, []);
    }
    this.ruleGroups.get(rule.group).push(rule.name);

    // Register dependencies
    if (rule.dependencies && rule.dependencies.length > 0) {
      this.ruleDependencies.set(rule.name, rule.dependencies);
    }
  }

  /**
   * Get applicable rules for context
   */
  _getApplicableRules(context, _data) {
    const applicableRules = [];

    for (const [_ruleName, rule] of this.rules) {
      if (rule.context.includes(context)) {
        applicableRules.push(rule);
      }
    }

    return applicableRules;
  }

  /**
   * Sort rules by dependencies
   */
  _sortRulesByDependencies(rules) {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = ruleName => {
      if (visiting.has(ruleName)) {
        throw new Error(`Circular dependency detected involving rule: ${ruleName}`);
      }

      if (visited.has(ruleName)) {
        return;
      }

      visiting.add(ruleName);

      const dependencies = this.ruleDependencies.get(ruleName) || [];
      for (const dep of dependencies) {
        visit(dep);
      }

      visiting.delete(ruleName);
      visited.add(ruleName);

      const rule = rules.find(r => r.name === ruleName);
      if (rule && !sorted.includes(rule)) {
        sorted.push(rule);
      }
    };

    // Visit all rules
    for (const rule of rules) {
      visit(rule.name);
    }

    return sorted;
  }

  /**
   * Execute individual rule
   */
  async _executeRule(rule, data, metadata) {
    try {
      const result = await rule.executor(data, metadata);

      return {
        passed: result.passed,
        message: result.message,
        field: result.field,
        correctionHint: result.correctionHint,
        warnings: result.warnings || [],
        metadata: result.metadata,
      };
    } catch (error) {
      logger.error(`Rule execution error: ${rule.name}`, error);
      throw error;
    }
  }

  /**
   * Calculate compliance score
   */
  _calculateComplianceScore(results) {
    if (results.totalRules === 0) {
      return 100;
    }

    const criticalWeight = 40;
    const highWeight = 30;
    const mediumWeight = 20;
    const lowWeight = 10;

    let totalWeight = 0;
    let earnedWeight = 0;

    results.violations.forEach(violation => {
      let weight;
      switch (violation.severity) {
        case 'CRITICAL':
          weight = criticalWeight;
          break;
        case 'HIGH':
          weight = highWeight;
          break;
        case 'MEDIUM':
          weight = mediumWeight;
          break;
        case 'LOW':
          weight = lowWeight;
          break;
        default:
          weight = mediumWeight;
      }
      totalWeight += weight;
    });

    // Add weight for passed rules
    const passedWeight = results.passed * mediumWeight;
    totalWeight += passedWeight;
    earnedWeight = passedWeight;

    return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100;
  }

  /**
   * Calculate age from birth date
   */
  _calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }
}

module.exports = BusinessRulesEngine;
