import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI, publicAPI } from '../services/api';
import { Eye, EyeOff, Sparkles, School, UserCircle, Hash, Lock, Search, ChevronDown, Check } from 'lucide-react';

const TYPE_BADGE_COLORS = {
  LYCEE: { bg: 'rgba(27,138,90,0.15)', text: '#1B8A5A' },
  CEG: { bg: 'rgba(124,58,237,0.15)', text: '#7C3AED' },
  EPP: { bg: 'rgba(6,182,212,0.15)', text: '#06B6D4' },
  AUTRE: { bg: 'rgba(156,163,175,0.15)', text: '#9CA3AF' },
};

// ── Composant Dropdown Personnalisé ──────────────────────────────────────────
function EstablishmentSelector({ value, onChange, options, loading, typeFilters, placeholderText, searchPlaceholder, loadingText, noResultText }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const containerRef = useRef(null);

  const selectedOption = options.find(o => String(o.id) === String(value));
  const filteredOptions = options.filter(o => {
    const matchesSearch = o.nom.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || o.type === typeFilter;
    return matchesSearch && matchesType;
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full glass-sm px-4 py-3 text-sm rounded-xl border transition-all flex items-center justify-between focus:outline-none ring-offset-0 ${
          isOpen ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-white/20 bg-white/5 hover:bg-white/10'
        }`}
        style={{ color: 'var(--text-primary)' }}
      >
        <div className="flex items-center gap-3 truncate">
          <School size={18} className={selectedOption ? "text-primary" : "text-slate-400"} />
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {selectedOption ? selectedOption.nom : placeholderText}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {selectedOption?.type_label && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
              style={{ background: (TYPE_BADGE_COLORS[selectedOption.type] || TYPE_BADGE_COLORS.AUTRE).bg, color: (TYPE_BADGE_COLORS[selectedOption.type] || TYPE_BADGE_COLORS.AUTRE).text }}>
              {selectedOption.type_label}
            </span>
          )}
          <ChevronDown size={18} className={`text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            className="absolute z-50 w-full mt-2 border border-primary/30 rounded-2xl shadow-[0_10px_40px_-10px_rgba(124,58,237,0.3)] overflow-hidden"
            style={{ background: 'var(--bg-card)' }}
          >
            {/* Recherche */}
            <div className="p-3 border-b border-white/10 bg-white/5 space-y-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                <input
                  type="text"
                  autoFocus
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-app border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {/* Filtres par type */}
              <div className="flex gap-1.5">
                {typeFilters.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setTypeFilter(f.id); }}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                      typeFilter === f.id
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'border border-white/10 hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Liste */}
            <div className="max-h-56 overflow-y-auto custom-scrollbar p-1.5">
              {loading ? (
                <div className="p-6 text-center text-sm flex flex-col items-center gap-2 text-slate-400">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  {loadingText}
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">
                  {noResultText}
                </div>
              ) : (
                filteredOptions.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onChange(option.id);
                      setIsOpen(false);
                      setSearch('');
                      setTypeFilter('');
                    }}
                    className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between rounded-xl transition-all mb-1 last:mb-0 ${
                      String(value) === String(option.id) 
                        ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20' 
                        : 'text-[var(--text-primary)] hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${String(value) === String(option.id) ? 'bg-white animate-pulse' : ''}`}
                        style={{ background: String(value) === String(option.id) ? '' : 'var(--color-primary)' }} />
                      <span className="truncate">{option.nom}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {option.type_label && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                          style={{ background: (TYPE_BADGE_COLORS[option.type] || TYPE_BADGE_COLORS.AUTRE).bg, color: (TYPE_BADGE_COLORS[option.type] || TYPE_BADGE_COLORS.AUTRE).text }}>
                          {option.type_label}
                        </span>
                      )}
                      {String(value) === String(option.id) && <Check size={16} className="text-white flex-shrink-0" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page Principale ──────────────────────────────────────────────────────────
export function LoginPage({ onLogin }) {
  const { t } = useTranslation();
  const ROLES = [
    { id: 'ETUDIANT', label: t('login.student_role') },
    { id: 'ENSEIGNANT', label: t('login.teacher_role') },
    { id: 'ADMINISTRATEUR', label: t('login.admin_role') },
  ];

  const TYPE_FILTERS = [
    { id: '', label: t('login.filter_all') },
    { id: 'LYCEE', label: t('login.filter_lycee') },
    { id: 'CEG', label: t('login.filter_ceg') },
    { id: 'EPP', label: t('login.filter_epp') },
  ];

  const [form, setForm] = useState({
    establishment: '',
    role: 'ETUDIANT',
    identifier: '',
    password: ''
  });
  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    publicAPI.getEstablishments({ page_size: 200 })
      .then(res => {
        const list = res.data?.results || res.data || [];
        setSchools(list);
        if (list.length === 0) setError(t('login.no_establishment_error'));
      })
      .catch(() => setError(t('login.load_establishments_error')))
      .finally(() => setSchoolsLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.establishment) {
      setError(t('login.select_establishment_error'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login({
        username: form.identifier,
        password: form.password,
        role: form.role,
        establishment_id: form.establishment
      });
      
      if (res.data?.access) sessionStorage.setItem('eneni_token', res.data.access);
      if (res.data?.refresh) sessionStorage.setItem('eneni_refresh', res.data.refresh);
      
      onLogin?.(res.data?.user);
    } catch (err) {
      setError(err.response?.data?.detail || t('login.identifier_incorrect'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />
      </div>

      <motion.div
        className="glass neon-border w-full max-w-md p-8 space-y-6 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-3">
          <motion.img
            src="/image/min_logo_pro.jpeg"
            alt={t('login.alt_logo')}
            className="w-16 h-16 rounded-2xl mx-auto object-cover border border-white/20 shadow-lg"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            onError={(e) => { e.target.style.display='none'; }}
          />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>EN<span className="text-gradient">ENI</span></h1>
          <p className="text-slate-400 text-sm">{t('login.login_portal')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Établissement (Custom Searchable Selector) */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2 font-semibold">
              <School size={12} className="text-primary" /> {t('login.establishment_label')}
            </label>
            <EstablishmentSelector
              value={form.establishment}
              onChange={(val) => setForm({ ...form, establishment: val })}
              options={schools}
              loading={schoolsLoading}
              typeFilters={TYPE_FILTERS}
              placeholderText={t('login.select_establishment')}
              searchPlaceholder={t('login.search_placeholder')}
              loadingText={t('login.loading_establishments')}
              noResultText={t('login.no_establishment')}
            />
          </div>

          {/* Rôle */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2 font-semibold">
              <UserCircle size={12} className="text-primary" /> {t('login.role_label')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(role => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setForm({ ...form, role: role.id })}
                  className={`py-2 text-[10px] font-black rounded-xl border transition-all uppercase tracking-wider ${
                    form.role === role.id
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                      : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                  }`}
                >
                  {role.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Identifier */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2 font-semibold">
              <Hash size={12} className="text-primary" /> {form.role === 'ETUDIANT' ? t('login.student_number') : t('login.email_identifier')}
            </label>
            <input
              type="text"
              required
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              className="w-full glass-sm bg-transparent px-4 py-3 text-sm rounded-xl focus:outline-none border border-white/10 focus:border-primary/50 transition"
              style={{ color: 'var(--text-primary)' }}
              placeholder={form.role === 'ETUDIANT' ? t('login.student_placeholder') : t('login.email_placeholder')}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2 font-semibold">
              <Lock size={12} className="text-primary" /> {t('login.password_label')}
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full glass-sm bg-transparent px-4 py-3 pr-12 text-sm rounded-xl focus:outline-none border border-white/10 focus:border-primary/50 transition"
                style={{ color: 'var(--text-primary)' }}
                placeholder="••••••••"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-red-400 text-[11px] font-bold text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4 flex flex-col gap-1">
              <span>{error}</span>
              <span className="opacity-60 font-medium">{t('login.check_credentials')}</span>
            </motion.div>
          )}

          {form.role === 'ETUDIANT' && !error && (
            <p className="text-[10px] text-primary/60 text-center font-bold uppercase tracking-tighter">
              {t('login.tip_text')}
            </p>
          )}

          <motion.button
            type="submit"
            className="btn-metal w-full py-4 flex items-center justify-center gap-2 text-sm font-bold"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Sparkles size={16} /> {t('login.login_button')}</>
            )}
          </motion.button>
        </form>

        <div className="text-center space-y-3 pt-4 border-t border-white/5">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
            {t('login.sso_note')}
          </p>
          <a href="/" className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1">
            {t('login.back_home')}
          </a>
        </div>
      </motion.div>
    </div>
  );
}
