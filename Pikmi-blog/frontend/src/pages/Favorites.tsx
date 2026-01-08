import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

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
      setPosts(response.data.posts || response.data);
    } catch (error) {
      // Обработано
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          ⭐ Избранные посты
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ваши сохраненные посты
        </p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="Нет избранных постов"
          description="У вас пока нет избранных постов. Начните сохранять посты, которые вам нравятся!"
          actionLabel="Перейти к ленте"
          actionLink="/"
          icon="⭐"
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
