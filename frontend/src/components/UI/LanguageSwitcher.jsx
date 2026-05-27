import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'mg', label: 'MG', emoji: '🇲🇬' },
  { code: 'fr', label: 'FR', emoji: '🇫🇷' },
  { code: 'en', label: 'EN', emoji: '🇬🇧' },
];

/**
 * Sélecteur de langue avec animation.
 * Persiste la langue dans localStorage via i18n.js.
 */
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = LANGS.find((l) => l.code === i18n.language) || LANGS[0];

  const switchLang = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('eneni_lang', code);
    setOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        className="glass-sm flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white"
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        <span>{current.emoji}</span>
        <span>{current.label}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>

      {open && (
        <motion.div
          className="absolute right-0 top-full mt-2 glass rounded-xl overflow-hidden z-50 min-w-[120px]"
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
        >
          {LANGS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLang(lang.code)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-white/10 ${
                lang.code === i18n.language ? 'text-primary font-semibold' : 'text-slate-300'
              }`}
            >
              <span>{lang.emoji}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
