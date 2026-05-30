import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertTriangle, Loader2, Play, Plus, Save, X, Edit3, Trash2, Eye, EyeOff, ChevronDown, ChevronRight, HelpCircle, ListChecks, GripVertical } from 'lucide-react';
import { examAPI, courseAPI } from '../services/api';

function ExamForm({ exam, onSaved, onCancel, matieresEnseigneesIds }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    titre: exam?.titre || '',
    matiere: exam?.matiere || (matieresEnseigneesIds?.[0]?.toString() || ''),
    niveau: exam?.niveau || '',
    duree_minutes: exam?.duree_minutes || 30,
    date_debut: exam?.date_debut ? exam.date_debut.slice(0, 16) : '',
    date_fin: exam?.date_fin ? exam.date_fin.slice(0, 16) : '',
    coefficient: exam?.coefficient || 1,
    type_examen: exam?.type_examen || 'MIXTE',
    session: exam?.session || 'EF',
    est_publie: exam?.est_publie || false,
  });
  const [matieres, setMatieres] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMatieres = async () => {
      try {
        const res = await courseAPI.matieres();
        const allMatieres = res.data?.results || res.data || [];
        if (matieresEnseigneesIds?.length > 0) {
          setMatieres(allMatieres.filter((m) => matieresEnseigneesIds.includes(m.id)));
        } else {
          setMatieres(allMatieres);
        }
      } catch (e) { console.error(e); }
    };
    loadMatieres();
  }, [matieresEnseigneesIds]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titre.trim() || !form.matiere) {
      setError(t('exams.fill_required'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        matiere: parseInt(form.matiere) || undefined,
        niveau: parseInt(form.niveau) || undefined,
        date_debut: form.date_debut || undefined,
        date_fin: form.date_fin || undefined,
      };
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
      if (exam) {
        await examAPI.update(exam.id, payload);
      } else {
        await examAPI.create(payload);
      }
      onSaved();
    } catch (err) {
      console.error('Exam save error:', err.response?.data);
      setError(err.response?.data?.detail || t('exams.save_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-xl" style={{ background: 'var(--overlay-light)' }}>
      <div className="space-y-1">
        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {t('exams.title_label', 'Titre de l\'examen')}
        </label>
        <input
          className="w-full px-3 py-2 rounded-lg text-sm border"
          style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
          placeholder={t('exams.title_placeholder', 'Ex: Contrôle continue n°1')}
          value={form.titre}
          onChange={(e) => setForm({ ...form, titre: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {t('exams.subject_label', 'Matière')}
          </label>
          <select
            className="w-full px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            value={form.matiere}
            onChange={(e) => setForm({ ...form, matiere: e.target.value })}
            required
          >
            {matieres.map((m) => (
              <option key={m.id} value={m.id} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>{m.nom}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {t('exams.duration_label', 'Durée (minutes)')}
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            placeholder="30"
            value={form.duree_minutes}
            onChange={(e) => setForm({ ...form, duree_minutes: parseInt(e.target.value) || 30 })}
            min={1}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {t('exams.start_date_label', 'Date de début')}
          </label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            value={form.date_debut}
            onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {t('exams.end_date_label', 'Date de fin')}
          </label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            value={form.date_fin}
            onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {t('exams.coefficient_label', 'Coefficient')}
          </label>
          <input
            type="number"
            step="0.5"
            className="w-full px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            placeholder="1.0"
            value={form.coefficient}
            onChange={(e) => setForm({ ...form, coefficient: parseFloat(e.target.value) || 1 })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {t('exams.session_label', 'Session')}
          </label>
          <select
            className="w-full px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            value={form.session}
            onChange={(e) => setForm({ ...form, session: e.target.value })}
          >
            <option value="CC" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Contrôle Continue</option>
            <option value="EF" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Examen Final</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {t('exams.type_label', 'Type')}
          </label>
          <select
            className="w-full px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            value={form.type_examen}
            onChange={(e) => setForm({ ...form, type_examen: e.target.value })}
          >
            <option value="MIXTE" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Mixte</option>
            <option value="QCM" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>QCM</option>
            <option value="TEXTE" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Texte</option>
            <option value="REDACTION" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Rédaction</option>
          </select>
        </div>
        <div className="space-y-1 flex flex-col justify-end">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {t('exams.publish_label', 'Publication')}
          </label>
          <label className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
            <input
              type="checkbox"
              checked={form.est_publie}
              onChange={(e) => setForm({ ...form, est_publie: e.target.checked })}
            />
            {form.est_publie ? <Eye key="eye-pub" className="w-4 h-4 text-green-400" /> : <EyeOff key="eye-draft" className="w-4 h-4 text-slate-400" />}
            {form.est_publie ? t('exams.published', 'Publié') : t('exams.draft', 'Brouillon')}
          </label>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs btn-ghost">
          {t('common.cancel', 'Annuler')}
        </button>
        <button type="submit" disabled={saving} className="px-4 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: 'var(--color-primary)' }}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin inline" /> : <Save className="w-3 h-3 inline" />}
          {' '}{t('common.save', 'Enregistrer')}
        </button>
      </div>
    </form>
  );
}

export function ExamsPage({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isTeacher = user?.type_utilisateur === 'ENSEIGNANT';
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  const fetchExams = async () => {
    try {
      const res = await examAPI.list();
      setExams(res.data?.results || res.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch exams', err);
      setError(t('exams.loadError', 'Impossible de charger les examens.'));
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExams(); }, []);

  const handleDelete = async (exam) => {
    if (!window.confirm(t('exams.confirm_delete', 'Supprimer cet examen ?'))) return;
    try {
      await examAPI.delete(exam.id);
      fetchExams();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handlePublish = async (exam) => {
    try {
      await examAPI.publier(exam.id);
      fetchExams();
    } catch (err) {
      console.error('Publish error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (error && exams.length === 0) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-danger)' }} />
        <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {t('exams.title', 'Examens')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {isTeacher ? t('exams.teacher_subtitle', 'Gérez les examens de vos élèves') : t('exams.subtitle', 'Préparez-vous et testez vos connaissances')}
          </p>
        </div>
        {isTeacher && (
          <button
            onClick={() => { setEditingExam(null); setShowForm(!showForm); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            <Plus className="w-4 h-4" />
            {t('exams.create_exam', 'Créer un examen')}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
              {editingExam ? t('exams.edit_exam', 'Modifier l\'examen') : t('exams.new_exam', 'Nouvel examen')}
            </h3>
            <ExamForm
              exam={editingExam}
              onSaved={() => { setShowForm(false); setEditingExam(null); fetchExams(); }}
              onCancel={() => { setShowForm(false); setEditingExam(null); }}
              matieresEnseigneesIds={user?.matieres_enseignees_ids}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {exams.length === 0 && !showForm ? (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {isTeacher ? t('exams.noExamsTeacher', 'Aucun examen créé') : t('exams.noExams', 'Aucun examen disponible')}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isTeacher ? t('exams.noExamsTeacherDesc', 'Créez votre premier examen pour vos élèves.') : t('exams.noExamsDesc', 'Les examens apparaîtront ici quand ils seront publiés.')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {exams.map((exam, idx) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                idx={idx}
                isTeacher={isTeacher}
                onStart={() => navigate(`/exams/${exam.id}`)}
                onEdit={() => { setEditingExam(exam); setShowForm(true); }}
                onDelete={() => handleDelete(exam)}
                onPublish={() => handlePublish(exam)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function ExamCard({ exam, idx, isTeacher, onStart, onEdit, onDelete, onPublish }) {
  const { t } = useTranslation();

  const getStatusIcon = () => {
    if (exam.est_termine) return <CheckCircle key="status-done" className="w-5 h-5 text-green-400" />;
    if (exam.est_publie) return <Eye key="status-pub" className="w-5 h-5 text-green-400" />;
    return <FileText key="status-draft" className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />;
  };

  const getStatusLabel = () => {
    if (exam.est_publie) return t('exams.published');
    return t('exams.draft');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      layout
      className="glass rounded-xl p-5 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-lg" style={{ background: 'var(--overlay-light)' }}>
          <FileText className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: 'var(--overlay-light)', color: 'var(--color-primary)' }}>
          {getStatusIcon()}
          <span>{getStatusLabel()}</span>
        </div>
      </div>

      <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
        {exam.titre || 'Examen'}
      </h3>

      {exam.matiere && (
        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
          {typeof exam.matiere === 'object' ? exam.matiere.nom : exam.matiere}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
        {exam.duree_minutes && (
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {exam.duree_minutes} {t('exams.min_abbr')}
          </span>
        )}
        {exam.coefficient && (
          <span className="flex items-center gap-1">
            {t('exams.coeff', 'Coef')}: {exam.coefficient}
          </span>
        )}
      </div>

      {isTeacher ? (
        <div className="flex gap-2 mt-4">
          {!exam.est_publie && (
            <button
              onClick={(e) => { e.stopPropagation(); onPublish(); }}
              className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
              style={{ background: 'var(--color-primary)', color: '#fff' }}
            >
              <Eye className="w-3.5 h-3.5" />
              {t('exams.publish')}
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
            style={{ background: 'var(--overlay-light)', color: 'var(--text-primary)' }}
          >
            <Edit3 className="w-3.5 h-3.5" />
            {t('common.edit')}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
            style={{ background: 'var(--color-danger)15', color: 'var(--color-danger)' }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <motion.button
          className="mt-4 w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
          style={{ background: 'var(--color-primary)', color: '#fff' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => { e.stopPropagation(); onStart(); }}
        >
          <Play className="w-4 h-4" />
          {t('exams.start_button')}
        </motion.button>
      )}
      {isTeacher && (
        <QuestionManager examId={exam.id} />
      )}
    </motion.div>
  );
}

function QuestionForm({ question, onSaved, onCancel, nextOrdre = 1 }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    texte: question?.texte || '',
    type_question: question?.type_question || 'QCM',
    points: question?.points || 1,
    ordre: question?.ordre ?? nextOrdre,
    options: question?.options?.join('\n') || '',
    reponse_correcte: question?.reponse_correcte || '',
    mot_min: question?.mot_min || '',
    mot_max: question?.mot_max || '',
    obligatoire: question?.obligatoire ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.texte.trim()) { setError('Le texte de la question est requis.'); return; }
    if ((form.type_question === 'QCM' || form.type_question === 'VRAI_FAUX') && !form.reponse_correcte.trim()) {
      setError('La réponse correcte est requise pour ce type de question.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        texte: form.texte,
        type_question: form.type_question,
        points: parseInt(form.points) || 1,
        ordre: parseInt(form.ordre) || 1,
        obligatoire: form.obligatoire,
        reponse_correcte: form.reponse_correcte.trim(),
      };
      if (form.type_question === 'QCM') {
        payload.options = form.options.split('\n').map((o) => o.trim()).filter(Boolean);
      }
      if (form.type_question === 'VRAI_FAUX') {
        payload.options = ['Vrai', 'Faux'];
        payload.reponse_correcte = form.reponse_correcte.trim();
      }
      if (form.type_question === 'REDACTION') {
        payload.mot_min = parseInt(form.mot_min) || undefined;
        payload.mot_max = parseInt(form.mot_max) || undefined;
      }
      onSaved(payload, question?.id);
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <div className="space-y-1">
        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Question</label>
        <textarea
          className="w-full px-3 py-2 rounded-lg text-sm border min-h-[60px]"
          style={{ background: 'var(--overlay-light)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
          placeholder="Entrez le texte de la question"
          value={form.texte}
          onChange={(e) => setForm({ ...form, texte: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Type</label>
          <select
            className="w-full px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--overlay-light)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            value={form.type_question}
            onChange={(e) => {
              const newType = e.target.value;
              setForm((prev) => ({
                ...prev,
                type_question: newType,
                options: newType === 'VRAI_FAUX' ? 'Vrai, Faux' : prev.options,
                reponse_correcte: newType === 'VRAI_FAUX' ? '' : prev.reponse_correcte,
              }));
            }}
          >
            <option value="QCM">QCM</option>
            <option value="VRAI_FAUX">Vrai / Faux</option>
            <option value="TEXTE">Texte</option>
            <option value="NUMERIQUE">Numérique</option>
            <option value="REDACTION">Rédaction</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Points</label>
          <input type="number" className="w-full px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--overlay-light)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            value={form.points} min={0} step={0.5}
            onChange={(e) => setForm({ ...form, points: e.target.value })} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Ordre</label>
          <input type="number" className="w-full px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--overlay-light)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            value={form.ordre} min={1}
            onChange={(e) => setForm({ ...form, ordre: e.target.value })} />
        </div>
      </div>
      {form.type_question === 'QCM' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Options (une par ligne)
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 rounded-lg text-sm border resize-none"
              style={{ background: 'var(--overlay-light)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              placeholder="Option 1&#10;Option 2&#10;Option 3"
              value={form.options}
              onChange={(e) => {
                setForm({ ...form, options: e.target.value });
              }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Bonne réponse</label>
            <select
              className="w-full px-3 py-2 rounded-lg text-sm border"
              style={{ background: 'var(--overlay-light)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              value={form.reponse_correcte}
              onChange={(e) => setForm({ ...form, reponse_correcte: e.target.value })}
            >
              <option value="">Sélectionner...</option>
              {form.options.split('\n').map((o, i) => o.trim() ? (
                <option key={i} value={o.trim()} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  Option {i + 1} — {o.trim()}
                </option>
              ) : null)}
            </select>
          </div>
        </div>
      )}
      {form.type_question === 'VRAI_FAUX' && (
        <div className="w-full space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Réponse correcte</label>
          <select className="w-full px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--overlay-light)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            value={form.reponse_correcte}
            onChange={(e) => setForm({ ...form, reponse_correcte: e.target.value })}
          >
            <option value="">Sélectionner...</option>
            <option value="Vrai">Vrai</option>
            <option value="Faux">Faux</option>
          </select>
        </div>
      )}
      {form.type_question === 'REDACTION' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Mots minimum</label>
            <input type="number" className="w-full px-3 py-2 rounded-lg text-sm border"
              style={{ background: 'var(--overlay-light)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              value={form.mot_min}
              onChange={(e) => setForm({ ...form, mot_min: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Mots maximum</label>
            <input type="number" className="w-full px-3 py-2 rounded-lg text-sm border"
              style={{ background: 'var(--overlay-light)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              value={form.mot_max}
              onChange={(e) => setForm({ ...form, mot_max: e.target.value })} />
          </div>
        </div>
      )}
      <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
        <input type="checkbox" checked={form.obligatoire}
          onChange={(e) => setForm({ ...form, obligatoire: e.target.checked })} />
        Question obligatoire
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs btn-ghost">Annuler</button>
        <button type="submit" disabled={saving} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
          style={{ background: 'var(--color-primary)' }}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin inline" /> : <Save className="w-3 h-3 inline" />}
          {' '}{t('common.save', 'Enregistrer')}
        </button>
      </div>
    </form>
  );
}

function QuestionManager({ examId }) {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await examAPI.questions(examId);
      setQuestions(res.data || []);
    } catch (err) {
      console.error('Failed to load questions', err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQuestions(); }, [examId]);

  const handleSave = async (payload, editId) => {
    try {
      if (editId) {
        await examAPI.updateQuestion(editId, payload);
      } else {
        await examAPI.ajouterQuestion(examId, payload);
      }
      setShowForm(false);
      setEditingId(null);
      loadQuestions();
    } catch (err) {
      console.error('Failed to save question', err);
      console.error('Server response:', err.response?.data);
    }
  };

  const handleDelete = async (qId) => {
    if (!window.confirm('Supprimer cette question ?')) return;
    try {
      await examAPI.deleteQuestion(qId);
      loadQuestions();
    } catch (err) {
      console.error('Failed to delete question', err);
    }
  };

  const typeLabels = { QCM: 'QCM', VRAI_FAUX: 'V/F', TEXTE: 'Texte', NUMERIQUE: 'Numérique', REDACTION: 'Rédaction' };

  if (loading) {
    return <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--color-primary)' }} /></div>;
  }

  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
          <ListChecks className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          Questions ({questions.length})
        </h4>
        <button
          onClick={() => { setEditingId(null); setShowForm(!showForm); }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          <Plus className="w-3 h-3" /> Ajouter
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-3">
            <QuestionForm
              question={null}
              nextOrdre={(questions.length > 0 ? Math.max(...questions.map(q => q.ordre)) : 0) + 1}
              onSaved={(payload) => handleSave(payload, null)}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {questions.length === 0 && !showForm ? (
        <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
          Aucune question pour cet examen. Cliquez sur "Ajouter" pour commencer.
        </p>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <motion.div key={q.id} layout className="rounded-xl p-3" style={{ background: 'var(--overlay-light)' }}>
              {editingId === q.id ? (
                <QuestionForm
                  question={q}
                  onSaved={(payload) => handleSave(payload, q.id)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: 'var(--bg-card)' }}>
                    <HelpCircle className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{ background: '#7C3AED15', color: '#7C3AED' }}>
                        {typeLabels[q.type_question] || q.type_question}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {q.points} pt{q.points > 1 ? 's' : ''} · Ordre {q.ordre}
                      </span>
                      {q.obligatoire && (
                        <span className="text-xs text-red-400">· Obligatoire</span>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{q.texte}</p>
                    {q.options?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {q.options.map((opt, i) => (
                          <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${opt === q.reponse_correcte ? 'text-green-400 bg-green-500/10' : ''}`}
                            style={{ background: opt === q.reponse_correcte ? '' : 'var(--bg-card)', color: opt === q.reponse_correcte ? '' : 'var(--text-muted)' }}>
                            {opt} {opt === q.reponse_correcte && '✓'}
                          </span>
                        ))}
                      </div>
                    )}
                    {q.type_question === 'REDACTION' && (q.mot_min || q.mot_max) && (
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {q.mot_min && `Min: ${q.mot_min} mots`}{q.mot_min && q.mot_max && ' · '}{q.mot_max && `Max: ${q.mot_max} mots`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => setEditingId(q.id)}
                      className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(q.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10" style={{ color: 'var(--color-danger)' }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
