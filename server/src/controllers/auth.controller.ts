import { Request, Response, NextFunction } from 'express';
import { signToken } from '../utils/jwt';
import * as AuthService from '../services/auth.service';
import { env } from '../config/env';
import type { RegisterInput, LoginInput } from '../validators/auth.validator';

// ── Cookie Configuration ──────────────────────────────────────────

/**
 * JWT cookie settings.
 *
 * In production (Vercel frontend + Render backend = different domains):
 *   - sameSite: 'none' — required for cross-origin cookie sending
 *   - secure: true     — required when sameSite is 'none' (browser enforces this)
 *
 * In development (localhost:5173 + localhost:5000 = different ports, same host):
 *   - sameSite: 'lax'  — allows cookies on cross-port requests
 *   - secure: false    — no HTTPS in local dev
 */
const COOKIE_NAME = 'token';

const getCookieOptions = () => ({
  httpOnly: true,                                               // No JS access → XSS protection
  secure: env.NODE_ENV === 'production',                        // HTTPS only in prod
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,                            // 7 days in milliseconds
  path: '/',
});

// ── Controllers ───────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 *
 * Creates a new STUDENT account, signs a JWT, and sets the HTTP-only cookie.
 * Returns the sanitized user object (no passwordHash).
 */
export const register = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    await AuthService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: 'OTP sent to email.',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (
  req: Request<{}, {}, { email: string; otp: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await AuthService.verifyOtp(req.body.email, req.body.otp);

    const token = signToken({ userId: user.id, role: user.role });

    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Email verified and logged in.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/resend-otp
 *
 * Re-sends a fresh OTP to an unverified account and resets the
 * brute-force attempt counter. This is the unlock path for users
 * who exhausted their 5 OTP attempts.
 */
export const resendOtp = async (
  req: Request<{}, {}, { email: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    await AuthService.resendOtp(req.body.email);

    res.status(200).json({
      success: true,
      message: 'A new verification code has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 *
 * Validates credentials, signs a JWT, and sets the HTTP-only cookie.
 * Returns the sanitized user object.
 */
export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await AuthService.loginUser(req.body);

    const token = signToken({ userId: user.id, role: user.role });

    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 *
 * Clears the JWT cookie. No DB interaction needed —
 * the client is responsible for discarding local state.
 */
export const logout = (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
    data: null,
  });
};

/**
 * GET /api/v1/auth/me
 *
 * Returns the current user's full profile.
 * Hits the DB to ensure the data is fresh (catches banned/deleted accounts
 * that still have a valid JWT in their cookie).
 *
 * Protected by the `authenticate` middleware — req.user is always present here.
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // req.user is set by the authenticate middleware
    const user = await AuthService.getUserById(req.user!.userId);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
