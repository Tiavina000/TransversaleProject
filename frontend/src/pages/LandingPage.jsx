import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, Users, BookOpen, Sparkles, Award,
  ChevronLeft, ChevronRight, ExternalLink,
  School, ShieldCheck, LogIn, Star
} from 'lucide-react';
import { publicAPI } from '../services/api';
import { ThemeSwitcher } from '../components/UI/ThemeSwitcher';

const DEFAULT_STATS = [
  { label: 'Établissements', value: '2 500+', icon: School,    color: 'from-[#1B8A5A] to-[#126B45]' },
  { label: 'Élèves inscrits', value: '1.2M',  icon: Users,     color: 'from-[#2EA87A] to-[#1B8A5A]' },
  { label: 'Ressources',      value: '15 000+',icon: BookOpen,  color: 'from-[#3CB892] to-[#2EA87A]' },
  { label: 'Taux de réussite',value: '85%',   icon: Sparkles,  color: 'from-[#1B8A5A] to-[#0F5A3A]' },
];

// ── Carrousel partenaires ───────────────────────────────────────────────────
function PartnerCarousel({ partners = [] }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const visible = 5;
  const total = partners.length;

  const next = useCallback(() => setIdx(i => (i + 1) % total), [total]);
  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total]);

  useEffect(() => {
    timerRef.current = setInterval(next, 3500);
    return () => clearInterval(timerRef.current);
  }, [next]);

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
            className="flex-1 min-w-0 p-4 rounded-2xl flex flex-col items-center gap-3 group transition-all"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4 }}
          >
            <img src={p.logo} alt={p.name} loading="lazy"
              className="h-12 w-full object-contain filter brightness-90 group-hover:brightness-110 transition-all"
              onError={e => { e.target.style.display='none'; }}
            />
            <span className="text-[10px] text-center transition-colors truncate w-full text-center" style={{ color: 'var(--text-muted)' }}>
              {p.name}
            </span>
            <ExternalLink size={10} className="group-hover:text-primary transition-colors" style={{ color: 'var(--text-muted)' }} />
          </motion.a>
        ))}
      </div>
      <button onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}>
        <ChevronLeft size={16} style={{ color: 'var(--text-muted)' }} />
      </button>
      <button onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}>
        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
      </button>
      <div className="flex justify-center gap-1.5 mt-4">
        {partners.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-primary w-4' : ''}`}
            style={i === idx ? {} : { background: 'var(--overlay-heavy)' }}
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
    if (!search.trim()) { return; }
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
        { label: 'Établissements', value: stats.total_schools || '2 500+',  icon: School,   color: 'from-[#1B8A5A] to-[#126B45]' },
        { label: 'Élèves inscrits', value: stats.total_students || '1.2M', icon: Users,    color: 'from-[#2EA87A] to-[#1B8A5A]' },
        { label: 'Ressources',      value: stats.total_lessons || '15 000+',icon: BookOpen, color: 'from-[#3CB892] to-[#2EA87A]' },
        { label: 'Taux de réussite',value: stats.success_rate || '85%',    icon: Sparkles, color: 'from-[#1B8A5A] to-[#0F5A3A]' },
      ]
    : DEFAULT_STATS;

  return (
    <div className="min-h-screen bg-app overflow-x-hidden" style={{ color: 'var(--text-primary)' }}>

      {/* ── Navbar publique ──────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-40"
        style={{ background: 'var(--bg-app)', borderTop: '3px solid var(--color-primary)', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/image/min_logo_pro.jpeg" alt="ENENI" loading="lazy" className="w-10 h-10 rounded-xl object-cover border border-white/20"
              onError={e => { e.target.style.display='none'; }} />
            <span className="font-bold text-xl tracking-tight hidden sm:block text-primary">
              ENENI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs hidden md:block" style={{ color: 'var(--text-secondary)' }}>Plateforme Nationale d'Éducation</span>
            <ThemeSwitcher />
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white"
            >
              <LogIn size={15} /> Se connecter
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-16">


        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #EAF7F0 0%, #FFFFFF 50%)' }} />

          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 space-y-8">
            <motion.div className="flex items-center justify-center gap-2 text-primary"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Star size={16} fill="currentColor" />
              <span className="text-sm font-semibold uppercase tracking-widest">Ministère de l'Éducation Nationale — Madagascar</span>
              <Star size={16} fill="currentColor" />
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-6xl font-black leading-tight text-[var(--text-primary)]"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              Bienvenue sur le portail<br />de l'Éducation Nationale
            </motion.h1>

            <motion.p className="text-lg max-w-2xl mx-auto leading-relaxed text-[var(--text-secondary)]"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              Informations scolaires, examens, résultats et services éducatifs.
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
                  className="w-full pl-12 pr-4 py-4 rounded-2xl placeholder:text-slate-400 focus:outline-none border-2 border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 transition text-base bg-app text-main"
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
                    className="absolute top-full mt-2 w-full rounded-2xl overflow-hidden z-50 shadow-xl border border-glass glass"
                  >
                    {results.slice(0, 6).map((r, i) => (
                      <div key={i} className="px-4 py-3 hover:bg-[var(--overlay-medium)] transition cursor-pointer flex items-center gap-3 border-b border-glass last:border-0">
                        <BookOpen size={14} className="text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm truncate text-main">{r.titre || r.name}</p>
                          <p className="text-xs truncate text-muted">{r.type || 'Cours'} · {r.niveau || ''}</p>
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

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate('/about')} className="btn-metal flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-lg">
                Découvrir
              </button>
              <button onClick={() => navigate('/results')} className="btn-ghost flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-lg">
                Résultats
              </button>
            </div>
          </div>
        </section>

        {/* ── Bandeau Partenaires ─────────────────────────────────── */}
        <section className="border-y py-10 overflow-hidden" style={{ borderColor: 'var(--border-glass)', background: 'var(--overlay-light)' }}>
          <div className="flex flex-col gap-6">
            <p className="text-[10px] text-center uppercase tracking-[0.4em] font-black text-muted">Soutenu par nos partenaires institutionnels</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 px-4">
              {partners.length > 0 ? partners.map((p, i) => (
                <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="h-10 md:h-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all flex items-center gap-3">
                  <img src={p.logo} alt={p.name} loading="lazy" className="h-full object-contain" />
                  <span className="text-xs font-bold hidden sm:block text-muted">{p.nom}</span>
                </a>
              )) : (
                 <div className="flex gap-8 opacity-20">
                   {[1,2,3,4,5].map(i => <div key={i} className="h-10 w-32 rounded-xl animate-pulse" style={{ background: 'var(--overlay-medium)' }} />)}
                 </div>
              )}
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
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center`}>
                  <stat.icon size={22} className="text-white" />
                </div>
                <span className="text-3xl font-black text-main">{stat.value}</span>
                <span className="text-[11px] uppercase tracking-widest font-semibold text-muted">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── À propos ────────────────────────────────────────────────── */}
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-black mb-4 text-main">Notre <span className="text-primary">Mission</span></h2>
            <p className="text-lg max-w-2xl mx-auto text-sec">
              Digitaliser l'écosystème éducatif malgache pour garantir un accès équitable à une éducation de qualité sur tout le territoire.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: School,      title: 'Pour les Élèves', desc: 'Accès aux cours, ressources, vidéos et examens depuis n\'importe quel appareil, à tout moment.' },
              { icon: Users,       title: 'Pour les Enseignants', desc: 'Outils de gestion de classe, diffusion de cours en direct, suivi des progrès élèves.' },
              { icon: ShieldCheck, title: 'Pour les Établissements', desc: 'Tableau de bord administratif, gestion des inscriptions et communication institutionnelle.' },
            ].map((c, i) => (
              <motion.div key={i} className="card-topline p-8 space-y-4 group glass"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
                  <c.icon size={26} />
                </div>
                <h3 className="text-xl font-bold text-main">{c.title}</h3>
                <p className="leading-relaxed text-sec">{c.desc}</p>
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
                <h2 className="text-3xl font-black text-main">Rénovations <span className="text-primary">Éducatives</span></h2>
                <p className="mt-1 text-muted">Les grandes avancées du Ministère ces dernières années</p>
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
                    activeReno === i ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'glass-sm text-slate-400 hover:text-primary'
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
                    <h3 className="text-xl font-bold mb-2 text-main">{renovations[activeReno].titre}</h3>
                    <p className="leading-relaxed text-sec">{renovations[activeReno].description}</p>
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
            <h2 className="text-3xl font-black mb-3 text-main">Nos <span className="text-primary">Partenaires</span></h2>
            <p className="text-muted">Organisations internationales soutenant l'éducation à Madagascar</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <PartnerCarousel partners={partners} />
          </motion.div>
        </section>

        {/* ── CTA connexion ───────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <motion.div
            className="relative overflow-hidden rounded-3xl p-12 text-center shadow-2xl shadow-primary/20"
            style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Award size={48} className="mx-auto mb-6 text-white" />
            <h2 className="text-4xl font-black mb-4 text-white">Prêt à Apprendre ?</h2>
            <p className="text-lg mb-8 max-w-xl mx-auto text-white/90">
              Connectez-vous avec les identifiants fournis par votre établissement pour accéder à tous vos cours et ressources.
            </p>
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 px-10 py-4 text-lg font-semibold rounded-lg mx-auto bg-white text-[var(--color-primary)] hover:bg-gray-100 transition">
              <LogIn size={20} /> Accéder à ma plateforme
            </button>
            <p className="text-xs mt-6 text-white/60">
              Vous n'avez pas de compte ? Contactez votre établissement scolaire.
            </p>
          </motion.div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer className="bg-[var(--bg-card)] border-t border-[var(--border-glass)] relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src="/image/min_logo_pro.jpeg" alt="Logo" loading="lazy" className="w-8 h-8 rounded-lg object-cover"
                    onError={e => { e.target.style.display='none'; }} />
                  <span className="font-bold text-lg text-main">ENENI</span>
                </div>
                <p className="text-sm text-sec">Ministère de l'Éducation Nationale de Madagascar</p>
                <p className="text-xs mt-2 text-muted">© 2026 ENENI — Plateforme Nationale d'E-Learning</p>
              </div>
              <div>
                <h4 className="font-bold mb-3 text-main">Contact</h4>
                <p className="text-sm text-sec hover:text-primary transition cursor-pointer">contact@education.gov.mg</p>
                <p className="text-sm text-sec hover:text-primary transition cursor-pointer">+261 20 22 123 45</p>
                <p className="text-sm text-sec">Antananarivo, Madagascar</p>
              </div>
              <div>
                <h4 className="font-bold mb-3 text-main">Liens</h4>
                <a href="https://www.education.gov.mg" target="_blank" rel="noopener noreferrer" className="block text-sm mb-2 text-sec hover:text-primary transition">Site officiel</a>
                <a href="/login" className="block text-sm mb-2 text-sec hover:text-primary transition">Espace enseignant</a>
                <a href="/login" className="block text-sm text-sec hover:text-primary transition">Espace élève</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
