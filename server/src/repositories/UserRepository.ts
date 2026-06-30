import { supabase } from '../config/supabase';
import { User } from '../types';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async update(
    id: string,
    updates: Partial<Pick<User, 'full_name' | 'avatar_url'>>
  ): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async upsert(user: Partial<User> & { id: string }): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(user)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
