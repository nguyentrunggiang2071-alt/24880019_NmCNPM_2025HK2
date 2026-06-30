import { useEffect, useState } from 'react';
import { favoriteApi } from '../services/api';
import ArticleList from '../components/articles/ArticleList';
import Loading from '../components/common/Loading';
import type { Favorite } from '../types';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteApi.getAll();
      setFavorites(res.data.data);
      setFavoritedIds(new Set(res.data.data.map((f) => f.article_id)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFavorites(); }, []);

  const handleRemove = async (articleId: string) => {
    try {
      await favoriteApi.remove(articleId);
      setFavorites((prev) => prev.filter((f) => f.article_id !== articleId));
      setFavoritedIds((prev) => { const s = new Set(prev); s.delete(articleId); return s; });
      toast.success('Đã bỏ yêu thích');
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bài báo yêu thích</h1>
        <p className="text-gray-500 mt-1">{favorites.length} bài báo đã lưu</p>
      </div>

      <ArticleList
        articles={favorites.map((f) => f.article!).filter(Boolean)}
        favoritedIds={favoritedIds}
        onToggleFavorite={handleRemove}
      />
    </div>
  );
}
