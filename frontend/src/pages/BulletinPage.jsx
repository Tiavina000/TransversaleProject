import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Award, TrendingUp, TrendingDown, Minus, Loader2, AlertTriangle } from 'lucide-react';
import { notesAPI } from '../services/api';

export function BulletinPage({ user }) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await notesAPI.mesNotes();
        const data = res.data?.results || res.data || [];
        setNotes(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch notes', err);
        setError(t('common.error'));
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-danger)' }} />
        <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{error}</p>
      </div>
    );
  }

  const moyenneGenerale = notes.length > 0
    ? (notes.reduce((sum, n) => sum + (n.note || 0), 0) / notes.length).toFixed(2)
    : '-';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {t('bulletin.title', 'Mon Bulletin')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {t('bulletin.subtitle', 'Consultez vos notes et suivez votre progression')}
          </p>
        </div>
        {notes.length > 0 && (
          <div className="text-right">
            <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{moyenneGenerale}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('bulletin.average')}</p>
          </div>
        )}
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-20">
          <Award className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('bulletin.noNotes', 'Aucune note disponible')}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('bulletin.noNotesDesc', 'Vos notes apparaîtront ici une fois publiées par vos enseignants.')}
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl overflow-hidden"
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--overlay-light)' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{t('bulletin.subject_header')}</th>
                <th className="text-center px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{t('bulletin.grade_header')}</th>
                <th className="text-center px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{t('bulletin.coefficient_header')}</th>
                <th className="text-center px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{t('bulletin.appreciation_header')}</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((n, i) => (
                <NoteRow key={n.id || i} note={n} idx={i} />
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}

function NoteRow({ note, idx }) {
  const { t } = useTranslation();
  const getTrendIcon = () => {
    if (note.note >= 14) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (note.note >= 10) return <Minus className="w-4 h-4 text-amber-400" />;
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  const getAppreciation = () => {
    if (note.note >= 16) return t('bulletin.excellent');
    if (note.note >= 14) return t('bulletin.very_good');
    if (note.note >= 12) return t('bulletin.good');
    if (note.note >= 10) return t('bulletin.passing');
    return t('bulletin.insufficient');
  };

  const matiereNom = typeof note.matiere === 'object' ? note.matiere?.nom : note.matiere || note.matiere_nom || 'Général';

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.03 }}
      className="border-t transition-colors hover:opacity-80"
      style={{ borderColor: 'var(--border-glass)' }}
    >
      <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{matiereNom}</td>
      <td className="px-4 py-3 text-center">
        <span className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>{note.note ?? '-'}</span>
        <span className="text-xs ml-0.5" style={{ color: 'var(--text-muted)' }}>{t('bulletin.grade_format')}</span>
      </td>
      <td className="px-4 py-3 text-center" style={{ color: 'var(--text-secondary)' }}>
        {note.coefficient ?? 1}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1.5">
          {getTrendIcon()}
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{getAppreciation()}</span>
        </div>
      </td>
    </motion.tr>
  );
}
