import axios from 'axios';
import { supabase } from './supabase';
import type { Article, Topic, Favorite, PaginatedResponse, ArticleFilters } from '../types';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const articleApi = {
  getAll: (filters: ArticleFilters) =>
    api.get<{ data: PaginatedResponse<Article> }>('/articles', {
      params: filters,
    }),

  getById: (id: string) =>
    api.get<{ data: Article }>(`/articles/${id}`),

  getSummary: (id: string) =>
    api.get<{ data: { summary: string } }>(`/articles/${id}/summary`),

  searchByKeywords: (keywords: string[]) =>
    api.get<{ data: Article[] }>('/articles/search', {
      params: { keywords: keywords.join(',') },
    }),

  triggerIngest: (keywords?: string[]) =>
    api.post<{ data: { ingested: number } }>('/articles/ingest', { keywords }),

  getRelated: (id: string) =>
    api.get<{ data: (import('../types').Article & { score: number })[] }>(`/articles/${id}/related`),
};

export const topicApi = {
  getAll: () => api.get<{ data: Topic[] }>('/topics'),

  create: (name: string, keywords: string[]) =>
    api.post<{ data: Topic }>('/topics', { name, keywords }),

  update: (id: string, name?: string, keywords?: string[]) =>
    api.put<{ data: Topic }>(`/topics/${id}`, { name, keywords }),

  delete: (id: string) => api.delete(`/topics/${id}`),
};

export const favoriteApi = {
  getAll: () => api.get<{ data: Favorite[] }>('/favorites'),

  add: (articleId: string) =>
    api.post<{ data: Favorite }>('/favorites', { article_id: articleId }),

  remove: (articleId: string) => api.delete(`/favorites/${articleId}`),

  check: (articleId: string) =>
    api.get<{ data: { is_favorited: boolean } }>(`/favorites/${articleId}/check`),
};

export const notificationApi = {
  getAll: () => api.get<{ data: Notification[] }>('/notifications'),
  getUnreadCount: () => api.get<{ data: { count: number } }>('/notifications/unread-count'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
};

export const analyticsApi = {
  getTopTags: () => api.get<{ data: { tag: string; count: number }[] }>('/analytics/top-tags'),
  getTrends: () => api.get<{ data: { month: string; tag: string; count: number }[] }>('/analytics/trends'),
  getMonthly: () => api.get<{ data: { month: string; count: number }[] }>('/analytics/monthly'),
};

export interface Notification {
  id: string;
  user_id: string;
  article_id: string;
  topic_id?: string;
  message: string;
  is_read: boolean;
  created_at: string;
  article?: { id: string; title: string; arxiv_id: string };
}

export const authApi = {
  getProfile: () => api.get<{ data: { id: string; full_name?: string; avatar_url?: string } }>('/auth/profile'),

  updateProfile: (data: { full_name?: string; avatar_url?: string }) =>
    api.put('/auth/profile', data),
};
