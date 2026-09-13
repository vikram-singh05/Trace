import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

// ── HTTP Server ───────────────────────────────────────────────────
// We wrap Express in an http.Server so Socket.io can share the same port.
const httpServer = http.createServer(app);

import jwt from 'jsonwebtoken';

// ── Socket.io Server ──────────────────────────────────────────────
// Exported so notification.service.ts can emit events to user rooms.
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.CLIENT_URL,
    credentials: true,
  },
});

// Socket auth middleware
io.use((socket, next) => {
  const cookieString = socket.request.headers.cookie;
  if (!cookieString) return next(new Error('Authentication error'));

  // Very basic cookie parsing for the 'token' cookie (set in auth.controller.ts)
  const match = cookieString.match(new RegExp('(^| )' + 'token' + '=([^;]+)'));
  if (match) {
    const token = match[2];
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      // Attach user ID to the socket for future reference
      (socket as any).userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const userId = (socket as any).userId;
  // Join a room unique to this user so we can emit to them specifically
  socket.join(userId);
  console.log(`🔌 Socket connected: ${socket.id} (User: ${userId})`);
  
  // -- Chat System --
  socket.on('join_chat', (conversationId: string) => {
    socket.join(`chat_${conversationId}`);
    console.log(`💬 User ${userId} joined chat_${conversationId}`);
  });

  // Max message length — mirrors a sane text-message bound and prevents a
  // single client from persisting arbitrarily large payloads.
  const MAX_MESSAGE_LENGTH = 5000;

  socket.on('send_message', async (data: { conversationId: string, content: string, receiverId: string }) => {
    try {
      // ── Input validation ──────────────────────────────────────────
      // Never trust the client payload. Reject missing/empty/oversized content.
      const content = typeof data?.content === 'string' ? data.content.trim() : '';
      if (!data?.conversationId || !content) return;
      if (content.length > MAX_MESSAGE_LENGTH) {
        socket.emit('message_error', { message: 'Message is too long.' });
        return;
      }

      // ── Authorization ─────────────────────────────────────────────
      // Load the conversation with its claim so we can confirm the sender
      // is actually a participant. A conversation has exactly two parties:
      // the item reporter and the claimant. Without this check any
      // authenticated user could inject messages into a stranger's chat
      // and spam notifications at an arbitrary receiverId.
      const conversation = await prisma.conversation.findUnique({
        where: { id: data.conversationId },
        include: {
          claim: { select: { claimantId: true, item: { select: { reporterId: true } } } },
        },
      });

      if (!conversation) return;

      const claimantId = conversation.claim.claimantId;
      const reporterId = conversation.claim.item.reporterId;
      if (userId !== claimantId && userId !== reporterId) {
        socket.emit('message_error', { message: 'Not authorized for this conversation.' });
        return;
      }

      // Derive the receiver server-side (the other participant) rather than
      // trusting the client-supplied receiverId.
      const receiverId = userId === reporterId ? claimantId : reporterId;

      // Save message to database
      const message = await prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: userId,
          content
        },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true } }
        }
      });

      // Broadcast to everyone in the chat room
      io.to(`chat_${data.conversationId}`).emit('receive_message', message);

      // Also emit a notification event to the receiver's personal room.
      // If the receiver is NOT currently connected, this event is silently
      // dropped — but that's fine: the message's `isRead: false` default
      // persists the unread state in the DB. The receiver will see the
      // correct unread count when they next open the app and fetch
      // conversations via GET /api/v1/chat (which includes unreadCount).
      io.to(receiverId).emit('chat_notification', message);

    } catch (error) {
      console.error('Socket message error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ── Start Server ──────────────────────────────────────────────────
const start = async () => {
  try {
    // Verify database connection before accepting traffic
    await prisma.$connect();
    console.log('✅ Database connected');

    httpServer.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// ── Graceful Shutdown ─────────────────────────────────────────────
// Close DB connections cleanly on CTRL+C or process termination
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

start();
