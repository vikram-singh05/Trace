import axiosClient from '../lib/axiosClient';
import type { Item } from './itemApi';

export interface ClaimAnswerInput {
  questionId: string;
  answer: string;
}

export interface CreateClaimInput {
  itemId: string;
  proofText?: string;
  proofImageUrls?: string[];
  answers: ClaimAnswerInput[];
}

export interface UpdateClaimStatusInput {
  status: 'APPROVED' | 'REJECTED';
}

export interface ClaimAnswer {
  id: string;
  questionId: string;
  answer: string;
  question?: {
    question: string;
  };
}

export interface Claim {
  id: string;
  itemId: string;
  claimantId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  proofText: string | null;
  proofImageUrls: string[];
  createdAt: string;
  claimant?: {
    id: string;
    name: string;
    avatarUrl: string | null;
    email?: string;
  };
  item?: Item;
  answers: ClaimAnswer[];
}

export const claimApi = {
  createClaim: async (data: CreateClaimInput): Promise<Claim> => {
    const res = await axiosClient.post('/claims', data);
    return res.data.data.claim;
  },

  getClaimsForItem: async (itemId: string): Promise<Claim[]> => {
    const res = await axiosClient.get(`/claims/item/${itemId}`);
    return res.data.data.claims;
  },

  getMyClaims: async (): Promise<Claim[]> => {
    const res = await axiosClient.get('/claims/me');
    return res.data.data.claims;
  },

  updateClaimStatus: async (claimId: string, data: UpdateClaimStatusInput): Promise<Claim> => {
    const res = await axiosClient.patch(`/claims/${claimId}/status`, data);
    return res.data.data.claim;
  }
};
