import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Play, FileText, Filter, Clock, Video, BarChart2, GraduationCap } from 'lucide-react';
import { courseAPI, statsAPI } from '../services/api';
import { TeacherCourseManager } from '../components/Feed/TeacherCourseManager';





export function CoursesPage({ user }) {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const SUBJECTS = [
    t('subjects.math'), t('subjects.french'), t('subjects.malagasy'), t('subjects.physics_chemistry'),
    t('subjects.svt'), t('subjects.history_geo'), t('subjects.english'), t('subjects.philosophy'), t('subjects.computer_science')
  ];
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentStats, setStudentStats] = useState(null);
  const [error, setError] = useState(null);
  const selectedLevel = user?.niveau || 'Terminale';
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [search, setSearch]                   = useState('');

  // ── Teacher view: show course manager ──────────────────────────────
  if (user?.type_utilisateur === 'ENSEIGNANT' || user?.role === 'ENSEIGNANT') {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {t('teacher.manageCourses', 'Gérer mes cours')}
          </h1>
          {user.etablissement && (
            <p className="text-sm mt-1 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <GraduationCap className="w-4 h-4" /> {user.etablissement}{user.specialite ? ` • ${user.specialite}` : ''}
            </p>
          )}
        </div>
        <TeacherCourseManager user={user} />
      </div>
    );
  }

  const fetchCourses = async () => {
    try {
      const params = {};
      if (user?.niveau) params.niveau = user.niveau;
      if (user?.etablissement) params.etablissement = user.etablissement;
      const res = await courseAPI.list(params);
      setError(null);
      let results = (res.data.results || res.data || []).map(c => ({
        id: c.id,
        titre:   c.nom || t('courses.untitled'),
        matiere: c.matiere_nom || c.nom || 'Général',
        niveau:  c.niveaux && c.niveaux.length > 0 ? (c.niveaux.some(n => n.nom === user?.niveau) ? user?.niveau : c.niveaux[0].nom) : 'Tout niveau',
        etablissement: c.etablissement_nom || '',
        duree:   t('courses.full_program'),
        emoji:   '📚',
        color:   'rgba(156,163,175,0.3)',
        has_live: false,
      }));
      if (selectedLevel !== 'All') {
        results = results.filter(r => r.niveau === selectedLevel || r.niveau === 'Tout niveau');
      }
      setCourses(results);
    } catch (err) {
      console.error('Failed to fetch courses', err);
      setError(t('common.error'));
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    statsAPI.getStudent()
      .then(res => setStudentStats(res.data))
      .catch(() => {});
  }, [selectedLevel]);

  const filteredCourses = courses.filter(c =>
    c.titre.toLowerCase().includes(search.toLowerCase()) &&
    (selectedSubject === 'All' || c.matiere === selectedSubject)
  );


  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[80vh]">
      
      {/* ── Sidebar Filters ─────────────────────────────────────── */}
      <motion.aside 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-64 flex-shrink-0 space-y-6"
      >
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Filter size={18} className="text-primary" /> {t('courses.filters')}
          </h3>
          
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{t('courses.your_level')}</p>
            <p className="text-sm font-bold text-primary">{selectedLevel}</p>
            {user?.etablissement && (
              <p className="text-[10px] text-slate-400 mt-1">{user.etablissement}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">{t('courses.subject_label')}</label>
            <div className="flex flex-wrap gap-2">
              <button 
                  onClick={() => setSelectedSubject('All')}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${selectedSubject === 'All' ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'}`}
                >
                  {t('courses.all_filter')}
              </button>
              {SUBJECTS.map(subject => (
                <button 
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${selectedSubject === subject ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'}`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* ── Main Content ────────────────────────────────────────── */}
      <div className="flex-1 space-y-6">

        {/* ── Statistiques élève ──────────────────────────────── */}
        {studentStats && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            <div className="glass-sm rounded-2xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                <Clock size={16} className="text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('courses.total_time')}</p>
                <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{studentStats.total_time_hours}h</p>
              </div>
            </div>
            <div className="glass-sm rounded-2xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <BarChart2 size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('courses.exercises_done')}</p>
                <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{studentStats.exercises_done}</p>
              </div>
            </div>
            {studentStats.subjects && (
              <div className="glass-sm rounded-2xl p-4 col-span-2 sm:col-span-1">
                <p className="text-xs text-slate-500 mb-2">{t('courses.time_by_subject')}</p>
                <div className="space-y-1.5">
                  {Object.entries(studentStats.subjects).slice(0, 3).map(([subj, hours]) => (
                    <div key={subj} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 flex-1 truncate">{subj}</span>
                      <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                          style={{ width: `${Math.min((hours / studentStats.total_time_hours) * 100, 100)}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 flex-shrink-0">{hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        {/* Header & Search */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold">{t('courses.catalog_title')}</h1>
            <p className="text-slate-400 text-sm mt-1">
              {filteredCourses.length} cours adaptés à votre niveau ({selectedLevel})
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-sm bg-transparent pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary/50 border border-white/10 transition"
            />
          </div>
        </motion.div>

        {/* Course Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-rose-400 gap-4">
            <p>{error}</p>
            <button onClick={fetchCourses} className="btn-ghost px-4 py-2 text-sm">{t('common.retry')}</button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <BookOpen size={48} className="mb-4 opacity-50" />
            <p>{t('courses.no_results')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence>
              {filteredCourses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="glass-panel p-5 rounded-2xl flex flex-col group cursor-pointer relative overflow-hidden border border-white/5 hover:border-primary/20 transition-all"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform duration-500">
                    {course.emoji}
                  </div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: course.color }}
                    >
                      {course.emoji}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {course.has_live && (
                        <span
                          onClick={e => { e.stopPropagation(); navigate(`/live/${course.id}`); }}
                          className="text-[10px] font-bold px-2 py-1 rounded-md bg-red-500/15 border border-red-500/30 text-red-400 flex items-center gap-1.5 cursor-pointer hover:bg-red-500/25 transition-all"
                        >
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                          {t('visio.live_badge')}
                        </span>
                      )}
                      {course.etablissement && (
                        <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400">
                          {course.etablissement}
                        </span>
                      )}
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                        {course.niveau}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2">
                    {course.titre}
                  </h4>
                  <p className="text-sm text-slate-400 mb-auto">{course.matiere}</p>

                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FileText size={13} style={{ color: 'var(--color-primary)' }} />
                      <Clock size={12} />
                      <span>{course.duree}</span>
                    </div>
                    <motion.button
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-semibold hover:bg-primary hover:text-white transition-all"
                      onClick={e => { e.stopPropagation(); navigate(`/courses/${course.id}`); }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play size={11} fill="currentColor" /> {t('courses.study')}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
