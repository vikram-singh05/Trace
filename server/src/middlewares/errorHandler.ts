import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

/**
 * Global Express error handler.
 *
 * Must be registered LAST in app.ts (after all routes).
 * Express identifies it as an error handler by its 4-argument signature.
 *
 * Handles:
 * - AppError (operational): returns structured JSON with the error's code/message
 * - Prisma errors: translates common Prisma error codes to user-friendly messages
 * - Unknown errors: returns 500, hides details in production
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Always log server-side, in every environment. This is the server's own
  // log stream, separate from the response sent to the client — hiding it
  // in production would mean real failures leave no trace to debug from.
  console.error(`🔥 [${req.method} ${req.originalUrl}]`, err);

  // Known operational errors (thrown with AppError)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Prisma known error codes
  // P2002 = unique constraint violation (e.g. email already exists)
  // P2025 = record not found
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = err.meta?.target as string[] | undefined;
      const field = target?.[0] ?? 'field';
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: `A record with that ${field} already exists.`,
        },
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'The requested resource was not found.',
        },
      });
    }
  }

  // Unknown / programmer errors — hide details in production
  const message =
    env.NODE_ENV === 'development'
      ? err.message
      : 'An unexpected error occurred. Please try again later.';

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
};
