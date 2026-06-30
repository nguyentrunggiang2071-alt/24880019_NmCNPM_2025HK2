import { FavoriteRepository } from '../repositories/FavoriteRepository';
import { Favorite } from '../types';

export class FavoriteService {
  private favoriteRepository: FavoriteRepository;

  constructor() {
    this.favoriteRepository = new FavoriteRepository();
  }

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    return this.favoriteRepository.findByUserId(userId);
  }

  async addFavorite(userId: string, articleId: string): Promise<Favorite> {
    const existing = await this.favoriteRepository.findOne(userId, articleId);
    if (existing) throw new Error('Article already in favorites');

    return this.favoriteRepository.create(userId, articleId);
  }

  async removeFavorite(userId: string, articleId: string): Promise<void> {
    const existing = await this.favoriteRepository.findOne(userId, articleId);
    if (!existing) throw new Error('Favorite not found');

    return this.favoriteRepository.delete(userId, articleId);
  }

  async isFavorited(userId: string, articleId: string): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne(userId, articleId);
    return favorite !== null;
  }
}
