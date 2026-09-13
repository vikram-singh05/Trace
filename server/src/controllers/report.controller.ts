import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { z } from 'zod';

const createReportSchema = z.object({
  type: z.enum(['CHAT_ABUSE', 'SCAM', 'INAPPROPRIATE_BEHAVIOR', 'OTHER']),
  reason: z.string().min(1, 'Reason is required').max(1000),
  reportedId: z.string().cuid('Invalid user ID'),
  conversationId: z.string().cuid('Invalid conversation ID').optional(),
});

export const reportController = {
  // Create a new report (User)
  createReport: async (req: Request, res: Response) => {
    try {
      const reporterId = req.user!.userId;
      const { type, reason, reportedId, conversationId } = createReportSchema.parse(req.body);

      if (reporterId === reportedId) {
        return res.status(400).json({ error: { message: 'You cannot report yourself' } });
      }

      // Check if reported user exists
      const reportedUser = await prisma.user.findUnique({
        where: { id: reportedId }
      });

      if (!reportedUser) {
        return res.status(404).json({ error: { message: 'Reported user not found' } });
      }

      // Validate conversation if provided
      if (conversationId) {
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId }
        });
        if (!conversation) {
          return res.status(404).json({ error: { message: 'Conversation not found' } });
        }
      }

      const report = await prisma.userReport.create({
        data: {
          type,
          reason,
          reporterId,
          reportedId,
          conversationId,
        },
      });

      return res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: { message: error.errors[0].message } });
      }
      console.error('[createReport]', error);
      return res.status(500).json({ error: { message: 'Internal server error' } });
    }
  },

  // Get all reports (Admin)
  getReports: async (req: Request, res: Response) => {
    try {
      const reports = await prisma.userReport.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
          reportedUser: { select: { id: true, name: true, email: true, avatarUrl: true, isActive: true } },
          conversation: {
            include: {
              claim: { include: { item: { select: { id: true, title: true } } } }
            }
          }
        },
      });
      return res.json(reports);
    } catch (error) {
      console.error('[getReports]', error);
      return res.status(500).json({ error: { message: 'Internal server error' } });
    }
  },

  // Update report status (Admin)
  updateReportStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['PENDING', 'REVIEWED', 'DISMISSED'].includes(status)) {
        return res.status(400).json({ error: { message: 'Invalid status' } });
      }

      const report = await prisma.userReport.update({
        where: { id },
        data: { status },
      });

      return res.json(report);
    } catch (error) {
      console.error('[updateReportStatus]', error);
      return res.status(500).json({ error: { message: 'Internal server error' } });
    }
  },
};
