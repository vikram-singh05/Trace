import axiosClient from '../lib/axiosClient';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface Conversation {
  id: string;
  claimId: string;
  createdAt: string;
  updatedAt: string;
  claim: {
    id: string;
    status: string;
    item: {
      id: string;
      title: string;
      imageUrls: string[];
      reporterId: string;
      reporter: {
        id: string;
        name: string;
        avatarUrl: string | null;
      };
    };
    claimant: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  };
  messages: ChatMessage[];
  unreadCount: number;
}

export interface PaginatedMessages {
  messages: ChatMessage[];
  nextCursor: string | null;
}

export const chatApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await axiosClient.get('/chat');
    return data;
  },

  getMessages: async (
    conversationId: string,
    cursor?: string,
    limit = 50
  ): Promise<PaginatedMessages> => {
    const params: Record<string, string> = { limit: String(limit) };
    if (cursor) params.cursor = cursor;
    const { data } = await axiosClient.get(`/chat/${conversationId}/messages`, { params });
    return data;
  },

  deleteConversation: async (conversationId: string): Promise<{ message: string }> => {
    const { data } = await axiosClient.delete(`/chat/${conversationId}`);
    return data;
  },
};
