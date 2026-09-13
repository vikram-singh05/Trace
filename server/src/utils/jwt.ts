import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  role: 'STUDENT' | 'ADMIN';
}

/**
 * Signs a JWT token containing the user's ID and role.
 * Expires according to JWT_EXPIRES_IN env var (default: 7d).
 */
export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Verifies and decodes a JWT token.
 * Throws JsonWebTokenError or TokenExpiredError on failure.
 */
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
