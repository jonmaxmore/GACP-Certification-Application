/**
 * List DTAM Staff Use Case
 * Application Layer - Clean Architecture
 *
 * Purpose: List staff with filters and pagination
 */

class ListDTAMStaffUseCase {
  constructor({ staffRepository }) {
    this.staffRepository = staffRepository;
  }

  async execute({ filters = {}, pagination = { page: 1, limit: 20 } }) {
    const result = await this.staffRepository.findWithFilters(filters, pagination);

    return {
      items: result.items.map(staff => staff.toPublicProfile()),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(result.total / pagination.limit),
    };
  }
}

module.exports = ListDTAMStaffUseCase;
