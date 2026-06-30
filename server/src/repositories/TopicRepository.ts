import { supabase } from '../config/supabase';
import { Topic } from '../types';

export class TopicRepository {
  async findAll(): Promise<Topic[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*');
    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByUserId(userId: string): Promise<Topic[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findById(id: string, userId: string): Promise<Topic | null> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  async create(topic: Omit<Topic, 'id' | 'created_at' | 'updated_at'>): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .insert(topic)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(
    id: string,
    userId: string,
    updates: Partial<Pick<Topic, 'name' | 'keywords'>>
  ): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }
}
