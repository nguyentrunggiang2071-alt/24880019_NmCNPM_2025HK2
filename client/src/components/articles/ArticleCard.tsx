import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { Article } from '../../types';
import { getCategoryLabel } from '../../utils/categoryLabels';
import { calcScore } from '../../utils/scoring';

interface ArticleCardProps {
  article: Article;
  isFavorited?: boolean;
  onToggleFavorite?: (articleId: string) => void;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 6 ? 'bg-green-50 text-green-700 border-green-200'
    : score >= 3 ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
    : 'bg-gray-50 text-gray-500 border-gray-200';
  return (
    <span
      className={`inline-flex items-center gap-0.5 border rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}
      title="Điểm đáng đọc (dựa trên độ mới và số tác giả)"
    >
      ★ {score.toFixed(1)}
    </span>
  );
}

export default function ArticleCard({ article, isFavorited, onToggleFavorite }: ArticleCardProps) {
  const publishDate = new Date(article.published_at);
  const score = calcScore(article);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/articles/${article.id}`} className="flex-1 group">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>
        </Link>

        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(article.id)}
            className={`shrink-0 text-xl transition-transform hover:scale-110 ${
              isFavorited ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
            }`}
            title={isFavorited ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
          >
            ★
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-1.5">
        {article.authors.slice(0, 3).join(', ')}
        {article.authors.length > 3 && ' et al.'}
      </p>

      <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
        {article.abstract}
      </p>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-1.5">
          {article.topic_tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium"
              title={tag}
            >
              {getCategoryLabel(tag)}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ScoreBadge score={score} />
          <span className="text-xs text-gray-400">{format(publishDate, 'dd/MM/yyyy')}</span>
          <a
            href={article.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-red-500 hover:text-red-600 font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            PDF
          </a>
        </div>
      </div>
    </div>
  );
}
