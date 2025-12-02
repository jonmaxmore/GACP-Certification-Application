/**
 * Register User Use Case Tests
 * Tests application layer business logic with mocked dependencies
 */

const RegisterUserUseCase = require('../../application/use-cases/register-usecase');
const User = require('../../domain/entities/User');
const Email = require('../../domain/value-objects/Email');
const Password = require('../../domain/value-objects/Password');
const {
  validUserPayload,
  createUserPayload,
  createUniqueUserPayload,
} = require('../fixtures/userFactory');

describe('RegisterUserUseCase', () => {
  let registerUseCase;
  let mockUserRepository;
  let mockPasswordHasher;
  let mockTokenGenerator;
  let mockEventBus;

  beforeEach(() => {
    // Mock user repository
    mockUserRepository = {
      emailExists: jest.fn(),
      idCardExists: jest.fn(),
      save: jest.fn(),
    };

    // Mock password hasher
    mockPasswordHasher = {
      hash: jest.fn(),
    };

    // Mock token generator
    mockTokenGenerator = {
      generate: jest.fn(),
    };

    // Mock event bus
    mockEventBus = {
      publish: jest.fn(),
    };

    // Create use case instance
    registerUseCase = new RegisterUserUseCase({
      userRepository: mockUserRepository,
      passwordHasher: mockPasswordHasher,
      tokenGenerator: mockTokenGenerator,
      eventBus: mockEventBus,
    });
  });

  describe('Happy Path', () => {
    it('should register a new user successfully', async () => {
      const userData = createUserPayload();

      // Setup mocks
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword123');
      mockTokenGenerator.generate.mockReturnValue('verificationToken123');
      mockUserRepository.save.mockImplementation(user => Promise.resolve(user));

      // Execute
      const result = await registerUseCase.execute(userData);

      // Assert - result should contain user and verificationToken
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('verificationToken');
      expect(result.user).toBeInstanceOf(User);
      expect(result.user.email).toBe(userData.email);
      expect(result.user.firstName).toBe(userData.firstName);
      expect(result.user.status).toBe('PENDING_VERIFICATION');
      expect(result.user.isEmailVerified).toBe(false);
      expect(result.verificationToken).toBe('verificationToken123');

      // Verify mocks called correctly
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.idCardExists).toHaveBeenCalledWith(userData.idCard);
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(userData.password);
      expect(mockTokenGenerator.generate).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockEventBus.publish).toHaveBeenCalled();
    });

    it('should register a CORPORATE farmer successfully', async () => {
      const userData = {
        ...createUserPayload(),
        farmerType: 'corporate',
        corporateId: '1711266102673', // Valid Thai ID
        farmingExperience: 5,
        idCard: '8531233336593', // Valid Thai ID
        laserCode: 'ME0123456789', // Valid Laser Code
      };

      // Setup mocks
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword123');
      mockTokenGenerator.generate.mockReturnValue('verificationToken123');
      mockUserRepository.save.mockImplementation(user => Promise.resolve(user));

      // Execute
      const result = await registerUseCase.execute(userData);

      // Assert
      expect(result.user).toBeInstanceOf(User);
      expect(result.user.farmerType).toBe('corporate');
      expect(result.user.corporateId).toBe('1711266102673');
      expect(result.user.farmingExperience).toBe(5);

      // Verify save called with correct data
      const savedUser = mockUserRepository.save.mock.calls[0][0];
      expect(savedUser.farmerType).toBe('corporate');
      expect(savedUser.corporateId).toBe('1711266102673');
    });

    it('should hash the password before saving', async () => {
      const userData = createUserPayload();

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('$2b$12$hashedPassword');
      mockTokenGenerator.generate.mockReturnValue('token123');
      mockUserRepository.save.mockImplementation(user => Promise.resolve(user));

      await registerUseCase.execute(userData);

      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(userData.password);

      const savedUser = mockUserRepository.save.mock.calls[0][0];
      expect(savedUser.password).toBe('$2b$12$hashedPassword');
    });

    it('should generate email verification token', async () => {
      const userData = createUserPayload();

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
      mockTokenGenerator.generate.mockReturnValue('generatedToken');
      mockUserRepository.save.mockImplementation(user => Promise.resolve(user));

      await registerUseCase.execute(userData);

      const savedUser = mockUserRepository.save.mock.calls[0][0];
      expect(savedUser.emailVerificationToken).toBe('generatedToken');
    });

    it('should publish UserRegistered event', async () => {
      const userData = createUserPayload();

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
      mockTokenGenerator.generate.mockReturnValue('token');
      mockUserRepository.save.mockImplementation(user => Promise.resolve(user));

      await registerUseCase.execute(userData);

      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'UserRegistered',
        }),
      );
    });
  });

  describe('Error Cases', () => {
    it('should throw error if email already exists', async () => {
      const userData = createUserPayload({ email: 'existing@example.com' });

      mockUserRepository.emailExists.mockResolvedValue(true);

      await expect(registerUseCase.execute(userData)).rejects.toThrow(
        /already exists|already registered/i,
      );

      expect(mockUserRepository.emailExists).toHaveBeenCalledWith(userData.email);
      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error if ID card already exists', async () => {
      const userData = createUserPayload();

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(true);

      await expect(registerUseCase.execute(userData)).rejects.toThrow(
        /already exists|already registered/i,
      );

      expect(mockUserRepository.idCardExists).toHaveBeenCalledWith(userData.idCard);
      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for invalid email format', async () => {
      const userData = createUserPayload({ email: 'invalid-email' });

      await expect(registerUseCase.execute(userData)).rejects.toThrow(/email/i);
    });

    it('should throw error for weak password', async () => {
      const userData = createUserPayload({ password: 'weak' });

      await expect(registerUseCase.execute(userData)).rejects.toThrow(/password/i);
    });

    it('should throw error for missing required fields', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecureP@ssw0rd123',
        // Missing firstName, lastName, idCard
      };

      await expect(registerUseCase.execute(userData)).rejects.toThrow();
    });

    it('should throw error if user validation fails', async () => {
      const userData = createUserPayload({ firstName: '' }); // Invalid: empty

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
      mockTokenGenerator.generate.mockReturnValue('token');

      await expect(registerUseCase.execute(userData)).rejects.toThrow();
    });
  });

  describe('Repository Error Handling', () => {
    it('should propagate repository errors', async () => {
      const userData = createUserPayload();

      mockUserRepository.emailExists.mockRejectedValue(new Error('Database connection failed'));

      await expect(registerUseCase.execute(userData)).rejects.toThrow('Database connection failed');
    });

    it('should propagate save errors', async () => {
      const userData = createUserPayload();

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
      mockTokenGenerator.generate.mockReturnValue('token');
      mockUserRepository.save.mockRejectedValue(new Error('Save failed'));

      await expect(registerUseCase.execute(userData)).rejects.toThrow('Save failed');
    });
  });

  describe('Password Hasher Error Handling', () => {
    it('should propagate password hashing errors', async () => {
      const userData = createUserPayload();

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockRejectedValue(new Error('Hashing failed'));

      await expect(registerUseCase.execute(userData)).rejects.toThrow('Hashing failed');
    });
  });

  describe('Integration with Value Objects', () => {
    it('should use Email value object for validation', async () => {
      const userData = createUserPayload({ email: 'test@example.com' });

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
      mockTokenGenerator.generate.mockReturnValue('token');
      mockUserRepository.save.mockImplementation(user => Promise.resolve(user));

      await registerUseCase.execute(userData);

      // Email should be validated through Email value object
      // If Email VO throws, registration should fail
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith(userData.email);
    });

    it('should use Password value object for validation', async () => {
      const userData = createUserPayload({ email: 'test@example.com' });

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
      mockTokenGenerator.generate.mockReturnValue('token');
      mockUserRepository.save.mockImplementation(user => Promise.resolve(user));

      await registerUseCase.execute(userData);

      // Password should be validated through Password value object
      // If Password VO throws, registration should fail
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(userData.password);
    });
  });
});
