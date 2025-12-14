import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white dark:bg-gray-800 pink:bg-black shadow-md border-b dark:border-gray-700 pink:border-pink-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="text-xl font-bold text-gray-900 dark:text-white pink:text-pink-400 hover:text-blue-600 dark:hover:text-blue-400 pink:hover:text-pink-300 transition"
          >
            Блог
          </Link>

          <div className="flex items-center gap-4">
            <ThemeSwitcher />

            {isAuthenticated ? (
              <>
                <Link
                  to="/create-post"
                  className="px-4 py-2 bg-blue-600 pink:bg-[#FFF3E6] text-white pink:text-black rounded-lg hover:bg-blue-700 pink:hover:bg-[#FFE8CC] transition"
                >
                  Создать пост
                </Link>
                <Link
                  to="/favorites"
                  className="text-gray-700 dark:text-gray-300 pink:text-pink-300 hover:text-blue-600 dark:hover:text-blue-400 pink:hover:text-pink-400 transition"
                >
                  Избранное
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 dark:text-gray-300 pink:text-pink-300 hover:text-blue-600 dark:hover:text-blue-400 pink:hover:text-pink-400 transition"
                >
                  {user?.username}
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 pink:text-pink-300 hover:text-red-600 dark:hover:text-red-400 pink:hover:text-red-400 transition"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 pink:text-pink-300 hover:text-blue-600 dark:hover:text-blue-400 pink:hover:text-pink-400 transition"
                >
                  Вход
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 pink:bg-[#FFF3E6] text-white pink:text-black rounded-lg hover:bg-blue-700 pink:hover:bg-[#FFE8CC] transition"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}