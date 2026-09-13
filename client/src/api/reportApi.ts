import axiosClient from '../lib/axiosClient';

export interface CreateReportInput {
  type: 'CHAT_ABUSE' | 'SCAM' | 'INAPPROPRIATE_BEHAVIOR' | 'OTHER';
  reason: string;
  reportedId: string;
  conversationId?: string;
}

export interface UserReport {
  id: string;
  type: string;
  reason: string;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
  createdAt: string;
  reporter: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  reportedUser: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    isActive: boolean;
  };
  conversation?: {
    id: string;
    claim: {
      item: {
        id: string;
        title: string;
      };
    };
  } | null;
}

export const reportApi = {
  createReport: async (data: CreateReportInput) => {
    const response = await axiosClient.post('/reports', data);
    return response.data;
  },

  getReports: async (): Promise<UserReport[]> => {
    const response = await axiosClient.get('/reports');
    return response.data;
  },

  updateReportStatus: async (id: string, status: 'PENDING' | 'REVIEWED' | 'DISMISSED') => {
    const response = await axiosClient.patch(`/reports/${id}/status`, { status });
    return response.data;
  },
};
