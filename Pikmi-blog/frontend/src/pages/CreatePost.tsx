import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const navigate = useNavigate();

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

    setLoading(true);
    try {
      const response = await axios.post('/posts', {
        title,
        content,
        published
      });
      toast.success('Пост создан!');
      navigate(`/posts/${response.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при создании поста');
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
        className="mb-6"
      >
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          ✍️ Создать новый пост
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Поделитесь своими мыслями с сообществом
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
                Опубликовать сразу
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                loading={loading}
              >
                Создать пост
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/')}
              >
                Отмена
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}