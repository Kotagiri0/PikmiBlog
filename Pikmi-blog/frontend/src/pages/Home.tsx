import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axios';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

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

function PostCard({ post, index }: { post: Post; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card hover className="mb-4">
        <Link to={`/posts/${post.id}`}>
          <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
            {post.title}
          </h2>
        </Link>

        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
          {post.content}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <motion.img
              whileHover={{ scale: 1.1 }}
              src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.username}&background=random`}
              alt={post.author.username}
              className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {post.author.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(post.createdAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400"
            >
              <span className="text-lg">❤️</span>
              <span className="font-medium">{post._count.likes}</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400"
            >
              <span className="text-lg">💬</span>
              <span className="font-medium">{post._count.comments}</span>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function PostSkeleton() {
  return (
    <Card className="mb-4">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" className="w-10 h-10" />
          <div>
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </Card>
  );
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search !== '') {
        setPage(1);
        fetchPosts();
      } else if (search === '') {
        setPage(1);
        fetchPosts();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Поиск постов..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white shadow-sm transition-all duration-200"
            />
            <Button type="submit" variant="primary">
              Искать
            </Button>
          </div>
        </form>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {[...Array(3)].map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </motion.div>
        ) : posts.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <EmptyState
              title="Постов не найдено"
              description={search ? `По запросу "${search}" ничего не найдено. Попробуйте другой поисковый запрос.` : 'Пока нет постов. Будьте первым, кто создаст пост!'}
              actionLabel={search ? undefined : 'Создать пост'}
              actionLink={search ? undefined : '/create-post'}
              icon="📝"
            />
          </motion.div>
        ) : (
          <motion.div
            key="posts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {totalPages > 1 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center gap-3 mt-8"
        >
          <Button
            variant="secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Назад
          </Button>
          <span className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium">
            Страница {page} из {totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Далее →
          </Button>
        </motion.div>
      )}
    </div>
  );
}
