import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LayoutTemplate, AlignLeft,
  StickyNote, Save, X, PanelRightOpen, CheckCircle,
  AlertTriangle, ChevronLeft, Video, Minimize, Maximize,
  BookOpen, Clock, Play, Pause, FileText, Download, PenTool, Eye
} from 'lucide-react';
import { courseAPI } from '../services/api';
import { useCourseTimer } from '../hooks/useCourseTimer';
import { useFullscreen } from '../hooks/useFullscreen';
import { useTranslation } from 'react-i18next';



// ── Composant fichier téléchargeable ────────────────────────────────────────
function FileItem({ file, courseId, onView }) {
  const handleAction = async (e) => {
    e.preventDefault();
    if (file.isDownloadable === false && onView) {
      onView(file);
      return;
    }

    const token = sessionStorage.getItem('eneni_token');
    if (!token) {
      alert(t('coursePlayer.download_login_required'));
      return;
    }
    try {
      const response = await fetch(`/api/courses/${courseId}/files/${file.id}/download/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Accès refusé');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = file.nom; a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(t('coursePlayer.download_access_denied'));
    }
  };

  return (
    <motion.div
      className="flex items-center gap-3 p-3 glass-sm rounded-xl hover:border-primary/30 transition-all group cursor-pointer"
      whileHover={{ x: 4 }}
      onClick={handleAction}
    >
      <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
        <FileText size={16} className="text-rose-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{file.nom}</p>
        <p className="text-xs text-slate-500">
          {file.taille} {file.isDownloadable === false ? t('coursePlayer.read_only') : ''}
        </p>
      </div>
      {file.isDownloadable === false ? (
        <Eye size={14} className="text-primary flex-shrink-0" />
      ) : (
        <Download size={14} className="text-slate-500 group-hover:text-primary transition-colors flex-shrink-0" />
      )}
    </motion.div>
  );
}

// ── Timer Display ────────────────────────────────────────────────────────────
function TimerBadge({ formatted, running }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-mono font-bold transition-all ${
      running ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
    }`}>
      <Clock size={14} className={running ? 'text-emerald-400' : 'text-amber-400'} />
      {formatted}
      {!running && <span className="text-xs font-normal">{t('coursePlayer.pause')}</span>}
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────
export function CoursePlayer() {
  const { t }       = useTranslation();
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [course, setCourse]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode]       = useState('select_chapter');
  const [courseStarted, setCourseStarted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [startTab, setStartTab]           = useState('chapitres'); // 'chapitres' | 'fichiers'
  const [noteText, setNoteText]           = useState(() => localStorage.getItem(`eneni_notes_${id || 1}`) || '');
  const [isSaving, setIsSaving]           = useState(false);
  const [currentFile, setCurrentFile]     = useState(null);
  const [validationQuestion, setValidationQuestion] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);

  const timer     = useCourseTimer(id || 1);
  const { ref: fullscreenRef, isFullscreen, enter: enterFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const isStartingRef = useRef(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await courseAPI.detail(id);
        // We get Matiere, we need to fetch its chapters
        const chapRes = await courseAPI.chapitres(id);
        const data = res.data;
        data.chapitres = chapRes.data;
        setCourse(data);
      } catch (err) {
        console.error("Failed to fetch course", err);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();

    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p') || (e.metaKey && e.key === 'p')) {
        e.preventDefault();
        alert(t('coursePlayer.print_capture_disabled'));
        navigator.clipboard.writeText('');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        alert(t('coursePlayer.copy_forbidden'));
        navigator.clipboard.writeText('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => { 
      timer.stop(); 
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Contrainte de plein écran strict
  useEffect(() => {
    if (courseStarted && !isFullscreen && mode !== 'exercise_done' && !isStartingRef.current) {
      alert(t('coursePlayer.fullscreen_exit_warning'));
      setCourseStarted(false);
      setMode('lesson');
      timer.stop();
      // On pourrait ici appeler l'API pour logger l'abandon
    }
  }, [isFullscreen, courseStarted, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeChapter) {
      courseAPI.validationQuestion(activeChapter.id)
        .then(res => setValidationQuestion(res.data))
        .catch(() => {});
    }
  }, [activeChapter]);

  const handleValidateExercise = async (passed) => {
    if (passed || !validationQuestion || validationQuestion.id === 'fallback') {
      alert(t('coursePlayer.chapter_validated_alert'));
      setMode('exercise_done');
      try {
        const token = sessionStorage.getItem('eneni_token');
        await fetch(`/api/chapitres/${activeChapter.id}/validate/`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      alert(t('coursePlayer.insufficient_score'));
      setMode('lesson');
    }
  };

  const handleViewFile = (file) => {
    setCurrentFile(file);
    if (!courseStarted && course.chapitres?.[0]) {
      handleStartChapter(course.chapitres[0]);
    }
    setMode('viewer');
    setIsSidebarOpen(false);
  };

  const handleSaveNote = () => {
    setIsSaving(true);
    localStorage.setItem(`eneni_notes_${id || 1}`, noteText);
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleStartChapter = async (chap) => {
    setActiveChapter(chap);
    isStartingRef.current = true;
    await timer.start(chap.id);
    setCourseStarted(true);
    setMode('lesson');
    await enterFullscreen();
    setTimeout(() => { isStartingRef.current = false; }, 1000);
  };

  const handlePauseResume = () => {
    timer.running ? timer.pause() : timer.resume();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!course) return null;

  return (
    <div ref={fullscreenRef} className="min-h-screen bg-app flex flex-col" style={{ color: 'var(--text-primary)' }}>

      {/* ── Avertissement plein écran ───────────────────────────────── */}
      <AnimatePresence>
        {courseStarted && timer.warning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-amber-500/95 backdrop-blur text-black py-3 px-4 flex items-center justify-center gap-3 text-sm font-semibold"
          >
            <AlertTriangle size={18} />
            {timer.warning}
              <button onClick={timer.resume} className="ml-4 bg-black/20 px-3 py-1 rounded-lg text-xs hover:bg-black/30 transition">
                {t('coursePlayer.resume')}
              </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 glass border-b border-white/10 px-4 sm:px-6 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/courses')}
          className="p-2 rounded-xl hover:bg-white/5 transition flex-shrink-0">
          <ChevronLeft size={18} className="text-slate-400" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{course.nom}</h1>
          <p className="text-xs text-slate-500">{course.nom} · {course.niveaux && course.niveaux.length > 0 ? course.niveaux[0].nom : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {courseStarted && <TimerBadge formatted={timer.formatted} running={timer.running} />}
          {/* Boutons de mode */}
          <div className="hidden sm:flex items-center gap-1 glass-sm p-1 rounded-xl">
            {[
              { key: 'lesson', icon: AlignLeft,     label: t('coursePlayer.course_tab') },
              { key: 'video',  icon: Video,          label: t('coursePlayer.video_tab') },
              { key: 'split',  icon: LayoutTemplate, label: t('coursePlayer.split_tab') },
              { key: 'viewer', icon: Eye,            label: t('coursePlayer.pdf_tab') },
              { key: 'exercise', icon: PenTool,      label: t('coursePlayer.validation_tab') },
            ].map(({ key, icon: Icon, label }) => {
              if (key === 'viewer' && !currentFile) return null; // Cacher le bouton si pas de fichier
              if (key === 'exercise' && mode === 'exercise_done') return null; // Cacher si déjà validé
              return (
                <button key={key} onClick={() => setMode(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    mode === key ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                  }`}>
                  <Icon size={13} /> {label}
                </button>
              );
            })}
          </div>
          <button onClick={toggleFullscreen} className="p-2 rounded-xl hover:bg-white/5 transition">
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
          
          {courseStarted && (
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-xl transition-all ${isSidebarOpen ? 'bg-primary text-white' : 'hover:bg-white/5 text-slate-400'}`}
              title={t('coursePlayer.notes_title')}
            >
              <PanelRightOpen size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ── Contenu principal ──────────────────────────────────────── */}
      {!courseStarted ? (
        /* ── Écran sélection chapitre ────────────────────────────── */
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            className="glass rounded-3xl p-10 max-w-xl w-full space-y-6"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          >
            {/* En-tête matière */}
            <div className="flex items-center gap-4 pb-4 border-b border-white/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
                <BookOpen size={28} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1">{t('coursePlayer.subject_label')}</p>
                <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{course.nom}</h2>
                <p className="text-sm text-slate-400">
                  {course.niveaux && course.niveaux.length > 0 ? course.niveaux[0].nom : t('coursePlayer.all_levels')}
                </p>
              </div>
            </div>
            {course.description && (
              <p className="text-slate-400 text-sm leading-relaxed text-left">{course.description}</p>
            )}
            {/* Tabs: Chapitres | Fichiers */}
            <div className="flex gap-1 glass-sm p-1 rounded-xl mb-4">
              <button
                onClick={() => setStartTab('chapitres')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  startTab === 'chapitres' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlignLeft size={14} /> {t('coursePlayer.chapters')}
              </button>
              <button
                onClick={() => setStartTab('fichiers')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  startTab === 'fichiers' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Download size={14} /> {t('coursePlayer.files')}
              </button>
            </div>

            {startTab === 'chapitres' ? (
            <div className="text-left">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <AlignLeft size={16} className="text-primary" />
                {t('coursePlayer.choose_chapter')}
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {course.chapitres && course.chapitres.length > 0 ? (
                  course.chapitres.map((chap, idx) => (
                    <motion.div
                      key={chap.id}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      className="glass-sm p-4 rounded-xl border border-white/10 hover:border-primary/50 cursor-pointer flex justify-between items-center gap-3 transition-all"
                      onClick={() => handleStartChapter(chap)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-primary/15 text-primary text-xs font-black flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{chap.titre}</p>
                          {chap.description && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{chap.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-slate-500">
                          {chap.lecons ? `${chap.lecons.length} ${t('coursePlayer.lesson', { count: chap.lecons.length })}` : ''}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Play size={14} className="text-primary" fill="currentColor" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-500">
                    <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm italic">{t('coursePlayer.no_chapters')}</p>
                  </div>
                )}
              </div>
            </div>
            ) : (
            <div className="text-left">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <Download size={16} className="text-primary" />
                {t('coursePlayer.downloadable_files')}
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {(() => {
                  const allFiles = (course.chapitres || []).flatMap(chap =>
                    (chap.lecons || []).flatMap(l => (l.fichiers || []).map(f => ({ ...f, chapTitre: chap.titre })))
                  );
                  return allFiles.length > 0 ? allFiles.map((file) => (
                    <FileItem key={file.id} file={file} courseId={course.id} onView={handleViewFile} />
                  )) : (
                    <div className="text-center py-10 text-slate-500">
                      <Download size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm italic">{t('coursePlayer.no_files')}</p>
                    </div>
                  );
                })()}
              </div>
            </div>
            )}
            <p className="text-xs text-slate-600 text-center">
              {t('coursePlayer.fullscreen_hint')}
            </p>
          </motion.div>
        </div>
      ) : (
        /* ── Interface de cours ──────────────────────────────────── */
        <div className={`flex-1 flex overflow-hidden ${mode === 'split' ? 'flex-row' : 'flex-col'}`}>

          {/* ── Volet vidéo ─────────────────────────────────────── */}
          {(mode === 'video' || mode === 'split') && (
            <div className={`bg-black flex items-center justify-center ${
              mode === 'split' ? 'w-1/2 border-r border-white/10' : 'flex-1'
            }`}>
              {(() => {
                const activeLesson = activeChapter?.lecons?.[0];
                const videoUrl = activeLesson?.video_url_display || activeLesson?.video_url;
                if (!videoUrl) {
                  return (
                    <div className="text-center text-slate-600 space-y-3 p-8">
                      <Video size={48} className="mx-auto opacity-40" />
                      <p className="text-sm">{t('coursePlayer.no_video')}</p>
                    </div>
                  );
                }
                const embedUrl = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
                  ? `https://www.youtube.com/embed/${videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)[1]}`
                  : videoUrl.match(/vimeo\.com\/(\d+)/)
                    ? `https://player.vimeo.com/video/${videoUrl.match(/vimeo\.com\/(\d+)/)[1]}`
                    : null;
                return embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={activeLesson?.titre || 'Video'}
                  />
                ) : (
                  <video controls className="w-full h-full" src={videoUrl} />
                );
              })()}
            </div>
          )}

          {/* ── Volet leçon ─────────────────────────────────────── */}
          {(mode === 'lesson' || mode === 'split') && (
            <div className={`flex flex-1 flex-col overflow-hidden p-6`}>
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold">{activeChapter?.titre}</h2>
                 <button 
                   onClick={() => {
                     if (validationQuestion && validationQuestion.id !== 'fallback') {
                       setMode('exercise');
                     } else {
                       handleValidateExercise(true); // Auto validation
                     }
                   }}
                   className="btn-metal px-4 py-2 text-sm flex items-center gap-2"
                 >
                   {t('coursePlayer.finish_validate')}
                 </button>
              </div>
              <div 
                className="flex-1 overflow-y-auto custom-scrollbar select-none"
                onContextMenu={e => e.preventDefault()}
              >
                {activeChapter?.lecons && activeChapter.lecons.length > 0 ? activeChapter.lecons.map((lecon, idx) => (
                  <div key={idx} className="mb-8">
                     <h3 className="text-xl font-bold mb-3 text-secondary">{lecon.titre}</h3>
                     <div
                        className="prose prose-invert prose-sm max-w-none text-slate-300 space-y-4"
                        style={{ lineHeight: '1.8', userSelect: 'none', WebkitUserSelect: 'none' }}
                        dangerouslySetInnerHTML={{ __html: lecon.content_html || `<p>${t('coursePlayer.content_unavailable')}</p>` }}
                     />
                  </div>
                )) : (
                  <p>{t('coursePlayer.no_lesson')}</p>
                )}
              </div>
            </div>
          )}

          {/* ── Volet Lecteur PDF ───────────────────────────────── */}
          {mode === 'viewer' && currentFile && (
            <div className="flex-1 flex flex-col relative" onContextMenu={e => e.preventDefault()} style={{ background: 'var(--bg-app)' }}>
              <div className="p-3 bg-black/40 border-b border-white/10 flex justify-between items-center z-10">
                <span className="text-sm font-bold flex items-center gap-2">
                  <FileText size={16} className="text-primary"/> {currentFile.nom}
                </span>
                <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                  {t('coursePlayer.read_only_badge')}
                </span>
              </div>
              <div className="flex-1 relative">
                {/* Couche transparente pour bloquer le clic droit sur l'iframe */}
                <div className="absolute inset-0 z-10 bg-transparent" onContextMenu={e => e.preventDefault()} />
                <iframe 
                  src={`${currentFile.url}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full pointer-events-auto"
                  title={currentFile.nom}
                  style={{ border: 'none' }}
                />
              </div>
            </div>
          )}

          {/* ── Volet Exercice de validation ─────────────────────── */}
          {mode === 'exercise' && (
            <div className="flex-1 flex items-center justify-center p-6" style={{ background: 'var(--bg-app)' }}>
              <div className="glass p-8 rounded-3xl max-w-2xl w-full text-center space-y-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PenTool size={32} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{t('coursePlayer.validation_exercise')}{activeChapter?.titre}</h3>
                <p className="text-slate-400">
                  {t('coursePlayer.validation_instruction')}
                  {t('coursePlayer.validation_fullscreen_warning')}
                </p>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-left space-y-4">
                  <p className="font-semibold text-lg">{t('coursePlayer.question_label')}{validationQuestion?.texte}</p>
                  <div className="space-y-2">
                    {(validationQuestion?.options || []).map(opt => (
                      <button key={opt} onClick={() => handleValidateExercise(opt === validationQuestion.reponse_correcte)}
                        className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Volet Validation Réussie ─────────────────────────── */}
          {mode === 'exercise_done' && (
            <div className="flex-1 flex items-center justify-center p-6" style={{ background: 'var(--bg-app)' }}>
              <div className="glass p-8 rounded-3xl max-w-xl w-full text-center space-y-6 border border-emerald-500/30">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-3xl font-bold text-emerald-400">{t('coursePlayer.chapter_validated')}</h3>
                <p className="text-slate-300">
                  {t('coursePlayer.validation_success')}
                </p>
                <button onClick={() => navigate('/courses')} className="btn-metal px-6 py-3">
                  {t('coursePlayer.back_to_catalog')}
                </button>
              </div>
            </div>
          )}

          {/* ── Sidebar Coulissante (Notes & Ressources) ────────────────── */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.aside
                initial={{ x: 400 }}
                animate={{ x: 0 }}
                exit={{ x: 400 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-16 bottom-0 w-80 z-30 glass border-l border-white/10 flex flex-col"
                style={{ backdropFilter: 'blur(30px) saturate(180%)' }}
              >
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <StickyNote size={16} className="text-primary" /> {t('coursePlayer.notes_resources')}
                  </h4>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition">
                    <X size={14} className="text-slate-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                  {/* Section Notes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-500 uppercase tracking-widest font-bold">{t('coursePlayer.my_notes')}</label>
                      <button 
                        onClick={handleSaveNote}
                        disabled={isSaving}
                        className={`text-[10px] px-2 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                          isSaving ? 'bg-emerald-500 text-white' : 'bg-primary/20 text-primary hover:bg-primary/30'
                        }`}
                      >
                        {isSaving ? <><Save size={10} /> {t('coursePlayer.saved')}</> : <><Save size={10} /> {t('coursePlayer.save')}</>}
                      </button>
                    </div>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder={t('coursePlayer.notes_placeholder')}
                      className="w-full h-64 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-primary/50 transition-all resize-none custom-scrollbar"
                    />
                  </div>

                  {/* Section Ressources */}
                  <div className="space-y-3">
                    <label className="text-xs text-slate-500 uppercase tracking-widest font-bold">{t('coursePlayer.course_files')}</label>
                    <div className="space-y-2">
                      {(activeChapter?.lecons || []).flatMap(l => l.fichiers || []).map(f => (
                        <FileItem key={f.id} file={f} courseId={id} onView={handleViewFile} />
                      ))}
                      {(!activeChapter || activeChapter.lecons?.length === 0) && (
                        <p className="text-xs text-slate-600 text-center py-4 italic">{t('coursePlayer.no_resources')}</p>
                      )}
                    </div>
                  </div>

                  {/* Contrôles chrono */}
                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <label className="text-xs text-slate-500 uppercase tracking-widest font-bold">{t('coursePlayer.my_session')}</label>
                    <TimerBadge formatted={timer.formatted} running={timer.running} />
                    <button onClick={handlePauseResume}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        timer.running
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                      }`}>
                      {timer.running ? <><Pause size={14} /> {t('coursePlayer.pause_session')}</> : <><Play size={14} /> {t('coursePlayer.resume_session')}</>}
                    </button>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
