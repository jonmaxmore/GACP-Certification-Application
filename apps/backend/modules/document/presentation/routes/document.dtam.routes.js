/**
 * Document Routes - DTAM Staff
 *
 * Routes for DTAM staff to review and manage documents.
 * Part of Clean Architecture - Presentation Layer
 */

const express = require('express');
const router = express.Router();

module.exports = (documentController, authenticateDTAM) => {
  // Get all documents (with filters)
  // GET /api/dtam/documents?page=1&limit=20&status=PENDING&type=FARM_CERTIFICATE
  router.get('/', authenticateDTAM, (req, res) => documentController.listDocuments(req, res));

  // Get pending documents for review
  // GET /api/dtam/documents/pending?page=1&limit=20
  router.get('/pending', authenticateDTAM, (req, res) =>
    documentController.getPendingDocuments(req, res),
  );

  // Get document statistics
  // GET /api/dtam/documents/statistics?startDate=2024-01-01&endDate=2024-12-31
  router.get('/statistics', authenticateDTAM, (req, res) =>
    documentController.getStatistics(req, res),
  );

  // Upload document (DTAM can also upload)
  // POST /api/dtam/documents/upload
  router.post('/upload', authenticateDTAM, documentController.upload.single('file'), (req, res) =>
    documentController.uploadDocument(req, res),
  );

  // Get document by ID
  // GET /api/dtam/documents/:id
  router.get('/:id', authenticateDTAM, (req, res) => documentController.getDocument(req, res));

  // Download document
  // GET /api/dtam/documents/:id/download
  router.get('/:id/download', authenticateDTAM, (req, res) =>
    documentController.downloadDocument(req, res),
  );

  // Get documents by related entity
  // GET /api/dtam/documents/entity/:entityType/:entityId
  router.get('/entity/:entityType/:entityId', authenticateDTAM, (req, res) =>
    documentController.getDocumentsByEntity(req, res),
  );

  // Approve document
  // PUT /api/dtam/documents/:id/approve
  // Body: { notes: "Approved - all requirements met" }
  router.put('/:id/approve', authenticateDTAM, (req, res) =>
    documentController.approveDocument(req, res),
  );

  // Reject document
  // PUT /api/dtam/documents/:id/reject
  // Body: { reason: "Document is not clear, please re-upload" }
  router.put('/:id/reject', authenticateDTAM, (req, res) =>
    documentController.rejectDocument(req, res),
  );

  // Update document metadata
  // PUT /api/dtam/documents/:id
  router.put('/:id', authenticateDTAM, (req, res) => documentController.updateMetadata(req, res));

  // Delete document (archive or hard delete)
  // DELETE /api/dtam/documents/:id?hard=true
  router.delete('/:id', authenticateDTAM, (req, res) =>
    documentController.deleteDocument(req, res),
  );

  return router;
};
