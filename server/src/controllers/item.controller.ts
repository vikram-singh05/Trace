import { Request, Response, NextFunction } from 'express';
import * as ItemService from '../services/item.service';
import type { CreateItemInput, UpdateItemInput, QueryItemInput } from '../validators/item.validator';

export const createItem = async (
  req: Request<{}, {}, CreateItemInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await ItemService.createItem(req.user!.userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Item reported successfully',
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

export const getItems = async (
  req: Request<any, any, any, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await ItemService.getItems(req.query as QueryItemInput);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyItems = async (
  req: Request<any, any, any, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await ItemService.getItems(req.query as QueryItemInput, req.user!.userId);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await ItemService.getItemById(req.params.id, req.user?.userId);
    res.status(200).json({
      success: true,
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (
  req: Request<{ id: string }, {}, UpdateItemInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await ItemService.updateItem(
      req.params.id,
      req.user!.userId,
      req.user!.role,
      req.body
    );
    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    await ItemService.deleteItem(req.params.id, req.user!.userId, req.user!.role);
    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
