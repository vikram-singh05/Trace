import axiosClient from '../lib/axiosClient';
import type { User, LoginInput, RegisterInput, ResetPasswordInput, ApiSuccess } from '../types';

type AuthResponse = ApiSuccess<{ user: User }>;

export const authApi = {
  register: async (data: RegisterInput): Promise<void> => {
    await axiosClient.post('/auth/register', data);
  },

  verifyOtp: async (email: string, otp: string): Promise<User> => {
    const res = await axiosClient.post<AuthResponse>('/auth/verify-otp', { email, otp });
    return res.data.data.user;
  },

  login: async (data: LoginInput): Promise<User> => {
    const res = await axiosClient.post<AuthResponse>('/auth/login', data);
    return res.data.data.user;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout');
  },

  forgotPassword: async (email: string): Promise<void> => {
    await axiosClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (data: ResetPasswordInput): Promise<void> => {
    await axiosClient.post('/auth/reset-password', data);
  },


  getMe: async (): Promise<User | null> => {
    try {
      const res = await axiosClient.get<ApiSuccess<{ user: User }>>('/auth/me');
      return res.data.data.user;
    } catch {
      return null;
    }
  },
};
