import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light', icon: '☀️', label: 'Светлая тема', color: 'bg-white' },
    { id: 'dark', icon: '🌙', label: 'Темная тема', color: 'bg-gray-800' },
    { id: 'pink', icon: '💗', label: 'Розовая тема', color: 'bg-pink-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg shadow-inner"
    >
      {themes.map((t) => (
        <motion.button
          key={t.id}
          onClick={() => setTheme(t.id as 'light' | 'dark' | 'pink')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`relative p-2 rounded-md transition-all duration-200 ${
            theme === t.id
              ? 'text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          title={t.label}
        >
          <AnimatePresence mode="wait">
            {theme === t.id && (
              <motion.span
                layoutId="activeTheme"
                className={`absolute inset-0 ${t.color} rounded-md`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
          <span className="relative z-10 text-lg">{t.icon}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}