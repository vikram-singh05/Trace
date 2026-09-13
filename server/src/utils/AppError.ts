/**
 * Custom application error class.
 *
 * Extends the built-in Error with an HTTP status code and an optional
 * machine-readable error code. The global error handler checks for
 * instances of AppError to produce structured JSON error responses.
 *
 * Usage:
 *   throw new AppError('Item not found', 404, 'ITEM_NOT_FOUND');
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // operational = expected, user-facing errors

    // Restore prototype chain (needed when extending built-in classes in TS)
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
