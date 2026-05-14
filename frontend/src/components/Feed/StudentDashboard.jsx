import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { statsAPI, newsAPI } from '../../services/api';
import {
  Users, Sparkles, Globe, Image as ImageIcon,
  ExternalLink, Newspaper, AlertTriangle, Play,
  Link2, ChevronLeft, ChevronRight, RefreshCw,
  Heart, MessageCircle, Share2, MoreHorizontal, Bookmark,
  Clock, CheckCircle, BarChart3, Calendar
} from 'lucide-react';

// ── Données statiques ────────────────────────────────────────────────────────
const COLLABORATORS = [
  { id: 'afd',    name: 'AFD',               logo: '/image/colab/afd.png',               url: 'https://www.afd.fr' },
  { id: 'france', name: 'Ambassade de France',logo: '/image/colab/ambassade-de-france.png',url: 'https://mg.ambafrance.org' },
  { id: 'auf',    name: 'AUF',               logo: '/image/colab/auf.png',               url: 'https://www.auf.org' },
  { id: 'bm',     name: 'Banque Mondiale',   logo: '/image/colab/banque-mondiale.png',   url: 'https://www.banquemondiale.org' },
  { id: 'giz',    name: 'GIZ',               logo: '/image/colab/giz.png',               url: 'https://www.giz.de' },
  { id: 'jica',   name: 'JICA',              logo: '/image/colab/jica.png',              url: 'https://www.jica.go.jp' },
  { id: 'unesco', name: 'UNESCO',            logo: '/image/colab/unesco.png',            url: 'https://www.unesco.org' },
  { id: 'unicef', name: 'UNICEF',            logo: '/image/colab/unicef.png',            url: 'https://www.unicef.org' },
  { id: 'usaid',  name: 'USAID',             logo: '/image/colab/usaid.png',             url: 'https://www.usaid.gov' },
  { id: 'orange', name: 'Orange Madagascar', logo: '/image/colab_orange.jpeg',           url: 'https://www.orange.mg' },
];

const GALLERY = [
  { src: '/image/photo_bat_min.jpg',       title: 'Siège Administratif' },
  { src: '/image/Fanabeazam-pirenena.jpeg',title: 'Éducation Nationale' },
  { src: '/image/situation_exam.png',      title: "Contexte d'Examen" },
  { src: '/image/UNICEF_Japon.webp',       title: 'Coopération Japon-UNICEF' },
  { src: '/image/norvege.png',             title: 'Partenariat Norvégien' },
];

const CATEGORIES = ['Tout', 'Examens', 'Cours', 'Événements', 'Annonces', 'Sport', 'Culture'];

// ── Composant Compte à Rebours ──────────────────────────────────────────────
function Countdown({ targetDate, label }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="glass-sm p-4 rounded-2xl border border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2 mb-2">
        <Calendar size={14} className="text-primary" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <div className="flex gap-3 justify-between">
        {[
          { v: timeLeft.d, l: 'J' },
          { v: timeLeft.h, l: 'H' },
          { v: timeLeft.m, l: 'M' },
          { v: timeLeft.s, l: 'S' }
        ].map((t, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-xl font-black text-white leading-none">{String(t.v).padStart(2, '0')}</span>
            <span className="text-[8px] font-bold text-primary uppercase mt-1">{t.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hook : Ring Buffer pour fil infini circulaire ──────────────────────────
function useCircularFeed(source, batchSize = 6) {
  const [feed, setFeed] = useState([]);
  const cursorRef = useRef(0);

  const getNextItems = useCallback((count) => {
    if (!source || source.length === 0) return [];
    const items = [];
    for (let i = 0; i < count; i++) {
      const originalItem = source[cursorRef.current % source.length];
      items.push({ 
        ...originalItem, 
        _feedKey: `feed-${cursorRef.current}-${originalItem.id}` 
      });
      cursorRef.current++;
    }
    return items;
  }, [source]);

  useEffect(() => {
    if (source && source.length > 0) {
      cursorRef.current = 0;
      setFeed(getNextItems(batchSize));
    } else {
      setFeed([]);
    }
  }, [source, getNextItems, batchSize]);

  const loadMore = useCallback(() => {
    if (source && source.length > 0) {
      const newItems = getNextItems(batchSize);
      setFeed(prev => [...prev, ...newItems]);
    }
  }, [getNextItems, batchSize, source]);

  return { feed, loadMore };
}

// ── Carte d'actualité style Instagram/Facebook ────────────────────────────────
function NewsCard({ item }) {
  const cat = item.categorie || item.category || 'Annonces';
  const title = item.titre || item.title || '';
  const content = item.contenu || item.content || '';
  const important = item.est_important || item.important || false;
  const dateStr = item.date_creation || item.date;
  const imageUrl = item.image_url || null;
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getYoutubeId = (url) => {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return m ? m[1] : null;
  };
  const ytId = getYoutubeId(item.video_url);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-sm rounded-3xl overflow-hidden border border-white/5 mb-6 shadow-2xl"
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-lg">
            <div className="w-full h-full rounded-full bg-[#0A0A14] flex items-center justify-center overflow-hidden">
               {item.auteur_image ? (
                 <img src={item.auteur_image} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <Newspaper size={18} className="text-primary" />
               )}
            </div>
          </div>
          <div>
            <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
              {item.auteur_nom || 'ENENI Info'}
              {important && <Sparkles size={12} className="text-amber-400" />}
            </h5>
            <p className="text-[10px] text-slate-500">
              {dateStr ? new Date(dateStr).toLocaleDateString('fr-FR') : 'Actualité'} • {cat}
            </p>
          </div>
        </div>
        <button className="p-2 text-slate-500 hover:text-white transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="relative group">
        {imageUrl ? (
          <div className="aspect-square sm:aspect-video overflow-hidden bg-black/20">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
        ) : ytId ? (
          <div className="aspect-video bg-black">
             <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                className="w-full h-full border-none"
                allowFullScreen
                title={title}
              />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-primary/20 via-[#0A0A14] to-secondary/20 flex items-center justify-center p-10 text-center">
             <h4 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-lg">{title}</h4>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button onClick={() => setIsLiked(!isLiked)} className={`transition-all hover:scale-110 ${isLiked ? 'text-red-500' : 'text-white/80 hover:text-red-500'}`}>
              <Heart size={26} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button className="text-white/80 hover:text-primary transition-all hover:scale-110">
              <MessageCircle size={26} />
            </button>
            <button className="text-white/80 hover:text-secondary transition-all hover:scale-110">
              <Share2 size={26} />
            </button>
          </div>
          <button onClick={() => setIsBookmarked(!isBookmarked)} className={`transition-all hover:scale-110 ${isBookmarked ? 'text-amber-400' : 'text-white/80 hover:text-amber-400'}`}>
            <Bookmark size={26} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-200 leading-relaxed">
            <span className="font-bold text-white mr-2">{item.auteur_nom || 'ENENI'}</span>
            {content}
          </p>
          
          <div className="flex flex-wrap gap-3 pt-2">
            {item.lien_externe && (
              <a href={item.lien_externe} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-[10px] text-primary hover:bg-primary/20 transition-all font-bold uppercase tracking-wider">
                <Link2 size={12} /> {item.lien_label || 'En savoir plus'}
              </a>
            )}
            {item.video_url && !ytId && (
              <a href={item.video_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 hover:bg-emerald-500/20 transition-all font-bold uppercase tracking-wider">
                <Play size={12} fill="currentColor" /> Voir la vidéo
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// ── Fil d'actualité avec son propre scroll ────────────────────────────────────
function SocialFeedTab({ newsSource, activeCategory }) {
  const filtered = activeCategory === 'Tout'
    ? newsSource
    : newsSource.filter(n => (n.categorie || n.category) === activeCategory);

  const { feed, loadMore } = useCircularFeed(filtered.length > 0 ? filtered : newsSource);
  const sentinelRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current || !scrollContainerRef.current) return;
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) loadMore();
      },
      { root: scrollContainerRef.current, threshold: 0.1 }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [loadMore]);

  return (
    <div 
      ref={scrollContainerRef}
      className="max-h-[1000px] overflow-y-auto custom-scrollbar pr-2 space-y-4 rounded-3xl"
    >
      {feed.length > 0 ? (
        feed.map((item) => (
          <NewsCard key={item._feedKey} item={item} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-slate-600 glass rounded-[2.5rem]">
          <Newspaper size={64} className="mb-4 opacity-10" />
          <p className="text-sm font-bold uppercase tracking-widest opacity-40">Chargement du flux...</p>
        </div>
      )}
      
      <div ref={sentinelRef} className="py-16 flex flex-col items-center justify-center gap-4 text-slate-700">
        <RefreshCw size={24} className="animate-spin opacity-20" />
        <span className="text-[10px] uppercase tracking-[0.4em] font-black opacity-20 text-center">
          Séquence circulaire active<br/>Répétition du contenu
        </span>
      </div>
    </div>
  );
}

// ── Dashboard principal ──────────────────────────────────────────────────────
export function StudentDashboard({ user }) {
  const navigate = useNavigate();
  const [realStats, setRealStats] = useState(null);
  const [studentStats, setStudentStats] = useState(null);
  const [newsSource, setNewsSource] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tout');
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsError, setNewsError] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');

  // Fetch initial des données
  const refreshData = useCallback(() => {
    statsAPI.getGlobal().then(res => setRealStats(res.data)).catch(() => {});
    statsAPI.getStudent().then(res => setStudentStats(res.data)).catch(() => {});
    
    newsAPI.infinite()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (data.length > 0) {
          setNewsSource(data);
          setNewsError(false);
        }
      })
      .catch(err => {
        console.error("News Feed Error:", err);
        setNewsError(true);
      })
      .finally(() => setLoadingNews(false));
  }, []);

  useEffect(() => {
    refreshData();
    const timer = setInterval(refreshData, 60000); // Refresh toutes les minutes
    return () => clearInterval(timer);
  }, [refreshData]);

  const displayStats = [
    { label: 'Utilisateurs',    value: realStats?.total_users    || '...', icon: Users,    color: 'text-blue-400' },
    { label: 'Établissements',  value: realStats?.total_schools  || '...', icon: Globe,    color: 'text-purple-400' },
    { label: 'Ressources',      value: realStats?.total_lessons  || '...', icon: ImageIcon,color: 'text-amber-400' },
  ];

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}min`;
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* ── 1. Grand Titre Hero ── */}
      <section className="relative h-[340px] rounded-[3rem] overflow-hidden glass neon-border shadow-2xl">
        <img src="/image/hero.png" alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-50"
          onError={e => { e.target.style.display = 'none'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A14] via-[#0A0A14]/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-14 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 text-primary">
            <Sparkles size={20} className="animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">
              {user?.prenom ? `Bienvenue, ${user.prenom}` : 'Bienvenue'}
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black leading-none">
            Espace <span className="text-gradient">ENENI</span>
          </motion.h1>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="glass-sm px-5 py-2 rounded-2xl flex items-center gap-3">
              <Clock size={16} className="text-emerald-400" />
              <div className="text-left">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Temps d'étude</p>
                <p className="text-sm font-black text-white">{formatTime(studentStats?.total_study_time || 0)}</p>
              </div>
            </div>
            <div className="glass-sm px-5 py-2 rounded-2xl flex items-center gap-3">
              <CheckCircle size={16} className="text-blue-400" />
              <div className="text-left">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Cours Validés</p>
                <p className="text-sm font-black text-white">{studentStats?.total_validated_chapters || 0} chapitres</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Gauche (Profil & Temps par Matière) */}
        <aside className="lg:col-span-3 space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 sticky top-24">
            
            {/* Profil Card */}
            <div className="glass p-8 rounded-[2.5rem] space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-1.5 shadow-2xl shadow-primary/30">
                  <div className="w-full h-full rounded-full bg-[#0A0A14] flex items-center justify-center text-4xl font-black text-white">
                    {user?.prenom?.[0] || user?.username?.[0] || 'U'}
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white">{user?.prenom || user?.username}</h4>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">{user?.niveau || 'Niveau non défini'}</p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5 space-y-4">
                {displayStats.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-wider flex items-center gap-3">
                      <s.icon size={16} className={s.color} /> {s.label}
                    </span>
                    <span className="text-white font-black">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Temps par Matière */}
            <div className="glass p-8 rounded-[2.5rem] space-y-6">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                <BarChart3 size={16} className="text-primary" /> Temps par Matière
              </h3>
              <div className="space-y-4">
                {studentStats?.matieres && studentStats.matieres.length > 0 ? (
                  studentStats.matieres.map((m, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                        <span className="text-slate-300">{m.chapitre__matiere__nom}</span>
                        <span className="text-white">{formatTime(m.total_secondes)}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${(m.chapitres_valides / (m.total_chapitres || 1)) * 100}%` }}
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                        />
                      </div>
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest text-right">
                        {m.chapitres_valides} / {m.total_chapitres} Validés
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-600 italic">Aucune donnée d'étude enregistrée.</p>
                )}
              </div>
            </div>

            <button onClick={() => navigate('/courses')}
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-primary hover:border-primary transition-all flex items-center justify-center gap-3 group"
            >
              Reprendre les cours <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </aside>

        {/* Main Feed (Centre) */}
        <main className="lg:col-span-6 space-y-6">
          <section className="space-y-6">
             <div className="flex items-center gap-3 glass p-2 rounded-[1.5rem]">
               <button onClick={() => setActiveTab('feed')}
                 className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'feed' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-slate-500 hover:text-white'}`}
               >
                 <Newspaper size={16} /> Flux Social
               </button>
               <button onClick={() => setActiveTab('gallery')}
                 className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'gallery' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-slate-500 hover:text-white'}`}
               >
                 <ImageIcon size={16} /> Galerie
               </button>
             </div>

             {activeTab === 'feed' ? (
               <div className="space-y-6">
                 <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                   {CATEGORIES.map(cat => (
                     <button key={cat} onClick={() => setActiveCategory(cat)}
                       className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap border transition-all ${
                         activeCategory === cat
                           ? 'bg-primary border-primary text-white shadow-lg'
                           : 'bg-white/5 border-white/10 text-slate-500 hover:text-white hover:border-white/20'
                       }`}>
                       {cat}
                     </button>
                   ))}
                 </div>
                 {loadingNews ? (
                   <div className="flex flex-col items-center justify-center py-28 gap-6 glass rounded-[3rem]">
                     <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                     <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] animate-pulse">Chargement...</p>
                   </div>
                 ) : newsError ? (
                   <div className="flex flex-col items-center justify-center py-24 glass rounded-[2.5rem] border border-red-500/10">
                     <AlertTriangle size={48} className="mb-4 text-red-500/50" />
                     <p className="text-xs font-bold uppercase tracking-widest opacity-40 text-slate-600">Erreur de connexion</p>
                     <button onClick={refreshData} className="mt-4 px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase">Réessayer</button>
                   </div>
                 ) : (
                   <SocialFeedTab newsSource={newsSource} activeCategory={activeCategory} />
                 )}
               </div>
             ) : (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {GALLERY.map((item, i) => (
                   <div key={i} className="glass rounded-[2rem] overflow-hidden group cursor-pointer border border-white/5 hover:border-primary/30 transition-all">
                      <div className="aspect-[16/10] overflow-hidden">
                        <img src={item.src} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      </div>
                      <div className="p-5">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">{item.title}</p>
                      </div>
                   </div>
                 ))}
               </motion.div>
             )}
          </section>
        </main>

        {/* Sidebar Droite (Countdown & Partenaires) */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="glass p-8 rounded-[2.5rem] space-y-8 sticky top-24">
             
             {/* Compte à rebours Examens Nationaux */}
             <div className="space-y-4">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                   <AlertTriangle size={16} className="text-amber-400" /> Échéances
                </h3>
                <Countdown label="Prochain Examen BEPC" targetDate="2026-07-15T08:00:00" />
                <Countdown label="Fin d'année scolaire" targetDate="2026-08-30T17:00:00" />
             </div>

             <div className="pt-8 border-t border-white/5 space-y-6">
               <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                  <Users size={16} className="text-primary" /> Partenaires
               </h3>
               <div className="grid grid-cols-2 gap-4">
                 {COLLABORATORS.slice(0, 4).map(c => (
                   <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer" 
                      className="glass-sm p-4 rounded-2xl flex items-center justify-center hover:border-primary/30 transition-all group aspect-square">
                      <img src={c.logo} alt={c.name} className="max-w-full max-h-full object-contain brightness-50 group-hover:brightness-100 transition-all" />
                   </a>
                 ))}
               </div>
               <button className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">
                  Voir tout
               </button>
             </div>
          </div>
        </aside>

      </div>

      <footer className="col-span-full text-center py-16 opacity-20">
        <p className="text-[10px] font-black uppercase tracking-[0.8em]">© 2026 ENENI — Ministère de l'Éducation Nationale</p>
      </footer>
    </div>
  );
}
