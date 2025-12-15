// @ts-nocheck
/**
 * Register User Use Case (Multi-Account Type Support)
 * Application Layer - Clean Architecture
 *
 * Purpose: Handle user registration business logic
 * Supports:
 * - INDIVIDUAL: Thai ID (13 digits)
 * - JURISTIC: Tax ID (13 digits)
 * - COMMUNITY_ENTERPRISE: CE Registration No.
 */

const User = require('../domain/entities/User');
const Password = require('../domain/value-objects/Password');
const UserRegistered = require('../domain/events/user-registered');
const { validateThaiID, validateLaserCode } = require('../../../utils/validators');

class RegisterUserUseCase {
  constructor({ userRepository, passwordHasher, tokenGenerator, eventBus }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenGenerator = tokenGenerator;
    this.eventBus = eventBus;
  }

  /**
   * Execute register user use case
   * @param {Object} request - Registration data
   * @returns {Promise<User>}
   */
  async execute(request) {
    const { accountType = 'INDIVIDUAL' } = request;

    // 1. Validate based on account type
    await this._validateByAccountType(request, accountType);

    // 2. Validate password strength using Value Object
    const password = new Password(request.password);

    // 3. Hash password
    const hashedPassword = await this.passwordHasher.hash(password.getPlainValue());

    // 4. Generate email verification token (optional for non-email accounts)
    const verificationToken = await this.tokenGenerator.generate();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 5. Build user data based on account type
    const userData = this._buildUserData(request, accountType, hashedPassword, verificationToken, verificationExpiry);

    // 6. Create user entity
    const user = new User(userData);

    // 7. Validate user entity
    const validationErrors = user.validate ? user.validate() : [];
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // 8. Save user
    const savedUser = await this.userRepository.save(user);

    // 9. Publish UserRegistered event
    if (this.eventBus) {
      const event = new UserRegistered({
        userId: savedUser.id,
        accountType: accountType,
        firstName: savedUser.firstName || savedUser.companyName || savedUser.communityName,
        registeredAt: savedUser.createdAt,
      });
      await this.eventBus.publish(event.toEventPayload());
    }

    // 10. Return user and verification token
    return {
      user: savedUser,
      verificationToken: verificationToken,
    };
  }

  /**
   * Validate input based on account type
   * @private
   */
  async _validateByAccountType(request, accountType) {
    switch (accountType) {
      case 'INDIVIDUAL':
        // Validate Thai ID
        if (!request.idCard && !request.identifier) {
          throw new Error('Thai ID Card is required for individual registration');
        }
        const thaiId = request.idCard || request.identifier;
        if (!validateThaiID(thaiId)) {
          throw new Error('Invalid Thai ID Card number');
        }
        // Check uniqueness
        const idCardExists = await this.userRepository.idCardExists(thaiId);
        if (idCardExists) {
          throw new Error('Thai ID Card already registered');
        }
        // Validate Laser Code (optional for simplified flow)
        if (request.laserCode && !validateLaserCode(request.laserCode)) {
          throw new Error('Invalid Laser Code format');
        }
        break;

      case 'JURISTIC':
        // Validate Tax ID
        if (!request.taxId && !request.identifier) {
          throw new Error('Tax ID is required for juristic registration');
        }
        const taxId = request.taxId || request.identifier;
        if (!/^\d{13}$/.test(taxId)) {
          throw new Error('Tax ID must be 13 digits');
        }
        // Check uniqueness by taxId
        const taxIdExists = await this.userRepository.taxIdExists?.(taxId) || false;
        if (taxIdExists) {
          throw new Error('Tax ID already registered');
        }
        // Require company name
        if (!request.companyName) {
          throw new Error('Company name is required');
        }
        break;

      case 'COMMUNITY_ENTERPRISE':
        // Validate CE Registration No
        if (!request.communityRegistrationNo && !request.identifier) {
          throw new Error('Community Enterprise registration number is required');
        }
        const ceNo = request.communityRegistrationNo || request.identifier;
        // Check uniqueness by CE No
        const ceExists = await this.userRepository.communityNoExists?.(ceNo) || false;
        if (ceExists) {
          throw new Error('Community Enterprise already registered');
        }
        // Require community name
        if (!request.communityName) {
          throw new Error('Community name is required');
        }
        break;

      default:
        throw new Error(`Invalid account type: ${accountType}`);
    }
  }

  /**
   * Build user data based on account type
   * @private
   */
  _buildUserData(request, accountType, hashedPassword, verificationToken, verificationExpiry) {
    const baseData = {
      accountType: accountType,
      password: hashedPassword,
      phoneNumber: request.phoneNumber,
      role: 'FARMER',
      status: 'PENDING_VERIFICATION',
      verificationStatus: 'pending',
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
      metadata: request.metadata || {},
    };

    switch (accountType) {
      case 'INDIVIDUAL':
        return {
          ...baseData,
          firstName: request.firstName,
          lastName: request.lastName,
          idCard: request.idCard || request.identifier,
          laserCode: request.laserCode,
          email: request.email || null,
          farmerType: 'INDIVIDUAL',
          address: request.address || '',
          province: request.province || '',
          district: request.district || '',
          subdistrict: request.subdistrict || '',
          zipCode: request.zipCode || '',
        };

      case 'JURISTIC':
        return {
          ...baseData,
          companyName: request.companyName,
          taxId: request.taxId || request.identifier,
          representativeName: request.representativeName,
          representativePosition: request.representativePosition,
          email: request.email || null,
          farmerType: 'CORPORATE',
          address: request.address || '',
          province: request.province || '',
        };

      case 'COMMUNITY_ENTERPRISE':
        return {
          ...baseData,
          communityName: request.communityName,
          communityRegistrationNo: request.communityRegistrationNo || request.identifier,
          representativeName: request.representativeName,
          email: request.email || null,
          farmerType: 'COMMUNITY_ENTERPRISE',
          address: request.address || '',
          province: request.province || '',
        };

      default:
        return baseData;
    }
  }
}

module.exports = RegisterUserUseCase;
