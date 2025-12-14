import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/users/me');
      setUser(response.data);
      setFullName(response.data.fullName || '');
      setBio(response.data.bio || '');
    } catch (error) {
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.patch('/users/me', { fullName, bio });
      toast.success('Профиль обновлён!');
      setEditing(false);
      fetchProfile();
    } catch (error) {
    }
  };

  if (!user) return <p>Загрузка...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&size=100`}
            alt={user.username}
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.username}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Статистика */}
        <div className="flex gap-6 mb-6 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-bold">{user._count.posts}</span> постов
          </div>
          <div>
            <span className="font-bold">{user._count.followers}</span> подписчиков
          </div>
          <div>
            <span className="font-bold">{user._count.following}</span> подписок
          </div>
        </div>

        {/* Редактирование профиля */}
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Полное имя
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                О себе
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Сохранить
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {user.fullName || 'Имя не указано'}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {user.bio || 'О себе не указано'}
            </p>
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Редактировать профиль
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
