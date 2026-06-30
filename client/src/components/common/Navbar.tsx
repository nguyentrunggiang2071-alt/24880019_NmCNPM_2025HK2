import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
      toast.success('Đã đăng xuất');
    } catch {
      toast.error('Đăng xuất thất bại');
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">PaperAI</span>
            <span className="hidden sm:inline text-sm text-gray-500">Research Aggregator</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                  Trang chủ
                </Link>
                <Link to="/analytics" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                  Xu hướng
                </Link>
                <Link to="/topics" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                  Chủ đề
                </Link>
                <Link to="/favorites" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                  Yêu thích
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                  Hồ sơ
                </Link>
                <NotificationBell />
                <button
                  onClick={handleSignOut}
                  className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 text-sm font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
