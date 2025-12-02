/**
 * AI QC Controller
 * Handles AI Quality Control operations for GACP applications
 */

const geminiService = require('../services/ai/geminiService');
const queueService = require('../services/queue/queueService');
const cacheService = require('../services/cache/cacheService');
const DTAMApplication = require('../models/DTAMApplication');
const logger = require('../utils/logger');

/**
 * Run AI QC on a submitted application (async with queue)
 */
exports.runAIQC = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { useQueue = true } = req.body; // Option to run immediately or queue

    const application = await DTAMApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.status !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: 'Application must be in SUBMITTED status for AI QC',
      });
    }

    // Add to queue for background processing
    if (useQueue && process.env.ENABLE_QUEUE === 'true') {
      const job = await queueService.addAIQCJob(applicationId, {
        priority: 5,
      });

      logger.info(`AI QC job queued for application ${applicationId}`, {
        jobId: job.id,
      });

      return res.json({
        success: true,
        message: 'AI QC queued for processing',
        data: {
          jobId: job.id,
          status: 'queued',
        },
      });
    }

    // Run immediately (fallback or when queue disabled)
    const appWithData = await DTAMApplication.findById(applicationId)
      .populate('farmer.user')
      .populate('documents')
      .populate('images');

    // Run AI QC
    const qcResult = await geminiService.performAIQC({
      id: appWithData._id,
      lotId: appWithData.lotId,
      farmer: {
        name: appWithData.farmer.name,
        idCard: appWithData.farmer.idCard,
      },
      farm: {
        name: appWithData.farmer.farmName,
        location: appWithData.farmer.farmLocation,
        area: appWithData.farmArea,
      },
      documents: appWithData.documents || [],
      images: appWithData.images || [],
    });

    if (!qcResult.success) {
      return res.status(500).json({
        success: false,
        message: 'AI QC failed',
        error: qcResult.error,
      });
    }

    // Update application with AI QC results
    appWithData.aiQc = {
      completedAt: new Date(),
      overallScore: qcResult.data.overallScore,
      scores: qcResult.data.scores,
      inspectionType: qcResult.data.inspectionType,
      issues: qcResult.data.issues,
      recommendations: qcResult.data.recommendations,
    };

    appWithData.inspectionType = qcResult.data.inspectionType;
    appWithData.status = 'IN_REVIEW';
    appWithData.aiQcCompletedAt = new Date();

    await appWithData.save();

    // Cache AI QC result
    await cacheService.cacheAIQCResult(applicationId, qcResult.data);

    logger.info(`AI QC completed for application ${applicationId}`, {
      score: qcResult.data.overallScore,
      inspectionType: qcResult.data.inspectionType,
    });

    res.json({
      success: true,
      message: 'AI QC completed successfully',
      data: {
        applicationId: application._id,
        overallScore: qcResult.data.overallScore,
        inspectionType: qcResult.data.inspectionType,
        issues: qcResult.data.issues,
        recommendations: qcResult.data.recommendations,
      },
    });
  } catch (error) {
    logger.error('AI QC error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run AI QC',
      error: error.message,
    });
  }
};

/**
 * Get AI QC results
 */
exports.getAIQCResults = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Try to get from cache first
    const cachedResult = await cacheService.getAIQCResult(applicationId);

    if (cachedResult) {
      logger.debug(`Cache hit for AI QC result: ${applicationId}`);
      return res.json({
        success: true,
        data: cachedResult,
        cached: true,
      });
    }

    const application = await DTAMApplication.findById(applicationId).select(
      'aiQc inspectionType aiQcCompletedAt',
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (!application.aiQc) {
      return res.status(404).json({
        success: false,
        message: 'AI QC not completed for this application',
      });
    }

    // Cache the result
    await cacheService.cacheAIQCResult(applicationId, application.aiQc);

    res.json({
      success: true,
      data: application.aiQc,
    });
  } catch (error) {
    logger.error('Get AI QC results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI QC results',
      error: error.message,
    });
  }
};

/**
 * OCR - Extract text from image
 */
exports.extractText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    const result = await geminiService.extractTextFromImage(req.file.path);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'OCR failed',
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: {
        extractedText: result.extractedText,
        confidence: result.confidence,
      },
    });
  } catch (error) {
    logger.error('OCR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract text',
      error: error.message,
    });
  }
};

/**
 * Validate document
 */
exports.validateDocument = async (req, res) => {
  try {
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file provided',
      });
    }

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: 'Document type is required',
      });
    }

    const result = await geminiService.validateGACPDocument(req.file.path, documentType);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Document validation failed',
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error('Document validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate document',
      error: error.message,
    });
  }
};

/**
 * Analyze image quality
 */
exports.analyzeImageQuality = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    const result = await geminiService.analyzeImageQuality(req.file.path);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Image analysis failed',
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error('Image analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze image',
      error: error.message,
    });
  }
};

/**
 * Compare two documents
 */
exports.compareDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Exactly 2 document files are required',
      });
    }

    const [doc1, doc2] = req.files;
    const result = await geminiService.compareDocuments(doc1.path, doc2.path);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Document comparison failed',
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error('Document comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare documents',
      error: error.message,
    });
  }
};

/**
 * Batch OCR processing
 */
exports.batchOCR = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided',
      });
    }

    const imagePaths = req.files.map(file => file.path);
    const results = await geminiService.batchOCR(imagePaths);

    res.json({
      success: true,
      data: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      },
    });
  } catch (error) {
    logger.error('Batch OCR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process batch OCR',
      error: error.message,
    });
  }
};

/**
 * Get AI QC statistics
 */
exports.getAIQCStats = async (req, res) => {
  try {
    const stats = await DTAMApplication.aggregate([
      {
        $match: {
          aiQcCompletedAt: { $exists: true },
        },
      },
      {
        $group: {
          _id: '$inspectionType',
          count: { $sum: 1 },
          avgScore: { $avg: '$aiQc.overallScore' },
        },
      },
    ]);

    const totalProcessed = await DTAMApplication.countDocuments({
      aiQcCompletedAt: { $exists: true },
    });

    res.json({
      success: true,
      data: {
        totalProcessed,
        byInspectionType: stats,
        overallAvgScore: stats.reduce((sum, s) => sum + s.avgScore, 0) / stats.length || 0,
      },
    });
  } catch (error) {
    logger.error('Get AI QC stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI QC statistics',
      error: error.message,
    });
  }
};
