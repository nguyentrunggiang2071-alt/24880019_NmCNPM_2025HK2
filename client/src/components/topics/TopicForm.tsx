import { useState, FormEvent, KeyboardEvent } from 'react';
import toast from 'react-hot-toast';

interface TopicFormProps {
  onSubmit: (name: string, keywords: string[]) => Promise<void>;
  initialName?: string;
  initialKeywords?: string[];
  submitLabel?: string;
}

export default function TopicForm({
  onSubmit,
  initialName = '',
  initialKeywords = [],
  submitLabel = 'Tạo chủ đề',
}: TopicFormProps) {
  const [name, setName] = useState(initialName);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [loading, setLoading] = useState(false);

  const addKeyword = () => {
    const kw = keywordInput.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      setKeywordInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Nhập tên chủ đề');
    if (!keywords.length) return toast.error('Thêm ít nhất 1 từ khóa');

    setLoading(true);
    try {
      await onSubmit(name, keywords);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ đề</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="VD: Machine Learning, AI in Healthcare..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Từ khóa <span className="text-gray-400 font-normal">(Enter hoặc dấu phẩy để thêm)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="VD: neural network..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addKeyword}
            className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            Thêm
          </button>
        </div>

        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                {kw}
                <button
                  type="button"
                  onClick={() => setKeywords(keywords.filter((k) => k !== kw))}
                  className="text-blue-400 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Đang lưu...' : submitLabel}
      </button>
    </form>
  );
}
