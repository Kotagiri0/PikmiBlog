import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  _count: {
    likes: number;
    comments: number;
  };
}

interface UserProfile {
  id: number;
  username: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
  isFollowing?: boolean;
}

export default function UserProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');

  const isOwnProfile = currentUser?.id === Number(id);

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/users/${id}`);
      setProfile(response.data);
    } catch (error) {
      toast.error('Не удалось загрузить профиль');
    }
  };

  const fetchUserPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/posts/user/${id}`);
      setPosts(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки постов');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;

    try {
      if (profile.isFollowing) {
        await axios.delete(`/users/${id}/follow`);
        toast.success('Вы отписались от пользователя');
      } else {
        await axios.post(`/users/${id}/follow`);
        toast.success('Вы подписались на пользователя');
      }
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при изменении подписки');
    }
  };

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Шапка профиля */}
      <div className="bg-white dark:bg-gray-800 pink:bg-pink-950 p-8 rounded-lg shadow-md mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-6">
            <img
              src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.username}&size=120`}
              alt={profile.username}
              className="w-24 h-24 rounded-full"
            />

            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white pink:text-pink-300 mb-2">
                {profile.username}
              </h1>
              {profile.fullName && (
                <p className="text-lg text-gray-600 dark:text-gray-400 pink:text-pink-400">
                  {profile.fullName}
                </p>
              )}
            </div>
          </div>

          {!isOwnProfile && (
            <button
              onClick={handleFollow}
              className={`px-6 py-2 rounded-lg transition ${
                profile.isFollowing
                  ? 'bg-gray-200 dark:bg-gray-700 pink:bg-pink-900 text-gray-700 dark:text-gray-300 pink:text-pink-300 hover:bg-gray-300 dark:hover:bg-gray-600 pink:hover:bg-pink-800'
                  : 'bg-blue-600 pink:bg-[#FFF3E6] text-white pink:text-black hover:bg-blue-700 pink:hover:bg-[#FFE8CC]'
              }`}
            >
              {profile.isFollowing ? 'Отписаться' : 'Подписаться'}
            </button>
          )}

          {isOwnProfile && (
            <Link
              to="/profile"
              className="px-6 py-2 bg-blue-600 pink:bg-[#FFF3E6] text-white pink:text-black rounded-lg hover:bg-blue-700 pink:hover:bg-[#FFE8CC] transition"
            >
              Редактировать профиль
            </Link>
          )}
        </div>

        {/* Статистика */}
        <div className="flex gap-8 mb-6 text-gray-700 dark:text-gray-300 pink:text-pink-300">
          <div>
            <span className="font-bold text-xl">{profile._count.posts}</span>
            <span className="ml-2">постов</span>
          </div>
          <div>
            <span className="font-bold text-xl">{profile._count.followers}</span>
            <span className="ml-2">подписчиков</span>
          </div>
          <div>
            <span className="font-bold text-xl">{profile._count.following}</span>
            <span className="ml-2">подписок</span>
          </div>
        </div>

        {/* Био */}
        {profile.bio && (
          <p className="text-gray-700 dark:text-gray-300 pink:text-pink-300">
            {profile.bio}
          </p>
        )}

        {/* Вкладки */}
        <div className="flex gap-8 mt-6 border-t border-gray-200 dark:border-gray-700 pink:border-pink-800 pt-4">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-2 transition ${
              activeTab === 'posts'
                ? 'border-b-2 border-blue-600 pink:border-pink-500 text-blue-600 dark:text-blue-400 pink:text-pink-400 font-semibold'
                : 'text-gray-600 dark:text-gray-400 pink:text-pink-500 hover:text-gray-900 dark:hover:text-gray-200 pink:hover:text-pink-300'
            }`}
          >
            Посты
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-2 transition ${
              activeTab === 'about'
                ? 'border-b-2 border-blue-600 pink:border-pink-500 text-blue-600 dark:text-blue-400 pink:text-pink-400 font-semibold'
                : 'text-gray-600 dark:text-gray-400 pink:text-pink-500 hover:text-gray-900 dark:hover:text-gray-200 pink:hover:text-pink-300'
            }`}
          >
            О пользователе
          </button>
        </div>
      </div>

      {/* Контент вкладок */}
      {activeTab === 'posts' ? (
        loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400 pink:text-pink-400">
            Загрузка постов...
          </p>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 pink:bg-pink-950 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 pink:text-pink-400">
              {isOwnProfile ? 'Вы ещё не создали ни одного поста' : 'Пользователь ещё не создал ни одного поста'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-gray-800 pink:bg-pink-950 p-6 rounded-lg shadow-md">
                <Link to={`/posts/${post.id}`}>
                  <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white pink:text-pink-300 hover:text-blue-600 dark:hover:text-blue-400 pink:hover:text-pink-400">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-gray-700 dark:text-gray-300 pink:text-pink-300 mb-4 line-clamp-3">
                  {post.content}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pink:text-pink-500">
                  <span>{new Date(post.createdAt).toLocaleDateString('ru-RU')}</span>
                  <div className="flex gap-4">
                    <span>❤️ {post._count.likes}</span>
                    <span>💬 {post._count.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-white dark:bg-gray-800 pink:bg-pink-950 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white pink:text-pink-300">
            Информация
          </h3>
          <div className="space-y-3 text-gray-700 dark:text-gray-300 pink:text-pink-300">
            <p>
              <strong>Дата регистрации:</strong>{' '}
              {new Date(profile.createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            {profile.fullName && (
              <p>
                <strong>Полное имя:</strong> {profile.fullName}
              </p>
            )}
            {profile.bio && (
              <div>
                <strong>О себе:</strong>
                <p className="mt-2">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}