import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-toastify';

export default function EditPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/posts/${id}`);
      setTitle(response.data.title);
      setContent(response.data.content);
      setPublished(response.data.published);
    } catch (error) {
      toast.error('Пост не найден');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || title.length < 5) {
      toast.error('Заголовок должен быть минимум 5 символов');
      return;
    }

    if (!content.trim() || content.length < 10) {
      toast.error('Содержание должно быть минимум 10 символов');
      return;
    }

    setLoading(true);
    try {
      await axios.patch(`/posts/${id}`, { title, content, published });
      toast.success('Пост обновлён!');
      navigate(`/posts/${id}`);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) {
      return;
    }

    try {
      await axios.delete(`/posts/${id}`);
      toast.success('Пост удалён');
      navigate('/');
    } catch (error) {
    }
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Редактировать пост
      </h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Заголовок
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Содержание
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Опубликовать
            </span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Сохранить
          </button>
          <button
            type="button"
            onClick={() => navigate(`/posts/${id}`)}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ml-auto"
          >
            Удалить пост
          </button>
        </div>
      </form>
    </div>
  );
}
