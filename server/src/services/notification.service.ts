import { prisma } from '../config/prisma';
import { io } from '../server';
import { sendEmail } from '../utils/mailer';
import { NotificationType } from '@prisma/client';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  message: string;
  relatedItemId?: string;
  emailSubject?: string;
  emailHtml?: string;
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    // 1. Create DB record
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        message: params.message,
        relatedItemId: params.relatedItemId,
      },
    });

    // 2. Emit to socket room
    // The user's socket joined a room named after their userId in server.ts
    io.to(params.userId).emit('notification', notification);

    // 3. Send email fallback if details provided — fire-and-forget so the
    //    caller (e.g. a claim action) isn't blocked on the SMTP round-trip.
    //    The in-app notification + socket emit above already succeeded; email
    //    failures are logged, not surfaced.
    if (params.emailSubject && params.emailHtml) {
      const emailSubject = params.emailSubject;
      const emailHtml = params.emailHtml;
      void (async () => {
        try {
          const user = await prisma.user.findUnique({ where: { id: params.userId }, select: { email: true } });
          if (user?.email) {
            await sendEmail({
              to: user.email,
              subject: emailSubject,
              html: emailHtml,
            });

            // Mark as email sent
            await prisma.notification.update({
              where: { id: notification.id },
              data: { emailSent: true },
            });
          }
        } catch (err) {
          console.error('Failed to send notification email:', err);
        }
      })();
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

export const getMyNotifications = async (userId: string, limit = 20) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};

export const markAsRead = async (notificationId: string, userId: string) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
};

export const markAllAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
