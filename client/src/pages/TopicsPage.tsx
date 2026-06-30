import { useEffect, useState } from 'react';
import { topicApi, articleApi } from '../services/api';
import TopicForm from '../components/topics/TopicForm';
import ArticleList from '../components/articles/ArticleList';
import Loading from '../components/common/Loading';
import type { Topic, Article } from '../types';
import toast from 'react-hot-toast';

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [topicArticles, setTopicArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const res = await topicApi.getAll();
      setTopics(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTopics(); }, []);

  const handleCreate = async (name: string, keywords: string[]) => {
    try {
      await topicApi.create(name, keywords);
      toast.success('Đã tạo chủ đề');
      setShowForm(false);
      loadTopics();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleUpdate = async (name: string, keywords: string[]) => {
    if (!editingTopic) return;
    try {
      await topicApi.update(editingTopic.id, name, keywords);
      toast.success('Đã cập nhật chủ đề');
      setEditingTopic(null);
      loadTopics();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDelete = async (topic: Topic) => {
    if (!confirm(`Xóa chủ đề "${topic.name}"?`)) return;
    try {
      await topicApi.delete(topic.id);
      toast.success('Đã xóa chủ đề');
      if (selectedTopic?.id === topic.id) setSelectedTopic(null);
      loadTopics();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const handleSelectTopic = async (topic: Topic) => {
    setSelectedTopic(topic);
    setArticlesLoading(true);
    try {
      const res = await articleApi.searchByKeywords(topic.keywords);
      setTopicArticles(res.data.data);
    } catch {
      toast.error('Không thể tải bài báo');
    } finally {
      setArticlesLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chủ đề của tôi</h1>
          <p className="text-gray-500 mt-1">Quản lý các chủ đề và từ khóa quan tâm</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingTopic(null); }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Thêm chủ đề
        </button>
      </div>

      {(showForm || editingTopic) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {editingTopic ? `Chỉnh sửa: ${editingTopic.name}` : 'Tạo chủ đề mới'}
          </h2>
          <TopicForm
            onSubmit={editingTopic ? handleUpdate : handleCreate}
            initialName={editingTopic?.name}
            initialKeywords={editingTopic?.keywords}
            submitLabel={editingTopic ? 'Cập nhật' : 'Tạo chủ đề'}
          />
          <button
            onClick={() => { setShowForm(false); setEditingTopic(null); }}
            className="mt-3 text-sm text-gray-500 hover:text-gray-700"
          >
            Hủy
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {topics.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🏷️</p>
              <p>Chưa có chủ đề nào</p>
            </div>
          ) : (
            topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => handleSelectTopic(topic)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                  selectedTopic?.id === topic.id
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{topic.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingTopic(topic); setShowForm(false); }}
                      className="text-xs text-gray-400 hover:text-blue-600"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(topic); }}
                      className="text-xs text-gray-400 hover:text-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {topic.keywords.map((kw) => (
                    <span key={kw} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedTopic ? (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Bài báo liên quan: {selectedTopic.name}
              </h2>
              {articlesLoading ? <Loading /> : <ArticleList articles={topicArticles} />}
            </>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-2">👆</p>
              <p>Chọn một chủ đề để xem bài báo liên quan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
