import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const requireRole = (role: 'STUDENT' | 'ADMIN') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (req.user.role !== role) {
      return next(new AppError('Access denied. Insufficient permissions.', 403));
    }

    next();
  };
};
