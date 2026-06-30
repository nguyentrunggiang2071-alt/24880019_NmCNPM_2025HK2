import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';

export class AnalyticsController {
  private service: AnalyticsService;

  constructor() {
    this.service = new AnalyticsService();
  }

  getTopTags = async (_req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getTopTags(15);
      res.json({ data, error: null });
    } catch (err) {
      res.status(500).json({ data: null, error: (err as Error).message });
    }
  };

  getTrends = async (_req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getTrendsByMonth(6);
      res.json({ data, error: null });
    } catch (err) {
      res.status(500).json({ data: null, error: (err as Error).message });
    }
  };

  getMonthlyCount = async (_req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getArticleCountByMonth();
      res.json({ data, error: null });
    } catch (err) {
      res.status(500).json({ data: null, error: (err as Error).message });
    }
  };
}
