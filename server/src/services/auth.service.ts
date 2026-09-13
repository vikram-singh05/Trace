import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import type { RegisterInput, LoginInput } from '../validators/auth.validator';
import type { UserResponse } from '../types';

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Strips the passwordHash field from a Prisma User record.
 * Call this on every user object before returning it to the client.
 *
 * Why a helper instead of a Prisma `select`?
 * Using `select` forces you to enumerate every field you want, meaning
 * you have to update the select if you add new columns. Stripping is
 * safer — new columns are automatically included, and sensitive fields
 * are always explicitly removed.
 */
const sanitizeUser = (user: {
  id: string;
  studentId: string | null;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  university: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  isVerified: boolean;
  otpCode: string | null;
  otpExpiresAt: Date | null;
  otpAttempts: number;
  createdAt: Date;
  updatedAt: Date;
  passwordHash: string;
  deletedAt: Date | null;
}): UserResponse => {
  // Strip every field that is not part of UserResponse. otpCode/otpExpiresAt
  // are cleared on verification so they are null in practice, but destructuring
  // them out here guarantees a live OTP can never be serialized to the client
  // even if this helper is ever called on an unverified user.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, deletedAt, isVerified, otpCode, otpExpiresAt, otpAttempts, ...safe } = user;
  return safe;
};

const BCRYPT_ROUNDS = 12; // ~300ms on modern hardware — good balance of security vs speed

// ── Service Functions ─────────────────────────────────────────────

/**
 * Registers a new STUDENT user.
 *
 * Throws:
 * - 409 CONFLICT if the email is already registered
 */
import { sendEmail } from '../utils/mailer';
import emailValidator from 'deep-email-validator';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

export const registerUser = async (input: RegisterInput) => {
  // Validate email strictly (MX record check)
  const validationResult = await emailValidator({
    email: input.email,
    validateRegex: true,
    validateMx: true,
    validateTypo: true,
    validateDisposable: true,
    validateSMTP: false, // SMTP validation can be flaky and slow
  });

  if (!validationResult.valid) {
    throw new AppError(
      `Please provide a valid, deliverable email address. Reason: ${validationResult.reason}`,
      400,
      'INVALID_EMAIL_DOMAIN'
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing && existing.isVerified) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const otpCode = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  if (existing && !existing.isVerified) {
    await prisma.user.update({
      where: { email: input.email },
      data: { passwordHash, name: input.name, otpCode, otpExpiresAt, otpAttempts: 0 },
    });
  } else {
    await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        otpCode,
        otpExpiresAt,
        isVerified: false,
      },
    });
  }

  // Send OTP Email
  await sendEmail({
    to: input.email,
    subject: 'Your Trace Verification Code',
    html: `
      <div style="font-family: sans-serif; text-align: center; padding: 40px 20px; background: #f8fafc;">
        <h1 style="color: #0f172a; margin-bottom: 20px;">Welcome to Trace!</h1>
        <p style="color: #475569; font-size: 16px; margin-bottom: 30px;">Use the following code to verify your university email address:</p>
        <div style="background: white; padding: 20px; border-radius: 12px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #3b82f6; border: 2px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          ${otpCode}
        </div>
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">This code expires in 10 minutes.</p>
      </div>
    `
  });

  return { success: true };
};

const MAX_OTP_ATTEMPTS = 5;

export const verifyOtp = async (email: string, otp: string): Promise<UserResponse> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }
  if (user.isVerified) {
    throw new AppError('Email already verified.', 400, 'ALREADY_VERIFIED');
  }

  // ── Brute-force lockout ────────────────────────────────────────
  // After MAX_OTP_ATTEMPTS wrong guesses the account is locked until
  // the user requests a fresh OTP via POST /auth/resend-otp, which
  // resets the counter.
  if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
    throw new AppError(
      'Too many failed attempts. Please request a new verification code.',
      429,
      'OTP_LOCKED'
    );
  }

  if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    throw new AppError('Verification code has expired.', 400, 'EXPIRED_OTP');
  }

  if (user.otpCode !== otp) {
    // Increment attempt counter before rejecting
    await prisma.user.update({
      where: { email },
      data: { otpAttempts: { increment: 1 } },
    });
    throw new AppError('Invalid verification code.', 400, 'INVALID_OTP');
  }

  const verifiedUser = await prisma.user.update({
    where: { email },
    data: {
      isVerified: true,
      otpCode: null,
      otpExpiresAt: null,
      otpAttempts: 0,
    },
  });

  return sanitizeUser(verifiedUser);
};

/**
 * Re-sends a fresh OTP to an unverified account.
 *
 * Also resets otpAttempts to 0, which is the unlock mechanism for
 * users who hit the brute-force lockout (5 wrong attempts).
 */
export const resendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }
  if (user.isVerified) {
    throw new AppError('Email already verified.', 400, 'ALREADY_VERIFIED');
  }

  const otpCode = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  await prisma.user.update({
    where: { email },
    data: { otpCode, otpExpiresAt, otpAttempts: 0 },
  });

  await sendEmail({
    to: email,
    subject: 'Your Trace Verification Code',
    html: `
      <div style="font-family: sans-serif; text-align: center; padding: 40px 20px; background: #f8fafc;">
        <h1 style="color: #0f172a; margin-bottom: 20px;">Your New Code</h1>
        <p style="color: #475569; font-size: 16px; margin-bottom: 30px;">Use the following code to verify your university email address:</p>
        <div style="background: white; padding: 20px; border-radius: 12px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #3b82f6; border: 2px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          ${otpCode}
        </div>
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">This code expires in 10 minutes.</p>
      </div>
    `
  });

  return { success: true };
};

/**
 * Validates credentials and returns the user if correct.
 *
 * Throws:
 * - 401 INVALID_CREDENTIALS for any auth failure
 *   (deliberately vague — never tell the client whether
 *    the email or the password was wrong, to prevent
 *    user enumeration attacks)
 */
export const loginUser = async (input: LoginInput): Promise<UserResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  // Use the same error for "email not found" and "wrong password"
  const INVALID = new AppError(
    'Invalid email or password.',
    401,
    'INVALID_CREDENTIALS'
  );

  if (!user) throw INVALID;

  // Soft-deleted users cannot log in
  if (user.deletedAt) {
    throw new AppError(
      'This account has been deactivated. Please contact support.',
      403,
      'ACCOUNT_DEACTIVATED'
    );
  }

  // Banned users cannot log in
  if (!user.isActive) {
    throw new AppError(
      'Your account has been suspended. Please contact support.',
      403,
      'ACCOUNT_SUSPENDED'
    );
  }

  // Unverified users must complete email OTP verification before logging in
  if (!user.isVerified) {
    throw new AppError(
      'Please verify your email before logging in. Check your inbox for the verification code.',
      403,
      'EMAIL_NOT_VERIFIED'
    );
  }

  const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatch) throw INVALID;

  return sanitizeUser(user);
};

/**
 * Fetches the current user's full profile by ID.
 * Used by GET /auth/me to return up-to-date profile data.
 *
 * Throws:
 * - 404 if the user was deleted after the JWT was issued
 */
export const getUserById = async (userId: string): Promise<UserResponse> => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,  // exclude soft-deleted
      isActive: true,   // exclude suspended
    },
  });

  if (!user) {
    throw new AppError(
      'User not found or account is no longer active.',
      404,
      'USER_NOT_FOUND'
    );
  }

  return sanitizeUser(user);
};
