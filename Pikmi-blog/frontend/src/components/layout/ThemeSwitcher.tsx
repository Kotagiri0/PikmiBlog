import { useTheme } from '../../context/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 pink:bg-pink-950 p-1 rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition ${
          theme === 'light' 
            ? 'bg-white text-gray-900 shadow' 
            : 'text-gray-600 hover:bg-gray-200'
        }`}
        title="Светлая тема"
      >
        ☀️
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition ${
          theme === 'dark' 
            ? 'bg-gray-700 text-white shadow' 
            : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
        }`}
        title="Темная тема"
      >
        🌙
      </button>
      <button
        onClick={() => setTheme('pink')}
        className={`p-2 rounded-md transition ${
          theme === 'pink' 
            ? 'bg-pink-600 text-white shadow' 
            : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
        }`}
        title="Розовая тема"
      >
        💗
      </button>
    </div>
  );
}