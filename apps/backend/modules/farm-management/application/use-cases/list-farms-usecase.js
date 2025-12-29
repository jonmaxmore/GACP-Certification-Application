/**
 * ListFarmsUseCase (Application Layer)
 *
 * List farms with filters
 * - Farmers see only their own farms
 * - DTAM staff see all farms with advanced filters
 */

class ListFarmsUseCase {
  constructor({ farmRepository }) {
    this.farmRepository = farmRepository;
  }

  async execute({
    userId,
    userType,
    filters = {},
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
  }) {
    const skip = (page - 1) * limit;

    let result;

    if (userType === 'farmer') {
      // Farmers can only see their own farms
      const farms = await this.farmRepository.findByOwnerId(userId, {
        limit,
        skip,
        sort,
      });

      const total = await this.farmRepository.countByOwner(userId);

      result = { farms, total };
    } else if (userType === 'dtam_staff') {
      // DTAM staff can see all farms with filters
      result = await this.farmRepository.findWithFilters(filters, {
        limit,
        skip,
        sort,
      });
    } else {
      throw new Error('Invalid user type');
    }

    return {
      farms: result.farms,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }
}

module.exports = ListFarmsUseCase;
