import axiosClient from '../lib/axiosClient';
import type { Item } from './itemApi';

export interface AdminStats {
  totalUsers: number;
  activeItems: number;
  resolvedItems: number;
  totalMatches: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  _count: {
    items: number;
    claims: number;
  };
}

export interface AdminUsersResponse {
  users: User[];
  total: number;
  pages: number;
}

export interface AdminItemsResponse {
  items: Item[];
  total: number;
  pages: number;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const res = await axiosClient.get('/admin/stats');
    return res.data.data;
  },

  getUsers: async (page = 1, search = ''): Promise<AdminUsersResponse> => {
    const res = await axiosClient.get('/admin/users', { params: { page, search } });
    return res.data.data;
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<User> => {
    const res = await axiosClient.patch(`/admin/users/${userId}/status`, { isActive });
    return res.data.data.user;
  },

  getItems: async (page = 1): Promise<AdminItemsResponse> => {
    const res = await axiosClient.get('/admin/items', { params: { page } });
    return res.data.data;
  },

  moderateItem: async (itemId: string, action: 'DELETE' | 'RESTORE' | 'HARD_DELETE'): Promise<Item> => {
    const res = await axiosClient.patch(`/admin/items/${itemId}/moderate`, { action });
    return res.data.data.item;
  },
};
