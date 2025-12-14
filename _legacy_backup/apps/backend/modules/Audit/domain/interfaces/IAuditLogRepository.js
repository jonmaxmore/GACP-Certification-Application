/* eslint-disable no-unused-vars */
/**
 * IAuditLogRepository Interface
 *
 * Repository interface for AuditLog entity.
 * Defines contract for audit log persistence operations.
 *
 * @interface IAuditLogRepository
 */

class IAuditLogRepository {
  /**
   * Save audit log
   * @param {AuditLog} auditLog - Audit log entity
   * @returns {Promise<AuditLog>}
   */
  async save(_auditLog) {
    throw new Error('Method not implemented');
  }

  /**
   * Find audit log by ID
   * @param {string} id - Audit log ID
   * @returns {Promise<AuditLog|null>}
   */
  async findById(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find audit logs by actor ID
   * @param {string} actorId - Actor ID
   * @param {Object} options - Query options
   * @returns {Promise<Array<AuditLog>>}
   */
  async findByActorId(actorId, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find audit logs by action type
   * @param {string} actionType - Action type
   * @param {Object} options - Query options
   * @returns {Promise<Array<AuditLog>>}
   */
  async findByActionType(actionType, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find audit logs by entity
   * @param {string} entityType - Entity type
   * @param {string} entityId - Entity ID
   * @param {Object} options - Query options
   * @returns {Promise<Array<AuditLog>>}
   */
  async findByEntity(entityType, entityId, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find audit logs with filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array<AuditLog>>}
   */
  async findWithFilters(filters, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find audit logs by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array<AuditLog>>}
   */
  async findByDateRange(startDate, endDate, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find recent audit logs
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array<AuditLog>>}
   */
  async findRecent(limit = 50) {
    throw new Error('Method not implemented');
  }

  /**
   * Find security-related audit logs
   * @param {Object} options - Query options
   * @returns {Promise<Array<AuditLog>>}
   */
  async findSecurityLogs(options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find failed actions
   * @param {Object} options - Query options
   * @returns {Promise<Array<AuditLog>>}
   */
  async findFailedActions(options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Count audit logs by criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise<number>}
   */
  async count(criteria = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get audit statistics
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>}
   */
  async getStatistics(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get activity summary by actor
   * @param {string} actorId - Actor ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>}
   */
  async getActivitySummary(_actorId, _startDate, _endDate) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete old audit logs (for cleanup/archival)
   * @param {Date} beforeDate - Delete logs before this date
   * @returns {Promise<number>} - Number of deleted records
   */
  async deleteOldLogs(_beforeDate) {
    throw new Error('Method not implemented');
  }
}

module.exports = IAuditLogRepository;
