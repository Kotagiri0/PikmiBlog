import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
}

export default function PostDetail() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
    checkFavoriteStatus();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/posts/${id}`);
      setPost(response.data);
      setIsLiked(response.data.isLiked);
      setLikesCount(response.data._count.likes);
    } catch (error) {
      toast.error('Ошибка при загрузке поста');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/comments/post/${id}`);
      setComments(response.data);
    } catch (error) {
      toast.error('Ошибка при загрузке комментариев');
    }
  };

  const checkFavoriteStatus = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const response = await axios.get('/favorites');
      const favorited = response.data.some((favPost: any) =>
        favPost.id === parseInt(id!) || favPost.postId === parseInt(id!)
      );
      setIsFavorite(favorited);
    } catch (error) {
      console.log('Не удалось проверить избранное');
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Войдите, чтобы лайкать посты');
      return;
    }

    try {
      const response = await axios.post(`/posts/${id}/like`);
      setIsLiked(response.data.liked);
      setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при лайке');
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Войдите, чтобы добавить в избранное');
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`/favorites/${id}`);
        setIsFavorite(false);
        toast.success('Удалено из избранного');
      } else {
        await axios.post(`/favorites/${id}`);
        setIsFavorite(true);
        toast.success('Добавлено в избранное');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при изменении избранного');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast.error('Комментарий не может быть пустым');
      return;
    }

    setCommentLoading(true);
    try {
      const response = await axios.post('/comments', {
        content: newComment,
        postId: parseInt(id!)
      });
      setComments([response.data, ...comments]);
      setNewComment('');
      toast.success('Комментарий добавлен');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при добавлении комментария');
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-12 w-48" />
        </Card>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Пост */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="mb-6 p-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white pr-4">
              {post.title}
            </h1>
            {isAuthenticated && user?.id === post.author.id && (
              <Link
                to={`/edit-post/${id}`}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                ✏️ Редактировать
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <motion.img
              whileHover={{ scale: 1.1 }}
              src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.username}&background=random`}
              alt={post.author.username}
              className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {post.author.username}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(post.createdAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Кнопки взаимодействия */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className={`px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium ${
                isLiked
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <motion.span
                animate={{ scale: isLiked ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                {isLiked ? '❤️' : '🤍'}
              </motion.span>
              <span>{likesCount}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleFavorite}
              className={`px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium ${
                isFavorite
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <motion.span
                animate={{ rotate: isFavorite ? [0, 10, -10, 0] : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isFavorite ? '⭐' : '☆'}
              </motion.span>
              <span>{isFavorite ? 'В избранном' : 'В избранное'}</span>
            </motion.button>
          </div>
        </Card>
      </motion.div>

      {/* Комментарии */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            💬 Комментарии ({comments.length})
          </h2>

          {/* Форма добавления */}
          {isAuthenticated && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleAddComment}
              className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <Input
                textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Напишите комментарий..."
                rows={3}
                className="mb-3"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={commentLoading}
                loading={commentLoading}
              >
                Отправить
              </Button>
            </motion.form>
          )}

          {/* Список комментариев */}
          <AnimatePresence>
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={comment.author.avatarUrl || `https://ui-avatars.com/api/?name=${comment.author.username}&background=random`}
                      alt={comment.author.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {comment.author.username}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 ml-11">
                    {comment.content}
                  </p>
                </motion.div>
              ))}

              {comments.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <p className="text-gray-500 dark:text-gray-400">
                    Пока нет комментариев. Будьте первым! 💭
                  </p>
                </motion.div>
              )}
            </div>
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
