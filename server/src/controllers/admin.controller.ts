import { Request, Response, NextFunction } from 'express';
import * as AdminService from '../services/admin.service';

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await AdminService.getStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const result = await AdminService.getUsers(page, limit, search);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean' });
    }

    const updatedUser = await AdminService.updateUserStatus(id, isActive);
    res.status(200).json({ success: true, data: { user: updatedUser } });
  } catch (error) {
    next(error);
  }
};

export const getItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await AdminService.getItems(page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const moderateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'DELETE' | 'RESTORE' | 'HARD_DELETE'

    if (action !== 'DELETE' && action !== 'RESTORE' && action !== 'HARD_DELETE') {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const updatedItem = await AdminService.moderateItem(id, action);
    res.status(200).json({ success: true, data: { item: updatedItem } });
  } catch (error) {
    next(error);
  }
};
