import ArticleCard from './ArticleCard';
import type { Article } from '../../types';

interface ArticleListProps {
  articles: Article[];
  favoritedIds?: Set<string>;
  onToggleFavorite?: (articleId: string) => void;
}

export default function ArticleList({ articles, favoritedIds, onToggleFavorite }: ArticleListProps) {
  if (!articles.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📄</p>
        <p>Không có bài báo nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          isFavorited={favoritedIds?.has(article.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
