import { supabase } from '../config/supabase';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../types';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async verifyToken(token: string): Promise<{ userId: string; email: string }> {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) throw new Error('Invalid or expired token');

    return { userId: data.user.id, email: data.user.email || '' };
  }

  async getUserProfile(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  async updateProfile(
    userId: string,
    updates: Partial<Pick<User, 'full_name' | 'avatar_url'>>
  ): Promise<User> {
    return this.userRepository.update(userId, updates);
  }
}
