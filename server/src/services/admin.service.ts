import { prisma } from '../config/prisma';

export const getStats = async () => {
  const [totalUsers, activeItems, resolvedItems, totalMatches, openSupportTickets] = await Promise.all([
    prisma.user.count(),
    prisma.item.count({ where: { status: 'ACTIVE', deletedAt: null } }),
    prisma.item.count({ where: { status: 'RESOLVED' } }),
    prisma.match.count(),
    prisma.supportTicket.count({ where: { status: 'OPEN' } }),
  ]);

  return {
    totalUsers,
    activeItems,
    resolvedItems,
    totalMatches,
    openSupportTickets,
  };
};

export const getUsers = async (page = 1, limit = 20, search?: string) => {
  const skip = (page - 1) * limit;
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { items: true, claims: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    pages: Math.ceil(total / limit),
  };
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: { id: true, name: true, email: true, isActive: true },
  });
};

export const getItems = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { name: true, email: true } },
        category: true,
        _count: { select: { claims: true } }
      },
    }),
    prisma.item.count(),
  ]);

  return {
    items,
    total,
    pages: Math.ceil(total / limit),
  };
};

export const moderateItem = async (itemId: string, action: 'DELETE' | 'RESTORE' | 'HARD_DELETE') => {
  if (action === 'HARD_DELETE') {
    return prisma.item.delete({
      where: { id: itemId },
    });
  } else if (action === 'DELETE') {
    return prisma.item.update({
      where: { id: itemId },
      data: { deletedAt: new Date() },
    });
  } else {
    return prisma.item.update({
      where: { id: itemId },
      data: { deletedAt: null },
    });
  }
};

export const getSupportTickets = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
    }),
    prisma.supportTicket.count(),
  ]);

  return {
    tickets,
    total,
    pages: Math.ceil(total / limit),
  };
};

import { sendEmail } from '../utils/mailer';

export const updateSupportTicketStatus = async (ticketId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED', resolutionMessage?: string) => {
  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status },
  });

  // Send an email notification based on the new status
  if (status === 'IN_PROGRESS') {
    await sendEmail({
      to: ticket.email,
      subject: 'Update on Your Trace Support Request',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0f172a;">Support Request Update</h2>
          <p>Hi ${ticket.name || 'there'},</p>
          <p>This is an automated message to let you know that our administrative team is currently reviewing your support request (<strong>${ticket.subject}</strong>).</p>
          <p>We are actively looking into the issue and will follow up with you as soon as we have a resolution.</p>
          <p>Thank you for your patience,<br>The Trace Team</p>
        </div>
      `,
    });
  } else if (status === 'RESOLVED') {
    const customMessageHtml = resolutionMessage 
      ? `<div style="margin: 20px 0; padding: 15px; border-left: 4px solid #10b981; background-color: #f0fdf4; color: #166534; font-size: 15px; line-height: 1.5;">${resolutionMessage.replace(/\n/g, '<br>')}</div>`
      : `<p>We are writing to let you know that your support request (<strong>${ticket.subject}</strong>) has been marked as resolved by our administrative team.</p>`;

    await sendEmail({
      to: ticket.email,
      subject: 'Your Trace Support Request Has Been Resolved',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0f172a;">Support Request Resolved</h2>
          <p>Hi ${ticket.name || 'there'},</p>
          ${customMessageHtml}
          <p>If you need any further assistance or if the issue persists, please don't hesitate to submit a new support request.</p>
          <p>Best regards,<br>The Trace Team</p>
        </div>
      `,
    });
  }

  return ticket;
};
