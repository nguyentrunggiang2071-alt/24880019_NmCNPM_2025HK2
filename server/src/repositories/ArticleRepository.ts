import { supabase } from '../config/supabase';
import { Article, ArticleFilters, PaginationParams, PaginatedResponse } from '../types';

export class ArticleRepository {
  async findAll(
    params: PaginationParams,
    filters: ArticleFilters
  ): Promise<PaginatedResponse<Article>> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    // Author filter: TEXT[] cannot use ilike directly — filter in JS
    if (filters.author) {
      return this.findAllFilteredByAuthor(params, filters);
    }

    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false });

    if (filters.keyword) {
      query = query.or(
        `title.ilike.%${filters.keyword}%,abstract.ilike.%${filters.keyword}%`
      );
    }

    if (filters.topic) {
      query = query.contains('topic_tags', [filters.topic]);
    }

    if (filters.date_from) {
      query = query.gte('published_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('published_at', filters.date_to);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  private async findAllFilteredByAuthor(
    params: PaginationParams,
    filters: ArticleFilters
  ): Promise<PaginatedResponse<Article>> {
    const { page, limit } = params;
    const authorLower = filters.author!.toLowerCase();

    let query = supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });

    if (filters.date_from) query = query.gte('published_at', filters.date_from);
    if (filters.date_to) query = query.lte('published_at', filters.date_to);
    if (filters.topic) query = query.contains('topic_tags', [filters.topic]);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const filtered = (data || []).filter((a) =>
      a.authors.some((name: string) => name.toLowerCase().includes(authorLower))
    );

    const total = filtered.length;
    const start = (page - 1) * limit;
    return {
      data: filtered.slice(start, start + limit),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from('articles')
      .select('*, summaries(*)')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async findByArxivId(arxivId: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('arxiv_id', arxivId)
      .single();

    if (error) return null;
    return data;
  }

  async create(article: Omit<Article, 'id' | 'created_at'>): Promise<Article> {
    const { data, error } = await supabase
      .from('articles')
      .insert(article)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findRelated(articleId: string, tags: string[], limit = 5): Promise<Article[]> {
    if (!tags.length) return [];
    const conditions = tags.map((t) => `topic_tags.cs.{${t}}`).join(',');
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .neq('id', articleId)
      .or(conditions)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findSimilarTitle(title: string): Promise<Article | null> {
    const fragment = title.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 50);
    const { data } = await supabase
      .from('articles')
      .select('*')
      .ilike('title', `%${fragment}%`)
      .limit(1)
      .maybeSingle();
    return data || null;
  }

  async findByTopicKeywords(keywords: string[]): Promise<Article[]> {
    const conditions = keywords
      .map((kw) => `title.ilike.%${kw}%,abstract.ilike.%${kw}%`)
      .join(',');

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .or(conditions)
      .order('published_at', { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);
    return data || [];
  }
}
