/**
 * Register User Use Case - Refactored with Result Pattern
 * Application Layer - Clean Architecture
 *
 * Changes from original:
 * - Returns Result<User, DomainError> instead of throwing
 * - Uses typed domain errors for explicit error handling
 * - Easier to test (no try-catch needed)
 * - Type-safe error propagation to controllers
 */

import { Result, ok, err } from '../../../shared/result';
import {
  ValidationError,
  EmailAlreadyExistsError,
  IdCardAlreadyExistsError,
  InvalidEmailFormatError,
  WeakPasswordError,
} from '../../../shared/errors';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';

export interface IPasswordHasher {
  hash(plainPassword: string): Promise<string>;
}

export interface ITokenGenerator {
  generate(): string;
}

export interface IEventBus {
  publish(event: any): Promise<void>;
}

export interface RegisterUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  idCard: string;
  phoneNumber?: string;
  address?: string;
  province?: string;
  district?: string;
  subDistrict?: string;
  postalCode?: string;
}

type RegisterError =
  | ValidationError
  | EmailAlreadyExistsError
  | IdCardAlreadyExistsError
  | InvalidEmailFormatError
  | WeakPasswordError
  | Error;

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenGenerator: ITokenGenerator,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(dto: RegisterUserDTO): Promise<Result<User, RegisterError>> {
    // 1. Validate email using Value Object
    let emailVO: Email;
    try {
      emailVO = new Email(dto.email);
    } catch (error) {
      return err(new InvalidEmailFormatError(dto.email));
    }

    // 2. Validate password using Value Object
    let passwordVO: Password;
    try {
      passwordVO = new Password(dto.password);
    } catch (error) {
      return err(new WeakPasswordError((error as Error).message));
    }

    // 3. Check if email already exists
    try {
      const emailExists = await this.userRepository.emailExists(emailVO.value);
      if (emailExists) {
        return err(new EmailAlreadyExistsError(emailVO.value));
      }
    } catch (error) {
      return err(new Error(`Database error checking email: ${(error as Error).message}`));
    }

    // 4. Check if ID card already exists
    if (dto.idCard) {
      try {
        const idCardExists = await this.userRepository.idCardExists(dto.idCard);
        if (idCardExists) {
          return err(new IdCardAlreadyExistsError(dto.idCard));
        }
      } catch (error) {
        return err(new Error(`Database error checking ID card: ${(error as Error).message}`));
      }
    }

    // 5. Hash password
    let hashedPassword: string;
    try {
      hashedPassword = await this.passwordHasher.hash(passwordVO.plainValue);
    } catch (error) {
      return err(new Error(`Password hashing failed: ${(error as Error).message}`));
    }

    // 6. Generate email verification token
    const verificationToken = this.tokenGenerator.generate();

    // 7. Create user entity
    const user = new User({
      email: emailVO.value,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      idCard: dto.idCard,
      phoneNumber: dto.phoneNumber,
      address: dto.address,
      province: dto.province,
      district: dto.district,
      subdistrict: dto.subDistrict,
      zipCode: dto.postalCode,
      emailVerificationToken: verificationToken,
      status: 'PENDING_VERIFICATION',
    });

    // 8. Validate user entity
    const validationErrors = user.validate();
    if (validationErrors.length > 0) {
      return err(new ValidationError(validationErrors.join(', ')));
    }

    // 9. Save user
    try {
      await this.userRepository.save(user);
    } catch (error) {
      return err(new Error(`Failed to save user: ${(error as Error).message}`));
    }

    // 10. Publish domain event
    try {
      await this.eventBus.publish({
        type: 'UserRegistered',
        userId: user.id,
        email: user.email,
        verificationToken,
        occurredAt: new Date(),
      });
    } catch (error) {
      // Event publishing failure shouldn't fail the registration
      console.error('Failed to publish UserRegistered event:', error);
    }

    // 11. Return success
    return ok(user);
  }
}
