import { TopicRepository } from '../repositories/TopicRepository';
import { Topic } from '../types';

export class TopicService {
  private topicRepository: TopicRepository;

  constructor() {
    this.topicRepository = new TopicRepository();
  }

  async getUserTopics(userId: string): Promise<Topic[]> {
    return this.topicRepository.findByUserId(userId);
  }

  async createTopic(
    userId: string,
    name: string,
    keywords: string[]
  ): Promise<Topic> {
    if (!name.trim()) throw new Error('Topic name is required');
    if (!keywords.length) throw new Error('At least one keyword is required');

    return this.topicRepository.create({
      user_id: userId,
      name: name.trim(),
      keywords: keywords.map((k) => k.trim().toLowerCase()),
    });
  }

  async updateTopic(
    id: string,
    userId: string,
    name?: string,
    keywords?: string[]
  ): Promise<Topic> {
    const existing = await this.topicRepository.findById(id, userId);
    if (!existing) throw new Error('Topic not found');

    const updates: Partial<Pick<Topic, 'name' | 'keywords'>> = {};
    if (name !== undefined) updates.name = name.trim();
    if (keywords !== undefined) updates.keywords = keywords.map((k) => k.trim().toLowerCase());

    return this.topicRepository.update(id, userId, updates);
  }

  async deleteTopic(id: string, userId: string): Promise<void> {
    const existing = await this.topicRepository.findById(id, userId);
    if (!existing) throw new Error('Topic not found');

    return this.topicRepository.delete(id, userId);
  }
}
