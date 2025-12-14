import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-toastify';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      const response = await axios.post('/posts', {
        title,
        content,
        published
      });
      toast.success('Пост создан!');
      navigate(`/posts/${response.data.id}`);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white pink:text-pink-300">
        Создать новый пост
      </h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 pink:bg-pink-950 p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pink:text-pink-300 mb-2">
            Заголовок
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pink:focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white pink:bg-gray-900 pink:border-pink-800 pink:text-pink-200"
            placeholder="Введите заголовок..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pink:text-pink-300 mb-2">
            Содержание
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pink:focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white pink:bg-gray-900 pink:border-pink-800 pink:text-pink-200"
            placeholder="Напишите текст поста..."
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
            <span className="text-sm text-gray-700 dark:text-gray-300 pink:text-pink-300">
              Опубликовать сразу
            </span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 pink:bg-[#FFF3E6] text-white pink:text-black rounded-lg hover:bg-blue-700 pink:hover:bg-[#FFE8CC] disabled:opacity-50 transition"
          >
            {loading ? 'Создание...' : 'Создать пост'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 pink:bg-pink-900 text-gray-700 dark:text-gray-300 pink:text-pink-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 pink:hover:bg-pink-800 transition"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}