import { z } from 'zod';
import { FeedbackType, FeedbackSeverity, FeedbackStatus } from '@prisma/client';

export const createFeedbackSchema = z.object({
  type: z.nativeEnum(FeedbackType),
  category: z.string().max(50).optional(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  severity: z.nativeEnum(FeedbackSeverity).optional(),
  screenshotUrl: z.string().url().optional().or(z.literal('')),
  pageUrl: z.string().url().optional().or(z.string().startsWith('/')).or(z.literal('')),
  route: z.string().max(100).optional().or(z.literal('')),
  itemId: z.string().optional().or(z.literal('')),
});

export const updateFeedbackStatusSchema = z.object({
  status: z.nativeEnum(FeedbackStatus),
  adminNote: z.string().max(1000).optional().or(z.literal('')),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackStatusInput = z.infer<typeof updateFeedbackStatusSchema>;
