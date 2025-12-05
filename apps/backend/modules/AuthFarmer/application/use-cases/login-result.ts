/**
 * Login User Use Case (TypeScript + Result<T, E> Pattern)
 * Authenticates user and returns JWT token
 * Part of Clean Architecture Application Layer
 */

import { Result, ok, err } from '../../../../shared/result';
import { Email, InvalidEmailError } from '../../domain/value-objects/Email';
import {
  Password,
  InvalidPasswordError,
  IPasswordHasher,
} from '../../domain/value-objects/Password';
import { User } from '../../domain/entities/User';

/**
 * Authentication-specific errors
 */
export class AuthenticationError extends Error {
  constructor(message = 'invalid_credentials') {
    super(message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AccountLockedError extends Error {
  constructor(message = 'account_locked') {
    super(message);
    this.name = 'AccountLockedError';
    Object.setPrototypeOf(this, AccountLockedError.prototype);
  }
}

export class AccountNotVerifiedError extends Error {
  constructor(message = 'account_not_verified') {
    super(message);
    this.name = 'AccountNotVerifiedError';
    Object.setPrototypeOf(this, AccountNotVerifiedError.prototype);
  }
}

export class AccountSuspendedError extends Error {
  constructor(message = 'account_suspended') {
    super(message);
    this.name = 'AccountSuspendedError';
    Object.setPrototypeOf(this, AccountSuspendedError.prototype);
  }
}

/**
 * Repository interface (dependency inversion)
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

/**
 * Token generator interface (dependency inversion)
 */
export interface ITokenGenerator {
  generate(userId: string, role: string): Promise<string>;
}

/**
 * Login use case input
 */
export interface LoginUserInput {
  email: string;
  password: string;
}

/**
 * Login use case output
 */
export interface LoginUserOutput {
  user: User;
  token: string;
}

/**
 * Union type for all possible login errors
 */
export type LoginError =
  | InvalidEmailError
  | InvalidPasswordError
  | AuthenticationError
  | AccountLockedError
  | AccountNotVerifiedError
  | AccountSuspendedError
  | Error;

/**
 * Login User Use Case
 * Follows Clean Architecture principles with explicit error handling
 */
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenGenerator: ITokenGenerator,
    private readonly config: {
      maxLoginAttempts: number;
      requireEmailVerification: boolean;
    } = {
      maxLoginAttempts: 5,
      requireEmailVerification: true,
    },
  ) {}

  /**
   * Execute login use case
   * @param input - Login credentials
   * @returns Result with user and token, or error
   */
  async execute(input: LoginUserInput): Promise<Result<LoginUserOutput, LoginError>> {
    try {
      // Step 1: Validate email using Email value object
      let emailVO: Email;
      try {
        emailVO = Email.create(input.email);
      } catch (error) {
        return err(error as InvalidEmailError);
      }

      // Step 2: Validate password using Password value object
      let passwordVO: Password;
      try {
        passwordVO = Password.create(input.password);
      } catch (error) {
        return err(error as InvalidPasswordError);
      }

      // Step 3: Find user by email
      const user = await this.userRepository.findByEmail(emailVO.toString());
      if (!user) {
        return err(new AuthenticationError('Invalid email or password'));
      }

      // Step 4: Check if account is locked
      if (user.isAccountLocked()) {
        return err(
          new AccountLockedError('Account is locked due to too many failed login attempts'),
        );
      }

      // Step 5: Check if account is suspended
      if (user.status === 'SUSPENDED') {
        return err(new AccountSuspendedError('Account has been suspended'));
      }

      // Step 6: Check if email is verified (if required)
      if (this.config.requireEmailVerification && !user.isEmailVerified) {
        return err(new AccountNotVerifiedError('Please verify your email before logging in'));
      }

      // Step 7: Verify password
      const passwordMatches = await passwordVO.compareToHash(this.passwordHasher, user.password);

      if (!passwordMatches) {
        // Record failed login attempt
        user.recordFailedLogin(this.config.maxLoginAttempts);
        await this.userRepository.save(user);

        return err(new AuthenticationError('Invalid email or password'));
      }

      // Step 8: Record successful login
      user.recordSuccessfulLogin();
      await this.userRepository.save(user);

      // Step 9: Generate JWT token
      const token = await this.tokenGenerator.generate(user.id, user.role);

      // Step 10: Return success result
      return ok({
        user,
        token,
      });
    } catch (error) {
      // Catch unexpected errors (database failures, etc.)
      return err(error as Error);
    }
  }

  /**
   * Helper: Check if error is authentication-related
   */
  static isAuthenticationError(error: LoginError): boolean {
    return (
      error instanceof AuthenticationError ||
      error instanceof AccountLockedError ||
      error instanceof AccountNotVerifiedError ||
      error instanceof AccountSuspendedError
    );
  }

  /**
   * Helper: Get user-friendly error message
   */
  static getErrorMessage(error: LoginError): string {
    if (error instanceof InvalidEmailError) {
      return 'Please enter a valid email address';
    }
    if (error instanceof InvalidPasswordError) {
      return 'Please enter a valid password';
    }
    if (error instanceof AuthenticationError) {
      return 'Invalid email or password';
    }
    if (error instanceof AccountLockedError) {
      return 'Your account has been locked due to too many failed login attempts. Please try again later or reset your password.';
    }
    if (error instanceof AccountNotVerifiedError) {
      return 'Please verify your email address before logging in. Check your inbox for the verification link.';
    }
    if (error instanceof AccountSuspendedError) {
      return 'Your account has been suspended. Please contact support for assistance.';
    }
    return 'An unexpected error occurred. Please try again later.';
  }

  /**
   * Helper: Get HTTP status code for error
   */
  static getErrorStatusCode(error: LoginError): number {
    if (error instanceof InvalidEmailError || error instanceof InvalidPasswordError) {
      return 400; // Bad Request
    }
    if (error instanceof AuthenticationError) {
      return 401; // Unauthorized
    }
    if (error instanceof AccountLockedError || error instanceof AccountNotVerifiedError) {
      return 403; // Forbidden
    }
    if (error instanceof AccountSuspendedError) {
      return 403; // Forbidden
    }
    return 500; // Internal Server Error
  }
}
