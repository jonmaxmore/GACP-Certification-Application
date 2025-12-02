/**
 * Document Routes - Farmer
 *
 * Routes for farmers to upload and manage their documents.
 * Part of Clean Architecture - Presentation Layer
 */

const express = require('express');
const router = express.Router();

module.exports = (documentController, authenticateFarmer) => {
  // Upload document
  // POST /api/farmer/documents/upload
  // Form data: file, name, description, type, category, relatedEntity, tags, metadata
  router.post('/upload', authenticateFarmer, documentController.upload.single('file'), (req, res) =>
    documentController.uploadDocument(req, res),
  );

  // Get all documents for logged-in farmer
  // GET /api/farmer/documents?page=1&limit=20&status=APPROVED&type=FARM_CERTIFICATE
  router.get('/', authenticateFarmer, (req, res) => documentController.listDocuments(req, res));

  // Get document by ID
  // GET /api/farmer/documents/:id
  router.get('/:id', authenticateFarmer, (req, res) => documentController.getDocument(req, res));

  // Download document
  // GET /api/farmer/documents/:id/download
  router.get('/:id/download', authenticateFarmer, (req, res) =>
    documentController.downloadDocument(req, res),
  );

  // Get documents by related entity (farm, survey, etc.)
  // GET /api/farmer/documents/entity/:entityType/:entityId
  router.get('/entity/:entityType/:entityId', authenticateFarmer, (req, res) =>
    documentController.getDocumentsByEntity(req, res),
  );

  // Update document metadata
  // PUT /api/farmer/documents/:id
  router.put('/:id', authenticateFarmer, (req, res) => documentController.updateMetadata(req, res));

  // Delete (archive) document
  // DELETE /api/farmer/documents/:id
  router.delete('/:id', authenticateFarmer, (req, res) =>
    documentController.deleteDocument(req, res),
  );

  return router;
};
