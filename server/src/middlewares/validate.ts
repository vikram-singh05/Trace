import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Middleware factory: validate
 *
 * Validates a specific part of the request (body, query, or params)
 * against a Zod schema. On failure, returns a structured 400 response
 * listing all validation errors.
 *
 * Usage:
 *   router.post('/', validate(createItemSchema), handler)
 *   router.get('/', validate(listQuerySchema, 'query'), handler)
 */
export const validate =
  (schema: ZodSchema, target: ValidationTarget = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = (result.error as ZodError).issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: errors,
        },
      });
    }

    // Replace the raw data with the parsed (and potentially transformed) data
    req[target] = result.data;
    next();
  };
