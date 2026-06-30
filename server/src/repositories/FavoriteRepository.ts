import { supabase } from '../config/supabase';
import { Favorite } from '../types';

export class FavoriteRepository {
  async findByUserId(userId: string): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('*, article:articles(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findOne(userId: string, articleId: string): Promise<Favorite | null> {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .single();

    if (error) return null;
    return data;
  }

  async create(userId: string, articleId: string): Promise<Favorite> {
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, article_id: articleId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(userId: string, articleId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('article_id', articleId);

    if (error) throw new Error(error.message);
  }
}
