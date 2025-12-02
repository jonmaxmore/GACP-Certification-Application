/**
 * Code Audit API Routes
 *
 * REST API endpoints for code duplication and similarity auditing.
 * Supports running audits, viewing history, and tracking cross-device drifts.
 *
 * @version 1.0.0
 * @created November 4, 2025
 */

const express = require('express');
const router = express.Router();
const { CodeAudit, RefactoringAction } = require('../models/CodeAudit');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const glob = require('glob');
const { promisify } = require('util');

const globAsync = promisify(glob);

/**
 * POST /api/audit/run
 * Run a new code audit scan
 */
router.post('/run', async (req, res) => {
  try {
    const {
      deviceId = 'UNKNOWN',
      deviceName = 'Unknown Device',
      scanType = 'full',
      directories = ['apps/**'],
      filePatterns = ['**/*.{tsx,jsx,ts,js}'],
      minSimilarity = 70,
      excludePatterns = ['**/node_modules/**', '**/*.test.*', '**/*.spec.*', '**/__tests__/**'],
    } = req.body;

    // Generate unique scan ID
    const scanId = `scan_${deviceId}_${Date.now()}`;

    // Create audit record
    const audit = new CodeAudit({
      scanId,
      deviceId,
      deviceName,
      scanType,
      directories,
      filePatterns,
      config: {
        minSimilarity,
        excludePatterns,
      },
      status: 'running',
      startedAt: new Date(),
      summary: {
        totalFiles: 0,
        analyzedFiles: 0,
        duplicateCount: 0,
        driftCount: 0,
        codeReduction: 0,
      },
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
      },
    });

    await audit.save();

    // Run audit asynchronously
    runAudit(audit._id, directories, filePatterns, excludePatterns, minSimilarity).catch(err => {
      console.error('Audit failed:', err);
    });

    res.json({
      success: true,
      message: 'Audit started',
      data: {
        scanId,
        auditId: audit._id,
        status: 'running',
      },
    });
  } catch (error) {
    console.error('Error starting audit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start audit',
      error: error.message,
    });
  }
});

/**
 * GET /api/audit/status/:scanId
 * Get audit status and progress
 */
router.get('/status/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    const audit = await CodeAudit.findOne({ scanId });

    if (!audit) {
      return res.status(404).json({
        success: false,
        message: 'Audit not found',
      });
    }

    res.json({
      success: true,
      data: {
        scanId: audit.scanId,
        status: audit.status,
        progress: audit.status === 'completed' ? 100 : 50,
        summary: audit.summary,
        startedAt: audit.startedAt,
        completedAt: audit.completedAt,
        duration: audit.duration,
      },
    });
  } catch (error) {
    console.error('Error getting audit status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit status',
      error: error.message,
    });
  }
});

/**
 * GET /api/audit/results/:scanId
 * Get audit results
 */
router.get('/results/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;
    const { priority, minSimilarity } = req.query;

    const audit = await CodeAudit.findOne({ scanId });

    if (!audit) {
      return res.status(404).json({
        success: false,
        message: 'Audit not found',
      });
    }

    let duplicates = audit.duplicates;

    // Filter by priority
    if (priority) {
      duplicates = duplicates.filter(d => d.priority === priority);
    }

    // Filter by similarity
    if (minSimilarity) {
      duplicates = duplicates.filter(d => d.similarity >= parseInt(minSimilarity));
    }

    res.json({
      success: true,
      data: {
        scanId: audit.scanId,
        deviceId: audit.deviceId,
        status: audit.status,
        summary: audit.summary,
        duplicates,
        drifts: audit.drifts,
        completedAt: audit.completedAt,
      },
    });
  } catch (error) {
    console.error('Error getting audit results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit results',
      error: error.message,
    });
  }
});

/**
 * GET /api/audit/history
 * Get audit history
 */
router.get('/history', async (req, res) => {
  try {
    const { deviceId, limit = 10, skip = 0, status = 'completed' } = req.query;

    const query = {};
    if (deviceId) {
      query.deviceId = deviceId;
    }
    if (status) {
      query.status = status;
    }

    const audits = await CodeAudit.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('scanId deviceId deviceName scanType status summary startedAt completedAt duration');

    const total = await CodeAudit.countDocuments(query);

    res.json({
      success: true,
      data: {
        audits,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: total > parseInt(skip) + parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Error getting audit history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit history',
      error: error.message,
    });
  }
});

/**
 * POST /api/audit/compare
 * Compare two specific files
 */
router.post('/compare', async (req, res) => {
  try {
    const { fileA, fileB } = req.body;

    if (!fileA || !fileB) {
      return res.status(400).json({
        success: false,
        message: 'Both fileA and fileB are required',
      });
    }

    const result = await compareFiles(fileA, fileB);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error comparing files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare files',
      error: error.message,
    });
  }
});

/**
 * GET /api/audit/drifts
 * Get cross-device drifts
 */
router.get('/drifts', async (req, res) => {
  try {
    const { deviceA, deviceB } = req.query;

    if (!deviceA || !deviceB) {
      return res.status(400).json({
        success: false,
        message: 'Both deviceA and deviceB are required',
      });
    }

    const drifts = await CodeAudit.findDriftsBetweenDevices(deviceA, deviceB);

    res.json({
      success: true,
      data: {
        deviceA,
        deviceB,
        drifts,
        count: drifts.length,
      },
    });
  } catch (error) {
    console.error('Error getting drifts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get drifts',
      error: error.message,
    });
  }
});

/**
 * GET /api/audit/dashboard
 * Get dashboard data
 */
router.get('/dashboard', async (req, res) => {
  try {
    const { deviceId } = req.query;

    // Get latest audit
    const latestAudit = deviceId
      ? await CodeAudit.findLatestForDevice(deviceId)
      : await CodeAudit.findOne({ status: 'completed' }).sort({ createdAt: -1 });

    if (!latestAudit) {
      return res.json({
        success: true,
        data: {
          hasAudit: false,
          message: 'No audit found',
        },
      });
    }

    // Get statistics
    const totalScans = await CodeAudit.countDocuments({ deviceId: latestAudit.deviceId });
    const criticalDuplicates = latestAudit.getCriticalDuplicates();
    const highSimilarity = latestAudit.getHighSimilarityDuplicates(85);

    // Get refactoring actions
    const refactoringActions = await RefactoringAction.find({
      auditId: latestAudit._id,
    })
      .sort({ priority: -1, createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        hasAudit: true,
        latestScan: {
          scanId: latestAudit.scanId,
          deviceId: latestAudit.deviceId,
          completedAt: latestAudit.completedAt,
          summary: latestAudit.summary,
        },
        statistics: {
          totalScans,
          criticalDuplicates: criticalDuplicates.length,
          highSimilarity: highSimilarity.length,
          totalDuplicateLines: latestAudit.getTotalDuplicateLines(),
        },
        topDuplicates: latestAudit.duplicates
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 10),
        criticalDuplicates,
        refactoringActions,
      },
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message,
    });
  }
});

/**
 * POST /api/audit/action
 * Create refactoring action
 */
router.post('/action', async (req, res) => {
  try {
    const {
      auditId,
      scanId,
      action,
      description,
      filesAffected,
      priority = 'medium',
      assignedTo,
      estimatedHours,
    } = req.body;

    const refactoringAction = new RefactoringAction({
      auditId,
      scanId,
      action,
      description,
      filesAffected,
      priority,
      assignedTo,
      estimatedHours,
      status: 'planned',
    });

    await refactoringAction.save();

    res.json({
      success: true,
      message: 'Refactoring action created',
      data: refactoringAction,
    });
  } catch (error) {
    console.error('Error creating refactoring action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create refactoring action',
      error: error.message,
    });
  }
});

/**
 * Helper Functions
 */

/**
 * Run audit asynchronously
 */
async function runAudit(auditId, directories, filePatterns, excludePatterns, minSimilarity) {
  const startTime = Date.now();

  try {
    const audit = await CodeAudit.findById(auditId);
    if (!audit) {
      throw new Error('Audit not found');
    }

    // Find all files
    const files = await findFiles(directories, filePatterns, excludePatterns);
    audit.summary.totalFiles = files.length;

    // Calculate file hashes
    const fileHashes = await Promise.all(
      files.map(async file => {
        const content = await fs.readFile(file, 'utf-8');
        const hash = crypto.createHash('sha1').update(content).digest('hex');
        const stats = await fs.stat(file);
        const lines = content.split('\n').length;

        return {
          path: file,
          hash,
          lines,
          size: stats.size,
          lastModified: stats.mtime,
        };
      }),
    );

    audit.fileHashes = fileHashes;
    audit.summary.analyzedFiles = files.length;

    // Find duplicates
    const duplicates = await findDuplicates(fileHashes, minSimilarity);
    audit.duplicates = duplicates;

    // Mark as completed
    audit.status = 'completed';
    audit.completedAt = new Date();
    audit.duration = Date.now() - startTime;

    await audit.save();

    console.log(`Audit ${audit.scanId} completed: ${duplicates.length} duplicates found`);
  } catch (error) {
    console.error('Audit failed:', error);
    const audit = await CodeAudit.findById(auditId);
    if (audit) {
      audit.status = 'failed';
      audit.errorMessage = error.message;
      audit.completedAt = new Date();
      audit.duration = Date.now() - startTime;
      await audit.save();
    }
  }
}

/**
 * Find all files matching patterns
 */
async function findFiles(directories, patterns, excludes) {
  const allFiles = new Set();

  for (const dir of directories) {
    for (const pattern of patterns) {
      const fullPattern = path.join(dir, pattern);
      const files = await globAsync(fullPattern, {
        ignore: excludes,
        absolute: true,
      });
      files.forEach(file => allFiles.add(file));
    }
  }

  return Array.from(allFiles);
}

/**
 * Find duplicate/similar files
 */
async function findDuplicates(fileHashes, minSimilarity) {
  const duplicates = [];

  // Compare all pairs
  for (let i = 0; i < fileHashes.length; i++) {
    for (let j = i + 1; j < fileHashes.length; j++) {
      const fileA = fileHashes[i];
      const fileB = fileHashes[j];

      // Skip if same file
      if (fileA.path === fileB.path) {
        continue;
      }

      // Calculate similarity
      const similarity = await calculateSimilarity(fileA, fileB);

      if (similarity >= minSimilarity) {
        const category = categorizeFile(fileA.path);
        const priority = determinePriority(similarity, category);

        duplicates.push({
          fileA: fileA.path,
          fileB: fileB.path,
          similarity,
          comment: generateComment(fileA, fileB, similarity),
          hashA: fileA.hash,
          hashB: fileB.hash,
          linesA: fileA.lines,
          linesB: fileB.lines,
          duplicatedLines: Math.round((similarity / 100) * Math.min(fileA.lines, fileB.lines)),
          category,
          priority,
          status: 'pending',
        });
      }
    }
  }

  return duplicates;
}

/**
 * Calculate similarity between two files
 */
async function calculateSimilarity(fileA, fileB) {
  // Exact match
  if (fileA.hash === fileB.hash) {
    return 100;
  }

  // Read file contents
  const contentA = await fs.readFile(fileA.path, 'utf-8');
  const contentB = await fs.readFile(fileB.path, 'utf-8');

  // Simple line-based similarity
  const linesA = contentA.split('\n').filter(line => line.trim());
  const linesB = contentB.split('\n').filter(line => line.trim());

  const matchingLines = linesA.filter(line => linesB.includes(line)).length;
  const totalLines = Math.max(linesA.length, linesB.length);

  return Math.round((matchingLines / totalLines) * 100);
}

/**
 * Compare two specific files
 */
async function compareFiles(fileA, fileB) {
  const contentA = await fs.readFile(fileA, 'utf-8');
  const contentB = await fs.readFile(fileB, 'utf-8');

  const hashA = crypto.createHash('sha1').update(contentA).digest('hex');
  const hashB = crypto.createHash('sha1').update(contentB).digest('hex');

  const linesA = contentA.split('\n');
  const linesB = contentB.split('\n');

  const similarity = await calculateSimilarity(
    { path: fileA, hash: hashA, lines: linesA.length },
    { path: fileB, hash: hashB, lines: linesB.length },
  );

  return {
    fileA,
    fileB,
    similarity,
    hashA,
    hashB,
    linesA: linesA.length,
    linesB: linesB.length,
    identical: hashA === hashB,
  };
}

/**
 * Categorize file by type
 */
function categorizeFile(filePath) {
  const fileName = path.basename(filePath);
  if (fileName.includes('Modal') || fileName.includes('Dialog')) {
    return 'modal';
  }
  if (fileName.includes('Form')) {
    return 'form';
  }
  if (fileName.startsWith('use')) {
    return 'hook';
  }
  if (fileName.includes('util') || fileName.includes('helper')) {
    return 'utility';
  }
  return 'component';
}

/**
 * Determine priority based on similarity and category
 */
function determinePriority(similarity, category) {
  if (similarity >= 95) {
    return 'critical';
  }
  if (similarity >= 85 && ['modal', 'form'].includes(category)) {
    return 'critical';
  }
  if (similarity >= 85) {
    return 'high';
  }
  if (similarity >= 75) {
    return 'medium';
  }
  return 'low';
}

/**
 * Generate descriptive comment
 */
function generateComment(fileA, fileB, similarity) {
  if (similarity === 100) {
    return 'Identical files - exact duplicate';
  }
  if (similarity >= 90) {
    return 'Nearly identical - strong duplicate';
  }
  if (similarity >= 80) {
    return 'Very similar structure - likely duplicate';
  }
  if (similarity >= 70) {
    return 'Similar patterns - consider consolidation';
  }
  return 'Moderate similarity';
}

module.exports = router;
