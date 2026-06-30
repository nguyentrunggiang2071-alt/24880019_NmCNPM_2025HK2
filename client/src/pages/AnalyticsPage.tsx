import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { analyticsApi } from '../services/api';
import Loading from '../components/common/Loading';
import { getCategoryLabel } from '../utils/categoryLabels';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];

export default function AnalyticsPage() {
  const [topTags, setTopTags] = useState<{ tag: string; count: number }[]>([]);
  const [monthly, setMonthly] = useState<{ month: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getTopTags(),
      analyticsApi.getMonthly(),
    ]).then(([tagsRes, monthlyRes]) => {
      setTopTags(
        tagsRes.data.data.slice(0, 8).map((item) => ({
          ...item,
          tag: getCategoryLabel(item.tag),
        }))
      );
      setMonthly(monthlyRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const totalArticles = monthly.reduce((s, m) => s + m.count, 0);
  const topTag = topTags[0]?.tag || '—';
  const latestMonth = monthly[monthly.length - 1];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Thống kê xu hướng</h1>
        <p className="text-gray-500 mt-1">Phân tích bài báo theo chủ đề và thời gian</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Tổng bài báo</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{totalArticles}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Chủ đề phổ biến nhất</p>
          <p className="text-xl font-bold text-green-600 mt-1 truncate">{topTag}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Bài báo tháng này</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">{latestMonth?.count || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Số bài theo tháng */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Số bài báo theo tháng</h2>
          {monthly.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Số bài" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top tags - Pie chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Phân bổ chủ đề</h2>
          {topTags.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={topTags} dataKey="count" nameKey="tag" cx="50%" cy="50%" outerRadius={90} label={(props) => String(props.name ?? '').slice(0, 12)}>
                  {topTags.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top tags - Bar chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top chủ đề nghiên cứu</h2>
          {topTags.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topTags} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="tag" type="category" width={130} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Số bài" radius={[0, 4, 4, 0]}>
                  {topTags.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
