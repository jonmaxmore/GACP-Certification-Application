const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth-middleware');
const adminAuth = require('../middleware/admin-auth-middleware');
const Questionnaire = require('../models/Questionnaire');
const QuestionnaireResponse = require('../models/QuestionnaireResponse');
const Farm = require('../models/Farm');
const logger = require('../shared').logger;
const questionnaireLogger = logger.createLogger('questionnaires');

// Get all questionnaires (templates)
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, region, farmType } = req.query;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (type) {
      filter.type = type;
    }

    // Region filter
    if (region) {
      filter.$or = [{ applicableRegions: region }, { applicableRegions: 'all' }];
    }

    // Farm type filter
    if (farmType) {
      filter.$or = [{ targetFarmTypes: farmType }, { targetFarmTypes: 'all' }];
    }

    // Regular users only see active questionnaires
    if (!req.user.roles.includes('admin')) {
      filter.status = 'active';
    }

    const questionnaires = await Questionnaire.find(filter)
      .select('title description type status version applicableRegions targetFarmTypes createdAt')
      .sort({ createdAt: -1 });

    res.json(questionnaires);
  } catch (err) {
    questionnaireLogger.error('Error fetching questionnaires:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new questionnaire template
router.post('/', [auth, adminAuth], async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      version,
      applicableRegions,
      targetFarmTypes,
      sections,
      scoringSystem,
    } = req.body;

    // Check version uniqueness
    const existingQuestionnaire = await Questionnaire.findOne({
      title,
      version,
    });

    if (existingQuestionnaire) {
      return res.status(400).json({
        message: 'Questionnaire with this title and version already exists',
      });
    }

    const newQuestionnaire = new Questionnaire({
      title,
      description,
      type,
      version,
      applicableRegions: applicableRegions || ['all'],
      targetFarmTypes: targetFarmTypes || ['all'],
      sections: sections || [],
      scoringSystem: scoringSystem || { enabled: false },
      createdBy: req.user.id,
    });

    const questionnaire = await newQuestionnaire.save();
    res.status(201).json(questionnaire);
  } catch (err) {
    questionnaireLogger.error('Error creating questionnaire:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get questionnaire by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findById(req.params.id);

    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }

    // Check if user can access
    if (questionnaire.status !== 'active' && !req.user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(questionnaire);
  } catch (err) {
    questionnaireLogger.error(`Error fetching questionnaire ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update questionnaire
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findById(req.params.id);

    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }

    // Don't allow updates to active or archived questionnaires
    if (questionnaire.status !== 'draft') {
      return res.status(400).json({
        message: 'Only draft questionnaires can be updated',
      });
    }

    const updatedQuestionnaire = await Questionnaire.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );

    res.json(updatedQuestionnaire);
  } catch (err) {
    questionnaireLogger.error(`Error updating questionnaire ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Activate questionnaire
router.patch('/:id/activate', [auth, adminAuth], async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findById(req.params.id);

    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }

    if (questionnaire.status === 'archived') {
      return res.status(400).json({ message: 'Cannot activate archived questionnaire' });
    }

    questionnaire.status = 'active';
    await questionnaire.save();

    res.json({
      status: 'active',
      message: 'Questionnaire activated successfully',
    });
  } catch (err) {
    questionnaireLogger.error(`Error activating questionnaire ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Archive questionnaire
router.patch('/:id/archive', [auth, adminAuth], async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findById(req.params.id);

    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }

    questionnaire.status = 'archived';
    await questionnaire.save();

    res.json({
      status: 'archived',
      message: 'Questionnaire archived successfully',
    });
  } catch (err) {
    questionnaireLogger.error(`Error archiving questionnaire ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new questionnaire response
router.post('/:id/responses', auth, async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findById(req.params.id);

    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }

    if (questionnaire.status !== 'active') {
      return res.status(400).json({
        message: 'Cannot respond to inactive questionnaire',
      });
    }

    const { farmId, responses } = req.body;

    // Verify farm exists and user has access
    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check permissions
    if (
      !req.user.roles.includes('admin') &&
      farm.owner.toString() !== req.user.id &&
      !farm.managers.some(m => m.toString() === req.user.id)
    ) {
      return res.status(403).json({ message: 'Access denied to this farm' });
    }

    // Extract farm's region for regional specificity
    const region = farm.region;

    const newResponse = new QuestionnaireResponse({
      questionnaire: questionnaire._id,
      farm: farmId,
      respondent: req.user.id,
      status: req.body.status || 'draft',
      responses: responses || [],
      region: region,
      location: farm.location,
    });

    // If submitting directly, record submission date
    if (req.body.status === 'submitted') {
      newResponse.submittedAt = new Date();

      // Calculate score if scoring is enabled
      if (questionnaire.scoringSystem.enabled) {
        // Scoring logic would go here
        // This is simplified for now
        const totalScore = 0;
        // Calculate total score based on answers...
        newResponse.overallScore = totalScore;
        newResponse.passingScore = questionnaire.scoringSystem.passingScore;
        newResponse.result =
          totalScore >= questionnaire.scoringSystem.passingScore ? 'pass' : 'fail';
      }
    }

    const savedResponse = await newResponse.save();

    // If submitted, notify inspectors
    if (req.body.status === 'submitted') {
      const io = req.app.get('io');
      if (io) {
        io.to('inspectors-channel').emit('new-questionnaire-submission', {
          responseId: savedResponse._id,
          questionnaireTitle: questionnaire.title,
          farmName: farm.name,
          submittedBy: req.user.id,
          region: region,
          timestamp: new Date(),
        });
      }
    }

    res.status(201).json(savedResponse);
  } catch (err) {
    questionnaireLogger.error(`Error creating response for questionnaire ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all responses for farm
router.get('/farm/:farmId/responses', auth, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.farmId);

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check permissions
    if (
      !req.user.roles.includes('admin') &&
      farm.owner.toString() !== req.user.id &&
      !farm.managers.some(m => m.toString() === req.user.id) &&
      !req.user.roles.includes('inspector')
    ) {
      return res.status(403).json({ message: 'Access denied to this farm' });
    }

    const responses = await QuestionnaireResponse.find({ farm: req.params.farmId })
      .populate('questionnaire', 'title type version')
      .populate('respondent', 'name')
      .populate('reviewedBy', 'name')
      .sort({ updatedAt: -1 });

    res.json(responses);
  } catch (err) {
    questionnaireLogger.error(`Error fetching responses for farm ${req.params.farmId}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Regional analytics endpoint
router.get('/analytics/regional', [auth, adminAuth], async (req, res) => {
  try {
    // Count submissions by region
    const submissionsByRegion = await QuestionnaireResponse.aggregate([
      { $match: { status: { $in: ['submitted', 'approved'] } } },
      { $group: { _id: '$region', count: { $sum: 1 } } },
    ]);

    // Average scores by region (if scoring is enabled)
    const scoresByRegion = await QuestionnaireResponse.aggregate([
      {
        $match: {
          status: { $in: ['approved'] },
          overallScore: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$region',
          avgScore: { $avg: '$overallScore' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Pass/fail rates by region
    const resultsByRegion = await QuestionnaireResponse.aggregate([
      {
        $match: {
          status: { $in: ['approved'] },
          result: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: { region: '$region', result: '$result' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.region',
          results: {
            $push: {
              result: '$_id.result',
              count: '$count',
            },
          },
          totalCount: { $sum: '$count' },
        },
      },
    ]);

    // Format results
    const formattedResults = resultsByRegion.map(item => {
      const passCount = item.results.find(r => r.result === 'pass')?.count || 0;
      const failCount = item.results.find(r => r.result === 'fail')?.count || 0;

      return {
        region: item._id,
        passRate: (passCount / item.totalCount) * 100,
        failRate: (failCount / item.totalCount) * 100,
        passCount,
        failCount,
        totalCount: item.totalCount,
      };
    });

    res.json({
      submissionsByRegion,
      scoresByRegion,
      resultsByRegion: formattedResults,
    });
  } catch (err) {
    questionnaireLogger.error('Error generating regional analytics:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
