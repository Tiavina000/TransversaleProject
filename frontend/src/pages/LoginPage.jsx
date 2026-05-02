import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../services/api';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

export function LoginPage({ onLogin }) {
  const { t } = useTranslation();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login(form);
      if (res.data?.token) localStorage.setItem('eneni_token', res.data.token);
      onLogin?.(res.data?.user);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
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
        {/* Logo */}
        <div className="text-center space-y-3">
          <motion.div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-3xl animate-glow"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            E
          </motion.div>
          <h1 className="text-2xl font-bold text-white">EN<span className="text-gradient">ENI</span></h1>
          <p className="text-slate-400 text-sm">Plateforme Éducative</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 uppercase tracking-wider">{t('auth.email')}</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full glass-sm bg-transparent px-4 py-3 text-sm text-white rounded-xl focus:outline-none border border-white/10 focus:border-primary/50 transition"
              placeholder="etudiant@eneni.mg"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 uppercase tracking-wider">{t('auth.password')}</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full glass-sm bg-transparent px-4 py-3 pr-12 text-sm text-white rounded-xl focus:outline-none border border-white/10 focus:border-primary/50 transition"
                placeholder="••••••••"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
              {error}
            </motion.p>
          )}

          {/* Forgot */}
          <div className="text-right">
            <button type="button" className="text-xs text-primary hover:underline">{t('auth.forgot')}</button>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            className="btn-metal w-full py-3 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Sparkles size={16} /> {t('auth.login')}</>
            )}
          </motion.button>
        </form>

        <p className="text-center text-xs text-slate-500">
          {t('auth.no_account')}{' '}
          <button className="text-primary hover:underline">{t('auth.register')}</button>
        </p>
      </motion.div>
    </div>
  );
}
