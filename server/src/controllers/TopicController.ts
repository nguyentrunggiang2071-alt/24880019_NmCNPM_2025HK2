import { Request, Response } from 'express';
import { TopicService } from '../services/TopicService';

export class TopicController {
  private topicService: TopicService;

  constructor() {
    this.topicService = new TopicService();
  }

  getTopics = async (req: Request, res: Response): Promise<void> => {
    try {
      const topics = await this.topicService.getUserTopics(req.userId!);
      res.json({ data: topics, error: null });
    } catch (err) {
      res.status(500).json({ data: null, error: (err as Error).message });
    }
  };

  createTopic = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, keywords } = req.body as { name: string; keywords: string[] };
      const topic = await this.topicService.createTopic(req.userId!, name, keywords);
      res.status(201).json({ data: topic, error: null });
    } catch (err) {
      res.status(400).json({ data: null, error: (err as Error).message });
    }
  };

  updateTopic = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, keywords } = req.body as { name?: string; keywords?: string[] };
      const topic = await this.topicService.updateTopic(
        String(req.params.id),
        req.userId!,
        name,
        keywords
      );
      res.json({ data: topic, error: null });
    } catch (err) {
      const status = (err as Error).message === 'Topic not found' ? 404 : 400;
      res.status(status).json({ data: null, error: (err as Error).message });
    }
  };

  deleteTopic = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.topicService.deleteTopic(String(req.params.id), req.userId!);
      res.json({ data: { message: 'Topic deleted' }, error: null });
    } catch (err) {
      const status = (err as Error).message === 'Topic not found' ? 404 : 500;
      res.status(status).json({ data: null, error: (err as Error).message });
    }
  };
}
