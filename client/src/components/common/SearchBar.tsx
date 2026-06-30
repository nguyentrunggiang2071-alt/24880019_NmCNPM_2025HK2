import { FormEvent } from 'react';

export type SearchType = 'keyword' | 'author';

interface SearchBarProps {
  value: string;
  searchType: SearchType;
  onChange: (value: string) => void;
  onSearchTypeChange: (type: SearchType) => void;
  onSearch: (value: string, type: SearchType) => void;
  placeholder?: string;
}

const PLACEHOLDERS: Record<SearchType, string> = {
  keyword: 'Tìm theo tiêu đề hoặc nội dung...',
  author: 'Tìm theo tên tác giả...',
};

export default function SearchBar({
  value,
  searchType,
  onChange,
  onSearchTypeChange,
  onSearch,
  placeholder,
}: SearchBarProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(value.trim(), searchType);
  };

  const handleClear = () => {
    onChange('');
    onSearch('', searchType);
  };

  const handleTypeChange = (type: SearchType) => {
    onSearchTypeChange(type);
    if (value.trim()) {
      onSearch(value.trim(), type);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl">
      <select
        value={searchType}
        onChange={(e) => handleTypeChange(e.target.value as SearchType)}
        className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0 cursor-pointer"
      >
        <option value="keyword">Từ khóa</option>
        <option value="author">Tác giả</option>
      </select>

      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? PLACEHOLDERS[searchType]}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
      >
        Tìm kiếm
      </button>
    </form>
  );
}
