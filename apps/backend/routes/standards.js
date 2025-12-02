const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth-middleware');
const adminAuth = require('../middleware/admin-auth-middleware');
const Standard = require('../models/Standard');
const ComparisonResult = require('../models/ComparisonResult');
const Farm = require('../models/Farm');
const logger = require('../shared').logger;
const standardsLogger = logger.createLogger('standards');

// Get all standards
router.get('/', auth, async (req, res) => {
  try {
    const { category, active, region } = req.query;

    // Build filter
    const filter = {};
    if (category) {
      filter.category = category;
    }
    if (active === 'true') {
      filter.isActive = true;
    }
    if (region) {
      filter.$or = [{ applicableRegions: region }, { applicableRegions: 'all' }];
    }

    const standards = await Standard.find(filter).sort({ name: 1 });

    res.json(standards);
  } catch (err) {
    standardsLogger.error('Error fetching standards:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new standard
router.post('/', [auth, adminAuth], async (req, res) => {
  try {
    const {
      name,
      description,
      version,
      category,
      applicableRegions,
      requirements,
      certificationProcess,
      validityPeriod,
      issuingBody,
    } = req.body;

    // Check if standard already exists
    const existingStandard = await Standard.findOne({
      name,
      version,
    });

    if (existingStandard) {
      return res.status(400).json({
        message: 'Standard with this name and version already exists',
      });
    }

    const newStandard = new Standard({
      name,
      description,
      version,
      category,
      applicableRegions: applicableRegions || ['all'],
      requirements,
      certificationProcess,
      validityPeriod,
      issuingBody,
      isActive: true,
      createdBy: req.user.id,
    });

    const standard = await newStandard.save();
    res.status(201).json(standard);
  } catch (err) {
    standardsLogger.error('Error creating standard:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get standard by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const standard = await Standard.findById(req.params.id);

    if (!standard) {
      return res.status(404).json({ message: 'Standard not found' });
    }

    res.json(standard);
  } catch (err) {
    standardsLogger.error(`Error fetching standard ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update standard
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const standard = await Standard.findById(req.params.id);

    if (!standard) {
      return res.status(404).json({ message: 'Standard not found' });
    }

    // Update fields
    const updatedStandard = await Standard.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );

    res.json(updatedStandard);
  } catch (err) {
    standardsLogger.error(`Error updating standard ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Compare farm against a standard
router.post('/compare', auth, async (req, res) => {
  try {
    const { farmId, standardId } = req.body;

    // Get farm and standard
    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check permissions for farm
    if (
      !req.user.roles.includes('admin') &&
      farm.owner.toString() !== req.user.id &&
      !farm.managers.some(m => m.toString() === req.user.id) &&
      !req.user.roles.includes('inspector')
    ) {
      return res.status(403).json({ message: 'Not authorized to access this farm' });
    }

    const standard = await Standard.findById(standardId);
    if (!standard) {
      return res.status(404).json({ message: 'Standard not found' });
    }

    // Fetch farm data needed for comparison
    // In a real implementation, this would gather all relevant farm data
    // including questionnaire responses, inspection reports, etc.

    // This is a simplified placeholder for the comparison logic
    const comparisonResults = [];
    const overallScore = { total: 0, achieved: 0 };

    for (const req of standard.requirements) {
      const result = {
        requirementId: req._id,
        name: req.name,
        category: req.category,
        complianceStatus: 'unknown',
        evidenceNeeded: [],
        notes: '',
      };

      // Here would be the actual logic to check each requirement against farm data
      // For this example, we'll generate placeholder results

      // Mock result generation - would be replaced with actual logic
      const mockStatus = ['compliant', 'partially-compliant', 'non-compliant', 'not-applicable'];
      const randomStatus = mockStatus[Math.floor(Math.random() * mockStatus.length)];

      result.complianceStatus = randomStatus;

      if (randomStatus === 'non-compliant') {
        result.evidenceNeeded.push('Documentation showing compliance with requirement');
        result.notes = 'Current farm practices do not meet this requirement';
      } else if (randomStatus === 'partially-compliant') {
        result.evidenceNeeded.push('Additional documentation needed');
        result.notes = 'Some aspects of this requirement are met, but improvements needed';
      }

      // Add to overall score if applicable
      if (randomStatus !== 'not-applicable') {
        overallScore.total += 1;
        if (randomStatus === 'compliant') {
          overallScore.achieved += 1;
        }
        if (randomStatus === 'partially-compliant') {
          overallScore.achieved += 0.5;
        }
      }

      comparisonResults.push(result);
    }

    // Calculate overall compliance percentage
    const compliancePercentage =
      overallScore.total > 0 ? (overallScore.achieved / overallScore.total) * 100 : 0;

    // Create comparison result record
    const newComparison = new ComparisonResult({
      farm: farmId,
      standard: standardId,
      comparedBy: req.user.id,
      comparedAt: new Date(),
      results: comparisonResults,
      overallCompliance: {
        percentage: compliancePercentage,
        achieved: overallScore.achieved,
        total: overallScore.total,
      },
      status: compliancePercentage >= 80 ? 'pass' : 'fail',
      recommendations:
        compliancePercentage < 80
          ? 'Several areas need improvement before certification can be achieved.'
          : 'Farm is largely compliant, minor improvements recommended.',
    });

    const savedComparison = await newComparison.save();

    res.status(201).json(savedComparison);
  } catch (err) {
    standardsLogger.error('Error comparing farm to standard:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comparison history for a farm
router.get('/farm/:farmId/comparisons', auth, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check permissions for farm
    if (
      !req.user.roles.includes('admin') &&
      farm.owner.toString() !== req.user.id &&
      !farm.managers.some(m => m.toString() === req.user.id) &&
      !req.user.roles.includes('inspector')
    ) {
      return res.status(403).json({ message: 'Not authorized to access this farm' });
    }

    const comparisons = await ComparisonResult.find({ farm: req.params.farmId })
      .populate('standard', 'name version category')
      .populate('comparedBy', 'name')
      .sort({ comparedAt: -1 });

    res.json(comparisons);
  } catch (err) {
    standardsLogger.error(`Error fetching comparisons for farm ${req.params.farmId}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comparison by ID
router.get('/comparisons/:id', auth, async (req, res) => {
  try {
    const comparison = await ComparisonResult.findById(req.params.id)
      .populate('standard', 'name version category requirements')
      .populate('farm', 'name owner managers')
      .populate('comparedBy', 'name');

    if (!comparison) {
      return res.status(404).json({ message: 'Comparison not found' });
    }

    // Check permissions
    const farm = comparison.farm;
    if (
      !req.user.roles.includes('admin') &&
      farm.owner.toString() !== req.user.id &&
      !farm.managers.some(m => m.toString() === req.user.id) &&
      !req.user.roles.includes('inspector') &&
      comparison.comparedBy._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized to access this comparison' });
    }

    res.json(comparison);
  } catch (err) {
    standardsLogger.error(`Error fetching comparison ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate action plan for non-compliant items
router.get('/comparisons/:id/action-plan', auth, async (req, res) => {
  try {
    const comparison = await ComparisonResult.findById(req.params.id)
      .populate('standard', 'name requirements')
      .populate('farm', 'name owner managers');

    if (!comparison) {
      return res.status(404).json({ message: 'Comparison not found' });
    }

    // Check permissions
    const farm = comparison.farm;
    if (
      !req.user.roles.includes('admin') &&
      farm.owner.toString() !== req.user.id &&
      !farm.managers.some(m => m.toString() === req.user.id) &&
      !req.user.roles.includes('inspector')
    ) {
      return res.status(403).json({ message: 'Not authorized to access this comparison' });
    }

    // Generate action plan for non-compliant and partially-compliant items
    const actionItems = [];

    comparison.results.forEach(result => {
      if (
        result.complianceStatus === 'non-compliant' ||
        result.complianceStatus === 'partially-compliant'
      ) {
        // Find the full requirement details from the standard
        const requirement = comparison.standard.requirements.find(
          req => req._id.toString() === result.requirementId.toString(),
        );

        const actionItem = {
          requirement: result.name,
          category: result.category,
          currentStatus: result.complianceStatus,
          description: requirement?.description || '',
          recommendedActions: [],
          evidenceNeeded: result.evidenceNeeded,
          priority: result.complianceStatus === 'non-compliant' ? 'high' : 'medium',
          estimatedEffort: requirement?.complexity || 'medium',
        };

        // Generate recommended actions based on requirement category
        // In a real system, this would be more sophisticated
        if (result.category === 'documentation') {
          actionItem.recommendedActions.push(
            'Prepare and organize required documentation',
            'Implement document management system',
          );
        } else if (result.category === 'environmental') {
          actionItem.recommendedActions.push(
            'Conduct environmental impact assessment',
            'Implement mitigation measures for identified impacts',
          );
        } else if (result.category === 'social') {
          actionItem.recommendedActions.push(
            'Review labor practices and policies',
            'Ensure fair compensation and safe working conditions',
          );
        } else if (result.category === 'technical') {
          actionItem.recommendedActions.push(
            'Update farming methods to align with requirements',
            'Invest in required equipment or infrastructure',
          );
        } else {
          actionItem.recommendedActions.push(
            'Review requirement details and develop compliance strategy',
            'Consult with certification expert for guidance',
          );
        }

        actionItems.push(actionItem);
      }
    });

    // Sort action items by priority
    actionItems.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const actionPlan = {
      farmId: comparison.farm._id,
      farmName: comparison.farm.name,
      standardId: comparison.standard._id,
      standardName: comparison.standard.name,
      comparisonId: comparison._id,
      generatedAt: new Date(),
      overallCompliance: comparison.overallCompliance,
      actionItems,
      summary: `This action plan addresses ${actionItems.length} areas that need improvement for compliance with ${comparison.standard.name}.`,
    };

    res.json(actionPlan);
  } catch (err) {
    standardsLogger.error(`Error generating action plan for comparison ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
