import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, Users, Globe, BookOpen, Sparkles, Award,
  ChevronLeft, ChevronRight, ExternalLink, Play,
  School, ShieldCheck, LogIn, Star
} from 'lucide-react';
import { publicAPI } from '../services/api';



const DEFAULT_STATS = [
  { label: 'Établissements', value: '2 500+', icon: School,    color: 'from-violet-500 to-purple-600' },
  { label: 'Élèves inscrits', value: '1.2M',  icon: Users,     color: 'from-cyan-500 to-blue-600' },
  { label: 'Ressources',      value: '15 000+',icon: BookOpen,  color: 'from-emerald-500 to-teal-600' },
  { label: 'Taux de réussite',value: '85%',   icon: Sparkles,  color: 'from-amber-500 to-orange-600' },
];

// ── Carrousel partenaires ───────────────────────────────────────────────────
function PartnerCarousel({ partners = [] }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const visible = 5;
  const total = partners.length;

  const next = () => setIdx(i => (i + 1) % total);
  const prev = () => setIdx(i => (i - 1 + total) % total);

  useEffect(() => {
    timerRef.current = setInterval(next, 3500);
    return () => clearInterval(timerRef.current);
  }, []);

  const getVisible = () => {
    const items = [];
    if (total === 0) return items;
    for (let i = 0; i < Math.min(visible, total); i++) items.push(partners[(idx + i) % total]);
    return items;
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-4 overflow-hidden px-12">
        {getVisible().map((p, i) => (
          <motion.a
            key={`${p.id}-${idx}-${i}`}
            href={p.url} target="_blank" rel="noopener noreferrer"
            className="flex-1 min-w-0 glass-sm p-4 rounded-2xl flex flex-col items-center gap-3 group hover:border-primary/40 transition-all"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4 }}
          >
            <img src={p.logo} alt={p.name}
              className="h-12 w-full object-contain filter brightness-90 group-hover:brightness-110 transition-all"
              onError={e => { e.target.style.display='none'; }}
            />
            <span className="text-[10px] text-slate-500 text-center group-hover:text-slate-300 transition-colors truncate w-full text-center">
              {p.name}
            </span>
            <ExternalLink size={10} className="text-slate-600 group-hover:text-primary transition-colors" />
          </motion.a>
        ))}
      </div>
      <button onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center hover:border-primary/40 transition-all">
        <ChevronLeft size={16} className="text-slate-300" />
      </button>
      <button onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center hover:border-primary/40 transition-all">
        <ChevronRight size={16} className="text-slate-300" />
      </button>
      <div className="flex justify-center gap-1.5 mt-4">
        {partners.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-primary w-4' : 'bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Page principale ─────────────────────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate();
  const [search, setSearch]       = useState('');
  const [results, setResults]     = useState([]);
  const [searching, setSearching] = useState(false);
  const [stats, setStats]         = useState(null);
  const [partners, setPartners]   = useState([]);
  const [renovations, setRenovations] = useState([]);
  const [activeReno, setActiveReno] = useState(0);

  // Chargement des stats publiques
  useEffect(() => {
    publicAPI.getStats()
      .then(res => setStats(res.data))
      .catch(() => {});
      
    publicAPI.getPartners().then(res => setPartners(res.data || []));
    publicAPI.getRenovations().then(res => setRenovations(res.data || []));
  }, []);

  // Recherche publique
  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await publicAPI.search(search);
        setResults(res.data?.results || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const displayStats = stats
    ? [
        { label: 'Établissements', value: stats.total_schools || '2 500+',  icon: School,   color: 'from-violet-500 to-purple-600' },
        { label: 'Élèves inscrits', value: stats.total_students || '1.2M', icon: Users,    color: 'from-cyan-500 to-blue-600' },
        { label: 'Ressources',      value: stats.total_lessons || '15 000+',icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
        { label: 'Taux de réussite',value: stats.success_rate || '85%',    icon: Sparkles, color: 'from-amber-500 to-orange-600' },
      ]
    : DEFAULT_STATS;

  return (
    <div className="min-h-screen bg-[#0A0A14] text-white">

      {/* ── Navbar publique ──────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/10"
        style={{ background: 'rgba(10,10,20,0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/image/min_logo_pro.jpeg" alt="ENENI" className="w-10 h-10 rounded-xl object-cover border border-white/20"
              onError={e => { e.target.style.display='none'; }} />
            <span className="font-bold text-xl tracking-tight hidden sm:block">
              EN<span className="text-gradient">ENI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden md:block">Plateforme Nationale d'Éducation</span>
            <motion.button
              onClick={() => navigate('/login')}
              className="btn-metal flex items-center gap-2 px-4 py-2 text-sm"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <LogIn size={15} /> Se connecter
            </motion.button>
          </div>
        </div>
      </nav>

      <main className="pt-16">

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <img src="/image/hero.png" alt="Hero" className="w-full h-full object-cover opacity-25"
              onError={e => { e.target.style.display='none'; }} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A14]/50 via-transparent to-[#0A0A14]" />
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
              style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
              style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 space-y-8">
            <motion.div className="flex items-center justify-center gap-2 text-primary"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Star size={16} fill="currentColor" />
              <span className="text-sm font-semibold uppercase tracking-widest">Ministère de l'Éducation Nationale — Madagascar</span>
              <Star size={16} fill="currentColor" />
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-7xl font-black leading-tight"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              L'Éducation<br /><span className="text-gradient">Numérique</span><br />pour Tous
            </motion.h1>

            <motion.p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              ENENI connecte élèves, enseignants et établissements sur une plateforme nationale
              d'apprentissage moderne, accessible et sécurisée.
            </motion.p>

            {/* ── Barre de recherche publique ────────────────────────── */}
            <motion.div className="relative max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un cours, une matière, un établissement..."
                  className="w-full glass pl-12 pr-4 py-4 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 border border-white/10 transition text-base"
                />
                {searching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {/* Résultats */}
              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full mt-2 w-full glass rounded-2xl overflow-hidden z-50 border border-white/10 shadow-xl"
                  >
                    {results.slice(0, 6).map((r, i) => (
                      <div key={i} className="px-4 py-3 hover:bg-white/5 transition cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0">
                        <BookOpen size={14} className="text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{r.titre || r.name}</p>
                          <p className="text-xs text-slate-500 truncate">{r.type || 'Cours'} · {r.niveau || ''}</p>
                        </div>
                        <span className="ml-auto text-xs text-primary flex-shrink-0">
                          Connexion requise
                        </span>
                      </div>
                    ))}
                    <div className="px-4 py-3 text-center">
                      <button onClick={() => navigate('/login')} className="text-xs text-primary hover:underline">
                        Connectez-vous pour accéder au contenu →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div className="flex flex-col sm:flex-row gap-3 justify-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <button onClick={() => navigate('/login')} className="btn-metal flex items-center gap-2 px-8 py-4 text-base">
                <Play size={18} fill="currentColor" /> Accéder à ma plateforme
              </button>
              <a href="#about" className="btn-ghost flex items-center gap-2 px-8 py-4 text-base">
                <Globe size={18} /> En savoir plus
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── Bandeau Partenaires (Marquee Premium) ─────────────────── */}
        <section className="border-y border-white/5 bg-white/[0.02] py-10 overflow-hidden">
          <div className="flex flex-col gap-6">
            <p className="text-[10px] text-center uppercase tracking-[0.4em] text-slate-500 font-black">Soutenu par nos partenaires institutionnels</p>
            <div className="relative flex overflow-hidden">
              <div className="flex animate-marquee whitespace-nowrap items-center gap-16 md:gap-24">
                {[...partners, ...partners].length > 0 ? [...partners, ...partners].map((p, i) => (
                  <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="h-10 md:h-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all flex items-center gap-3">
                    <img src={p.logo} alt={p.name} className="h-full object-contain" />
                    <span className="text-xs font-bold text-slate-400 hidden sm:block">{p.nom}</span>
                  </a>
                )) : (
                   <div className="flex gap-20 opacity-20">
                     {[1,2,3,4,5].map(i => <div key={i} className="h-10 w-32 bg-white/10 rounded-xl animate-pulse" />)}
                   </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Statistiques ────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayStats.map((stat, i) => (
              <motion.div key={i}
                className="glass rounded-3xl p-6 flex flex-col items-center text-center gap-3 group"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon size={22} className="text-white" />
                </div>
                <span className="text-3xl font-black text-white">{stat.value}</span>
                <span className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── À propos ────────────────────────────────────────────────── */}
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-black mb-4">Notre <span className="text-gradient">Mission</span></h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Digitaliser l'écosystème éducatif malgache pour garantir un accès équitable à une éducation de qualité sur tout le territoire.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: School,      color: 'text-violet-400', bg: 'bg-violet-500/10', title: 'Pour les Élèves', desc: 'Accès aux cours, ressources, vidéos et examens depuis n\'importe quel appareil, à tout moment.' },
              { icon: Users,       color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   title: 'Pour les Enseignants', desc: 'Outils de gestion de classe, diffusion de cours en direct, suivi des progrès élèves.' },
              { icon: ShieldCheck, color: 'text-emerald-400',bg: 'bg-emerald-500/10',title: 'Pour les Établissements', desc: 'Tableau de bord administratif, gestion des inscriptions et communication institutionnelle.' },
            ].map((c, i) => (
              <motion.div key={i} className="glass p-8 rounded-3xl space-y-4 group"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}>
                <div className={`w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center`}>
                  <c.icon size={26} className={c.color} />
                </div>
                <h3 className="text-xl font-bold">{c.title}</h3>
                <p className="text-slate-400 leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Rénovations éducatives ──────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <motion.div className="glass rounded-3xl p-8 sm:p-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-black">Rénovations <span className="text-gradient">Éducatives</span></h2>
                <p className="text-slate-400 mt-1">Les grandes avancées du Ministère ces dernières années</p>
              </div>
              <a href="https://www.education.gov.mg" target="_blank" rel="noopener noreferrer"
                className="btn-ghost flex items-center gap-2 text-sm px-4 py-2">
                <ExternalLink size={14} /> Site officiel du Ministère
              </a>
            </div>

            <div className="flex gap-3 flex-wrap mb-8">
              {renovations.map((r, i) => (
                <button key={i} onClick={() => setActiveReno(i)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeReno === i ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'glass-sm text-slate-400 hover:text-white'
                  }`}>
                  {r.annee}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {renovations.length > 0 && renovations[activeReno] && (
                <motion.div key={activeReno}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="glass-sm rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl font-black text-primary flex-shrink-0">
                    {renovations[activeReno].annee.slice(2)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{renovations[activeReno].titre}</h3>
                    <p className="text-slate-400 leading-relaxed">{renovations[activeReno].description}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* ── Partenaires ────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <motion.div className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-black mb-3">Nos <span className="text-gradient">Partenaires</span></h2>
            <p className="text-slate-400">Organisations internationales soutenant l'éducation à Madagascar</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <PartnerCarousel partners={partners} />
          </motion.div>
        </section>

        {/* ── CTA connexion ───────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <motion.div
            className="relative overflow-hidden rounded-3xl p-12 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.15))' }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="absolute inset-0 neon-border rounded-3xl pointer-events-none" />
            <Award size={48} className="mx-auto mb-6 text-primary" />
            <h2 className="text-4xl font-black mb-4">Prêt à Apprendre ?</h2>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
              Connectez-vous avec les identifiants fournis par votre établissement pour accéder à tous vos cours et ressources.
            </p>
            <button onClick={() => navigate('/login')} className="btn-metal flex items-center gap-2 px-10 py-4 text-lg mx-auto">
              <LogIn size={20} /> Accéder à ma plateforme
            </button>
            <p className="text-slate-600 text-xs mt-6">
              Vous n'avez pas de compte ? Contactez votre établissement scolaire.
            </p>
          </motion.div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer className="border-t border-white/5 py-10 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src="/image/min_logo_pro.jpeg" alt="Logo" className="w-8 h-8 rounded-lg object-cover"
                onError={e => { e.target.style.display='none'; }} />
              <span className="font-bold text-lg">EN<span className="text-gradient">ENI</span></span>
            </div>
            <p className="text-slate-500 text-sm">Ministère de l'Éducation Nationale de Madagascar</p>
            <p className="text-slate-600 text-xs mt-2">© 2026 ENENI — Plateforme Nationale d'E-Learning · Tous droits réservés</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
