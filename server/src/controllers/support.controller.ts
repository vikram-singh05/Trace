import { Request, Response, NextFunction } from 'express';
import * as SupportService from '../services/support.service';
import type { CreateSupportTicketInput } from '../validators/support.validator';

export const createTicket = async (
  req: Request<{}, {}, CreateSupportTicketInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    // If the user is logged in, authenticate middleware will attach req.user
    const userId = req.user?.userId;

    const ticket = await SupportService.createSupportTicket(req.body, userId);

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully.',
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};
