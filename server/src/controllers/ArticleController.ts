import { Request, Response } from 'express';
import { ArticleService } from '../services/ArticleService';

const str = (val: unknown): string | undefined => {
  if (Array.isArray(val)) return String(val[0]);
  if (typeof val === 'string') return val;
  return undefined;
};

export class ArticleController {
  private articleService: ArticleService;

  constructor() {
    this.articleService = new ArticleService();
  }

  getArticles = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(str(req.query.page) || '1');
      const limit = Math.min(parseInt(str(req.query.limit) || '20'), 100);

      const result = await this.articleService.getArticles(
        { page, limit },
        {
          keyword: str(req.query.keyword),
          author: str(req.query.author),
          topic: str(req.query.topic),
          date_from: str(req.query.date_from),
          date_to: str(req.query.date_to),
        }
      );

      res.json({ data: result, error: null });
    } catch (err) {
      res.status(500).json({ data: null, error: (err as Error).message });
    }
  };

  getArticleById = async (req: Request, res: Response): Promise<void> => {
    try {
      const article = await this.articleService.getArticleById(String(req.params.id));
      res.json({ data: article, error: null });
    } catch (err) {
      const status = (err as Error).message === 'Article not found' ? 404 : 500;
      res.status(status).json({ data: null, error: (err as Error).message });
    }
  };

  getSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const summary = await this.articleService.getSummary(String(req.params.id));
      res.json({ data: { summary }, error: null });
    } catch (err) {
      const status = (err as Error).message === 'Article not found' ? 404 : 500;
      res.status(status).json({ data: null, error: (err as Error).message });
    }
  };

  getRelated = async (req: Request, res: Response): Promise<void> => {
    try {
      const related = await this.articleService.getRelatedArticles(String(req.params.id));
      res.json({ data: related, error: null });
    } catch (err) {
      res.status(500).json({ data: null, error: (err as Error).message });
    }
  };

  triggerIngest = async (req: Request, res: Response): Promise<void> => {
    try {
      const keywords = (req.body?.keywords as string[] | undefined) || [
        'machine learning', 'deep learning', 'natural language processing',
        'computer vision', 'artificial intelligence',
      ];
      const count = await this.articleService['ingestionService'].ingestByTopicKeywords(keywords);
      res.json({ data: { ingested: count }, error: null });
    } catch (err) {
      res.status(500).json({ data: null, error: (err as Error).message });
    }
  };

  searchByKeywords = async (req: Request, res: Response): Promise<void> => {
    try {
      const raw = str(req.query.keywords);
      const keywords = raw?.split(',').filter(Boolean) || [];
      if (!keywords.length) {
        res.status(400).json({ data: null, error: 'Keywords are required' });
        return;
      }

      const articles = await this.articleService.getArticlesByKeywords(keywords);
      res.json({ data: articles, error: null });
    } catch (err) {
      res.status(500).json({ data: null, error: (err as Error).message });
    }
  };
}
