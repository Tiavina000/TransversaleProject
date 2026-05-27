import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { newsAPI } from '../../services/api';
import {
  Plus, Trash2, Edit3, Eye, EyeOff, Video,
  Link2, AlertTriangle, CheckCircle, Newspaper, X, Upload,
  Send, Loader2, Heart, MessageCircle, 
  Share2, Bookmark, MoreHorizontal, Sparkles
} from 'lucide-react';

const CATEGORIES = ['Annonces', 'Examens', 'Cours', 'Événements', 'Sport', 'Culture'];
const AUDIENCES  = [
  { value: 'TOUS',          label: 'Tous' },
  { value: 'ETUDIANTS',     label: 'Élèves seulement' },
  { value: 'ENSEIGNANTS',   label: 'Enseignants seulement' },
  { value: 'ETABLISSEMENT', label: 'Mon établissement' },
];

const EMPTY_FORM = {
  titre: '', contenu: '', categorie: 'Annonces',
  est_important: false, est_publie: true,
  public_ciblie: 'TOUS', lien_externe: '', lien_label: '',
  video_url: '', image: null,
};

// ── Prévisualisation Instagram-Style ─────────────────────────────────────────
function PreviewCard({ form, imagePreview, user }) {
  const getYoutubeId = (url) => {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return m ? m[1] : null;
  };
  const ytId = getYoutubeId(form.video_url);

  return (
    <div className="glass-sm rounded-3xl overflow-hidden border border-white/10 shadow-2xl scale-90 origin-top">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary p-0.5">
            <div className="w-full h-full rounded-full bg-[#0A0A14] flex items-center justify-center text-[10px] font-black text-white">
              {user?.prenom?.[0] || 'A'}
            </div>
          </div>
          <div>
            <h5 className="text-[10px] font-bold text-white flex items-center gap-1">
              {user?.prenom || 'Administrateur'}
              {form.est_important && <Sparkles size={10} className="text-amber-400" />}
            </h5>
            <p className="text-[8px] text-slate-500 uppercase tracking-widest">
              À l'instant • {form.categorie}
            </p>
          </div>
        </div>
        <MoreHorizontal size={14} className="text-slate-500" />
      </div>

      {/* Media */}
      <div className="aspect-square bg-black/20 flex items-center justify-center overflow-hidden">
        {imagePreview ? (
          <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
        ) : ytId ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-primary">
            <Video size={32} />
            <span className="text-[10px] font-bold">Vidéo YouTube</span>
          </div>
        ) : (
          <div className="p-6 text-center">
             <h4 className="text-sm font-bold text-white leading-tight">{form.titre || 'Titre de l\'actualité...'}</h4>
          </div>
        )}
      </div>

      {/* Footer / Interactions */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3 text-slate-400">
             <Heart size={18} />
             <MessageCircle size={18} />
             <Share2 size={18} />
           </div>
           <Bookmark size={18} className="text-slate-400" />
        </div>
        <div className="space-y-1">
           <p className="text-[10px] text-white">
             <span className="font-bold mr-1">{user?.prenom || 'Admin'}</span>
             {form.contenu || 'Votre texte apparaîtra ici...'}
           </p>
           {form.lien_externe && (
             <p className="text-[9px] text-primary flex items-center gap-1 font-medium">
               <Link2 size={10} /> {form.lien_label || 'En savoir plus'}
             </p>
           )}
        </div>
      </div>
    </div>
  );
}

// ── Formulaire de création/édition ───────────────────────────────────────────
function NewsForm({ initial = EMPTY_FORM, onSave, onCancel, loading, user }) {
  const [form, setForm] = useState(initial);
  const [imagePreview, setImagePreview] = useState(initial.image_url || null);
  const fileRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set('image', file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'image') {
        if (v instanceof File) fd.append('image', v);
      } else if (v !== null && v !== undefined) {
        fd.append(k, v);
      }
    });
    onSave(fd, form.id);
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <motion.div
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="glass rounded-[2rem] p-8 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Plus size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">
              {form.id ? 'Modifier l\'actualité' : 'Créer une actualité'}
            </h3>
          </div>
          <button onClick={onCancel} className="p-2.5 rounded-xl glass-sm hover:border-white/20 transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Titre */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold ml-1">Titre de la publication</label>
            <input type="text" required value={form.titre}
              onChange={e => set('titre', e.target.value)}
              className={inputClass} placeholder="Ex: Résultats des examens 2026" />
          </div>

          {/* Contenu */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold ml-1">Message / Légende</label>
            <textarea required value={form.contenu}
              onChange={e => set('contenu', e.target.value)}
              rows={4} className={`${inputClass} resize-none`}
              placeholder="Décrivez votre actualité ici..." />
          </div>

          {/* Catégorie & Audience */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold ml-1">Catégorie</label>
              <select value={form.categorie} onChange={e => set('categorie', e.target.value)}
                className={`${inputClass} appearance-none cursor-pointer`}>
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0A0A14]">{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold ml-1">Audience</label>
              <select value={form.public_ciblie} onChange={e => set('public_ciblie', e.target.value)}
                className={`${inputClass} appearance-none cursor-pointer`}>
                {AUDIENCES.map(a => <option key={a.value} value={a.value} className="bg-[#0A0A14]">{a.label}</option>)}
              </select>
            </div>
          </div>

          {/* Media Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold ml-1">Image de couverture</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="aspect-video border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload size={20} className="text-slate-600 group-hover:text-primary transition-colors" />
                    <span className="text-[10px] text-slate-600 font-bold group-hover:text-slate-400">Uploader</span>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold ml-1">Vidéo (YouTube)</label>
              <div className="aspect-video glass-sm rounded-2xl flex flex-col items-center justify-center p-4 gap-2">
                 <Video size={20} className="text-slate-600" />
                 <input type="url" value={form.video_url}
                   onChange={e => set('video_url', e.target.value)}
                   className="w-full bg-transparent text-[10px] text-center focus:outline-none placeholder:text-slate-700" 
                   placeholder="Coller l'URL YouTube ici..." />
              </div>
            </div>
          </div>

          {/* Lien externe */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold ml-1">Lien externe</label>
                <div className="relative">
                  <Link2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input type="url" value={form.lien_externe}
                    onChange={e => set('lien_externe', e.target.value)}
                    className={`${inputClass} pl-10 text-[11px]`} placeholder="https://..." />
                </div>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold ml-1">Label du lien</label>
                <input type="text" value={form.lien_label}
                  onChange={e => set('lien_label', e.target.value)}
                  className={`${inputClass} text-[11px]`} placeholder="Ex: Télécharger PDF" />
             </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-2">
            <button 
              type="button"
              onClick={() => set('est_important', !form.est_important)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-[10px] font-bold ${form.est_important ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-white/5 border-white/10 text-slate-500'}`}
            >
              <Sparkles size={14} /> IMPORTANT
            </button>
            <button 
              type="button"
              onClick={() => set('est_publie', !form.est_publie)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-[10px] font-bold ${form.est_publie ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-white/5 border-white/10 text-slate-500'}`}
            >
              {form.est_publie ? <Eye size={14} /> : <EyeOff size={14} />} 
              {form.est_publie ? 'PUBLIÉ' : 'BROUILLON'}
            </button>
          </div>

          <motion.button type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-black text-sm shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
            whileTap={{ scale: 0.98 }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> {form.id ? 'METTRE À JOUR' : 'PUBLIER MAINTENANT'}</>}
          </motion.button>
        </form>
      </motion.div>

      {/* Preview Column */}
      <div className="hidden lg:block sticky top-24">
        <div className="text-center mb-6">
           <h4 className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black">Aperçu du flux social</h4>
        </div>
        <PreviewCard form={form} imagePreview={imagePreview} user={user} />
      </div>
    </div>
  );
}

// ── Dashboard Admin principal ─────────────────────────────────────────────────
export function AdminDashboard({ user }) {
  const [news, setNews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    newsAPI.list({ page_size: 50 })
      .then(res => setNews(res.data?.results || res.data || []))
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  const notify = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSave = async (fd, id) => {
    setSaving(true);
    try {
      if (id) {
        await newsAPI.update(id, fd);
        notify('ok', 'Actualité mise à jour !');
      } else {
        await newsAPI.create(fd);
        notify('ok', 'Actualité publiée !');
      }
      setShowForm(false);
      setEditItem(null);
      setLoading(true);
      newsAPI.list({ page_size: 50 })
        .then(res => setNews(res.data?.results || res.data || []))
        .catch(() => setNews([]))
        .finally(() => setLoading(false));
    } catch {
      notify('err', 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette actualité ?')) return;
    try {
      await newsAPI.remove(id);
      notify('ok', 'Actualité supprimée.');
      setLoading(true);
      newsAPI.list({ page_size: 50 })
        .then(res => setNews(res.data?.results || res.data || []))
        .catch(() => setNews([]))
        .finally(() => setLoading(false));
    } catch { notify('err', 'Erreur lors de la suppression.'); }
  };

  return (
    <div className="space-y-10 pb-16">
      
      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-6">
        <div>
           <div className="flex items-center gap-2 text-primary mb-1">
             <Newspaper size={16} />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Communication Portal</span>
           </div>
           <h1 className="text-4xl font-black text-white">Gestion <span className="text-gradient">Actualités</span></h1>
        </div>
        {!showForm && (
          <motion.button
            onClick={() => setShowForm(true)}
            className="px-6 py-3.5 rounded-2xl bg-white text-[#0A0A14] font-black text-xs flex items-center gap-2 hover:bg-primary hover:text-white transition-all shadow-xl shadow-white/5"
            whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
          >
            <Plus size={16} /> NOUVELLE PUBLICATION
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${
              feedback.type === 'ok' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-red-500/20 border-red-500/30 text-red-400'
            }`}
          >
            {feedback.type === 'ok' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <span className="text-sm font-bold">{feedback.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm ? (
          <NewsForm 
            initial={editItem || EMPTY_FORM} 
            onSave={handleSave} 
            onCancel={() => { setShowForm(false); setEditItem(null); }} 
            loading={saving}
            user={user}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {loading ? (
               <div className="col-span-full py-20 flex flex-col items-center gap-4">
                  <Loader2 size={40} className="animate-spin text-primary opacity-20" />
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Chargement des données...</p>
               </div>
             ) : news.length === 0 ? (
               <div className="col-span-full py-32 flex flex-col items-center gap-6 glass rounded-[3rem] border-dashed border-2 border-white/5">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-700">
                    <Newspaper size={40} />
                  </div>
                  <p className="text-slate-500 font-bold">Aucune publication pour le moment.</p>
                  <button onClick={() => setShowForm(true)} className="btn-ghost px-6 py-3 rounded-2xl text-xs font-black">Lancer une campagne</button>
               </div>
             ) : (
               news.map((item, idx) => (
                 <motion.div 
                   key={item.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="glass-sm rounded-3xl p-5 border border-white/5 group hover:border-primary/20 transition-all flex flex-col justify-between h-full"
                 >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-white/5 text-slate-500">{item.categorie}</span>
                        <div className="flex gap-1">
                          <button onClick={() => { setEditItem(item); setShowForm(true); }} className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-all"><Edit3 size={14} /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-2 line-clamp-2">{item.titre}</h4>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{item.contenu}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[9px] text-slate-600 font-bold">{new Date(item.date_creation).toLocaleDateString()}</span>
                       <div className="flex items-center gap-2">
                          {item.est_important && <Sparkles size={12} className="text-amber-400" />}
                          {item.est_publie ? <div className="w-2 h-2 rounded-full bg-emerald-500" /> : <div className="w-2 h-2 rounded-full bg-slate-700" />}
                       </div>
                    </div>
                 </motion.div>
               ))
             )}
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
