import { Request, Response, NextFunction } from 'express';
import * as FeedbackService from '../services/feedback.service';
import type { CreateFeedbackInput, UpdateFeedbackStatusInput } from '../validators/feedback.validator';

export const createFeedback = async (
  req: Request<{}, {}, CreateFeedbackInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const feedback = await FeedbackService.createFeedback(req.body, userId);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      data: { feedback },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserFeedbacks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const feedbacks = await FeedbackService.getUserFeedbacks(userId);
    res.json({ success: true, data: { feedbacks } });
  } catch (error) {
    next(error);
  }
};

export const getAllFeedbacks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = req.query;
    const feedbacks = await FeedbackService.getFeedbacks(filters);
    res.json({ success: true, data: { feedbacks } });
  } catch (error) {
    next(error);
  }
};

export const getFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const feedback = await FeedbackService.getFeedbackById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, error: { message: 'Feedback not found' } });
    }
    res.json({ success: true, data: { feedback } });
  } catch (error) {
    next(error);
  }
};

export const updateFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const feedback = await FeedbackService.updateFeedbackStatus(req.params.id, req.body);
    res.json({ success: true, message: 'Status updated', data: { feedback } });
  } catch (error) {
    next(error);
  }
};
