import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);
  res.status(500).json({ data: null, error: err.message || 'Internal server error' });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({ data: null, error: `Route ${req.path} not found` });
};
