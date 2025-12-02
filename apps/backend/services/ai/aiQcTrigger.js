/**
 * Automatic AI QC Trigger
 * Automatically runs AI QC when application is submitted
 * Updated to use Bull queue for background processing
 */

const queueService = require('../queue/queueService');
const DTAMApplication = require('../../models/DTAMApplication');
const logger = require('../../utils/logger');

/**
 * Auto-trigger AI QC after application submission
 * Uses queue for background processing
 */
exports.autoTriggerAIQC = async applicationId => {
  try {
    logger.info(`Auto-triggering AI QC for application ${applicationId}`);

    const application = await DTAMApplication.findById(applicationId);

    if (!application) {
      throw new Error('Application not found');
    }

    // Only run AI QC for newly submitted applications
    if (application.status !== 'SUBMITTED') {
      logger.warn(`Application ${applicationId} is not in SUBMITTED status, skipping AI QC`);
      return { success: false, reason: 'Wrong status' };
    }

    // Check if AI QC already completed
    if (application.aiQcCompletedAt) {
      logger.warn(`AI QC already completed for application ${applicationId}`);
      return { success: false, reason: 'Already completed' };
    }

    // Add to queue if enabled
    if (process.env.ENABLE_QUEUE === 'true') {
      const job = await queueService.addAIQCJob(applicationId, {
        priority: 7, // Higher priority for auto-triggered
        delay: 5000, // 5 seconds delay
      });

      logger.info(`AI QC job queued for application ${applicationId}`, {
        jobId: job.id,
      });

      return { success: true, jobId: job.id, status: 'queued' };
    }

    // Fallback: Run immediately if queue disabled
    const geminiService = require('./geminiService');
    const appWithData = await DTAMApplication.findById(applicationId)
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
      logger.error(`AI QC failed for application ${applicationId}:`, qcResult.error);

      // Still update application to move forward even if AI QC fails
      appWithData.status = 'IN_REVIEW';
      appWithData.inspectionType = 'ONSITE'; // Default to safest option
      await appWithData.save();
      return { success: false, error: qcResult.error, degraded: true };
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

    logger.info(`AI QC completed successfully for application ${applicationId}`, {
      score: qcResult.data.overallScore,
      inspectionType: qcResult.data.inspectionType,
    });

    return { success: true, data: qcResult.data };
  } catch (error) {
    logger.error(`Error in auto AI QC for application ${applicationId}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Batch process multiple applications
 */
exports.batchProcessAIQC = async applicationIds => {
  const results = {
    total: applicationIds.length,
    successful: 0,
    failed: 0,
    errors: [],
  };

  for (const appId of applicationIds) {
    try {
      await exports.autoTriggerAIQC(appId);
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        applicationId: appId,
        error: error.message,
      });
    }
  }

  return results;
};

/**
 * Check if AI QC is needed
 */
exports.isAIQCNeeded = application => {
  return (
    application.status === 'SUBMITTED' &&
    !application.aiQcCompletedAt &&
    process.env.ENABLE_AI_QC === 'true'
  );
};

/**
 * Get AI QC queue (applications waiting for AI QC)
 */
exports.getAIQCQueue = async () => {
  try {
    const applications = await DTAMApplication.find({
      status: 'SUBMITTED',
      aiQcCompletedAt: { $exists: false },
    })
      .select('applicationNumber lotId farmer.name submittedAt')
      .sort({ submittedAt: 1 })
      .limit(50);

    return {
      success: true,
      count: applications.length,
      applications,
    };
  } catch (error) {
    logger.error('Error getting AI QC queue:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Process AI QC queue (cron job)
 */
exports.processAIQCQueue = async () => {
  try {
    logger.info('Starting AI QC queue processing');

    const queue = await exports.getAIQCQueue();
    if (!queue.success || queue.count === 0) {
      logger.info('No applications in AI QC queue');
      return;
    }

    const applicationIds = queue.applications.map(app => app._id);
    const results = await exports.batchProcessAIQC(applicationIds);

    logger.info('AI QC queue processing completed', results);

    return results;
  } catch (error) {
    logger.error('Error processing AI QC queue:', error);
    throw error;
  }
};
