import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/users/me');
      setUser(response.data);
      setFullName(response.data.fullName || '');
      setBio(response.data.bio || '');
    } catch (error) {
      toast.error('Ошибка при загрузке профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await axios.patch('/users/me', { fullName, bio });
      toast.success('Профиль обновлён!');
      setEditing(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при обновлении профиля');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <Skeleton variant="circular" className="w-20 h-20" />
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-8">
          <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <motion.img
              whileHover={{ scale: 1.1 }}
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&size=100&background=random`}
              alt={user.username}
              className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-700"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {user.username}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {user._count?.posts || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Постов</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {user._count?.followers || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Подписчиков</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {user._count?.following || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Подписок</div>
            </motion.div>
          </div>

          {/* Редактирование профиля */}
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5"
              >
                <Input
                  label="Полное имя"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Введите ваше имя"
                />

                <Input
                  textarea
                  label="О себе"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Расскажите о себе..."
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="primary"
                    onClick={handleUpdate}
                    disabled={saving}
                    loading={saving}
                  >
                    Сохранить
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setEditing(false)}
                  >
                    Отмена
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Полное имя
                    </h3>
                    <p className="text-gray-900 dark:text-white">
                      {user.fullName || 'Не указано'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      О себе
                    </h3>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {user.bio || 'Не указано'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  onClick={() => setEditing(true)}
                >
                  ✏️ Редактировать профиль
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
