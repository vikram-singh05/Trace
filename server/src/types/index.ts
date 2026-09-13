/**
 * Shared TypeScript types for the Trace API.
 *
 * These types define the "shapes" of data that flow between
 * the service layer, controllers, and ultimately to the client.
 * They are separate from Prisma's auto-generated types so that
 * we can deliberately strip sensitive fields (like passwordHash).
 */

import { UserRole } from '@prisma/client';

// ── User Types ────────────────────────────────────────────────────

/**
 * The safe user object returned to the client.
 * passwordHash is intentionally EXCLUDED from this type.
 */
export interface UserResponse {
  id: string;
  studentId: string | null;
  name: string;
  email: string;
  role: UserRole;
  university: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Auth Types ────────────────────────────────────────────────────

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ── API Response Types ────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;
