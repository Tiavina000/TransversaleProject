import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamSecurity } from '../../hooks/useExamSecurity';
import { useSurveillance } from '../../hooks/useSurveillance';
import { AttentionIndicator } from '../UI/AttentionIndicator';
import { VoiceInput } from '../UI/VoiceInput';
import { examAPI } from '../../services/api';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export function ExamMode({ exam, onFinish }) {
  const { t }    = useTranslation();
  const examId   = exam?.id;
  const navigate = useNavigate();
  const total    = exam?.duree_minutes * 60 || 3600;

  const [started, setStarted]       = useState(false);
  const [answers, setAnswers]       = useState({});
  const [currentQ, setCurrentQ]     = useState(0);
  const [remaining, setRemaining]   = useState(total);
  const [isFocused, setIsFocused]   = useState(true);
  const [alert, setAlert]           = useState('');
  const [submitted, setSubmitted]   = useState(false);
  const timerRef                    = useRef(null);
  const syncRef                     = useRef(null);
  const submitRef                   = useRef(null);

  const handleSubmit = useCallback(async () => {
    clearInterval(timerRef.current);
    clearInterval(syncRef.current);
    try {
      const reponses = Object.entries(answers).map(([qId, val]) => ({
        question_id: parseInt(qId),
        reponse: val,
      }));
      await examAPI.submit(examId, { reponses });
    } catch { /* silencieux */ }
    setSubmitted(true);
    onFinish?.();
  }, [examId, answers, onFinish]);

  submitRef.current = handleSubmit;

  const onEscape = useCallback(() => {
    setAlert(t('exam.leave_warning'));
    setTimeout(() => setAlert(''), 4000);
  }, [t]);
  useExamSecurity(started, onEscape);

  useEffect(() => {
    if (!started) return;
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      setAlert(t('exam.leave_warning'));
      setTimeout(() => setAlert(''), 4000);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [started, t]);

  const onAlert = useCallback((msg) => {
    setIsFocused(false);
    setAlert(msg);
    setTimeout(() => { setIsFocused(true); setAlert(''); }, 4000);
  }, []);
  useSurveillance(started ? examId : null, onAlert);

  // ── Timer local (setTimeout chaine) ────────────────────────────────────
  useEffect(() => {
    if (!started || submitted) return;
    let id;
    const tick = () => {
      setRemaining((r) => r - 1);
      id = setTimeout(tick, 1000);
    };
    id = setTimeout(tick, 1000);
    return () => clearTimeout(id);
  }, [started, submitted]);

  // ── Auto-submit quand remaining arrive à 0 ─────────────────────────────
  useEffect(() => {
    if (!started || submitted || remaining > 0) return;
    submitRef.current();
  }, [started, submitted, remaining]);

  // ── Synchronisation du timer avec le backend ────────────────────────────
  useEffect(() => {
    if (!started || !examId) return;
    const doSync = async () => {
      try {
        const res = await examAPI.syncTimer(examId);
        if (res.data?.remaining_seconds !== undefined) setRemaining(res.data.remaining_seconds);
      } catch { /* silencieux */ }
    };
    doSync();
    syncRef.current = setInterval(doSync, 30000);
    return () => clearInterval(syncRef.current);
  }, [started, examId]);

  const handleAnswer = (qId, value) => setAnswers((a) => ({ ...a, [qId]: value }));

  const questions = exam?.questions || [];
  const question  = questions[currentQ];
  const mins      = Math.floor(remaining / 60);
  const secs      = remaining % 60;
  const progress  = remaining / total;
  const color     = progress > 0.3 ? '#7C3AED' : progress > 0.1 ? '#F59E0B' : '#EF4444';

  const trySubmit = () => {
    setAlert(t('exam.finish_confirm'));
  };
  const confirmSubmit = () => {
    setAlert('');
    handleSubmit();
  };
  const cancelSubmit = () => {
    setAlert('');
    try { if (!document.fullscreenElement) document.documentElement.requestFullscreen({ navigationUI: 'hide' }); } catch {}
  };

  if (!started) {
    return (
      <div className="min-h-screen exam-mode-bg flex items-center justify-center p-4">
        <motion.div
          className="glass neon-border max-w-md w-full p-8 text-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-5xl">📝</div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{exam?.titre}</h2>
          <p className="text-slate-400 text-sm">{t('exam.leave_warning')}</p>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
            <div className="glass-sm p-3 rounded-xl">
              <p className="text-xs text-slate-500 mb-1">{t('exam.duration')}</p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{exam?.duree_minutes} {t('common.minutes')}</p>
            </div>
            <div className="glass-sm p-3 rounded-xl">
              <p className="text-xs text-slate-500 mb-1">{t('exam.questions_count')}</p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{questions.length}</p>
            </div>
          </div>
          <button className="btn-metal w-full py-3" onClick={async (e) => {
            try { await document.documentElement.requestFullscreen({ navigationUI: 'hide' }); } catch {}
            try { await examAPI.start(examId); } catch { /* already started */ }
            setStarted(true);
          }}>
            {t('exam.start')}
          </button>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen exam-mode-bg flex items-center justify-center p-4">
        <motion.div
          className="glass max-w-sm w-full p-8 text-center space-y-4"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
        >
          <CheckCircle size={64} className="text-green-400 mx-auto" />
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('exam.exam_submitted')}</h2>
          <p className="text-slate-400 text-sm">{t('exam.answers_saved')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen exam-mode-bg flex flex-col">
      <div className="glass border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AttentionIndicator isFocused={isFocused} />
          <h2 className="font-semibold text-sm hidden sm:block" style={{ color: 'var(--text-primary)' }}>{exam?.titre}</h2>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-2xl font-bold font-mono" style={{ color }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </p>
          <p className="text-xs text-slate-400">{t('exam.time_left')}</p>
        </div>
        <button className="btn-ghost text-xs" onClick={trySubmit}>
          {t('exam.submit')}
        </button>
      </div>

      <AnimatePresence>
        {alert && (
          <motion.div
            className="flex items-center gap-2 px-6 py-2 text-sm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: alert === t('exam.finish_confirm') ? 'rgba(124,58,237,0.15)' : 'rgba(245,158,11,0.15)',
              borderColor: alert === t('exam.finish_confirm') ? 'rgba(124,58,237,0.4)' : 'rgba(245,158,11,0.4)',
              color: alert === t('exam.finish_confirm') ? '#c4b5fd' : '#fcd34d',
              borderWidth: 1,
              borderStyle: 'solid',
            }}
          >
            <AlertTriangle size={14} />
            <span className="flex-1">{alert}</span>
            {alert === t('exam.finish_confirm') && (
              <div className="flex gap-2">
                <button className="btn-metal text-xs px-3 py-1" onClick={confirmSubmit}>Oui</button>
                <button className="btn-ghost text-xs px-3 py-1" onClick={cancelSubmit}>Non</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-6">
          <div className="flex gap-1 flex-wrap">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                  i === currentQ ? 'btn-metal' :
                  answers[questions[i]?.id] ? 'bg-green-500/20 border border-green-500/40 text-green-300' :
                  'btn-ghost'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {question && (
            <motion.div
              key={currentQ}
              className="glass neon-border p-6 space-y-4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-400">{t('exam.question')} {currentQ + 1}/{questions.length}</span>
                <span className="text-xs text-primary">{question.points} pts</span>
              </div>
              <p className="font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>{question.texte}</p>

              {question.type_question === 'QCM' && (
                <div className="space-y-2">
                  {question.options?.map((opt, i) => (
                    <label key={i} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                      answers[question.id] === opt
                        ? 'border-primary bg-primary/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                    }`}>
                      <input
                        type="radio"
                        name={`q-${question.id}`}
                        className="sr-only"
                        checked={answers[question.id] === opt}
                        onChange={() => handleAnswer(question.id, opt)}
                      />
                      <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        answers[question.id] === opt ? 'border-primary bg-primary' : 'border-slate-500'
                      }`}>
                        {answers[question.id] === opt && <span className="w-2 h-2 rounded-full bg-white" />}
                      </span>
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {(question.type_question === 'TEXTE' || question.type_question === 'NUMERIQUE') && (
                <div className="relative">
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    rows={4}
                    className="w-full glass-sm bg-white p-3 pr-12 text-sm text-gray-900 rounded-xl resize-none focus:outline-none border border-gray-300 focus:border-primary/50 transition"
                    placeholder={t('exam.answer_placeholder')}
                  />
                  <div className="absolute bottom-3 right-3">
                    <VoiceInput onResult={(txt) => handleAnswer(question.id, txt)} />
                  </div>
                </div>
              )}

              {question.type_question === 'VRAI_FAUX' && (
                <div className="flex gap-3">
                  {['Vrai', 'Faux'].map((v) => (
                    <button
                      key={v}
                      onClick={() => handleAnswer(question.id, v)}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                        answers[question.id] === v
                          ? v === 'Vrai' ? 'bg-green-500/30 border border-green-500 text-green-300' : 'bg-red-500/30 border border-red-500 text-red-300'
                          : 'btn-ghost'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}

              {question.type_question === 'REDACTION' && (
                <div className="relative">
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    rows={8}
                    className="w-full glass-sm bg-white p-3 pr-12 text-sm text-gray-900 rounded-xl resize-none focus:outline-none border border-gray-300 focus:border-primary/50 transition"
                    placeholder={t('exam.answer_placeholder')}
                  />
                  <div className="absolute bottom-3 right-3">
                    <VoiceInput onResult={(txt) => handleAnswer(question.id, txt)} />
                  </div>
                  {answers[question.id] && (
                    <div className="flex justify-end mt-1 gap-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      <span>{answers[question.id].trim() ? answers[question.id].trim().split(/\s+/).length : 0} mots</span>
                      {question.mot_min > 0 && <span>min: {question.mot_min}</span>}
                      {question.mot_max > 0 && <span>max: {question.mot_max}</span>}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          <div className="flex justify-between gap-3">
            <button className="btn-ghost flex-1" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>
              {t('exam.previous')}
            </button>
            <button className="btn-metal flex-1" onClick={() => {
              if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
              else trySubmit();
            }}>
              {currentQ < questions.length - 1 ? t('exam.next') : t('exam.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExamView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await examAPI.detail(id);
        if (res.data?.soumis) {
          setError("Vous avez déjà soumis cet examen.");
        } else {
          setExam(res.data);
        }
      } catch (err) {
        setError("Impossible de charger l'examen.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen exam-mode-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen exam-mode-bg flex items-center justify-center p-4">
        <div className="glass max-w-sm w-full p-8 text-center space-y-4">
          <AlertTriangle size={48} className="text-red-400 mx-auto" />
          <p className="text-white font-semibold">{error || "Examen introuvable"}</p>
          <button className="btn-metal w-full py-2" onClick={() => navigate('/exams')}>
            Retour aux examens
          </button>
        </div>
      </div>
    );
  }

  return <ExamMode exam={exam} onFinish={() => navigate('/exams', { replace: true })} />;
}
