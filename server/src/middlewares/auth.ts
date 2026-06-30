import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ data: null, error: 'Missing authorization token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const { userId, email } = await authService.verifyToken(token);
    req.userId = userId;
    req.userEmail = email;
    next();
  } catch {
    res.status(401).json({ data: null, error: 'Invalid or expired token' });
  }
};
