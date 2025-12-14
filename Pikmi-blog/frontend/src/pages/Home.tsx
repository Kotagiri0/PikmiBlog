import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';

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

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [page, search]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/posts', {
        params: { page, search }
      });
      setPosts(response.data.posts);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      // Обработано
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск постов..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Искать
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-center text-gray-600 dark:text-gray-400">Загрузка...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">Постов не найдено</p>
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

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            Назад
          </button>
          <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
            Страница {page} из {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            Далее
          </button>
        </div>
      )}
    </div>
  );
}
