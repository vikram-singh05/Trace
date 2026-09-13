import axiosClient from '../lib/axiosClient';

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const res = await axiosClient.get('/categories');
    return res.data.data.categories;
  },
};
