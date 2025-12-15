/* eslint-disable no-unused-vars */
/**
 * Farm Repository Interface (Domain Layer)
 *
 * Contract for farm persistence
 * - Follows Dependency Inversion Principle
 * - Independent of database technology
 */

class IFarmRepository {
  /**
   * Find farm by ID
   * @param {string} id - Farm ID
   * @returns {Promise<Farm|null>}
   */
  async findById(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find farms by owner ID
   * @param {string} ownerId - Owner ID
   * @param {Object} options - Query options (limit, skip, sort)
   * @returns {Promise<Farm[]>}
   */
  async findByOwnerId(ownerId, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find farms by status
   * @param {string} status - Farm status
   * @param {Object} options - Query options (limit, skip, sort)
   * @returns {Promise<Farm[]>}
   */
  async findByStatus(status, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find farms with filters
   * @param {Object} filters - Search filters
   * @param {Object} options - Query options (limit, skip, sort)
   * @returns {Promise<{farms: Farm[], total: number}>}
   */
  async findWithFilters(filters = {}, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find farms by location
   * @param {string} province - Province name
   * @param {string} district - District name (optional)
   * @param {Object} options - Query options
   * @returns {Promise<Farm[]>}
   */
  async findByLocation(province, district = null, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find farms near coordinates
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} radiusKm - Radius in kilometers
   * @param {Object} options - Query options
   * @returns {Promise<Farm[]>}
   */
  async findNearLocation(latitude, longitude, radiusKm, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Save farm (create or update)
   * @param {Farm} farm - Farm entity
   * @returns {Promise<Farm>}
   */
  async save(_farm) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete farm
   * @param {string} id - Farm ID
   * @returns {Promise<boolean>}
   */
  async delete(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Count farms by status
   * @param {string} status - Farm status
   * @returns {Promise<number>}
   */
  async countByStatus(_status) {
    throw new Error('Method not implemented');
  }

  /**
   * Count farms by owner
   * @param {string} ownerId - Owner ID
   * @returns {Promise<number>}
   */
  async countByOwner(_ownerId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get farm statistics by province
   * @returns {Promise<Array<{province: string, count: number}>>}
   */
  async getStatisticsByProvince() {
    throw new Error('Method not implemented');
  }

  /**
   * Get farm statistics by status
   * @returns {Promise<Array<{status: string, count: number}>>}
   */
  async getStatisticsByStatus() {
    throw new Error('Method not implemented');
  }

  /**
   * Check if farm name exists for owner
   * @param {string} ownerId - Owner ID
   * @param {string} farmName - Farm name
   * @param {string} excludeId - Farm ID to exclude (for updates)
   * @returns {Promise<boolean>}
   */
  async farmNameExists(ownerId, farmName, excludeId = null) {
    throw new Error('Method not implemented');
  }

  /**
   * Find recently submitted farms (for DTAM review queue)
   * @param {number} limit - Max number of farms
   * @returns {Promise<Farm[]>}
   */
  async findRecentlySubmitted(limit = 10) {
    throw new Error('Method not implemented');
  }

  /**
   * Find farms verified by staff
   * @param {string} staffId - Staff ID
   * @param {Object} options - Query options
   * @returns {Promise<Farm[]>}
   */
  async findVerifiedByStaff(staffId, options = {}) {
    throw new Error('Method not implemented');
  }
}

module.exports = IFarmRepository;
