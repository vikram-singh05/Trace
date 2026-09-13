/**
 * Frontend TypeScript types.
 * These mirror the server's UserResponse type — keeping both in sync
 * is your responsibility (or a future shared types package).
 */

export interface User {
  id: string;
  studentId: string | null;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  university: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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

export interface ApiSuccess<T> {
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
