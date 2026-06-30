import { useState, useCallback } from 'react';
import { articleApi } from '../services/api';
import type { Article, PaginatedResponse, ArticleFilters } from '../types';

export function useArticles() {
  const [articles, setArticles] = useState<PaginatedResponse<Article> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async (filters: ArticleFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await articleApi.getAll(filters);
      setArticles(res.data.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { articles, loading, error, fetchArticles };
}
