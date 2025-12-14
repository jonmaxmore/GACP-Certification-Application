/* eslint-disable no-unused-vars */
/**
 * DTAM Staff Repository Interface
 * Domain Layer - Clean Architecture
 *
 * Purpose: Define repository contract for DTAM staff
 * - Repository methods declaration
 * - Dependency Inversion Principle
 * - No implementation details
 */

class IDTAMStaffRepository {
  /**
   * Find staff by ID
   * @param {string} id - Staff ID
   * @returns {Promise<DTAMStaff|null>}
   */
  async findById(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find staff by email
   * @param {string} email - Staff email
   * @returns {Promise<DTAMStaff|null>}
   */
  async findByEmail(_email) {
    throw new Error('Method not implemented');
  }

  /**
   * Find staff by employee ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise<DTAMStaff|null>}
   */
  async findByEmployeeId(_employeeId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find staff by password reset token
   * @param {string} token - Password reset token
   * @returns {Promise<DTAMStaff|null>}
   */
  async findByPasswordResetToken(_token) {
    throw new Error('Method not implemented');
  }

  /**
   * Save staff (create or update)
   * @param {DTAMStaff} staff - Staff entity
   * @returns {Promise<DTAMStaff>}
   */
  async save(_staff) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete staff
   * @param {string} id - Staff ID
   * @returns {Promise<boolean>}
   */
  async delete(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find staff with filters
   * @param {Object} filters - Search filters
   * @param {Object} pagination - Pagination options
   * @returns {Promise<{items: DTAMStaff[], total: number}>}
   */
  async findWithFilters(_filters, _pagination) {
    throw new Error('Method not implemented');
  }

  /**
   * Count staff by status
   * @param {string} status - Staff status
   * @returns {Promise<number>}
   */
  async countByStatus(_status) {
    throw new Error('Method not implemented');
  }

  /**
   * Count staff by role
   * @param {string} role - Staff role
   * @returns {Promise<number>}
   */
  async countByRole(_role) {
    throw new Error('Method not implemented');
  }

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @param {string} excludeId - ID to exclude from check (for updates)
   * @returns {Promise<boolean>}
   */
  async emailExists(email, excludeId = null) {
    throw new Error('Method not implemented');
  }

  /**
   * Check if employee ID exists
   * @param {string} employeeId - Employee ID to check
   * @param {string} excludeId - ID to exclude from check (for updates)
   * @returns {Promise<boolean>}
   */
  async employeeIdExists(employeeId, excludeId = null) {
    throw new Error('Method not implemented');
  }

  /**
   * Find recently created staff
   * @param {number} limit - Number of records
   * @returns {Promise<DTAMStaff[]>}
   */
  async findRecentlyCreated(limit = 10) {
    throw new Error('Method not implemented');
  }

  /**
   * Find staff by role
   * @param {string} role - Staff role
   * @returns {Promise<DTAMStaff[]>}
   */
  async findByRole(_role) {
    throw new Error('Method not implemented');
  }

  /**
   * Find staff by department
   * @param {string} department - Department name
   * @returns {Promise<DTAMStaff[]>}
   */
  async findByDepartment(_department) {
    throw new Error('Method not implemented');
  }
}

module.exports = IDTAMStaffRepository;
