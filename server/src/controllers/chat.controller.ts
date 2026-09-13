import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// Get all active conversations for the logged-in user
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const conversations = await prisma.conversation.findMany({
      where: {
        claim: {
          OR: [
            { claimantId: userId },
            { item: { reporterId: userId } }
          ],
          status: 'APPROVED'
        }
      },
      include: {
        claim: {
          include: {
            item: { 
              select: { 
                id: true, 
                title: true, 
                imageUrls: true, 
                reporterId: true,
                reporter: { select: { id: true, name: true, avatarUrl: true } }
              } 
            },
            claimant: { select: { id: true, name: true, avatarUrl: true } }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Hide conversations the current user has "deleted" from their own inbox.
    // The thread still exists for the other party; it reappears here only if a
    // message newer than this user's deletion timestamp has since arrived.
    const visible = conversations.filter((conv) => {
      const isReporter = conv.claim.item.reporterId === userId;
      const myDeletedAt = isReporter ? conv.reporterDeletedAt : conv.claimantDeletedAt;
      if (!myDeletedAt) return true;
      const lastMessage = conv.messages[0];
      return !!lastMessage && lastMessage.createdAt.getTime() > myDeletedAt.getTime();
    });

    // Attach per-conversation unread count so the client can show badge numbers.
    // A message is "unread" if it was sent by the other party and isRead is false.
    const withUnread = await Promise.all(
      visible.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false,
          },
        });
        return { ...conv, unreadCount };
      })
    );

    res.status(200).json(withUnread);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: { message: 'Failed to fetch conversations' } });
  }
};

// Get messages for a specific conversation (cursor-based pagination)
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.userId;

    // Pagination params
    const cursor = req.query.cursor as string | undefined;
    const rawLimit = parseInt(req.query.limit as string, 10);
    const limit = Math.min(Math.max(rawLimit || 50, 1), 100); // default 50, max 100

    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { claim: { include: { item: true } } }
    });

    if (!conv || (req.user!.role !== 'ADMIN' && conv.claim.claimantId !== userId && conv.claim.item.reporterId !== userId)) {
      return res.status(403).json({ error: { message: 'Access denied to this conversation' } });
    }

    // Fetch one extra row to determine if there are more messages beyond this page
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(cursor ? { createdAt: { lt: (await prisma.message.findUnique({ where: { id: cursor } }))!.createdAt } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    // If we got more than `limit`, there are older messages
    const hasMore = messages.length > limit;
    const page = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    // Reverse to chronological order for display
    page.reverse();

    // Mark incoming messages as read, unless an ADMIN is simply auditing
    const isParticipant = conv.claim.claimantId === userId || conv.claim.item.reporterId === userId;
    if (isParticipant) {
      await prisma.message.updateMany({
        where: { conversationId, senderId: { not: userId }, isRead: false },
        data: { isRead: true }
      });
    }

    res.status(200).json({ messages: page, nextCursor });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: { message: 'Failed to fetch messages' } });
  }
};

// Delete a conversation.
//
// Participants delete only their OWN view of the thread (like every mainstream
// messaging app): we stamp their side and hide it from their inbox, but the
// other party keeps the full history. The row is removed for good only once
// both parties have cleared it. A non-participant admin hard-deletes (moderation).
export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.userId;
    const isAdmin = req.user!.role === 'ADMIN';

    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        claim: { include: { item: { select: { reporterId: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    if (!conv) {
      return res.status(404).json({ error: { message: 'Conversation not found' } });
    }

    const reporterId = conv.claim.item.reporterId;
    const claimantId = conv.claim.claimantId;
    const isReporter = userId === reporterId;
    const isClaimant = userId === claimantId;

    if (!isReporter && !isClaimant && !isAdmin) {
      return res.status(403).json({ error: { message: 'Access denied to this conversation' } });
    }

    // Admin who isn't a participant is moderating — remove the whole thread.
    if (isAdmin && !isReporter && !isClaimant) {
      await prisma.conversation.delete({ where: { id: conversationId } });
      return res.status(200).json({ message: 'Conversation deleted successfully' });
    }

    // Participant: soft-delete this user's side only.
    const now = new Date();
    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: isReporter ? { reporterDeletedAt: now } : { claimantDeletedAt: now },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    // Cleanup: if both sides have cleared the thread and nothing newer was said,
    // no one can ever see it again — safe to remove the row permanently.
    if (updated.reporterDeletedAt && updated.claimantDeletedAt) {
      const lastMessageAt = updated.messages[0]?.createdAt.getTime() ?? null;
      const bothClearedLatest =
        lastMessageAt === null ||
        (updated.reporterDeletedAt.getTime() >= lastMessageAt &&
          updated.claimantDeletedAt.getTime() >= lastMessageAt);
      if (bothClearedLatest) {
        await prisma.conversation.delete({ where: { id: conversationId } });
      }
    }

    res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: { message: 'Failed to delete conversation' } });
  }
};
