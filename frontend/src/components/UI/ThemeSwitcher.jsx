import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const THEME_ICONS = {
  green: '🏛️',
  dark: <Moon className="w-4 h-4" />,
  light: <Sun className="w-4 h-4" />,
};

export function ThemeSwitcher() {
  const { theme, setTheme, THEMES } = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        className="glass-sm flex items-center gap-2 px-3 py-1.5 text-sm font-medium"
        style={{ color: 'var(--text-primary)' }}
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        <span>{THEME_ICONS[theme] || '🏛️'}</span>
        <span>{t('theme.' + theme) || t('theme.label')}</span>
      </motion.button>

      {open && (
        <motion.div
          className="absolute right-0 top-full mt-2 glass rounded-xl overflow-hidden z-50 min-w-[140px]"
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
        >
          {THEMES.map((item) => (
            <button
              key={item.key}
              onClick={() => { setTheme(item.key); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-white/10 ${
                item.key === theme ? 'font-semibold' : ''
              }`}
              style={{
                color: item.key === theme ? 'var(--color-primary)' : 'var(--text-secondary)',
              }}
            >
              <span>{item.icon}</span>
              <span>{t('theme.' + item.key)}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
