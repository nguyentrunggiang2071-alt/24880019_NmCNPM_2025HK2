import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { articleApi, favoriteApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getCategoryLabel } from '../utils/categoryLabels';
import { calcScore } from '../utils/scoring';
import Loading from '../components/common/Loading';
import ArticleCard from '../components/articles/ArticleCard';
import type { Article } from '../types';
import toast from 'react-hot-toast';

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<(Article & { score: number })[]>([]);

  useEffect(() => {
    if (!id) return;
    articleApi.getById(id).then((res) => {
      setArticle(res.data.data);
      setLoading(false);
    });
    articleApi.getRelated(id).then((res) => setRelated(res.data.data)).catch(() => {});

    if (user) {
      favoriteApi.check(id).then((res) => {
        setIsFavorited(res.data.data.is_favorited);
      });
    }
  }, [id, user]);

  const handleGetSummary = async () => {
    if (!id || !user) return toast.error('Đăng nhập để sử dụng tóm tắt AI');
    setSummaryLoading(true);
    try {
      const res = await articleApi.getSummary(id);
      setSummary(res.data.data.summary);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      const msg = axiosErr?.response?.data?.error || axiosErr?.message || 'Không thể tạo tóm tắt';
      console.error('[Summary error]', msg);
      toast.error(msg);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!id || !user) return toast.error('Đăng nhập để lưu yêu thích');
    try {
      if (isFavorited) {
        await favoriteApi.remove(id);
        setIsFavorited(false);
        toast.success('Đã bỏ yêu thích');
      } else {
        await favoriteApi.add(id);
        setIsFavorited(true);
        toast.success('Đã thêm vào yêu thích');
      }
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  if (loading) return <Loading />;
  if (!article) return <div className="text-center py-16 text-gray-500">Không tìm thấy bài báo</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-blue-600 hover:underline text-sm mb-6 inline-block">
        ← Quay lại
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 leading-snug">{article.title}</h1>
          <button
            onClick={handleToggleFavorite}
            className={`text-3xl shrink-0 transition-transform hover:scale-110 ${
              isFavorited ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            ★
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {article.topic_tags.map((tag) => (
            <span key={tag} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium" title={tag}>
              {getCategoryLabel(tag)}
            </span>
          ))}
        </div>

        <div className="text-sm text-gray-500 mb-6 space-y-1">
          <p><span className="font-medium">Tác giả:</span> {article.authors.join(', ')}</p>
          <p><span className="font-medium">Ngày công bố:</span> {format(new Date(article.published_at), 'dd/MM/yyyy')}</p>
          <p>
            <span className="font-medium">Điểm đáng đọc:</span>{' '}
            <ScoreBadge score={calcScore(article)} />
          </p>
          <p>
            <span className="font-medium">ArXiv ID:</span>{' '}
            <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {article.arxiv_id}
            </a>
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Abstract</h2>
          <p className="text-gray-600 leading-relaxed">{article.abstract}</p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-blue-800">Tóm tắt bằng AI (Gemini)</h2>
            {!summary && (
              <button
                onClick={handleGetSummary}
                disabled={summaryLoading}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {summaryLoading ? 'Đang tóm tắt...' : 'Tạo tóm tắt'}
              </button>
            )}
          </div>
          {summary ? (
            <p className="text-blue-900 leading-relaxed">{summary}</p>
          ) : (
            <p className="text-blue-600 text-sm italic">
              {user ? 'Nhấn "Tạo tóm tắt" để AI tóm tắt bài báo này.' : 'Đăng nhập để sử dụng tính năng tóm tắt AI.'}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <a
            href={article.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Tải PDF
          </a>
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Xem trên arXiv
          </a>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bài báo liên quan</h2>
          <div className="space-y-3">
            {related.map((r) => (
              <div key={r.id} className="relative">
                <span className="absolute top-3 right-3 z-10 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  ★ {r.score.toFixed(1)}
                </span>
                <ArticleCard article={r} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 7 ? 'text-green-600' : score >= 4 ? 'text-yellow-600' : 'text-gray-500';
  const stars = Math.round(score / 2);
  return (
    <span className={`font-semibold ${color}`}>
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)} {score.toFixed(1)}/10
    </span>
  );
}
