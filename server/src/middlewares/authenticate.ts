import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/prisma';

// Extend Express Request to carry the decoded user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware: authenticate
 *
 * Reads the JWT from the 'token' HTTP-only cookie, verifies it,
 * and attaches the decoded payload to req.user.
 *
 * Also re-checks the user's live status in the database on every request.
 * The JWT itself is valid for 7 days, so signature verification alone
 * isn't enough — without this check, an admin banning/deleting a user
 * would have no effect until that user's existing token expired.
 *
 * Throws 401 if the cookie is missing or the token is invalid/expired,
 * or 403 if the account has since been suspended/deleted.
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    return next(new AppError('Authentication required. Please log in.', 401, 'UNAUTHENTICATED'));
  }

  let decoded: JwtPayload;
  try {
    decoded = verifyToken(token);
  } catch {
    return next(new AppError('Session expired or invalid. Please log in again.', 401, 'INVALID_TOKEN'));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isActive: true, deletedAt: true },
    });

    if (!user || user.deletedAt || !user.isActive) {
      return next(new AppError('This account is no longer active. Please contact support.', 403, 'ACCOUNT_INACTIVE'));
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
