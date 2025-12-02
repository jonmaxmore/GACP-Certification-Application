const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('certificate-management-list-certificates');

/**
 * List Certificates Use Case
 *
 * Business Logic: ดึงรายการใบรับรองตามเงื่อนไขต่างๆ
 *
 * Workflow:
 * 1. รับเงื่อนไขการค้นหา (filters)
 * 2. ตรวจสอบสิทธิ์การเข้าถึง
 * 3. สร้าง query ตามเงื่อนไข
 * 4. ดึงข้อมูลพร้อม pagination
 * 5. ส่งกลับผลลัพธ์
 */

class ListCertificatesUseCase {
  constructor({ certificateRepository, authorizationService }) {
    this.certificateRepository = certificateRepository;
    this.authorizationService = authorizationService;
  }

  /**
   * ดึงรายการใบรับรองตามเงื่อนไข
   * @param {Object} params - พารามิเตอร์การค้นหา
   * @param {Object} params.filters - เงื่อนไขการกรอง
   * @param {Object} params.pagination - การแบ่งหน้า
   * @param {Object} params.sort - การเรียงลำดับ
   * @param {Object} params.user - ข้อมูลผู้ใช้
   * @returns {Object} รายการใบรับรองและข้อมูลเพิ่มเติม
   */
  async execute({ filters = {}, pagination = {}, sort = {}, user }) {
    try {
      logger.info('📋 Listing certificates with filters:', filters);

      // 1. ตั้งค่า default values
      const defaultPagination = {
        page: pagination.page || 1,
        limit: Math.min(pagination.limit || 20, 100), // จำกัดไม่เกิน 100 รายการต่อหน้า
      };

      const defaultSort = {
        field: sort.field || 'issuedDate',
        order: sort.order || 'desc',
      };

      // 2. ตรวจสอบสิทธิ์และปรับ filters ตามบทบาท
      const authorizedFilters = await this._applyAuthorizationFilters(filters, user);

      // 3. สร้าง query criteria
      const queryCriteria = this._buildQueryCriteria(authorizedFilters);

      // 4. ดึงข้อมูลใบรับรอง
      const certificates = await this.certificateRepository.findWithFilters({
        ...queryCriteria,
        skip: (defaultPagination.page - 1) * defaultPagination.limit,
        limit: defaultPagination.limit,
        sort: { [defaultSort.field]: defaultSort.order === 'asc' ? 1 : -1 },
      });

      // 5. นับจำนวนทั้งหมด
      const totalCount = await this.certificateRepository.countWithFilters(queryCriteria);

      // 6. คำนวณข้อมูล pagination
      const totalPages = Math.ceil(totalCount / defaultPagination.limit);
      const hasNext = defaultPagination.page < totalPages;
      const hasPrev = defaultPagination.page > 1;

      // 7. เตรียมข้อมูลสถิติ
      const statistics = await this._gatherStatistics(authorizedFilters, user);

      logger.info(`📊 Retrieved ${certificates.length} certificates (${totalCount} total);`);

      return {
        certificates: certificates.map(cert => cert.toJSON()),
        pagination: {
          currentPage: defaultPagination.page,
          totalPages,
          totalCount,
          limit: defaultPagination.limit,
          hasNext,
          hasPrev,
        },
        sort: defaultSort,
        filters: authorizedFilters,
        statistics,
      };
    } catch (error) {
      logger.error('❌ Failed to list certificates:', error);
      throw error;
    }
  }

  /**
   * ปรับ filters ตามสิทธิ์ของผู้ใช้
   */
  async _applyAuthorizationFilters(filters, user) {
    if (!user) {
      throw new Error('User authentication required');
    }

    const authorizedFilters = { ...filters };

    // ตรวจสอบตามบทบาท
    switch (user.role) {
      case 'FARMER':
        // เกษตรกรเห็นเฉพาะใบรับรองของตนเอง
        authorizedFilters.userId = user.id;
        break;

      case 'QC_OFFICER':
        // QC เห็นใบรับรองในพื้นที่รับผิดชอบ
        if (user.responsibleProvinces) {
          authorizedFilters.province = { $in: user.responsibleProvinces };
        }
        break;

      case 'DTAM_OFFICER':
      case 'DTAM_MANAGER':
      case 'ADMIN':
        // DTAM และ Admin เห็นทุกใบรับรอง (ไม่มีการจำกัด)
        break;

      default:
        throw new Error(`Unauthorized role: ${user.role}`);
    }

    return authorizedFilters;
  }

  /**
   * สร้าง query criteria จาก filters
   */
  _buildQueryCriteria(filters) {
    const criteria = {};

    // Status filter
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        criteria.status = { $in: filters.status };
      } else {
        criteria.status = filters.status;
      }
    }

    // User ID filter
    if (filters.userId) {
      criteria.userId = filters.userId;
    }

    // Farm ID filter
    if (filters.farmId) {
      criteria.farmId = filters.farmId;
    }

    // Province filter
    if (filters.province) {
      if (Array.isArray(filters.province)) {
        criteria['farmLocation.province'] = { $in: filters.province };
      } else {
        criteria['farmLocation.province'] = filters.province;
      }
    }

    // Certification standard filter
    if (filters.certificationStandard) {
      criteria.certificationStandard = filters.certificationStandard;
    }

    // Date range filters
    if (filters.issuedFrom || filters.issuedTo) {
      criteria.issuedDate = {};
      if (filters.issuedFrom) {
        criteria.issuedDate.$gte = new Date(filters.issuedFrom);
      }
      if (filters.issuedTo) {
        criteria.issuedDate.$lte = new Date(filters.issuedTo);
      }
    }

    if (filters.expiryFrom || filters.expiryTo) {
      criteria.expiryDate = {};
      if (filters.expiryFrom) {
        criteria.expiryDate.$gte = new Date(filters.expiryFrom);
      }
      if (filters.expiryTo) {
        criteria.expiryDate.$lte = new Date(filters.expiryTo);
      }
    }

    // Search by certificate number or farmer name
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      criteria.$or = [
        { certificateNumber: searchRegex },
        { farmerName: searchRegex },
        { farmName: searchRegex },
      ];
    }

    // Expiring soon filter (certificates expiring within specified days)
    if (filters.expiringSoon) {
      const daysAhead = parseInt(filters.expiringSoon) || 30;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      criteria.expiryDate = {
        $gte: new Date(),
        $lte: futureDate,
      };
      criteria.status = 'ACTIVE';
    }

    return criteria;
  }

  /**
   * รวบรวมข้อมูลสถิติ
   */
  async _gatherStatistics(filters, user) {
    try {
      const baseFilters = await this._applyAuthorizationFilters({}, user);

      const [
        totalCertificates,
        activeCertificates,
        expiredCertificates,
        revokedCertificates,
        expiringSoon,
      ] = await Promise.all([
        this.certificateRepository.countWithFilters(baseFilters),
        this.certificateRepository.countWithFilters({ ...baseFilters, status: 'ACTIVE' }),
        this.certificateRepository.countWithFilters({ ...baseFilters, status: 'EXPIRED' }),
        this.certificateRepository.countWithFilters({ ...baseFilters, status: 'REVOKED' }),
        this.certificateRepository.countExpiringSoon(30, baseFilters),
      ]);

      return {
        total: totalCertificates,
        active: activeCertificates,
        expired: expiredCertificates,
        revoked: revokedCertificates,
        expiringSoon,
      };
    } catch (error) {
      logger.error('Failed to gather statistics:', error);
      return {};
    }
  }
}

module.exports = ListCertificatesUseCase;
