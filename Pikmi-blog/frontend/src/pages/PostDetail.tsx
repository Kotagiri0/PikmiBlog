import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

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

  useEffect(() => {
    fetchPost();
    fetchComments();
    checkFavoriteStatus();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/posts/${id}`);
      setPost(response.data);
      setIsLiked(response.data.isLiked);
      setLikesCount(response.data._count.likes);
    } catch (error) {
      toast.error('Ошибка при загрузке поста');
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
      toast.success(response.data.liked ? 'Лайк добавлен' : 'Лайк убран');
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
    }
  };

  if (!post) return <p>Загрузка...</p>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Пост */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          {post.title}
        </h1>

        <div className="flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-400">
          <img
            src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.username}`}
            alt={post.author.username}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium">{post.author.username}</p>
            <p className="text-sm">{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none mb-6">
          <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
        </div>

        {/* Кнопки взаимодействия */}
        <div className="flex gap-4">
          {/* Кнопка лайка */}
          <button
            onClick={handleLike}
            className={`px-4 py-2 rounded-lg transition ${
              isLiked
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <span className="flex items-center gap-2">
              {isLiked ? '❤️' : '🤍'} {likesCount}
            </span>
          </button>

          {/* Кнопка избранного */}
          <button
            onClick={handleToggleFavorite}
            className={`px-4 py-2 rounded-lg transition ${
              isFavorite
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <span className="flex items-center gap-2">
              {isFavorite ? '⭐' : '☆'}
              {isFavorite ? 'В избранном' : 'В избранное'}
            </span>
          </button>
        </div>
      </div>

      {/* Комментарии */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Комментарии ({comments.length})
        </h2>

        {/* Форма добавления */}
        {isAuthenticated && (
          <form onSubmit={handleAddComment} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишите комментарий..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
            />
            <button
              type="submit"
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Отправить
            </button>
          </form>
        )}

        {/* Список комментариев */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={comment.author.avatarUrl || `https://ui-avatars.com/api/?name=${comment.author.username}`}
                  alt={comment.author.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium text-gray-900 dark:text-white">
                  {comment.author.username}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Пока нет комментариев. Будьте первым!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
