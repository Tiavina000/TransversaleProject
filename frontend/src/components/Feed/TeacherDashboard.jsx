import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, FileText, Users, BarChart3, ClipboardCheck,
  Video, Clock, CheckCircle, AlertTriangle, Loader2, GraduationCap, School, X, Plus
} from 'lucide-react';
import { correctionAPI, visioAPI, statsAPI } from '../../services/api';
import MesClasses from './MesClasses';
const QUICK_ACTIONS = [
  { key: 'courses',    label: 'manage_courses',   icon: BookOpen,      path: '/courses',     color: '#1B8A5A' },
  { key: 'exams',      label: 'create_exam',    icon: FileText,      path: '/exams',       color: '#7C3AED' },
  { key: 'corrections',label: 'corrections_short',         icon: ClipboardCheck,path: '/corrections', color: '#D64545' },
  { key: 'live',       label: 'live_course',     icon: Video,         path: '#creer-visio', color: '#06B6D4' },
  { key: 'students',   label: 'my_classes',        icon: Users,         path: '#classes',     color: '#F59E0B' },
  { key: 'stats',      label: 'stats_short',        icon: BarChart3,    path: '/dashboard',   color: '#22C55E' },
];

function CreerVisioModal({ open, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ titre: '', date_debut: '', date_fin: '' });
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.titre.trim()) return;
    setCreating(true);
    try {
      const payload = {
        titre: form.titre,
        date_debut: form.date_debut || new Date().toISOString(),
        date_fin: form.date_fin || new Date(Date.now() + 3600000).toISOString(),
        est_active: true,
      };
      const res = await visioAPI.create(payload);
      onClose();
      if (res.data?.id) navigate(`/live/${res.data.id}`);
    } catch (err) {
      console.error('Create visio error:', err);
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-6 max-w-md mx-4 w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            <Video className="w-5 h-5 inline mr-2" style={{ color: 'var(--color-primary)' }} />
            {t('teacherDashboard.create_visio', 'Nouvelle session live')}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            className="w-full px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            placeholder={t('visio.title', 'Titre de la session')}
            value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })}
            required
          />
          <input
            type="datetime-local"
            className="w-full px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            value={form.date_debut}
            onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
          />
          <input
            type="datetime-local"
            className="w-full px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            value={form.date_fin}
            onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
          />
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm btn-ghost">
              {t('common.cancel', 'Annuler')}
            </button>
            <button type="submit" disabled={creating} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'var(--color-primary)' }}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <Video className="w-4 h-4 inline" />}
              {' '}{t('teacherDashboard.start_visio', 'Démarrer')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function TeacherDashboard({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingCorrections, setPendingCorrections] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreerVisio, setShowCreerVisio] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [corrRes, statsRes] = await Promise.allSettled([
          correctionAPI.list({ statut: 'soumis' }),
          statsAPI.getTeacher(),
        ]);
        if (corrRes.status === 'fulfilled') {
          setPendingCorrections(corrRes.value.data?.count ?? corrRes.value.data?.results?.length ?? 0);
        }
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data);
        }
      } catch (err) {
        console.error('TeacherDashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {t('teacher.welcome', 'Espace Enseignant')}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {t('teacher.subtitle', 'Bienvenue, {{name}}', { name: user?.prenom || user?.username || '' })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {user.etablissement && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'var(--overlay-light)' }}>
                <School className="w-3.5 h-3.5" /> {user.etablissement}
              </span>
            )}
            {user.specialite && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'var(--overlay-light)' }}>
                <GraduationCap className="w-3.5 h-3.5" /> {user.specialite}
              </span>
            )}
            {user.niveau && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: `${'#7C3AED'}15`, color: '#7C3AED' }}>
                <BarChart3 className="w-3.5 h-3.5" /> {user.niveau}
              </span>
            )}
          </div>
        </div>
        {user.matieres_enseignees?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {user.matieres_enseignees.map((m) => (
              <span key={m} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${'#1B8A5A'}15`, color: '#1B8A5A' }}>
                {m}
              </span>
            ))}
          </div>
        )}
      </div>

      {pendingCorrections > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-4 mb-6 flex items-center gap-3"
                style={{ borderLeft: '4px solid var(--color-danger)' }}
              >
                <AlertTriangle className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--color-danger)' }} />
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {t('teacherDashboard.pending_corrections_alert', { count: pendingCorrections })}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {t('teacherDashboard.pending_corrections_desc')}
                  </p>
                </div>
                <motion.button
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: 'var(--color-primary)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/corrections')}
                >
                  {t('teacherDashboard.correct')}
                </motion.button>
              </motion.div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {QUICK_ACTIONS.map((action, idx) => (
                <motion.button
                  key={action.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => action.key === 'live' ? setShowCreerVisio(true) : navigate(action.path)}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="p-2.5 rounded-lg" style={{ background: `${action.color}15` }}>
                    <action.icon className="w-5 h-5" style={{ color: action.color }} />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {t('teacherDashboard.' + action.label)}
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <RecentActivity />
              <TeacherStats stats={stats} />
            </div>

            {user.niveaux_enseignes?.length > 0 && (
              <div className="glass rounded-xl p-5 mt-6">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <GraduationCap className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  {t('teacher.myLevels', 'Mes niveaux')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.niveaux_enseignes.map((n) => (
                    <span key={n} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'var(--overlay-light)', color: 'var(--text-primary)' }}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <MesClasses />
            </div>
            <CreerVisioModal open={showCreerVisio} onClose={() => setShowCreerVisio(false)} />
    </div>
  );
}

function RecentActivity() {
  const [sessions, setSessions] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    visioAPI.sessions()
      .then((res) => setSessions(res.data?.results?.slice(0, 5) || res.data?.slice(0, 5) || []))
      .catch(() => setSessions([]));
  }, []);

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="font-semibold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <Clock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
        {t('teacher.recentActivity', 'Activité récente')}
      </h3>
      {sessions.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {t('teacher.noRecentActivity', 'Aucune activité récente.')}
        </p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center gap-3 text-sm p-2 rounded-lg" style={{ background: 'var(--overlay-light)' }}>
              <Video className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{s.titre || 'Session'}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(s.date_debut || s.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${s.statut === 'en_cours' ? 'text-green-400 bg-green-500/10' : 'text-slate-400 bg-slate-500/10'}`}>
                {s.statut === 'en_cours' ? t('teacherDashboard.live_status') : t('teacherDashboard.ended_status')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeacherStats({ stats }) {
  const { t } = useTranslation();

  const ITEMS = [
    { label: 'courses_published',    value: stats?.published_courses ?? '-', icon: BookOpen,    color: '#1B8A5A' },
    { label: 'students_followed',    value: stats?.total_students  ?? '-', icon: Users,       color: '#7C3AED' },
    { label: 'exams_created',    value: stats?.total_exams     ?? '-', icon: FileText,    color: '#D64545' },
    { label: 'success_rate', value: stats?.success_rate != null ? `${stats.success_rate}%` : '-', icon: CheckCircle, color: '#22C55E' },
  ];

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="font-semibold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <BarChart3 className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
        {t('teacher.stats', 'Vos statistiques')}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.08 }}
            className="rounded-xl p-4 text-center"
            style={{ background: `${item.color}08` }}
          >
            <item.icon className="w-5 h-5 mx-auto mb-2" style={{ color: item.color }} />
            <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{t('teacherDashboard.' + item.label)}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
