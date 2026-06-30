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

export interface UserTopic {
  user_id: string;
  topic_id: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ArticleFilters {
  keyword?: string;
  author?: string;
  topic?: string;
  date_from?: string;
  date_to?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}
