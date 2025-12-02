/**
 * Auth Controller Example - Using Result Pattern
 * Presentation Layer - Clean Architecture
 *
 * This shows how to handle Result<T, E> in Express controllers
 */

import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/register-result';
import { isErr, isOk } from '../../../shared/result';
import {
  ValidationError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  DomainError,
} from '../../../shared/errors';

export class AuthControllerWithResult {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  /**
   * POST /api/auth/farmer/register
   * Register new farmer account
   */
  async register(req: Request, res: Response): Promise<void> {
    const result = await this.registerUserUseCase.execute(req.body);

    // Type-safe error handling with Result pattern
    if (isErr(result)) {
      const error = result.error;

      // Map domain errors to HTTP responses
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: error.message,
          code: (error as any).code,
          field: (error as any).field,
        });
        return;
      }

      if (error instanceof ConflictError) {
        res.status(409).json({
          success: false,
          error: error.message,
          code: (error as any).code,
          resource: (error as any).resource,
        });
        return;
      }

      if (error instanceof UnauthorizedError) {
        res.status(401).json({
          success: false,
          error: error.message,
          code: (error as any).code,
        });
        return;
      }

      if (error instanceof ForbiddenError) {
        res.status(403).json({
          success: false,
          error: error.message,
          code: (error as any).code,
        });
        return;
      }

      // Generic domain error
      if (error instanceof DomainError) {
        res.status((error as any).statusCode).json({
          success: false,
          error: error.message,
          code: (error as any).code,
        });
        return;
      }

      // Unknown error
      console.error('Unexpected error in register:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
      return;
    }

    // Success case - type-safe access to user
    const user = result.value;
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        user: user.toJSON(), // Safe: password excluded
      },
    });
  }
}

/**
 * Helper: Map DomainError to HTTP response
 * Can be used across all controllers
 */
export function mapErrorToResponse(error: Error): {
  statusCode: number;
  body: {
    success: false;
    error: string;
    code: string;
    [key: string]: any;
  };
} {
  if (error instanceof DomainError) {
    return {
      statusCode: (error as any).statusCode,
      body: {
        success: false,
        error: error.message,
        code: (error as any).code,
        ...(error instanceof ValidationError && { field: (error as any).field }),
        ...(error instanceof ConflictError && { resource: (error as any).resource }),
      },
    };
  }

  // Unknown error
  console.error('Unexpected error:', error);
  return {
    statusCode: 500,
    body: {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  };
}
