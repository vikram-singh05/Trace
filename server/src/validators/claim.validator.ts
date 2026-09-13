import { z } from 'zod';
import { ClaimStatus } from '@prisma/client';

export const createClaimSchema = z.object({
  itemId: z.string().cuid('Invalid item ID'),
  proofText: z.string().max(1000, 'Proof text too long').optional(),
  proofImageUrls: z.array(z.string().url()).max(3, 'Max 3 proof images').optional().default([]),
  answers: z.array(
    z.object({
      questionId: z.string().cuid('Invalid question ID'),
      answer: z.string().min(1, 'Answer is required').max(200, 'Answer too long'),
    })
  ),
});

export const updateClaimStatusSchema = z.object({
  status: z.enum([ClaimStatus.APPROVED, ClaimStatus.REJECTED]),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type UpdateClaimStatusInput = z.infer<typeof updateClaimStatusSchema>;
