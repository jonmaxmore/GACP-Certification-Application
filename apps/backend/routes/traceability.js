const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth-middleware');
const { adminAuth } = require('../middleware/auth-middleware');
const Batch = require('../models/Batch');
const Farm = require('../models/Farm');
const _Crop = require('../models/_Crop');
const QRCode = require('qrcode');
const logger = require('../shared').logger;
const traceLogger = logger.createLogger('traceability');

// Create a new batch
router.post('/batches', auth, async (req, res) => {
  try {
    const { product, farm, harvestDate, quantity, processingSteps, qualityChecks } = req.body;

    // Validate input data
    if (!product || !farm || !harvestDate || !quantity) {
      return res
        .status(400)
        .json({ message: 'Product, farm, harvest date, and quantity are required' });
    }

    // Create new batch
    const batch = new Batch({
      product,
      farm,
      harvestDate,
      quantity: {
        initial: quantity,
        current: quantity,
      },
      processingSteps: processingSteps || [],
      qualityChecks: qualityChecks || [],
      createdBy: req.user.id,
    });

    // Generate batch ID and traceability code
    const batchId = `BATCH-${Date.now()}`;
    const traceabilityCode = await QRCode.toDataURL(batchId);

    batch.batchId = batchId;
    batch.traceabilityCode = traceabilityCode;

    await batch.save();

    res.status(201).json(batch);
  } catch (err) {
    traceLogger.error('Error creating batch:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get batches for a farm
router.get('/farms/:farmId/batches', auth, async (req, res) => {
  try {
    const { farmId } = req.params;

    // Check permissions
    const isAdmin = req.user.roles.includes('admin');
    const isFarmManager =
      req.user.roles.includes('manager') &&
      (await Farm.findById(farmId)).managers.includes(req.user.id);

    if (!isAdmin && !isFarmManager) {
      return res.status(403).json({ message: 'Not authorized to view these batches' });
    }

    const batches = await Batch.find({ farm: farmId })
      .populate('product', 'name scientificName variety')
      .populate('farm', 'name region contactDetails.address certifications')
      .populate('createdBy', 'name')
      .populate('processingSteps.performedBy', 'name')
      .populate('qualityChecks.performedBy', 'name');

    res.json(batches);
  } catch (err) {
    traceLogger.error('Error fetching batches:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add processing step to batch
router.post('/batches/:id/processing-steps', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, location, startTime, endTime, notes } = req.body;

    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check permissions
    const isAdmin = req.user.roles.includes('admin');
    const isBatchOwner = batch.createdBy.toString() === req.user.id;

    if (!isAdmin && !isBatchOwner) {
      return res
        .status(403)
        .json({ message: 'Not authorized to add processing steps to this batch' });
    }

    // Add processing step
    batch.processingSteps.push({
      type,
      location,
      startTime,
      endTime,
      performedBy: req.user.id,
      notes,
    });

    await batch.save();

    res.status(201).json(batch);
  } catch (err) {
    traceLogger.error(`Error adding processing step to batch ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add quality check to batch
router.post('/batches/:id/quality-checks', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, performedAt, passed, notes } = req.body;

    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check permissions
    const isAdmin = req.user.roles.includes('admin');
    const isBatchOwner = batch.createdBy.toString() === req.user.id;

    if (!isAdmin && !isBatchOwner) {
      return res
        .status(403)
        .json({ message: 'Not authorized to add quality checks to this batch' });
    }

    // Add quality check
    batch.qualityChecks.push({
      type,
      performedAt,
      passed,
      performedBy: req.user.id,
      notes,
    });

    await batch.save();

    res.status(201).json(batch);
  } catch (err) {
    traceLogger.error(`Error adding quality check to batch ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public verification endpoint (no auth required)
router.get('/batches/verify/:traceabilityCode', async (req, res) => {
  try {
    const { traceabilityCode } = req.params;

    const batch = await Batch.findOne({ traceabilityCode })
      .populate('product', 'name scientificName variety')
      .populate('farm', 'name region contactDetails.address certifications')
      .populate('createdBy', 'name')
      .populate('processingSteps.performedBy', 'name')
      .populate('qualityChecks.performedBy', 'name');

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json(batch);
  } catch (err) {
    traceLogger.error(
      `Error verifying batch with traceability code ${req.params.traceabilityCode}:`,
      err,
    );
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate traceability report
router.get('/batches/:id/report', auth, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('product', 'name scientificName variety')
      .populate('farm', 'name region contactDetails.address certifications')
      .populate('createdBy', 'name')
      .populate('processingSteps.performedBy', 'name')
      .populate('qualityChecks.performedBy', 'name');

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check permissions
    const hasFarmAccess =
      req.user.roles.includes('admin') ||
      batch.farm.owner.toString() === req.user.id ||
      batch.farm.managers.some(m => m.toString() === req.user.id);
    const isInspector = req.user.roles.includes('inspector');

    if (!hasFarmAccess && !isInspector) {
      return res.status(403).json({ message: 'Not authorized to view this report' });
    }

    // Generate comprehensive report
    const report = {
      batchInfo: {
        id: batch._id,
        batchId: batch.batchId,
        traceabilityCode: batch.traceabilityCode,
        status: batch.status,
        createdBy: batch.createdBy.name,
        createdAt: batch.createdAt,
      },
      product: {
        id: batch.product._id,
        name: batch.product.name,
        scientificName: batch.product.scientificName,
        variety: batch.product.variety,
      },
      farm: {
        id: batch.farm._id,
        name: batch.farm.name,
        region: batch.farm.region,
        address: batch.farm.contactDetails?.address,
      },
      harvest: {
        date: batch.harvestDate,
        initialQuantity: batch.quantity.initial,
        currentQuantity: batch.quantity.current,
      },
      processingTimeline: batch.processingSteps.map(step => ({
        type: step.type,
        location: step.location,
        startTime: step.startTime,
        endTime: step.endTime,
        performedBy: step.performedBy?.name || 'Unknown',
        notes: step.notes,
      })),
      qualityChecks: batch.qualityChecks.map(check => ({
        type: check.type,
        performedAt: check.performedAt,
        performedBy: check.performedBy?.name || 'Unknown',
        passed: check.passed,
        notes: check.notes,
      })),
      certifications: batch.certifications,
      childBatches: batch.childBatches,
      parentBatch: batch.parentBatch,
    };

    res.json(report);
  } catch (err) {
    traceLogger.error(`Error generating report for batch ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Split a batch into multiple child batches
router.post('/batches/:id/split', auth, async (req, res) => {
  try {
    const parentBatch = await Batch.findById(req.params.id).populate('farm').populate('product');

    if (!parentBatch) {
      return res.status(404).json({ message: 'Parent batch not found' });
    }

    // Check permissions
    if (
      !req.user.roles.includes('admin') &&
      parentBatch.farm.owner.toString() !== req.user.id &&
      !parentBatch.farm.managers.some(m => m.toString() === req.user.id)
    ) {
      return res.status(403).json({ message: 'Not authorized to modify this batch' });
    }

    const { childBatches } = req.body;

    // Validate split quantities
    const totalSplitQuantity = childBatches.reduce((sum, child) => sum + child.quantity.value, 0);

    if (totalSplitQuantity > parentBatch.quantity.current.value) {
      return res.status(400).json({
        message: 'Total split quantity exceeds current batch quantity',
      });
    }

    // Create child batches
    const childBatchIds = [];
    const createdChildBatches = [];

    for (const childBatchData of childBatches) {
      // Generate batch ID similar to parent with additional suffix
      const parentIdParts = parentBatch.batchId.split('-');
      const childSuffix = childBatchData.suffix || `C${childBatchIds.length + 1}`;
      const childBatchId = `${parentIdParts.join('-')}-${childSuffix}`;

      // Copy essential info from parent batch
      const newChildBatch = new Batch({
        batchId: childBatchId,
        product: parentBatch.product._id,
        farm: parentBatch.farm._id,
        harvestDate: parentBatch.harvestDate,
        plot: parentBatch.plot,
        quantity: {
          initial: childBatchData.quantity,
          current: childBatchData.quantity,
        },
        processingSteps: [...parentBatch.processingSteps],
        qualityChecks: [...parentBatch.qualityChecks],
        certifications: [...parentBatch.certifications],
        status: childBatchData.status || parentBatch.status,
        parentBatch: parentBatch._id,
        createdBy: req.user.id,
      });

      // Add split step
      newChildBatch.processingSteps.push({
        type: 'other',
        notes: `Split from parent batch ${parentBatch.batchId}`,
        startTime: new Date(),
        performedBy: req.user.id,
      });

      const savedChildBatch = await newChildBatch.save();
      childBatchIds.push(savedChildBatch._id);
      createdChildBatches.push(savedChildBatch);
    }

    // Update parent batch
    parentBatch.childBatches = [...(parentBatch.childBatches || []), ...childBatchIds];

    // Update parent batch remaining quantity
    parentBatch.quantity.current.value -= totalSplitQuantity;

    // If all quantity is distributed, mark parent as fully processed
    if (parentBatch.quantity.current.value === 0) {
      parentBatch.status = 'shipped';
    }

    // Add processing step to record the split
    parentBatch.processingSteps.push({
      type: 'other',
      notes: `Split into ${childBatchIds.length} child batches`,
      startTime: new Date(),
      performedBy: req.user.id,
    });

    await parentBatch.save();

    res.status(201).json({
      parentBatch,
      childBatches: createdChildBatches,
    });
  } catch (err) {
    traceLogger.error(`Error splitting batch ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track batch movement
router.post('/batches/:id/movement', auth, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate('farm');

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check permissions (owners, managers, or authorized logistics partners)
    const isAuthorized =
      req.user.roles.includes('admin') ||
      batch.farm.owner.toString() === req.user.id ||
      batch.farm.managers.some(m => m.toString() === req.user.id) ||
      req.user.roles.includes('logistics');

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to track this batch' });
    }

    const {
      origin,
      destination,
      transportMethod,
      departureTime,
      estimatedArrival,
      actualArrival,
      carrier,
      trackingNumber,
      temperature,
      notes,
    } = req.body;

    // Add transport step
    batch.processingSteps.push({
      type: 'transport',
      location: {
        name: origin.name,
        coordinates: origin.coordinates,
        address: origin.address,
      },
      startTime: new Date(departureTime),
      endTime: actualArrival ? new Date(actualArrival) : undefined,
      temperature,
      performedBy: req.user.id,
      notes,
      parameters: {
        destination: destination,
        transportMethod,
        carrier,
        trackingNumber,
        estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : undefined,
      },
    });

    // Update batch status if delivered
    if (actualArrival) {
      batch.status = 'delivered';
    } else {
      batch.status = 'shipped';
    }

    await batch.save();

    // Notify relevant parties about shipment
    const io = req.app.get('io');
    if (io && carrier) {
      io.to(`logistics:${carrier}`).emit('batch-shipped', {
        batchId: batch._id,
        traceCode: batch.traceabilityCode,
        from: origin.name,
        to: destination.name,
        departureTime,
        estimatedArrival,
      });
    }

    res.json(batch);
  } catch (err) {
    traceLogger.error(`Error tracking movement for batch ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get traceability analytics
router.get('/analytics', [auth, adminAuth], async (req, res) => {
  try {
    // Total batches created over time (last 12 months)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const batchesByMonth = await Batch.aggregate([
      { $match: { createdAt: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Batch statuses
    const batchStatusCounts = await Batch.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Quality check success rates
    const qualityCheckStats = await Batch.aggregate([
      { $unwind: '$qualityChecks' },
      {
        $group: {
          _id: '$qualityChecks.type',
          total: { $sum: 1 },
          passed: {
            $sum: { $cond: [{ $eq: ['$qualityChecks.passed', true] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          type: '$_id',
          total: 1,
          passed: 1,
          passRate: {
            $multiply: [{ $divide: ['$passed', '$total'] }, 100],
          },
        },
      },
    ]);

    // Traceability code scans
    // Note: This would require an actual scan tracking system
    // This is a placeholder for the concept

    res.json({
      batchesByMonth,
      batchStatusCounts,
      qualityCheckStats,
    });
  } catch (err) {
    traceLogger.error('Error generating traceability analytics:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
