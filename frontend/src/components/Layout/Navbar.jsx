import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, BookOpen, FileText, ShoppingBag,
  Video, LogOut, Menu, X, User
} from 'lucide-react';
import { LanguageSwitcher } from '../UI/LanguageSwitcher';

const NAV_ITEMS = [
  { key: 'dashboard', path: '/',        icon: LayoutDashboard },
  { key: 'courses',   path: '/courses', icon: BookOpen        },
  { key: 'exams',     path: '/exams',   icon: FileText        },
  { key: 'shop',      path: '/shop',    icon: ShoppingBag     },
  { key: 'visio',     path: '/visio',   icon: Video           },
];

/**
 * Navbar glassmorphism principale.
 * - Fond flouté + bordure animée
 * - Liens actifs avec indicateur néon
 * - Menu hamburger mobile
 * - Sélecteur de langue
 */
export function Navbar({ user }) {
  const { t }          = useTranslation();
  const navigate       = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('eneni_token');
    navigate('/login');
  };

  return (
    <>
      {/* ── Desktop & Mobile bar ──────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 border-b border-white/10"
        style={{
          background: 'rgba(10,10,20,0.7)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <motion.div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-lg"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
              whileHover={{ rotate: 10, scale: 1.1 }}
            >
              E
            </motion.div>
            <span className="text-white font-bold text-xl tracking-tight hidden sm:block">
              EN<span className="text-gradient">ENI</span>
            </span>
          </NavLink>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ key, path, icon: Icon }) => (
              <NavLink
                key={key}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} />
                    <span>{t(`nav.${key}`)}</span>
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-primary/15 border border-primary/30"
                        layoutId="nav-active"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {/* Profile */}
            <motion.div
              className="hidden sm:flex items-center gap-2 glass-sm px-3 py-1.5 rounded-xl cursor-pointer"
              whileHover={{ scale: 1.03 }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
              >
                {user?.prenom?.[0]?.toUpperCase() || <User size={14} />}
              </div>
              <span className="text-sm text-slate-300">{user?.prenom || 'Étudiant'}</span>
            </motion.div>

            {/* Logout */}
            <motion.button
              onClick={handleLogout}
              className="btn-ghost hidden sm:flex items-center gap-1.5 text-xs py-2 px-3 text-slate-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              title={t('nav.logout')}
            >
              <LogOut size={15} />
            </motion.button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl btn-ghost"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu ──────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-30 pt-16 md:hidden"
            style={{ background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(20px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="p-4 space-y-2">
              {NAV_ITEMS.map(({ key, path, icon: Icon }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <NavLink
                    to={path}
                    end={path === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive ? 'bg-primary/15 border border-primary/30 text-white' : 'text-slate-400'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {t(`nav.${key}`)}
                  </NavLink>
                </motion.div>
              ))}
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400"
              >
                <LogOut size={18} /> {t('nav.logout')}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
