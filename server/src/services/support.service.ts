import { prisma } from '../config/prisma';
import type { CreateSupportTicketInput } from '../validators/support.validator';

export const createSupportTicket = async (
  input: CreateSupportTicketInput,
  userId?: string
) => {
  const ticket = await prisma.supportTicket.create({
    data: {
      email: input.email,
      name: input.name,
      subject: input.subject,
      message: input.message,
      userId: userId || null, // Optional, links to the user if they were logged in
    },
  });

  return ticket;
};
