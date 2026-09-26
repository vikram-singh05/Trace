import { prisma } from '../config/prisma';
import type { CreateFeedbackInput, UpdateFeedbackStatusInput } from '../validators/feedback.validator';

export const createFeedback = async (input: CreateFeedbackInput, userId?: string) => {
  return prisma.feedbackReport.create({
    data: {
      type: input.type,
      category: input.category || null,
      title: input.title,
      description: input.description,
      severity: input.severity || null,
      screenshotUrl: input.screenshotUrl || null,
      pageUrl: input.pageUrl || null,
      route: input.route || null,
      itemId: input.itemId || null,
      userId: userId || null,
    },
  });
};

export const getFeedbacks = async (filters: any) => {
  return prisma.feedbackReport.findMany({
    where: filters,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      item: { select: { id: true, title: true } },
    }
  });
};

export const getFeedbackById = async (id: string) => {
  return prisma.feedbackReport.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      item: { select: { id: true, title: true } },
    }
  });
};

export const updateFeedbackStatus = async (id: string, input: UpdateFeedbackStatusInput) => {
  return prisma.feedbackReport.update({
    where: { id },
    data: {
      status: input.status,
      adminNote: input.adminNote || null,
    },
  });
};

export const getUserFeedbacks = async (userId: string) => {
  return prisma.feedbackReport.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};
