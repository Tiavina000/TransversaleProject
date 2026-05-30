import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BookOpen, Plus, ChevronDown, ChevronRight, FileText, Upload,
  Trash2, Loader2, Save, Video, File as FileIcon, CheckSquare, Edit3
} from 'lucide-react';
import { teacherCourseAPI, courseAPI, visioAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { RichTextEditor } from './RichTextEditor';

function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-6 max-w-sm mx-4 w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium btn-ghost">
            {t('common.cancel')}
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'var(--color-danger)' }}>
            {t('teacherCourseManager.confirm_confirm')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function FileUpload({ leconId, leconTitre, onUploaded }) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('fichier', file);
      fd.append('lecon_id', leconId);
      fd.append('titre', file.name);
      await teacherCourseAPI.uploadFile(fd);
      if (onUploaded) onUploaded();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      setFileName('');
    }
  };

  const isVideo = fileName && /\.(mp4|webm|ogg|mov|avi)$/i.test(fileName);

  return (
    <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all hover:bg-white/10" style={{ color: 'var(--color-primary)', border: '1px dashed var(--color-primary)' }}>
      {uploading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isVideo ? (
        <Video className="w-4 h-4" />
      ) : (
        <Upload className="w-4 h-4" />
      )}
      <span>
        {uploading
          ? t('teacher.uploading', 'Upload...')
          : isVideo
            ? t('teacher.videoFile', 'Vidéo ajoutée ✓')
            : t('teacher.uploadFile', 'Ajouter un fichier')}
      </span>
      <input type="file" className="hidden" onChange={handleFile} disabled={uploading} accept=".pdf,.mp4,.webm,.mp3,.wav,.jpg,.png,.txt" />
    </label>
  );
}

function LeconForm({ chapitreId, onSaved, onCancel }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ titre: '', contenue_texte: '', video_url: '', objectifs: '', duree_estimee: 30, est_publie: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pendingVideo, setPendingVideo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titre.trim()) { setError(t('teacherCourseManager.title_required')); return; }
    setSaving(true);
    setError('');
    try {
      const res = await teacherCourseAPI.createLecon({ ...form, chapitre: chapitreId });
      if (pendingVideo) {
        const fd = new FormData();
        fd.append('fichier', pendingVideo);
        fd.append('lecon_id', res.data.id);
        fd.append('titre', pendingVideo.name);
        await teacherCourseAPI.uploadFile(fd);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.detail || t('teacherCourseManager.creation_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-xl" style={{ background: 'var(--overlay-light)' }}>
      <div>
        <input
          className="w-full px-3 py-2 rounded-lg text-sm border"
          style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
          placeholder={t('teacher.lessonTitle', 'Titre de la leçon')}
          value={form.titre}
          onChange={(e) => setForm({ ...form, titre: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
          {t('teacher.lessonContent', 'Contenu de la leçon')}
        </label>
        <RichTextEditor
          value={form.contenue_texte}
          onChange={(html) => setForm({ ...form, contenue_texte: html })}
          placeholder={t('teacher.writeContent', 'Rédigez votre contenu ici...')}
          minHeight={200}
        />
      </div>
      <div>
        <label className="text-xs font-medium mb-1 block flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
          <Video className="w-3.5 h-3.5" />
          {t('teacher.videoUrl', 'Vidéo (lien YouTube, Vimeo...)')}
        </label>
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            placeholder="https://www.youtube.com/watch?v=..."
            value={form.video_url}
            onChange={(e) => setForm({ ...form, video_url: e.target.value })}
          />
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs cursor-pointer whitespace-nowrap"
            style={{ color: pendingVideo ? '#22C55E' : 'var(--color-primary)', border: '1px dashed var(--color-primary)' }}>
            <Upload className="w-3.5 h-3.5" />
            {pendingVideo ? pendingVideo.name : t('teacher.uploadVideo', 'Vidéo PC')}
            <input type="file" className="hidden" accept=".mp4,.webm,.ogg,.mov,.avi"
              onChange={(e) => setPendingVideo(e.target.files[0])} />
          </label>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          className="px-3 py-2 rounded-lg text-sm border"
          style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
          placeholder={t('teacher.objectives', 'Objectifs')}
          value={form.objectifs}
          onChange={(e) => setForm({ ...form, objectifs: e.target.value })}
        />
        <input
          type="number"
          className="px-3 py-2 rounded-lg text-sm border"
          style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
          placeholder={t('teacher.duration', 'Durée (min)')}
          value={form.duree_estimee}
          onChange={(e) => setForm({ ...form, duree_estimee: parseInt(e.target.value) || 30 })}
        />
      </div>
      <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <input
          type="checkbox"
          checked={form.est_publie}
          onChange={(e) => setForm({ ...form, est_publie: e.target.checked })}
          className="rounded"
        />
        {t('teacherCourseManager.publish_lesson', 'Publier la leçon (visible par les étudiants)')}
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs btn-ghost">
          {t('common.cancel', 'Annuler')}
        </button>
        <button type="submit" disabled={saving} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: 'var(--color-primary)' }}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin inline" /> : <Save className="w-3 h-3 inline" />}
          {' '}{t('common.save', 'Enregistrer')}
        </button>
      </div>
    </form>
  );
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function getVimeoEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
}

function getVideoEmbedUrl(url) {
  return getYouTubeEmbedUrl(url) || getVimeoEmbedUrl(url) || url;
}

function isVideoUrl(url) {
  return url && (url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo') || url.match(/\.(mp4|webm|ogg)(\?|$)/i));
}

function LeconItem({ lecon, onDeleted }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [publie, setPublie] = useState(lecon.est_publie);
  const files = lecon.fichiers || [];
  const videoFiles = files.filter((f) => f.type_fichier === 'VIDEO');
  const videoUrl = lecon.video_url || videoFiles[0]?.url_fichier || lecon.video_url_display;

  const togglePublie = async () => {
    try {
      await teacherCourseAPI.updateLecon(lecon.id, { est_publie: !publie });
      setPublie(!publie);
    } catch (err) {
      console.error('Toggle publish error:', err);
    }
  };

  if (editing) {
    return <LeconEditForm lecon={lecon} onSaved={() => { setEditing(false); onDeleted(); }} onCancel={() => setEditing(false)} />;
  }

  return (
    <div className="rounded-xl" style={{ background: 'var(--overlay-light)' }}>
      <div className="flex items-center gap-3 p-3">
        <button onClick={() => setExpanded(!expanded)} className="p-1 rounded hover:bg-white/5">
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
        <FileText className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{lecon.titre}</p>
          {lecon.objectifs && <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{lecon.objectifs}</p>}
        </div>
        {videoUrl && <Video className="w-3.5 h-3.5" style={{ color: 'var(--color-danger)' }} />}
        <button
          onClick={togglePublie}
          className={`p-1.5 rounded-lg text-xs font-medium ${
            publie ? 'text-green-400 hover:bg-green-500/10' : 'text-slate-400 hover:bg-white/5'
          }`}
          title={publie ? t('teacherCourseManager.published') : t('teacherCourseManager.draft')}
        >
          {publie ? 'Publié' : 'Brouillon'}
        </button>
        <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setShowDelete(true)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="px-3 pb-3 space-y-3">
              {videoUrl && (
                <div className="rounded-xl overflow-hidden" style={{ background: '#000' }}>
                  {isVideoUrl(videoUrl) ? (
                    <iframe
                      src={getVideoEmbedUrl(videoUrl)}
                      className="w-full aspect-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={lecon.titre}
                    />
                  ) : (
                    <video controls className="w-full aspect-video" src={videoUrl} />
                  )}
                </div>
              )}
              {lecon.contenue_texte && (
                <div
                  className="text-xs leading-relaxed prose prose-sm max-w-none"
                  style={{ color: 'var(--text-secondary)' }}
                  dangerouslySetInnerHTML={{ __html: lecon.contenue_texte }}
                />
              )}
              <FileUpload leconId={lecon.id} leconTitre={lecon.titre} onUploaded={onDeleted} />
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {files.map((f) => (
                    <div key={f.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs" style={{ background: 'var(--bg-card)' }}>
                      {f.type_fichier === 'VIDEO' ? <Video className="w-3 h-3" /> : <FileIcon className="w-3 h-3" />}
                      <span className="max-w-[120px] truncate">{f.titre || f.nom}</span>
                      <button type="button" onClick={async () => { try { await teacherCourseAPI.deleteFile(f.id); onDeleted(); } catch {} }}
                        className="p-0.5 rounded hover:bg-red-500/10 text-red-400">
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmModal
        open={showDelete}
        title={t('teacherCourseManager.delete_lesson_title')}
        message={t('teacherCourseManager.delete_lesson_msg', { title: lecon.titre })}
        onConfirm={async () => { try { await teacherCourseAPI.deleteLecon(lecon.id); onDeleted(); } catch {} finally { setShowDelete(false); } }}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}

function QcmSection({ chapitreId }) {
  const { t } = useTranslation();
  const [qcm, setQcm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [duree, setDuree] = useState(15);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    loadQcm();
  }, [chapitreId]);

  const loadQcm = async () => {
    setLoading(true);
    try {
      const res = await teacherCourseAPI.getQCM(chapitreId);
      if (res.data.exists) {
        setQcm(res.data);
        setDuree(res.data.duree);
        setQuestions(res.data.questions.map((q) => ({
          texte: q.texte,
          options: q.options.join(', '),
          reponse_correcte: q.reponse_correcte,
          points: q.points,
        })));
      } else {
        setQcm(null);
        setQuestions([]);
        setDuree(15);
      }
    } catch {
      setQcm(null);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { texte: '', options: '', reponse_correcte: '', points: 1 }]);
  };

  const removeQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const handleSave = async () => {
    const valid = questions.filter((q) => q.texte.trim() && q.options.trim() && q.reponse_correcte.trim());
    if (valid.length === 0) return;
    setSaving(true);
    try {
      const payload = {
        duree,
        questions: valid.map((q) => ({
          texte: q.texte,
          options: q.options.split(',').map((o) => o.trim()),
          reponse_correcte: q.reponse_correcte.trim(),
          points: q.points || 1,
        })),
      };
      await teacherCourseAPI.createQCM(chapitreId, payload);
      setShowForm(false);
      loadQcm();
    } catch (err) {
      console.error('QCM save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await teacherCourseAPI.deleteQCM(chapitreId);
      setQcm(null);
      setQuestions([]);
      setShowForm(false);
    } catch (err) {
      console.error('QCM delete error:', err);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--color-primary)' }} /></div>;
  }

  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
          <CheckSquare className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
          {t('teacher.qcmValidation', 'Validation QCM')}
          {qcm && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--color-primary)', color: 'white' }}>{qcm.questions.length} Q</span>}
        </h4>
        <div className="flex gap-1">
          {qcm && (
            <button onClick={handleDelete} className="text-[10px] px-2 py-1 rounded-lg text-red-400 hover:bg-red-500/10">
              {t('common.delete', 'Supprimer')}
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-[10px] px-2 py-1 rounded-lg font-medium"
            style={{ color: 'var(--color-primary)', background: `${'var(--color-primary)'}10` }}
          >
            {qcm ? t('common.edit', 'Modifier') : t('common.add', 'Ajouter')}
          </button>
        </div>
      </div>

      {qcm && !showForm && (
        <div className="space-y-1.5">
          {qcm.questions.map((q, i) => (
            <div key={q.id} className="text-[11px] p-2 rounded-lg" style={{ background: 'var(--overlay-light)' }}>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{i + 1}. {q.texte}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {q.options.join(', ')} → <span style={{ color: 'var(--color-primary)' }}>{q.reponse_correcte}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Durée (min) :</label>
            <input
              type="number"
              className="w-20 px-2 py-1 rounded-lg text-xs border"
              style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              value={duree}
              onChange={(e) => setDuree(parseInt(e.target.value) || 15)}
              min={1}
            />
          </div>
          {questions.map((q, i) => (
            <div key={i} className="p-2 rounded-lg space-y-1" style={{ background: 'var(--overlay-light)' }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>Question {i + 1}</span>
                <button onClick={() => removeQuestion(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
              </div>
              <input
                className="w-full px-2 py-1 rounded text-xs border"
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                placeholder={t('teacherCourseManager.question_text_placeholder')}
                value={q.texte}
                onChange={(e) => updateQuestion(i, 'texte', e.target.value)}
              />
              <input
                className="w-full px-2 py-1 rounded text-xs border"
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                placeholder={t('teacherCourseManager.options_placeholder')}
                value={q.options}
                onChange={(e) => updateQuestion(i, 'options', e.target.value)}
              />
              <div className="flex gap-2">
                <input
                  className="flex-1 px-2 py-1 rounded text-xs border"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  placeholder={t('teacherCourseManager.correct_answer_placeholder')}
                  value={q.reponse_correcte}
                  onChange={(e) => updateQuestion(i, 'reponse_correcte', e.target.value)}
                />
                <input
                  type="number"
                  className="w-16 px-2 py-1 rounded text-xs border"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  placeholder={t('teacherCourseManager.pts_placeholder')}
                  value={q.points}
                  onChange={(e) => updateQuestion(i, 'points', parseInt(e.target.value) || 1)}
                  min={1}
                />
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={addQuestion} className="text-[10px] px-2 py-1 rounded-lg" style={{ color: 'var(--color-primary)', border: '1px dashed var(--color-primary)' }}>
              <Plus className="w-3 h-3 inline" /> {t('common.add', 'Ajouter une question')}
            </button>
            <button onClick={handleSave} disabled={saving} className="text-[10px] px-3 py-1 rounded-lg text-white font-medium" style={{ background: 'var(--color-primary)' }}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin inline" /> : <Save className="w-3 h-3 inline" />} {t('common.save', 'Enregistrer')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChapterEditForm({ chapitre, onSaved, onCancel }) {
  const { t } = useTranslation();
  const [titre, setTitre] = useState(chapitre.titre);
  const [description, setDescription] = useState(chapitre.description || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titre.trim()) return;
    setSaving(true);
    try {
      await teacherCourseAPI.updateChapitre(chapitre.id, { titre, description });
      onSaved();
    } catch (err) {
      console.error('Edit chapter error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-3 rounded-xl" style={{ background: 'var(--overlay-light)' }}>
      <input
        className="w-full px-3 py-2 rounded-lg text-sm border"
        style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        placeholder={t('teacher.chapterTitle', 'Titre du chapitre')}
      />
      <textarea
        className="w-full px-3 py-2 rounded-lg text-sm border"
        style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('teacher.chapterDescription', 'Description')}
      />
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs btn-ghost">{t('common.cancel', 'Annuler')}</button>
        <button type="submit" disabled={saving} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: 'var(--color-primary)' }}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin inline" /> : <Save className="w-3 h-3 inline" />} {t('common.save', 'Enregistrer')}
        </button>
      </div>
    </form>
  );
}

function LeconEditForm({ lecon, onSaved, onCancel }) {
  const { t } = useTranslation();
  const [titre, setTitre] = useState(lecon.titre);
  const [contenue_texte, setContenueTexte] = useState(lecon.contenue_texte || '');
  const [video_url, setVideoUrl] = useState(lecon.video_url || '');
  const [objectifs, setObjectifs] = useState(lecon.objectifs || '');
  const [duree_estimee, setDuree] = useState(lecon.duree_estimee || 30);
  const [est_publie, setEstPublie] = useState(lecon.est_publie || false);
  const [fichiers, setFichiers] = useState(lecon.fichiers || []);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titre.trim()) return;
    setSaving(true);
    try {
      await teacherCourseAPI.updateLecon(lecon.id, { titre, contenue_texte, video_url, objectifs, duree_estimee, est_publie });
      onSaved();
    } catch (err) {
      console.error('Edit lesson error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('fichier', file);
      fd.append('lecon_id', lecon.id);
      fd.append('titre', file.name);
      const res = await teacherCourseAPI.uploadFile(fd);
      setFichiers([...fichiers, res.data]);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (file) => {
    setDeleting(file.id);
    try {
      await teacherCourseAPI.deleteFile(file.id);
      setFichiers(fichiers.filter((f) => f.id !== file.id));
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 rounded-xl" style={{ background: 'var(--overlay-light)' }}>
      <input
        className="w-full px-3 py-2 rounded-lg text-sm border"
        style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        placeholder={t('teacher.lessonTitle', 'Titre de la leçon')}
      />
      <div>
        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
          {t('teacher.lessonContent', 'Contenu de la leçon')}
        </label>
        <RichTextEditor
          value={contenue_texte}
          onChange={setContenueTexte}
          placeholder={t('teacher.writeContent', 'Rédigez votre contenu ici...')}
          minHeight={150}
        />
      </div>
      <div>
        <label className="text-xs font-medium mb-1 block flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
          <Video className="w-3.5 h-3.5" />
          {t('teacher.videoUrl', 'Vidéo (lien YouTube, Vimeo...)')}
        </label>
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            placeholder="https://www.youtube.com/watch?v=..."
            value={video_url}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs cursor-pointer whitespace-nowrap"
            style={{ color: 'var(--color-primary)', border: '1px dashed var(--color-primary)' }}>
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? t('teacher.uploading', 'Upload...') : t('teacher.uploadVideo', 'Vidéo PC')}
            <input type="file" className="hidden" accept=".mp4,.webm,.ogg,.mov,.avi"
              onChange={(e) => { const f = e.target.files[0]; e.target.value = ''; handleUpload(f); }}
              disabled={uploading} />
          </label>
        </div>
      </div>
      {fichiers.length > 0 && (
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
            {t('teacher.files', 'Fichiers')}
          </label>
          <div className="space-y-1">
            {fichiers.map((f) => (
              <div key={f.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs" style={{ background: 'var(--bg-card)' }}>
                {f.type_fichier === 'VIDEO' ? <Video className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-danger)' }} /> :
                 f.type_fichier === 'AUDIO' ? <FileIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#22C55E' }} /> :
                 <FileIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />}
                <span className="flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{f.titre || f.nom}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{f.type_fichier}</span>
                <button type="button" onClick={() => handleDeleteFile(f)} disabled={deleting === f.id}
                  className="p-1 rounded hover:bg-red-500/10 text-red-400">
                  {deleting === f.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <label className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer border-dashed"
          style={{ color: 'var(--color-primary)', border: '1px dashed var(--border-color)' }}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? t('teacher.uploading', 'Upload...') : t('teacher.addFile', 'Ajouter un fichier (PDF, vidéo, audio, image...)')}
          <input type="file" className="hidden" accept=".pdf,.mp4,.webm,.mp3,.wav,.jpg,.png,.txt,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            onChange={(e) => { const f = e.target.files[0]; e.target.value = ''; handleUpload(f); }}
            disabled={uploading} />
        </label>
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-lg text-sm border"
          style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
          value={objectifs}
          onChange={(e) => setObjectifs(e.target.value)}
          placeholder={t('teacher.objectives', 'Objectifs')}
        />
        <input
          type="number"
          className="w-20 px-3 py-2 rounded-lg text-sm border"
          style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
          value={duree_estimee}
          onChange={(e) => setDuree(parseInt(e.target.value) || 30)}
        />
      </div>
      <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <input
          type="checkbox"
          checked={est_publie}
          onChange={(e) => setEstPublie(e.target.checked)}
          className="rounded"
        />
        {t('teacherCourseManager.publish_lesson', 'Publier la leçon (visible par les étudiants)')}
      </label>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs btn-ghost">{t('common.cancel', 'Annuler')}</button>
        <button type="submit" disabled={saving} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: 'var(--color-primary)' }}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin inline" /> : <Save className="w-3 h-3 inline" />} {t('common.save', 'Enregistrer')}
        </button>
      </div>
    </form>
  );
}

function ChapitreCard({ chapitre, onDeleted }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [lecons, setLecons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loadingLecons, setLoadingLecons] = useState(false);

  useEffect(() => {
    if (expanded && chapitre.id) {
      setLoadingLecons(true);
      courseAPI.lecons(chapitre.id).then((res) => {
        setLecons(res.data || []);
      }).catch(() => {}).finally(() => setLoadingLecons(false));
    }
  }, [expanded, chapitre.id]);

  const refreshLecons = () => courseAPI.lecons(chapitre.id).then(r => setLecons(r.data || [])).catch(() => {});

  if (showEdit) {
    return (
      <div className="glass rounded-xl p-4">
        <ChapterEditForm chapitre={chapitre} onSaved={() => { setShowEdit(false); onDeleted(); }} onCancel={() => setShowEdit(false)} />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <BookOpen className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{chapitre.titre}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{chapitre.description || t('teacher.noDescription', 'Aucune description')}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); setShowEdit(true); }} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setShowForm(true); setExpanded(true); }} className="p-1.5 rounded-lg hover:bg-white/5">
            <Plus className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setShowDelete(true); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400">
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <div className="pt-2 space-y-2">
                {loadingLecons ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--color-primary)' }} /></div>
                ) : lecons.length === 0 && !showForm ? (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>{t('teacher.noLessons', 'Aucune leçon')}</p>
                ) : (
                  lecons.map((l) => <LeconItem key={l.id} lecon={l} onDeleted={refreshLecons} />)
                )}
              </div>
              {showForm && (
                <LeconForm
                  chapitreId={chapitre.id}
                  onSaved={() => { setShowForm(false); refreshLecons(); }}
                  onCancel={() => setShowForm(false)}
                />
              )}
              {chapitre.id && <QcmSection chapitreId={chapitre.id} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmModal
        open={showDelete}
        title={t('teacherCourseManager.delete_chapter_title')}
        message={t('teacherCourseManager.delete_chapter_msg', { title: chapitre.titre })}
        onConfirm={async () => { try { await teacherCourseAPI.deleteChapitre(chapitre.id); onDeleted(); } catch {} finally { setShowDelete(false); } }}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}

export function TeacherCourseManager({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [matieres, setMatieres] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [chapitres, setChapitres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showVisioModal, setShowVisioModal] = useState(false);
  const [visioForm, setVisioForm] = useState({ titre: '', date_debut: '', date_fin: '' });
  const [creatingVisio, setCreatingVisio] = useState(false);
  const niveaux = user.niveau_id ? [{ id: user.niveau_id, nom: user.niveau }] : [];
  const [selectedNiveau, setSelectedNiveau] = useState(
    niveaux.length === 1 ? niveaux[0].id : null
  );
  const [newChapter, setNewChapter] = useState({ titre: '', description: '', matiere: '', niveau: user.niveau_id || '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateVisio = async (e) => {
    e.preventDefault();
    if (!visioForm.titre.trim()) return;
    setCreatingVisio(true);
    try {
      const payload = {
        titre: visioForm.titre,
        date_debut: visioForm.date_debut || new Date().toISOString(),
        date_fin: visioForm.date_fin || new Date(Date.now() + 3600000).toISOString(),
        est_active: true,
      };
      const res = await visioAPI.create(payload);
      setShowVisioModal(false);
      if (res.data?.id) navigate(`/live/${res.data.id}`);
    } catch (err) {
      console.error('Create visio error:', err);
    } finally {
      setCreatingVisio(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const matieresIds = user.matieres_enseignees_ids || [];
        if (matieresIds.length > 0) {
          const res = await courseAPI.matieres();
          const allMatieres = res.data?.results || res.data || [];
          const filtered = allMatieres.filter((m) => matieresIds.includes(m.id));
          setMatieres(filtered);
          if (filtered.length > 0) {
            setSelectedMatiere(filtered[0].id);
            setNewChapter((prev) => ({ ...prev, matiere: filtered[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load matieres:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.matieres_enseignees_ids]);

  useEffect(() => {
    if (!selectedMatiere) return;
    const loadChapitres = async () => {
      try {
        const params = { matiere: selectedMatiere };
        if (selectedNiveau) params.niveau = selectedNiveau;
        const res = await teacherCourseAPI.chapitres(params);
        setChapitres(res.data?.results || res.data || []);
      } catch (err) {
        console.error('Failed to load chapitres:', err);
        setChapitres([]);
      }
    };
    loadChapitres();
  }, [selectedMatiere, selectedNiveau]);

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    const niveauVal = newChapter.niveau || selectedNiveau || user.niveau_id;
    if (!newChapter.titre.trim() || !newChapter.matiere || !niveauVal) {
      setError(t('teacherCourseManager.fill_required_fields'));
      return;
    }
    setCreating(true);
    setError('');
    try {
      await teacherCourseAPI.createChapitre({
        titre: newChapter.titre,
        description: newChapter.description,
        matiere: parseInt(newChapter.matiere),
        niveau: parseInt(niveauVal),
      });
      setNewChapter({ titre: '', description: '', matiere: selectedMatiere?.toString() || '', niveau: niveauVal.toString() || '' });
      setShowCreateForm(false);
      const params = { matiere: selectedMatiere };
      if (selectedNiveau) params.niveau = selectedNiveau;
      const res = await teacherCourseAPI.chapitres(params);
      setChapitres(res.data?.results || res.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const refreshChapitres = async () => {
    if (!selectedMatiere) return;
    const params = { matiere: selectedMatiere };
    if (selectedNiveau) params.niveau = selectedNiveau;
    const res = await teacherCourseAPI.chapitres(params);
    setChapitres(res.data?.results || res.data || []);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {t('teacher.manageCourses', 'Gérer mes cours')}
          </h2>
          {user.etablissement && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {user.etablissement}{user.specialite ? ` • ${user.specialite}` : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowVisioModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}
          >
            <Video className="w-4 h-4" />
            {t('teacherDashboard.start_visio', 'Visio')}
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            <Plus className="w-4 h-4" />
            {t('teacher.newChapter', 'Nouveau chapitre')}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {matieres.map((m) => (
          <button
            key={m.id}
            onClick={() => { setSelectedMatiere(m.id); setNewChapter((prev) => ({ ...prev, matiere: m.id })); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedMatiere === m.id ? 'text-white' : 'text-[var(--text-primary)] hover:bg-white/5'
            }`}
            style={selectedMatiere === m.id ? { background: 'var(--color-primary)' } : { background: 'var(--overlay-light)' }}
          >
            {m.nom}
          </button>
        ))}
      </div>

      {user.niveau && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: `${'var(--color-primary)'}15`, color: 'var(--color-primary)' }}>
            {user.niveau}
          </span>
        </div>
      )}

      <AnimatePresence>
        {showCreateForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleCreateChapter}
            className="glass rounded-xl p-4 mb-6 space-y-3"
          >
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {t('teacher.newChapter', 'Nouveau chapitre')}
            </h3>
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {t('teacher.chapterTitle', 'Titre du chapitre')}
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg text-sm border"
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                placeholder={t('teacher.chapterTitle', 'Titre du chapitre')}
                value={newChapter.titre}
                onChange={(e) => setNewChapter({ ...newChapter, titre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {t('teacher.chapterDescription', 'Description du chapitre')}
              </label>
              <textarea
                className="w-full px-3 py-2 rounded-lg text-sm border"
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                rows={2}
                placeholder={t('teacher.chapterDescription', 'Description du chapitre')}
                value={newChapter.description}
                onChange={(e) => setNewChapter({ ...newChapter, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {t('teacher.subject', 'Matière')}
                </label>
                <select
                  className="w-full px-3 py-2 rounded-lg text-sm border"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  value={newChapter.matiere}
                  onChange={(e) => setNewChapter({ ...newChapter, matiere: e.target.value })}
                >
                  {matieres.map((m) => <option key={m.id} value={m.id} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>{m.nom}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {t('teacher.level', 'Niveau')}
                </label>
                <div className="flex items-center px-3 py-2 rounded-lg text-sm border" style={{ background: 'var(--overlay-light)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                  <input type="hidden" value={newChapter.niveau || selectedNiveau || ''} />
                  {user.niveau || t('teacherCourseManager.level_not_assigned')}
                </div>
              </div>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowCreateForm(false)} className="px-3 py-1.5 rounded-lg text-xs btn-ghost">
                {t('common.cancel', 'Annuler')}
              </button>
              <button type="submit" disabled={creating} className="px-4 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: 'var(--color-primary)' }}>
                {creating ? <Loader2 className="w-3 h-3 animate-spin inline" /> : <Save className="w-3 h-3 inline" />}
                {' '}{t('common.save', 'Créer')}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {chapitres.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {t('teacher.noChapters', 'Aucun chapitre pour cette matière')}
            </p>
            <button onClick={() => setShowCreateForm(true)} className="mt-3 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'var(--color-primary)' }}>
              <Plus className="w-4 h-4 inline" /> {t('teacher.createFirstChapter', 'Créer le premier chapitre')}
            </button>
          </div>
        ) : (
          chapitres.map((ch) => <ChapitreCard key={ch.id} chapitre={ch} onDeleted={refreshChapitres} />)
        )}
      </div>

      {showVisioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowVisioModal(false)}>
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
              <button onClick={() => setShowVisioModal(false)} className="p-1 rounded-lg hover:bg-white/5"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateVisio} className="space-y-3">
              <input
                className="w-full px-3 py-2 rounded-lg text-sm border"
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                placeholder={t('visio.title', 'Titre de la session')}
                value={visioForm.titre}
                onChange={(e) => setVisioForm({ ...visioForm, titre: e.target.value })}
                required
              />
              <input
                type="datetime-local"
                className="w-full px-3 py-2 rounded-lg text-sm border"
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                value={visioForm.date_debut}
                onChange={(e) => setVisioForm({ ...visioForm, date_debut: e.target.value })}
              />
              <input
                type="datetime-local"
                className="w-full px-3 py-2 rounded-lg text-sm border"
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                value={visioForm.date_fin}
                onChange={(e) => setVisioForm({ ...visioForm, date_fin: e.target.value })}
              />
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowVisioModal(false)} className="px-4 py-2 rounded-lg text-sm btn-ghost">
                  {t('common.cancel', 'Annuler')}
                </button>
                <button type="submit" disabled={creatingVisio} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'var(--color-primary)' }}>
                  {creatingVisio ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <Video className="w-4 h-4 inline" />}
                  {' '}{t('teacherDashboard.start_visio', 'Démarrer')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
