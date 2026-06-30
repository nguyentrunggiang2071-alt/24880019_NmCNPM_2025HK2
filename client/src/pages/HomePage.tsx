import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useArticles } from '../hooks/useArticles';
import { favoriteApi, topicApi, articleApi } from '../services/api';
import ArticleList from '../components/articles/ArticleList';
import SearchBar, { type SearchType } from '../components/common/SearchBar';
import Loading from '../components/common/Loading';
import TopicTag from '../components/topics/TopicTag';
import type { Topic, ArticleFilters } from '../types';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { user } = useAuth();
  const { articles, loading, error, fetchArticles } = useArticles();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<ArticleFilters>({ page: 1, limit: 10 });
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('keyword');
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [ingesting, setIngesting] = useState(false);

  useEffect(() => {
    fetchArticles(filters);
  }, [fetchArticles, filters]);

  useEffect(() => {
    if (!user) return;
    topicApi.getAll().then((res) => setTopics(res.data.data));
    favoriteApi.getAll().then((res) => {
      const ids = new Set(res.data.data.map((f) => f.article_id));
      setFavoritedIds(ids);
    });
  }, [user]);

  const handleSearch = useCallback((value: string, type: SearchType) => {
    setActiveTopicId(null);
    setSearchValue(value);
    if (!value) {
      setFilters({ page: 1, limit: 10 });
    } else if (type === 'author') {
      setFilters({ page: 1, limit: 10, author: value });
    } else {
      setFilters({ page: 1, limit: 10, keyword: value });
    }
  }, []);

  const handleTopicFilter = useCallback(
    (topic: Topic) => {
      if (activeTopicId === topic.id) {
        setActiveTopicId(null);
        setSearchValue('');
        setFilters({ page: 1, limit: 10 });
      } else {
        setActiveTopicId(topic.id);
        const kw = topic.keywords[0] || '';
        setSearchValue(kw);
        setSearchType('keyword');
        setFilters({ page: 1, limit: 10, keyword: kw });
      }
    },
    [activeTopicId]
  );

  const handleToggleFavorite = async (articleId: string) => {
    if (!user) return toast.error('Đăng nhập để lưu yêu thích');
    try {
      if (favoritedIds.has(articleId)) {
        await favoriteApi.remove(articleId);
        setFavoritedIds((prev) => { const s = new Set(prev); s.delete(articleId); return s; });
        toast.success('Đã bỏ yêu thích');
      } else {
        await favoriteApi.add(articleId);
        setFavoritedIds((prev) => new Set(prev).add(articleId));
        toast.success('Đã thêm vào yêu thích');
      }
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const handleIngest = useCallback(async () => {
    setIngesting(true);
    const toastId = toast.loading('Đang thu thập bài báo từ arXiv...');
    try {
      await articleApi.triggerIngest();
      toast.success('Thu thập xong! Đang tải bài báo...', { id: toastId });
      fetchArticles(filters);
    } catch {
      toast.error('Thu thập thất bại', { id: toastId });
    } finally {
      setIngesting(false);
    }
  }, [filters, fetchArticles]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchValue('');
    setActiveTopicId(null);
    setFilters({ page: 1, limit: 10 });
  };

  const activeFilter = filters.keyword
    ? { label: 'Từ khóa', value: filters.keyword }
    : filters.author
    ? { label: 'Tác giả', value: filters.author }
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bài báo khoa học mới nhất</h1>
        <p className="text-gray-500">Tự động tổng hợp từ arXiv và tóm tắt bằng AI</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchBar
          value={searchValue}
          searchType={searchType}
          onChange={setSearchValue}
          onSearchTypeChange={setSearchType}
          onSearch={handleSearch}
        />
        <button
          onClick={handleIngest}
          disabled={ingesting || loading}
          className="shrink-0 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {ingesting ? 'Đang thu thập...' : 'Làm mới từ arXiv'}
        </button>
      </div>

      {activeFilter && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <span>{activeFilter.label}:</span>
          <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
            {activeFilter.value}
          </span>
          <button
            onClick={clearFilters}
            className="text-gray-400 hover:text-gray-600 text-xs underline"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {user && topics.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2 font-medium">Lọc theo chủ đề của bạn:</p>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <TopicTag
                key={topic.id}
                name={topic.name}
                active={activeTopicId === topic.id}
                onClick={() => handleTopicFilter(topic)}
              />
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <Loading text={ingesting ? 'Đang thu thập bài báo từ arXiv, vui lòng chờ...' : 'Đang tải...'} />
      ) : (
        <>
          {articles?.data.length === 0 && activeFilter && (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg mb-2">
                Không tìm thấy bài báo nào với {activeFilter.label.toLowerCase()} "{activeFilter.value}"
              </p>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:underline text-sm"
              >
                Xem tất cả bài báo
              </button>
            </div>
          )}

          <ArticleList
            articles={articles?.data || []}
            favoritedIds={user ? favoritedIds : undefined}
            onToggleFavorite={user ? handleToggleFavorite : undefined}
          />

          {articles && articles.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: articles.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === filters.page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
