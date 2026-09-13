import axiosClient from '../lib/axiosClient';

export interface VerificationQuestionInput {
  question: string;
  displayOrder?: number;
}

export interface CreateItemInput {
  type: 'LOST' | 'FOUND';
  categoryId: string;
  title: string;
  description: string;
  color?: string | null;
  brand?: string | null;
  location: string;
  dateOccurred: string;
  imageUrls?: string[];
  tags?: string[];
  verificationQuestions?: VerificationQuestionInput[];
}

export interface Item {
  id: string;
  type: 'LOST' | 'FOUND';
  status: 'ACTIVE' | 'PENDING_REVIEW' | 'RESOLVED' | 'ARCHIVED';
  title: string;
  description: string;
  color: string | null;
  brand: string | null;
  location: string;
  dateOccurred: string;
  imageUrls: string[];
  tags: string[];
  deletedAt?: string | null;
  createdAt: string;
  category: {
    id: string;
    name: string;
    icon: string;
  };
  reporter?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  verificationQuestions?: {
    id: string;
    question: string;
    displayOrder: number;
  }[];
  matches?: {
    id: string;
    score: number;
    reasons: string[];
    item: Item;
  }[];
}

export interface PaginatedItems {
  items: Item[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface QueryItemInput {
  page?: number;
  limit?: number;
  type?: 'LOST' | 'FOUND';
  categoryId?: string;
  status?: string;
  location?: string;
  search?: string;
}

export interface UpdateItemInput {
  categoryId?: string;
  title?: string;
  description?: string;
  color?: string | null;
  brand?: string | null;
  location?: string;
  dateOccurred?: string;
  status?: 'ACTIVE' | 'PENDING_REVIEW' | 'RESOLVED' | 'ARCHIVED';
  imageUrls?: string[];
  tags?: string[];
}

export const itemApi = {
  createItem: async (data: CreateItemInput): Promise<Item> => {
    const res = await axiosClient.post('/items', data);
    return res.data.data.item;
  },

  updateItem: async (id: string, data: UpdateItemInput): Promise<Item> => {
    const res = await axiosClient.patch(`/items/${id}`, data);
    return res.data.data.item;
  },

  getItems: async (params: QueryItemInput = {}): Promise<PaginatedItems> => {
    const res = await axiosClient.get('/items', { params });
    return res.data.data;
  },

  getMyItems: async (params: QueryItemInput = {}): Promise<PaginatedItems> => {
    const res = await axiosClient.get('/items/me', { params });
    return res.data.data;
  },

  getItemById: async (id: string): Promise<Item> => {
    const res = await axiosClient.get(`/items/${id}`);
    return res.data.data.item;
  },

  deleteItem: async (id: string): Promise<void> => {
    await axiosClient.delete(`/items/${id}`);
  }
};
