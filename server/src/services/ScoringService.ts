import { Article } from '../types';

const HOT_KEYWORDS = [
  'large language model', 'llm', 'gpt', 'transformer', 'diffusion',
  'generative', 'multimodal', 'rlhf', 'fine-tuning', 'retrieval augmented',
  'neural network', 'deep learning', 'computer vision', 'nlp',
];

export class ScoringService {
  scoreArticle(article: Article): number {
    const now = Date.now();
    const published = new Date(article.published_at).getTime();
    const ageInDays = (now - published) / (1000 * 60 * 60 * 24);

    // Recency score (0–5): bài mới nhất được 5, >365 ngày được 0
    const recencyScore = Math.max(0, 5 - (ageInDays / 73));

    // Keyword hot score (0–3): mỗi keyword hot khớp +0.5
    const text = `${article.title} ${article.abstract}`.toLowerCase();
    const keywordScore = Math.min(
      3,
      HOT_KEYWORDS.filter((kw) => text.includes(kw)).length * 0.5
    );

    // Author score (0–2): nhiều tác giả = hợp tác rộng
    const authorScore = Math.min(2, article.authors.length * 0.4);

    const total = recencyScore + keywordScore + authorScore;
    return Math.round(Math.min(10, total) * 10) / 10;
  }

  scoreArticles(articles: Article[]): (Article & { score: number })[] {
    return articles
      .map((a) => ({ ...a, score: this.scoreArticle(a) }))
      .sort((a, b) => b.score - a.score);
  }
}
