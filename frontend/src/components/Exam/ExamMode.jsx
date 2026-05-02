import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useExamSecurity } from '../../hooks/useExamSecurity';
import { useSurveillance } from '../../hooks/useSurveillance';
import { AttentionIndicator } from '../UI/AttentionIndicator';
import { VoiceInput } from '../UI/VoiceInput';
import { examAPI } from '../../services/api';
import { CheckCircle, AlertTriangle } from 'lucide-react';

/**
 * DynamicTimer — Cercle SVG de compte à rebours.
 * Change de couleur (primaire → orange → rouge) à l'approche de la fin.
 */
function DynamicTimer({ totalSeconds, remainingSeconds }) {
  const { t } = useTranslation();
  const radius    = 44;
  const stroke    = 5;
  const circ      = 2 * Math.PI * radius;
  const progress  = remainingSeconds / totalSeconds;
  const dashoffset = circ * (1 - progress);

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;

  const color =
    progress > 0.3 ? '#7C3AED' :
    progress > 0.1 ? '#F59E0B' : '#EF4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="110" height="110" className="rotate-[-90deg]">
        <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <motion.circle
          cx="55" cy="55" r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          animate={{ strokeDashoffset: dashoffset, stroke: color }}
          transition={{ duration: 0.8 }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="text-center -mt-20">
        <p className="text-2xl font-bold font-mono" style={{ color }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </p>
        <p className="text-xs text-slate-400">{t('exam.time_left')}</p>
      </div>
    </div>
  );
}

/**
 * ExamMode — Module e-Exam High-Security.
 * Active le plein écran, bloque les actions de triche,
 * surveille l'attention et synchronise le timer avec le backend.
 */
export function ExamMode({ exam, onFinish }) {
  const { t }    = useTranslation();
  const examId   = exam?.id;

  const [started, setStarted]       = useState(false);
  const [answers, setAnswers]       = useState({});
  const [currentQ, setCurrentQ]     = useState(0);
  const [remaining, setRemaining]   = useState(exam?.duree_minutes * 60 || 3600);
  const [isFocused, setIsFocused]   = useState(true);
  const [alert, setAlert]           = useState('');
  const [submitted, setSubmitted]   = useState(false);
  const timerRef                    = useRef(null);
  const syncRef                     = useRef(null);

  // ── Sécurité ──────────────────────────────────────────────────────────────
  useExamSecurity(started, () => {
    setAlert(t('exam.leave_warning'));
    setTimeout(() => setAlert(''), 4000);
  });

  // ── Surveillance ──────────────────────────────────────────────────────────
  useSurveillance(started ? examId : null, (msg) => {
    setIsFocused(false);
    setAlert(msg);
    setTimeout(() => { setIsFocused(true); setAlert(''); }, 4000);
  });

  // ── Timer local ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!started || submitted) return;
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, submitted]);

  // ── Synchronisation du timer avec le backend toutes les 30s ──────────────
  useEffect(() => {
    if (!started || !examId) return;
    syncRef.current = setInterval(async () => {
      try {
        const res = await examAPI.syncTimer(examId);
        if (res.data?.remaining_seconds) setRemaining(res.data.remaining_seconds);
      } catch {}
    }, 30000);
    return () => clearInterval(syncRef.current);
  }, [started, examId]);

  const handleAnswer = (qId, value) => setAnswers((a) => ({ ...a, [qId]: value }));

  const handleSubmit = useCallback(async () => {
    clearInterval(timerRef.current);
    clearInterval(syncRef.current);
    try {
      await examAPI.submit(examId, { reponses: answers });
    } catch {}
    setSubmitted(true);
    onFinish?.();
  }, [examId, answers, onFinish]);

  const questions = exam?.questions || [];
  const question  = questions[currentQ];

  // ── Confirmation démarrage ────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen exam-mode-bg flex items-center justify-center p-4">
        <motion.div
          className="glass neon-border max-w-md w-full p-8 text-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-5xl">📝</div>
          <h2 className="text-2xl font-bold text-white">{exam?.titre}</h2>
          <p className="text-slate-400 text-sm">{t('exam.leave_warning')}</p>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
            <div className="glass-sm p-3 rounded-xl">
              <p className="text-xs text-slate-500 mb-1">Durée</p>
              <p className="font-semibold text-white">{exam?.duree_minutes} {t('common.minutes')}</p>
            </div>
            <div className="glass-sm p-3 rounded-xl">
              <p className="text-xs text-slate-500 mb-1">Questions</p>
              <p className="font-semibold text-white">{questions.length}</p>
            </div>
          </div>
          <button className="btn-metal w-full py-3" onClick={() => setStarted(true)}>
            {t('exam.start')}
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Exam terminé ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen exam-mode-bg flex items-center justify-center p-4">
        <motion.div
          className="glass max-w-sm w-full p-8 text-center space-y-4"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
        >
          <CheckCircle size={64} className="text-green-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Examen soumis !</h2>
          <p className="text-slate-400 text-sm">Vos réponses ont été enregistrées.</p>
        </motion.div>
      </div>
    );
  }

  // ── Interface d'examen ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen exam-mode-bg flex flex-col">
      {/* Header */}
      <div className="glass border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AttentionIndicator isFocused={isFocused} />
          <h2 className="text-white font-semibold text-sm hidden sm:block">{exam?.titre}</h2>
        </div>
        <DynamicTimer totalSeconds={exam?.duree_minutes * 60 || 3600} remainingSeconds={remaining} />
        <button className="btn-ghost text-xs" onClick={() => {
          if (window.confirm(t('exam.finish_confirm'))) handleSubmit();
        }}>
          {t('exam.submit')}
        </button>
      </div>

      {/* Alert banner */}
      <AnimatePresence>
        {alert && (
          <motion.div
            className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 text-orange-300 px-6 py-2 text-sm"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <AlertTriangle size={14} /> {alert}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-6">
          {/* Progress pills */}
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
              <p className="text-white font-medium leading-relaxed">{question.texte}</p>

              {/* QCM */}
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

              {/* TEXTE */}
              {(question.type_question === 'TEXTE' || question.type_question === 'NUMERIQUE') && (
                <div className="relative">
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    rows={4}
                    className="w-full glass-sm bg-transparent p-3 pr-12 text-sm text-white rounded-xl resize-none focus:outline-none border border-white/10 focus:border-primary/50 transition"
                    placeholder="Votre réponse..."
                  />
                  <div className="absolute bottom-3 right-3">
                    <VoiceInput onResult={(txt) => handleAnswer(question.id, txt)} />
                  </div>
                </div>
              )}

              {/* VRAI / FAUX */}
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
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between gap-3">
            <button className="btn-ghost flex-1" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>
              ← Précédent
            </button>
            <button className="btn-metal flex-1" onClick={() => {
              if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
              else if (window.confirm(t('exam.finish_confirm'))) handleSubmit();
            }}>
              {currentQ < questions.length - 1 ? 'Suivant →' : t('exam.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
