import axiosClient from '../lib/axiosClient';

export interface CreateFeedbackInput {
  type: 'BUG' | 'PROBLEM' | 'FEEDBACK' | 'FEATURE_REQUEST';
  category?: string;
  title: string;
  description: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  screenshotUrl?: string;
  pageUrl?: string;
  route?: string;
  itemId?: string;
}

export const feedbackApi = {
  createFeedback: async (data: CreateFeedbackInput) => {
    const res = await axiosClient.post('/feedback', data);
    return res.data;
  },
  getUserFeedbacks: async () => {
    const res = await axiosClient.get('/feedback/me');
    return res.data;
  },
  getAllFeedbacks: async (params?: any) => {
    const res = await axiosClient.get('/feedback', { params });
    return res.data;
  },
  updateStatus: async (id: string, status: string, adminNote?: string) => {
    const res = await axiosClient.patch(`/feedback/${id}/status`, { status, adminNote });
    return res.data;
  },
  uploadScreenshot: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await axiosClient.post('/upload?folder=feedback-screenshots', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  }
};
