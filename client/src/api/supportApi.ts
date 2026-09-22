import axiosClient from '../lib/axiosClient';

export interface CreateSupportTicketInput {
  email: string;
  name?: string;
  subject: string;
  message: string;
}

export const supportApi = {
  createTicket: async (data: CreateSupportTicketInput): Promise<void> => {
    await axiosClient.post('/support', data);
  },
};
