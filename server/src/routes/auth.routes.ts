import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as AuthController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema, verifyOtpSchema, resendOtpSchema } from '../validators/auth.validator';

const router = Router();

// ── Auth-Specific Rate Limiters ───────────────────────────────────
//
// These are intentionally stricter than the global rate limiter (100/15min)
// because auth endpoints are the primary target for brute-force attacks.

/**
 * Login rate limiter: 10 attempts per 15 minutes per IP.
 *
 * Why 10, not 5?
 * Too-strict limits cause real users to get locked out (typos, autocorrect).
 * 10 is a common industry standard. In a production system, you'd layer this
 * with per-account lockout after N failures (tracked in Redis or DB).
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many login attempts. Please try again in 15 minutes.',
    },
  },
});

/**
 * Register rate limiter: 5 registrations per hour per IP.
 * Prevents automated account creation / spam.
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many accounts created. Please try again in an hour.',
    },
  },
});

/**
 * Verify-OTP rate limiter: 5 attempts per 15 minutes per IP.
 *
 * Aligned with the DB-level lockout threshold (MAX_OTP_ATTEMPTS = 5
 * in auth.service.ts). An attacker from a single IP hits the IP limit
 * at the same time as the DB lock; an attacker rotating IPs still hits
 * the DB lock.
 */
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many verification attempts. Please try again in 15 minutes.',
    },
  },
});

/**
 * Resend-OTP rate limiter: 3 per hour per IP.
 * Prevents spamming the email-sending endpoint.
 */
const resendOtpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many resend requests. Please try again in an hour.',
    },
  },
});

// ── Routes ────────────────────────────────────────────────────────
//
// Middleware chain is read left-to-right:
//   rateLimiter → validate(schema) → controller
//
// validate() parses the body with Zod and returns a 400 before the
// controller runs if the input is invalid.

/**
 * POST /api/v1/auth/register
 * Public. Creates a new STUDENT account.
 */
router.post(
  '/register',
  registerLimiter,
  validate(registerSchema),
  AuthController.register
);

/**
 * POST /api/v1/auth/verify-otp
 * Public. Verifies the email OTP and issues a JWT cookie.
 */
router.post(
  '/verify-otp',
  verifyOtpLimiter,
  validate(verifyOtpSchema),
  AuthController.verifyOtp
);

/**
 * POST /api/v1/auth/resend-otp
 * Public. Re-sends a fresh OTP and resets the brute-force attempt counter.
 */
router.post(
  '/resend-otp',
  resendOtpLimiter,
  validate(resendOtpSchema),
  AuthController.resendOtp
);

/**
 * POST /api/v1/auth/login
 * Public. Validates credentials and issues a JWT cookie.
 */
router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  AuthController.login
);

/**
 * POST /api/v1/auth/logout
 * Protected. Clears the JWT cookie.
 */
router.post(
  '/logout',
  authenticate,
  AuthController.logout
);

/**
 * GET /api/v1/auth/me
 * Protected. Returns the current user's profile.
 */
router.get(
  '/me',
  authenticate,
  AuthController.getMe
);

export default router;
