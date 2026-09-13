import { z } from 'zod';
import { ItemType, ItemStatus } from '@prisma/client';

// ── Reusable schemas ──────────────────────────────────────────────

const verificationQuestionSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters').max(200, 'Question too long'),
  displayOrder: z.number().int().min(1).optional(),
});

// ── Create Item Schema ────────────────────────────────────────────

export const createItemSchema = z
  .object({
    type: z.nativeEnum(ItemType, { required_error: 'Item type (LOST/FOUND) is required' }),
    categoryId: z.string().cuid('Invalid category ID'),
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
    color: z.string().max(50, 'Color description too long').optional().nullable(),
    brand: z.string().max(50, 'Brand name too long').optional().nullable(),
    location: z.string().min(3, 'Location is required').max(100, 'Location too long'),
    dateOccurred: z.coerce.date({ required_error: 'Date is required', invalid_type_error: 'Invalid date format' }),
    imageUrls: z.array(z.string().url('Invalid image URL')).max(5, 'Maximum 5 images allowed').optional().default([]),
    tags: z.array(z.string().max(30)).max(10, 'Maximum 10 tags allowed').optional().default([]),
    verificationQuestions: z.array(verificationQuestionSchema).max(3, 'Maximum 3 verification questions allowed').optional(),
  })
  .refine(
    (data) => {
      // If type is FOUND, verificationQuestions must be provided and have at least 1 question
      if (data.type === 'FOUND') {
        return data.verificationQuestions && data.verificationQuestions.length > 0;
      }
      return true;
    },
    {
      message: 'Verification questions are required for FOUND items',
      path: ['verificationQuestions'],
    }
  );

// ── Update Item Schema ────────────────────────────────────────────

export const updateItemSchema = z.object({
  status: z.nativeEnum(ItemStatus).optional(),
  categoryId: z.string().cuid('Invalid category ID').optional(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long').optional(),
  color: z.string().max(50, 'Color description too long').optional().nullable(),
  brand: z.string().max(50, 'Brand name too long').optional().nullable(),
  location: z.string().min(3, 'Location is required').max(100, 'Location too long').optional(),
  dateOccurred: z.coerce.date({ invalid_type_error: 'Invalid date format' }).optional(),
  imageUrls: z.array(z.string().url('Invalid image URL')).max(5, 'Maximum 5 images allowed').optional(),
  tags: z.array(z.string().max(30)).max(10, 'Maximum 10 tags allowed').optional(),
});

// ── Query (List/Search) Schema ────────────────────────────────────

export const queryItemSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  type: z.nativeEnum(ItemType).optional(),
  categoryId: z.string().cuid().optional(),
  status: z.nativeEnum(ItemStatus).optional(),
  location: z.string().optional(),
  search: z.string().optional(),
});

// ── Inferred TypeScript types ─────────────────────────────────────

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type QueryItemInput  = z.infer<typeof queryItemSchema>;
