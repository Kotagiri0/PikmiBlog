import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

export default function EditPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
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

  const validate = () => {
    const newErrors: { title?: string; content?: string } = {};
    if (!title.trim() || title.length < 5) {
      newErrors.title = 'Заголовок должен быть минимум 5 символов';
    }
    if (!content.trim() || content.length < 10) {
      newErrors.content = 'Содержание должно быть минимум 10 символов';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      await axios.patch(`/posts/${id}`, { title, content, published });
      toast.success('Пост обновлён!');
      navigate(`/posts/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при обновлении поста');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот пост? Это действие нельзя отменить.')) {
      return;
    }

    try {
      await axios.delete(`/posts/${id}`);
      toast.success('Пост удалён');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при удалении поста');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64 mb-6" />
        <Card>
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-12 w-full mb-6" />
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-10 w-32" />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          ✏️ Редактировать пост
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Внесите изменения в ваш пост
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              label="Заголовок"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              placeholder="Введите заголовок..."
              error={errors.title}
            />

            <div>
              <Input
                textarea
                label="Содержание"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) setErrors({ ...errors, content: undefined });
                }}
                rows={15}
                placeholder="Напишите текст поста..."
                error={errors.content}
                className="font-mono text-sm"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {content.length} символов
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label
                htmlFor="published"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Опубликовать
              </label>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={saving}
                loading={saving}
              >
                Сохранить
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/posts/${id}`)}
              >
                Отмена
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                className="ml-auto"
              >
                🗑️ Удалить пост
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
