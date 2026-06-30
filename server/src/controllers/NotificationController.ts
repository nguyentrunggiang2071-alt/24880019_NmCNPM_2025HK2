import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';

export class NotificationController {
  private service: NotificationService;

  constructor() {
    this.service = new NotificationService();
  }

  getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const notifications = await this.service.getNotifications(req.userId!);
      res.json({ data: notifications, error: null });
    } catch (err) {
      res.status(500).json({ data: null, error: (err as Error).message });
    }
  };

  getUnreadCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.service.getUnreadCount(req.userId!);
      res.json({ data: { count }, error: null });
    } catch (err) {
      res.status(500).json({ data: null, error: (err as Error).message });
    }
  };

  markRead = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.markRead(String(req.params.id), req.userId!);
      res.json({ data: { ok: true }, error: null });
    } catch (err) {
      res.status(500).json({ data: null, error: (err as Error).message });
    }
  };

  markAllRead = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.markAllRead(req.userId!);
      res.json({ data: { ok: true }, error: null });
    } catch (err) {
      res.status(500).json({ data: null, error: (err as Error).message });
    }
  };
}
