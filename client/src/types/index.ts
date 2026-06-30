export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Topic {
  id: string;
  user_id: string;
  name: string;
  keywords: string[];
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  arxiv_id: string;
  title: string;
  authors: string[];
  abstract: string;
  published_at: string;
  updated_at: string;
  pdf_url: string;
  source_url: string;
  topic_tags: string[];
  created_at: string;
  summaries?: Summary[];
}

export interface Summary {
  id: string;
  article_id: string;
  content: string;
  model_used: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
  article?: Article;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message?: string;
}

export interface ArticleFilters {
  keyword?: string;
  author?: string;
  topic?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}
