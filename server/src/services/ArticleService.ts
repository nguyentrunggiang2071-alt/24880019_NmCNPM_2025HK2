import { ArticleRepository } from '../repositories/ArticleRepository';
import { AIService } from './AIService';
import { IngestionService } from './IngestionService';
import { ScoringService } from './ScoringService';
import { Article, ArticleFilters, PaginationParams, PaginatedResponse } from '../types';

export class ArticleService {
  private articleRepository: ArticleRepository;
  private aiService: AIService;
  private ingestionService: IngestionService;
  private scoringService: ScoringService;

  constructor() {
    this.articleRepository = new ArticleRepository();
    this.aiService = new AIService();
    this.ingestionService = new IngestionService();
    this.scoringService = new ScoringService();
  }

  private readonly DEFAULT_KEYWORDS = [
    'machine learning', 'deep learning', 'artificial intelligence',
    'natural language processing', 'computer vision',
    'large language model', 'transformer', 'neural network',
    'reinforcement learning', 'generative AI',
  ];

  async getArticles(
    params: PaginationParams,
    filters: ArticleFilters
  ): Promise<PaginatedResponse<Article>> {
    const result = await this.articleRepository.findAll(params, filters);

    // Tự động ingest lần đầu nếu database trống và không có filter
    if (result.total === 0 && !filters.keyword && !filters.topic) {
      console.log('[ArticleService] Database empty — running initial ingestion...');
      await this.ingestionService.ingestByTopicKeywords(this.DEFAULT_KEYWORDS);
      return this.articleRepository.findAll(params, filters);
    }

    return result;
  }

  async getArticleById(id: string): Promise<Article & { summary?: string }> {
    const article = await this.articleRepository.findById(id);
    if (!article) throw new Error('Article not found');
    return article;
  }

  async getSummary(articleId: string): Promise<string> {
    const article = await this.articleRepository.findById(articleId);
    if (!article) throw new Error('Article not found');

    const summary = await this.aiService.summarizeArticle(
      articleId,
      article.abstract,
      article.title
    );
    return summary.content;
  }

  async getArticlesByKeywords(keywords: string[]): Promise<Article[]> {
    await this.ingestionService.ingestByTopicKeywords(keywords);
    return this.articleRepository.findByTopicKeywords(keywords);
  }

  async getRelatedArticles(articleId: string): Promise<(Article & { score: number })[]> {
    const article = await this.articleRepository.findById(articleId);
    if (!article) throw new Error('Article not found');
    const related = await this.articleRepository.findRelated(articleId, article.topic_tags, 6);
    return this.scoringService.scoreArticles(related);
  }

  async getScoredArticles(params: PaginationParams, filters: ArticleFilters): Promise<PaginatedResponse<Article & { score: number }>> {
    const result = await this.getArticles(params, filters);
    const scored = this.scoringService.scoreArticles(result.data);
    return { ...result, data: scored };
  }
}
