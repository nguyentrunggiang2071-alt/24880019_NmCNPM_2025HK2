import type { Article } from '../types';

const HOT_KEYWORDS = [
  'large language model', 'llm', 'gpt', 'transformer', 'diffusion',
  'generative', 'multimodal', 'rlhf', 'fine-tuning', 'retrieval augmented',
  'neural network', 'deep learning', 'computer vision', 'nlp',
];

export function calcScore(article: Article): number {
  const ageInDays = (Date.now() - new Date(article.published_at).getTime()) / 86400000;

  const recencyScore = Math.max(0, 5 - ageInDays / 73);

  const text = `${article.title} ${article.abstract}`.toLowerCase();
  const keywordScore = Math.min(3, HOT_KEYWORDS.filter((kw) => text.includes(kw)).length * 0.5);

  const authorScore = Math.min(2, article.authors.length * 0.4);

  return Math.round(Math.min(10, recencyScore + keywordScore + authorScore) * 10) / 10;
}
