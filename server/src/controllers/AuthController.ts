import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const profile = await this.authService.getUserProfile(req.userId!);
      res.json({ data: profile, error: null });
    } catch (err) {
      res.status(500).json({ data: null, error: (err as Error).message });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { full_name, avatar_url } = req.body;
      const profile = await this.authService.updateProfile(req.userId!, {
        full_name,
        avatar_url,
      });
      res.json({ data: profile, error: null });
    } catch (err) {
      res.status(400).json({ data: null, error: (err as Error).message });
    }
  };
}
