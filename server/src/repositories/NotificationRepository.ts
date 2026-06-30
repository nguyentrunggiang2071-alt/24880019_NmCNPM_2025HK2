import { supabase } from '../config/supabase';

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

export class NotificationRepository {
  async findByUserId(userId: string, limit = 20): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, article:articles(id, title, arxiv_id)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      // Table not yet created — migration 002 pending
      if (error.code === '42P01' || error.message.includes('does not exist')) return [];
      throw new Error(error.message);
    }
    return data || [];
  }

  async countUnread(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) return 0;
      throw new Error(error.message);
    }
    return count || 0;
  }

  async create(notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<void> {
    const { error } = await supabase.from('notifications').insert({
      ...notification,
      is_read: false,
    });
    if (error && error.code !== '42P01') throw new Error(error.message);
  }

  async markAllRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    if (error && error.code !== '42P01') throw new Error(error.message);
  }

  async markRead(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId);
    if (error && error.code !== '42P01') throw new Error(error.message);
  }

  async existsForUserAndArticle(userId: string, articleId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('article_id', articleId);
    if (error) return false;
    return (count || 0) > 0;
  }
}
