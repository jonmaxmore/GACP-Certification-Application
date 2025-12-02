/**
 * Document Repository Interface
 *
 * Defines the contract for document data access.
 * Part of Clean Architecture - Domain Layer (Dependency Inversion Principle)
 */

class IDocumentRepository {
  /**
   * Save document (create or update)
   * @param {Document} document - Document entity
   * @returns {Promise<Document>} Saved document
   */
  async save(_document) {
    throw new Error('Method not implemented');
  }

  /**
   * Find document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Document|null>} Document or null
   */
  async findById(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find documents by uploader
   * @param {string} uploaderId - Uploader user ID
   * @param {Object} filters - Optional filters (status, type, category)
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} { documents, total, page, limit }
   */
  async findByUploader(_uploaderId, _filters, _options) {
    throw new Error('Method not implemented');
  }

  /**
   * Find documents by related entity
   * @param {string} entityType - Entity type (farm, survey, certificate)
   * @param {string} entityId - Entity ID
   * @param {Object} options - Optional filters and pagination
   * @returns {Promise<Array<Document>>} Array of documents
   */
  async findByRelatedEntity(_entityType, _entityId, _options) {
    throw new Error('Method not implemented');
  }

  /**
   * Find documents by status
   * @param {string} status - Document status
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} { documents, total, page, limit }
   */
  async findByStatus(_status, _options) {
    throw new Error('Method not implemented');
  }

  /**
   * Find documents by type
   * @param {string} type - Document type
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} { documents, total, page, limit }
   */
  async findByType(_type, _options) {
    throw new Error('Method not implemented');
  }

  /**
   * Find documents by category
   * @param {string} category - Document category
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} { documents, total, page, limit }
   */
  async findByCategory(_category, _options) {
    throw new Error('Method not implemented');
  }

  /**
   * Find documents with filters
   * @param {Object} filters - Search filters (status, type, category, uploadedBy, etc.)
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} { documents, total, page, limit }
   */
  async findWithFilters(_filters, _options) {
    throw new Error('Method not implemented');
  }

  /**
   * Find documents pending review
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} { documents, total, page, limit }
   */
  async findPendingReview(_options) {
    throw new Error('Method not implemented');
  }

  /**
   * Find expired documents
   * @param {Object} options - Optional filters
   * @returns {Promise<Array<Document>>} Array of expired documents
   */
  async findExpired(_options) {
    throw new Error('Method not implemented');
  }

  /**
   * Find all versions of a document
   * @param {string} documentId - Original document ID
   * @returns {Promise<Array<Document>>} Array of document versions
   */
  async findVersionHistory(_documentId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find latest version of document
   * @param {string} originalDocumentId - ID of any version
   * @returns {Promise<Document|null>} Latest version or null
   */
  async findLatestVersion(_originalDocumentId) {
    throw new Error('Method not implemented');
  }

  /**
   * Count documents
   * @param {Object} criteria - Count criteria
   * @returns {Promise<number>} Count
   */
  async count(_criteria) {
    throw new Error('Method not implemented');
  }

  /**
   * Count documents by uploader
   * @param {string} uploaderId - Uploader user ID
   * @param {Object} filters - Optional filters (status, type, category)
   * @returns {Promise<number>} Count
   */
  async countByUploader(_uploaderId, _filters) {
    throw new Error('Method not implemented');
  }

  /**
   * Mark expired documents
   * @returns {Promise<number>} Number of documents marked as expired
   */
  async markExpired() {
    throw new Error('Method not implemented');
  }

  /**
   * Get document statistics
   * @param {Object} filters - Optional filters (uploaderId, dateRange, etc.)
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics(_filters) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete document (hard delete)
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Search documents by text
   * @param {string} searchText - Search query
   * @param {Object} options - Search options and pagination
   * @returns {Promise<Object>} { documents, total, page, limit }
   */
  async searchDocuments(_searchText, _options) {
    throw new Error('Method not implemented');
  }
}

module.exports = IDocumentRepository;
