import { supabase } from '../config/supabase';
import { Summary } from '../types';

export class SummaryRepository {
  async findByArticleId(articleId: string): Promise<Summary | null> {
    const { data, error } = await supabase
      .from('summaries')
      .select('*')
      .eq('article_id', articleId)
      .single();

    if (error) return null;
    return data;
  }

  async create(summary: Omit<Summary, 'id' | 'created_at'>): Promise<Summary> {
    const { data, error } = await supabase
      .from('summaries')
      .insert(summary)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async upsert(summary: Omit<Summary, 'id' | 'created_at'>): Promise<Summary> {
    const { data, error } = await supabase
      .from('summaries')
      .upsert(summary, { onConflict: 'article_id' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
