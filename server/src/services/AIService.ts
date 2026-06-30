import { geminiGenerateContent, GEMINI_MODEL } from '../config/gemini';
import { SummaryRepository } from '../repositories/SummaryRepository';
import { Summary } from '../types';

export class AIService {
  private summaryRepository: SummaryRepository;

  constructor() {
    this.summaryRepository = new SummaryRepository();
  }

  async summarizeArticle(articleId: string, abstract: string, title: string): Promise<Summary> {
    const existing = await this.summaryRepository.findByArticleId(articleId);
    if (existing) return existing;

    const prompt = `Hãy tóm tắt bài báo khoa học sau bằng tiếng Việt trong 3-5 câu ngắn gọn, tập trung vào đóng góp chính và phương pháp nghiên cứu.

Tiêu đề: ${title}

Tóm tắt gốc (Abstract): ${abstract}

Hãy viết tóm tắt:`;

    let summaryText: string;
    try {
      summaryText = await geminiGenerateContent(prompt);
    } catch (err) {
      const detail = (err as { response?: { data?: unknown }; message?: string })?.response?.data
        ?? (err as Error).message;
      console.error('[Gemini Error]', detail);
      throw new Error(`Gemini API lỗi: ${JSON.stringify(detail)}`);
    }

    return this.summaryRepository.upsert({
      article_id: articleId,
      content: summaryText,
      model_used: GEMINI_MODEL,
    });
  }

  async generateKeywords(text: string): Promise<string[]> {
    const prompt = `Trích xuất 5-10 từ khóa chính từ đoạn văn sau. Chỉ trả về các từ khóa, phân cách bằng dấu phẩy, không giải thích thêm.\n\nVăn bản: ${text}\n\nTừ khóa:`;
    const result = await geminiGenerateContent(prompt);
    return result.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);
  }
}
