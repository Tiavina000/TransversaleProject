import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, Filter } from 'lucide-react';
import { Stories } from './Stories';
import { InfiniteScrollContainer } from './InfiniteScrollContainer';

const MOCK_STORIES = [
  { id: 1, title: 'Examen Maths', content: 'Examen de Mathématiques prévu vendredi à 09h00. Révisions recommandées : Chapitres 5 et 6.', emoji: '📝', color: 'rgba(239,68,68,0.3)' },
  { id: 2, title: 'Nouveau cours', content: 'Un nouveau cours de Physique-Chimie est disponible. Consultez vos leçons !', emoji: '⚗️', color: 'rgba(124,58,237,0.3)' },
  { id: 3, title: 'Session Live', content: 'Session de révision en direct ce soir à 18h avec votre professeur.', emoji: '🎥', color: 'rgba(6,182,212,0.3)' },
];

const MOCK_COURSES = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  titre: ['Algèbre Linéaire', 'Physique-Chimie', 'Histoire-Géo', 'Français', 'Sciences Naturelles', 'Informatique', 'Anglais', 'Philosophie'][i],
  matiere: ['Mathématiques', 'Sciences', 'Histoire', 'Français', 'SVT', 'NSI', 'Langues', 'Philosophie'][i],
  niveau: ['3ème', 'Terminale', '2nde', '1ère', 'CM2', 'Terminale', '1ère', 'Terminale'][i],
  progress: [72, 45, 90, 30, 100, 15, 60, 5][i],
  emoji: ['📐', '⚗️', '🗺️', '📖', '🌿', '💻', '🇬🇧', '🤔'][i],
  color: ['rgba(124,58,237,0.3)', 'rgba(6,182,212,0.3)', 'rgba(245,158,11,0.3)', 'rgba(239,68,68,0.3)', 'rgba(34,197,94,0.3)', 'rgba(99,102,241,0.3)', 'rgba(236,72,153,0.3)', 'rgba(168,85,247,0.3)'][i],
}));

const FILTERS = [
  { key: 'all',      label: 'dashboard.filter_all' },
  { key: 'progress', label: 'dashboard.filter_progress' },
  { key: 'done',     label: 'dashboard.filter_done' },
];

export function StudentDashboard({ user }) {
  const { t } = useTranslation();
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [courses, setCourses]     = useState(MOCK_COURSES);
  const [hasMore, setHasMore]     = useState(false);
  const [page, setPage]           = useState(1);

  const loadMore = useCallback(() => {
    // Dans un vrai projet → courseAPI.list({ page: page + 1 })
    setHasMore(false);
    setPage((p) => p + 1);
  }, [page]);

  const filtered = courses.filter((c) => {
    const matchSearch = c.titre.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all'      ? true :
      filter === 'progress' ? c.progress > 0 && c.progress < 100 :
      filter === 'done'     ? c.progress === 100 : true;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-8">
      {/* ── Welcome ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <p className="text-slate-400 text-sm">{t('dashboard.welcome')},</p>
        <h1 className="text-3xl font-bold">
          <span className="text-gradient">{user?.prenom || 'Étudiant'}</span> 👋
        </h1>
      </motion.div>

      {/* ── Stories ─────────────────────────────────────────────── */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
          {t('dashboard.stories_title')}
        </p>
        <Stories stories={MOCK_STORIES} />
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="w-full glass-sm bg-transparent pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 border border-white/10 rounded-xl transition"
          />
        </div>
        {/* Filter pills */}
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                filter === f.key
                  ? 'btn-metal'
                  : 'btn-ghost'
              }`}
            >
              {t(f.label)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Course Grid (Infinite Scroll) ──────────────────────── */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">
          {t('dashboard.my_courses')} — {filtered.length}
        </p>
        <InfiniteScrollContainer
          courses={filtered}
          onLoadMore={loadMore}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
}
