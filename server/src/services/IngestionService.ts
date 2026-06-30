import axios from 'axios';
import xml2js from 'xml2js';
import { ArticleRepository } from '../repositories/ArticleRepository';
import { TopicRepository } from '../repositories/TopicRepository';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { Article } from '../types';

const ARXIV_API = 'http://export.arxiv.org/api/query';

interface ArxivEntry {
  id: string[];
  title: string[];
  summary: string[];
  published: string[];
  updated: string[];
  author: Array<{ name: string[] }>;
  link: Array<{ $: { href: string; rel: string; type?: string } }>;
  'arxiv:primary_category': Array<{ $: { term: string } }>;
}

export class IngestionService {
  private articleRepository: ArticleRepository;
  private topicRepository: TopicRepository;
  private notificationRepository: NotificationRepository;

  constructor() {
    this.articleRepository = new ArticleRepository();
    this.topicRepository = new TopicRepository();
    this.notificationRepository = new NotificationRepository();
  }

  async fetchFromArxiv(keywords: string[], maxResults = 10): Promise<Article[]> {
    const query = keywords.map((k) => `all:${k}`).join(' OR ');
    const url = `${ARXIV_API}?search_query=${encodeURIComponent(query)}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;

    const response = await axios.get(url, { timeout: 15000 });
    const parsed = await xml2js.parseStringPromise(response.data);
    const entries: ArxivEntry[] = parsed?.feed?.entry || [];

    const articles: Article[] = [];

    for (const entry of entries) {
      const arxivId = entry.id[0].split('/abs/').pop() || '';

      // Deduplication bước 1: kiểm tra arxiv_id
      const existingById = await this.articleRepository.findByArxivId(arxivId);
      if (existingById) {
        articles.push(existingById);
        continue;
      }

      const title = entry.title[0].replace(/\s+/g, ' ').trim();

      // Deduplication bước 2: kiểm tra title tương tự
      const existingByTitle = await this.articleRepository.findSimilarTitle(title);
      if (existingByTitle) {
        console.log(`[Dedup] Skipped near-duplicate: "${title.slice(0, 60)}..."`);
        articles.push(existingByTitle);
        continue;
      }

      const pdfLink = entry.link?.find((l) => l.$.type === 'application/pdf');
      const sourceLink = entry.link?.find((l) => l.$.rel === 'alternate');
      const authors = entry.author?.map((a) => a.name[0]) || [];
      const category = entry['arxiv:primary_category']?.[0]?.$.term || '';

      const articleData: Omit<Article, 'id' | 'created_at'> = {
        arxiv_id: arxivId,
        title,
        authors,
        abstract: entry.summary[0].replace(/\s+/g, ' ').trim(),
        published_at: entry.published[0],
        updated_at: entry.updated[0],
        pdf_url: pdfLink?.$.href || '',
        source_url: sourceLink?.$.href || `https://arxiv.org/abs/${arxivId}`,
        topic_tags: category ? [category, ...keywords] : keywords,
      };

      try {
        const saved = await this.articleRepository.create(articleData);
        articles.push(saved);
        // Gửi notifications cho user có topic khớp
        await this.notifyMatchingUsers(saved);
      } catch {
        // Skip duplicates from race condition
      }
    }

    return articles;
  }

  private async notifyMatchingUsers(article: Article): Promise<void> {
    try {
      const allTopics = await this.topicRepository.findAll();
      if (!allTopics.length) return;

      const titleLower = article.title.toLowerCase();
      const abstractLower = article.abstract.toLowerCase();
      const tagsLower = article.topic_tags.map((t) => t.toLowerCase());

      for (const topic of allTopics) {
        const matches = topic.keywords.some((kw) => {
          const kwLower = kw.toLowerCase();
          return (
            titleLower.includes(kwLower) ||
            abstractLower.includes(kwLower) ||
            tagsLower.some((tag) => tag.includes(kwLower))
          );
        });

        if (!matches) continue;

        const alreadyNotified = await this.notificationRepository.existsForUserAndArticle(
          topic.user_id,
          article.id
        );
        if (alreadyNotified) continue;

        const shortTitle =
          article.title.length > 80
            ? article.title.slice(0, 80) + '...'
            : article.title;

        await this.notificationRepository.create({
          user_id: topic.user_id,
          article_id: article.id,
          topic_id: topic.id,
          message: `Bài báo mới thuộc chủ đề "${topic.name}": ${shortTitle}`,
        });
      }
    } catch (err) {
      console.warn('[Notification] Failed to notify:', (err as Error).message);
    }
  }

  async ingestByTopicKeywords(keywords: string[]): Promise<number> {
    let total = 0;
    for (const keyword of keywords) {
      try {
        const articles = await this.fetchFromArxiv([keyword], 30);
        total += articles.length;
      } catch (err) {
        console.warn(`[Ingestion] Failed for keyword "${keyword}":`, (err as Error).message);
      }
    }
    return total;
  }
}
