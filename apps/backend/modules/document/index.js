/**
 * Document Module Index
 *
 * Main entry point for the Document Module.
 * Exports container, helper, and key entities.
 */

const { getDocumentModuleContainer } = require('./integration/container');
const DocumentHelper = require('./integration/DocumentHelper');
const Document = require('./domain/entities/Document');

module.exports = {
  // Main container (for app.js)
  getDocumentModuleContainer,

  // Helper for other modules
  DocumentHelper,

  // Domain entities
  Document,

  // Constants
  DocumentTypes: Document.TYPE,
  DocumentStatuses: Document.STATUS,
  DocumentCategories: Document.CATEGORY,
  DocumentAccessLevels: Document.ACCESS_LEVEL,
};
