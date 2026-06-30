import { Request, Response } from 'express';
import { FavoriteService } from '../services/FavoriteService';

export class FavoriteController {
  private favoriteService: FavoriteService;

  constructor() {
    this.favoriteService = new FavoriteService();
  }

  getFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
      const favorites = await this.favoriteService.getUserFavorites(req.userId!);
      res.json({ data: favorites, error: null });
    } catch (err) {
      res.status(500).json({ data: null, error: (err as Error).message });
    }
  };

  addFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
      const { article_id } = req.body as { article_id?: string };
      if (!article_id) {
        res.status(400).json({ data: null, error: 'article_id is required' });
        return;
      }
      const favorite = await this.favoriteService.addFavorite(req.userId!, article_id);
      res.status(201).json({ data: favorite, error: null });
    } catch (err) {
      res.status(400).json({ data: null, error: (err as Error).message });
    }
  };

  removeFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.favoriteService.removeFavorite(req.userId!, String(req.params.articleId));
      res.json({ data: { message: 'Removed from favorites' }, error: null });
    } catch (err) {
      const status = (err as Error).message === 'Favorite not found' ? 404 : 500;
      res.status(status).json({ data: null, error: (err as Error).message });
    }
  };

  checkFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
      const isFavorited = await this.favoriteService.isFavorited(
        req.userId!,
        String(req.params.articleId)
      );
      res.json({ data: { is_favorited: isFavorited }, error: null });
    } catch (err) {
      res.status(500).json({ data: null, error: (err as Error).message });
    }
  };
}
