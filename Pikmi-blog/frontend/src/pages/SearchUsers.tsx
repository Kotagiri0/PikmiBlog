import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-toastify';

interface User {
  id: number;
  username: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
  isFollowing?: boolean;
}

export default function SearchUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!search.trim()) {
      toast.error('Введите имя пользователя для поиска');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await axios.get('/users/search', {
        params: { query: search }
      });
      setUsers(response.data);
    } catch (error: any) {
      toast.error('Ошибка при поиске пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: number, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await axios.delete(`/users/${userId}/follow`);
        toast.success('Вы отписались от пользователя');
      } else {
        await axios.post(`/users/${userId}/follow`);
        toast.success('Вы подписались на пользователя');
      }

      // Обновляем состояние
      setUsers(users.map(user =>
        user.id === userId
          ? {
              ...user,
              isFollowing: !isFollowing,
              _count: {
                ...user._count,
                followers: isFollowing ? user._count.followers - 1 : user._count.followers + 1
              }
            }
          : user
      ));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при изменении подписки');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white pink:text-pink-300">
        Поиск пользователей
      </h1>

      {/* Форма поиска */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Введите имя пользователя..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pink:focus:ring-pink-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white pink:bg-gray-900 pink:border-pink-800 pink:text-pink-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 pink:bg-[#FFF3E6] text-white pink:text-black rounded-lg hover:bg-blue-700 pink:hover:bg-[#FFE8CC] disabled:opacity-50 transition"
          >
            {loading ? 'Поиск...' : 'Искать'}
          </button>
        </div>
      </form>

      {/* Результаты поиска */}
      {loading ? (
        <p className="text-center text-gray-600 dark:text-gray-400 pink:text-pink-400">
          Загрузка...
        </p>
      ) : hasSearched && users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 pink:text-pink-400 mb-4">
            Пользователи не найдены
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 pink:text-pink-500">
            Попробуйте изменить запрос
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-800 pink:bg-pink-950 p-6 rounded-lg shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Link to={`/users/${user.id}`}>
                    <img
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&size=80`}
                      alt={user.username}
                      className="w-16 h-16 rounded-full hover:opacity-80 transition"
                    />
                  </Link>

                  <div className="flex-1">
                    <Link to={`/users/${user.id}`}>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white pink:text-pink-300 hover:text-blue-600 dark:hover:text-blue-400 pink:hover:text-pink-400">
                        {user.username}
                      </h3>
                    </Link>

                    {user.fullName && (
                      <p className="text-gray-600 dark:text-gray-400 pink:text-pink-400">
                        {user.fullName}
                      </p>
                    )}

                    {user.bio && (
                      <p className="text-gray-700 dark:text-gray-300 pink:text-pink-300 mt-2 line-clamp-2">
                        {user.bio}
                      </p>
                    )}

                    <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400 pink:text-pink-500">
                      <span>
                        <strong>{user._count.posts}</strong> постов
                      </span>
                      <span>
                        <strong>{user._count.followers}</strong> подписчиков
                      </span>
                      <span>
                        <strong>{user._count.following}</strong> подписок
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleFollow(user.id, user.isFollowing || false)}
                  className={`px-4 py-2 rounded-lg transition ml-4 ${
                    user.isFollowing
                      ? 'bg-gray-200 dark:bg-gray-700 pink:bg-pink-900 text-gray-700 dark:text-gray-300 pink:text-pink-300 hover:bg-gray-300 dark:hover:bg-gray-600 pink:hover:bg-pink-800'
                      : 'bg-blue-600 pink:bg-[#FFF3E6] text-white pink:text-black hover:bg-blue-700 pink:hover:bg-[#FFE8CC]'
                  }`}
                >
                  {user.isFollowing ? 'Отписаться' : 'Подписаться'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}