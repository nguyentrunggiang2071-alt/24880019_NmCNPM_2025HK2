import { supabase } from '../config/supabase';

export interface TrendDataPoint {
  month: string;
  tag: string;
  count: number;
}

export interface TagCount {
  tag: string;
  count: number;
}

export class AnalyticsService {
  async getTopTags(limit = 10): Promise<TagCount[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('topic_tags');

    if (error) throw new Error(error.message);

    const tagMap = new Map<string, number>();
    for (const row of data || []) {
      for (const tag of row.topic_tags || []) {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      }
    }

    return Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getTrendsByMonth(months = 6): Promise<TrendDataPoint[]> {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const { data, error } = await supabase
      .from('articles')
      .select('topic_tags, published_at')
      .gte('published_at', since.toISOString())
      .order('published_at', { ascending: true });

    if (error) throw new Error(error.message);

    const map = new Map<string, number>();
    for (const row of data || []) {
      const month = row.published_at.slice(0, 7); // YYYY-MM
      for (const tag of (row.topic_tags || []).slice(0, 3)) {
        const key = `${month}__${tag}`;
        map.set(key, (map.get(key) || 0) + 1);
      }
    }

    return Array.from(map.entries()).map(([key, count]) => {
      const [month, tag] = key.split('__');
      return { month, tag, count };
    });
  }

  async getArticleCountByMonth(): Promise<{ month: string; count: number }[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('published_at')
      .order('published_at', { ascending: true });

    if (error) throw new Error(error.message);

    const map = new Map<string, number>();
    for (const row of data || []) {
      const month = row.published_at.slice(0, 7);
      map.set(month, (map.get(month) || 0) + 1);
    }

    return Array.from(map.entries())
      .map(([month, count]) => ({ month, count }))
      .slice(-12);
  }
}
