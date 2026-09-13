import axiosClient from '../lib/axiosClient';

export interface Notification {
  id: string;
  type: 'MATCH_FOUND' | 'CLAIM_FILED' | 'CLAIM_APPROVED' | 'CLAIM_REJECTED' | 'ITEM_RESOLVED' | 'ITEM_MODERATED';
  message: string;
  isRead: boolean;
  relatedItemId: string | null;
  createdAt: string;
  userId: string;
}

export const notificationApi = {
  getMyNotifications: async (): Promise<Notification[]> => {
    const res = await axiosClient.get('/notifications');
    return res.data.data.notifications;
  },

  markAsRead: async (id: string): Promise<void> => {
    await axiosClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosClient.patch('/notifications/read-all');
  },
};
