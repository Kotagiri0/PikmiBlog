import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

export default function Favorites() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/favorites');
      setPosts(response.data.posts);
    } catch (error) {
      // Обработано
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Избранные посты
      </h1>

      {loading ? (
        <p className="text-center text-gray-600 dark:text-gray-400">Загрузка...</p>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            У вас пока нет избранных постов
          </p>
          <Link
            to="/"
            className="text-blue-600 hover:underline"
          >
            Перейти к ленте
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <Link to={`/posts/${post.id}`}>
                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white hover:text-blue-600">
                  {post.title}
                </h2>
              </Link>

              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                {post.content}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <img
                    src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.username}`}
                    alt={post.author.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{post.author.username}</span>
                </div>

                <div className="flex gap-4">
                  <span>❤️ {post._count.likes}</span>
                  <span>💬 {post._count.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
