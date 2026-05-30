import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ClipboardCheck, FileText, CheckCircle, XCircle,
  AlertTriangle, Loader2, User, Star, ChevronDown, ChevronRight,
  ThumbsUp, ThumbsDown, ShieldCheck, Lock
} from 'lucide-react';
import { correctionAPI, copieAPI, reponseAPI } from '../services/api';

const TYPE_LABELS = { QCM: 'QCM', VRAI_FAUX: 'V/F', TEXTE: 'Texte', NUMERIQUE: 'Numérique', REDACTION: 'Rédaction' };

export function CorrectionsPage() {
  const { t } = useTranslation();
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('soumis');

  const fetch = useCallback(async (filter) => {
    setLoading(true);
    try {
      const f = filter || selectedFilter;
      const res = await correctionAPI.list({ statut: f });
      setCopies(res.data?.results || res.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch corrections', err);
      setError(t('common.error'));
      setCopies([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter, t]);
  useEffect(() => { const timer = setTimeout(fetch, 0); return () => clearTimeout(timer); }, [fetch]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {t('corrections.title', 'Corrections')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {t('corrections.subtitle', 'Évaluez les copies soumises par vos élèves')}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'soumis', label: t('corrections.submitted'), icon: FileText },
          { key: 'corrige', label: t('corrections.corrected'), icon: CheckCircle },
          { key: 'toutes', label: t('corrections.all_filters'), icon: ClipboardCheck },
        ].map((f) => (
          <motion.button
            key={f.key}
            onClick={() => setSelectedFilter(f.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedFilter === f.key ? 'text-white' : ''
            }`}
            style={{
              background: selectedFilter === f.key ? 'var(--color-primary)' : 'var(--overlay-light)',
              color: selectedFilter === f.key ? '#fff' : 'var(--text-secondary)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <f.icon className="w-4 h-4" />
            {f.label}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-danger)' }} />
          <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{error}</p>
        </div>
      ) : copies.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardCheck className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('corrections.noCopies', 'Aucune copie trouvée')}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('corrections.noCopiesDesc', 'Les copies soumises par les élèves apparaîtront ici.')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {copies.map((copie, idx) => (
              <CopieCard key={copie.id} copie={copie} idx={idx} onNoter={() => fetch()} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function CopieCard({ copie, idx, onNoter }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [autoSaved, setAutoSaved] = useState(false);
  const [validating, setValidating] = useState(false);

  const isValidee = copie.statut === 'valide' || detail?.note_validee;

  const eleveNom = copie.eleve
    ? (typeof copie.eleve === 'object' ? copie.eleve.nom || copie.eleve.username : copie.eleve)
    : copie.nom_eleve || 'Élève';

  const matiereNom = copie.matiere
    ? (typeof copie.matiere === 'object' ? copie.matiere.nom : copie.matiere)
    : copie.matiere_nom || 'Général';

  const loadDetail = async () => {
    if (detail) { setExpanded(!expanded); return; }
    setLoadingDetail(true);
    try {
      const res = await copieAPI.detail(copie.id);
      setDetail(res.data);
      setExpanded(true);
    } catch { /* ignore */ }
    finally { setLoadingDetail(false); }
  };

  const toggleReponse = async (repId, current) => {
    if (isValidee) return;
    setToggling(repId);
    const newVal = !current;
    try {
      await reponseAPI.update(repId, { est_correct: newVal });
      const updated = await new Promise(resolve => {
        setDetail(prev => {
          const reponses = prev.reponses.map(r =>
            r.id === repId ? { ...r, est_correct: newVal, points_obtenus: newVal ? r.question_points : 0 } : r
          );
          const next = { ...prev, reponses };
          resolve(next);
          return next;
        });
      });
      await recalcGrade(updated);
    } catch (err) {
      console.error('Failed to toggle response', err);
    } finally {
      setToggling(null);
    }
  };

  const saveScore = async (repId, score) => {
    if (isValidee) return;
    const scoreNum = parseFloat(score) || 0;
    const rep = detail?.reponses?.find(r => r.id === repId);
    if (!rep) return;
    const maxPts = rep.question_points || 0;
    const clamped = Math.min(Math.max(scoreNum, 0), maxPts);
    const estCorrect = clamped >= maxPts && maxPts > 0;
    try {
      await reponseAPI.update(repId, { points_obtenus: clamped, est_correct: estCorrect });
      const updated = await new Promise(resolve => {
        setDetail(prev => {
          const reponses = prev.reponses.map(r =>
            r.id === repId ? { ...r, points_obtenus: clamped, est_correct: estCorrect } : r
          );
          const next = { ...prev, reponses };
          resolve(next);
          return next;
        });
      });
      await recalcGrade(updated);
    } catch (err) {
      console.error('Failed to save score', err);
    }
  };

  const recalcGrade = async (updated) => {
    const pts = updated.reponses.reduce((s, r) => s + (r.points_obtenus || 0), 0);
    const max = updated.reponses.reduce((s, r) => s + (r.question_points || 0), 0);
    const grade = max > 0 ? Math.round((pts / max) * 20 * 100) / 100 : 0;
    try {
      await correctionAPI.noter(copie.id, grade);
      onNoter?.();
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 1500);
    } catch (err) {
      console.error('Failed to save grade', err);
    }
  };

  const handleValider = async () => {
    setValidating(true);
    try {
      await correctionAPI.valider(copie.id);
      setDetail(prev => ({ ...prev, note_validee: true }));
      onNoter?.();
    } catch (err) {
      console.error('Failed to validate', err);
    } finally {
      setValidating(false);
    }
  };

  const totalPoints = detail?.reponses?.reduce((s, r) => s + (r.points_obtenus || 0), 0) ?? 0;
  const totalMax = detail?.reponses?.reduce((s, r) => s + (r.question_points || 0), 0) ?? 0;

  const badgeColor = isValidee
    ? 'text-emerald-400 bg-emerald-500/10'
    : copie.statut === 'corrige'
    ? 'text-green-400 bg-green-500/10'
    : 'text-amber-400 bg-amber-500/10';

  const badgeLabel = isValidee
    ? t('corrections.validated_badge', 'Validée')
    : copie.statut === 'corrige'
    ? t('corrections.corrected_badge')
    : t('corrections.pending_badge');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      layout
      className="glass rounded-xl overflow-hidden"
    >
      {/* En-tête cliquable */}
      <div
        onClick={loadDetail}
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/[0.02] transition"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg" style={{ background: 'var(--overlay-light)' }}>
            <User className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{eleveNom}</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{matiereNom}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {detail && (
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {totalPoints}/{totalMax}
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full ${badgeColor}`}>
            {badgeLabel}
          </span>
          {loadingDetail ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--color-primary)' }} />
          ) : expanded ? (
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          ) : (
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          )}
        </div>
      </div>

      {/* Détail des réponses */}
      <AnimatePresence>
        {expanded && detail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t overflow-hidden" style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="p-5 space-y-4">
              {detail.reponses?.length === 0 && (
                <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                  {t('corrections.no_responses', 'Aucune réponse détaillée disponible.')}
                </p>
              )}
              {detail.reponses?.map((rep) => {
                const isAuto = rep.question_type === 'QCM' || rep.question_type === 'VRAI_FAUX';
                return (
                  <div
                    key={rep.id}
                    className="rounded-xl p-4"
                    style={{
                      background: rep.est_correct ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.04)',
                      border: `1px solid ${rep.est_correct ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)'}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider"
                            style={{ background: 'var(--overlay-light)', color: 'var(--text-muted)' }}
                          >
                            {rep.question_type ? (TYPE_LABELS[rep.question_type] || rep.question_type) : ''}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {rep.question_points ?? 0} pts
                          </span>
                        </div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {rep.question_texte}
                        </p>
                      </div>
                      {isAuto ? (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); toggleReponse(rep.id, rep.est_correct); }}
                          disabled={toggling === rep.id || isValidee}
                          className="flex-shrink-0 p-2 rounded-lg transition"
                          style={{
                            background: rep.est_correct ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)',
                            color: rep.est_correct ? 'rgb(34,197,94)' : 'rgb(239,68,68)',
                            opacity: isValidee ? 0.5 : 1,
                          }}
                          title={rep.est_correct ? t('corrections.mark_incorrect', 'Marquer incorrect') : t('corrections.mark_correct', 'Marquer correct')}
                        >
                          {toggling === rep.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isValidee ? (
                            <Lock className="w-4 h-4" />
                          ) : rep.est_correct ? (
                            <ThumbsUp className="w-4 h-4" />
                          ) : (
                            <ThumbsDown className="w-4 h-4" />
                          )}
                        </motion.button>
                      ) : null}
                    </div>
                    <div
                      className="rounded-lg px-3 py-2 text-sm mt-2"
                      style={{ background: 'var(--overlay-light)' }}
                    >
                      <span className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
                        {t('corrections.student_answer', 'Réponse de l\'élève')}
                      </span>
                      <p style={{ color: 'var(--text-primary)' }}>{rep.reponse_etudiant || '(vide)'}</p>
                    </div>
                    {!isAuto && (
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {t('corrections.score', 'Note')} :
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={rep.question_points || 0}
                            step={0.25}
                            value={rep.points_obtenus ?? 0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { e.stopPropagation(); saveScore(rep.id, e.target.value); }
                            }}
                            onChange={(e) => {
                              const val = Math.min(Math.max(parseFloat(e.target.value) || 0, 0), rep.question_points || 0);
                              setDetail(prev => ({
                                ...prev,
                                reponses: prev.reponses.map(r =>
                                  r.id === rep.id ? { ...r, points_obtenus: val, est_correct: val >= (r.question_points || 0) && (r.question_points || 0) > 0 } : r
                                )
                              }));
                            }}
                            disabled={isValidee}
                            className="w-20 px-2 py-1 rounded-lg text-sm border text-center"
                            style={{
                              background: isValidee ? 'var(--overlay-light)' : 'transparent',
                              color: 'var(--text-primary)',
                              borderColor: isValidee ? 'var(--border-color)' : 'var(--color-primary)',
                              opacity: isValidee ? 0.5 : 1,
                            }}
                          />
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            / {rep.question_points ?? 0}
                          </span>
                          {!isValidee && (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.stopPropagation(); saveScore(rep.id, rep.points_obtenus); }}
                              disabled={toggling === rep.id}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition"
                              style={{
                                background: rep.est_correct ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                color: rep.est_correct ? 'rgb(34,197,94)' : 'rgb(239,68,68)',
                              }}
                            >
                              {toggling === rep.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                              {t('common.save', 'Appliquer')}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Barre de note + Finaliser */}
            <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: 'var(--border-color)', background: 'var(--overlay-light)' }}>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                <Star className="w-4 h-4" />
                {t('corrections.total', 'Total')} : {totalPoints}/{totalMax}
              </div>
              <div className="flex items-center gap-3">
                {totalMax > 0 && (
                  <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {Math.round((totalPoints / totalMax) * 20 * 100) / 100}/20
                  </span>
                )}
                {isValidee ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    {t('corrections.validated', 'Validée')}
                  </span>
                ) : (
                  <motion.button
                    onClick={handleValider}
                    disabled={validating || !totalMax}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-40"
                    style={{ background: 'var(--color-primary)' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {validating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    {t('corrections.finalize', 'Finaliser')}
                  </motion.button>
                )}
                {autoSaved && !isValidee && (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {t('corrections.saved', 'Enregistré')}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
