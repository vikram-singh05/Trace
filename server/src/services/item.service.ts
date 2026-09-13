import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import * as MatchService from './match.service';
import type { CreateItemInput, UpdateItemInput, QueryItemInput } from '../validators/item.validator';

// ── Service Functions ─────────────────────────────────────────────

export const createItem = async (userId: string, input: CreateItemInput) => {
  // If FOUND, hash the verification answers before storing
  let verificationQuestionsData = undefined;
  
  if (input.type === 'FOUND' && input.verificationQuestions && input.verificationQuestions.length > 0) {
    verificationQuestionsData = {
      create: input.verificationQuestions.map((q) => ({
        question: q.question,
        displayOrder: q.displayOrder ?? 1,
      })),
    };
  }

  const item = await prisma.item.create({
    data: {
      reporterId: userId,
      type: input.type,
      categoryId: input.categoryId,
      title: input.title,
      description: input.description,
      color: input.color,
      brand: input.brand,
      location: input.location,
      dateOccurred: input.dateOccurred,
      imageUrls: input.imageUrls,
      tags: input.tags,
      // Status defaults to ACTIVE in Prisma schema
      ...(verificationQuestionsData && { verificationQuestions: verificationQuestionsData }),
    },
    include: {
      category: true,
    },
  });

  // Asynchronously trigger matching (do not await)
  MatchService.findMatchesFor(item.id).catch(console.error);

  return item;
};

export const getItems = async (query: QueryItemInput, reporterId?: string) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  // Build the dynamic where clause
  const where: Prisma.ItemWhereInput = {
    deletedAt: null, // Always exclude soft-deleted items
  };

  if (reporterId) {
    where.reporterId = reporterId;
  }
  if (query.type) {
    where.type = query.type;
  }
  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }
  if (query.status) {
    where.status = query.status;
  }
  if (query.location) {
    where.location = { contains: query.location, mode: 'insensitive' };
  }
  if (query.search) {
    // Basic search in title, description, or tags
    // Phase 5 will enhance this with full-text search
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { tags: { has: query.search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        reporter: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    }),
    prisma.item.count({ where }),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getItemById = async (id: string, currentUserId?: string) => {
  // Fetch the item lean. Match data is owner-only (see below), so pulling the
  // match joins for every authenticated viewer was wasted work on this hot
  // endpoint. Matches are loaded in a second, index-backed query only when the
  // viewer is the reporter.
  const item = await prisma.item.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      category: true,
      reporter: {
        select: { id: true, name: true, avatarUrl: true },
      },
      verificationQuestions: {
        select: {
          id: true,
          question: true,
          displayOrder: true,
          // Explicitly omit answerHash to ensure it never leaks
        },
        orderBy: {
          displayOrder: 'asc',
        },
      },
    },
  });

  if (!item) {
    throw new AppError('Item not found', 404, 'ITEM_NOT_FOUND');
  }

  // Matches are visible to the owner only. Fetch just the relevant direction
  // for the item's type, so non-owners pay nothing for match data.
  let matches = undefined;
  if (currentUserId === item.reporterId) {
    if (item.type === 'LOST') {
      const rows = await prisma.match.findMany({
        where: { lostItemId: id },
        include: { foundItem: { include: { category: true } } },
        orderBy: { score: 'desc' },
      });
      matches = rows.map((m) => ({
        id: m.id,
        score: m.score,
        reasons: m.reasons,
        item: m.foundItem,
      }));
    } else if (item.type === 'FOUND') {
      const rows = await prisma.match.findMany({
        where: { foundItemId: id },
        include: { lostItem: { include: { category: true } } },
        orderBy: { score: 'desc' },
      });
      matches = rows.map((m) => ({
        id: m.id,
        score: m.score,
        reasons: m.reasons,
        item: m.lostItem,
      }));
    }
  }

  return { ...item, ...(matches && { matches }) };
};

export const updateItem = async (id: string, userId: string, userRole: string, input: UpdateItemInput) => {
  const item = await prisma.item.findUnique({ where: { id } });

  if (!item || item.deletedAt) {
    throw new AppError('Item not found', 404, 'ITEM_NOT_FOUND');
  }

  // Authorization: Only the owner or an admin can update
  if (item.reporterId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Not authorized to modify this item', 403, 'FORBIDDEN');
  }

  const updatedItem = await prisma.item.update({
    where: { id },
    data: input,
    include: {
      category: true,
    },
  });

  return updatedItem;
};

export const deleteItem = async (id: string, userId: string, userRole: string) => {
  const item = await prisma.item.findUnique({ where: { id } });

  if (!item || item.deletedAt) {
    throw new AppError('Item not found', 404, 'ITEM_NOT_FOUND');
  }

  if (item.reporterId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Not authorized to delete this item', 403, 'FORBIDDEN');
  }

  await prisma.item.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
