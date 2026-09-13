import { z } from 'zod';

// ── Reusable field schemas ────────────────────────────────────────

/**
 * Password rules:
 * - 8–72 chars (72 is bcrypt's internal limit — anything beyond is silently truncated)
 * - At least one uppercase, one lowercase, one digit
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must not exceed 72 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// ── Register Schema ───────────────────────────────────────────────

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters')
      .trim(),

    email: z
      .string()
      .email('Please enter a valid email address')
      .toLowerCase()
      .trim(),

    password: passwordSchema,

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    // Attach the error to the confirmPassword field so the frontend
    // knows exactly which input to highlight
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ── Login Schema ──────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),

  // No complexity rules on login — just check it's not empty
  password: z.string().min(1, 'Password is required'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export const resendOtpSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

// ── Inferred TypeScript types ─────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput    = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
