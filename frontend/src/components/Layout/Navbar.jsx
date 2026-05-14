import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, BookOpen, FileText, ShoppingBag,
  LogOut, Menu, X, User, Bell
} from 'lucide-react';
import { LanguageSwitcher } from '../UI/LanguageSwitcher';
import { useNotifications } from '../../hooks/useNotifications';

const NAV_ITEMS = [
  { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'courses',   path: '/courses',   icon: BookOpen        },
  { key: 'exams',     path: '/exams',     icon: FileText        },
  { key: 'shop',      path: '/shop',      icon: ShoppingBag     },
];

/**
 * Navbar principale avec :
 * - Glassmorphism + bordure animée
 * - Liens actifs avec indicateur néon
 * - Cloche de notifications avec badge
 * - Menu hamburger mobile
 * - Sélecteur de langue
 */
export function Navbar({ user, onLogout }) {
  const { t }      = useTranslation();
  const navigate   = useNavigate();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const { notifications, unreadCount, markRead, markAllRead, getStyle } = useNotifications();

  const handleLogout = () => {
    sessionStorage.removeItem('eneni_token');
    sessionStorage.removeItem('eneni_refresh');
    onLogout?.();
    navigate('/');
  };

  return (
    <>
      {/* ── Barre principale ──────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 border-b border-white/10"
        style={{
          background: 'rgba(10,10,20,0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

          {/* Logo */}
          <NavLink to="/dashboard" className="flex items-center gap-3">
            <motion.img
              src="/image/min_logo_pro.jpeg"
              alt="ENENI Logo"
              className="w-10 h-10 rounded-xl object-cover border border-white/20"
              whileHover={{ rotate: 5, scale: 1.1 }}
              onError={e => { e.target.style.display='none'; }}
            />
            <span className="text-white font-bold text-xl tracking-tight hidden sm:block">
              EN<span className="text-gradient">ENI</span>
            </span>
          </NavLink>

          {/* Liens desktop */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ key, path, icon: Icon }) => (
              <NavLink
                key={key}
                to={path}
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

          {/* Droite */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {/* ── Cloche notifications ─────────────────────────── */}
            <div className="relative">
              <motion.button
                onClick={() => setNotifOpen(o => !o)}
                className="relative p-2 rounded-xl hover:bg-white/5 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell size={18} className="text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </motion.button>

              {/* Panneau notifications */}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    className="absolute right-0 top-full mt-2 w-80 glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                      <h3 className="text-sm font-bold text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                          Tout marquer lu
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0
                        ? <p className="text-center text-slate-600 text-sm py-8">Aucune notification.</p>
                        : notifications.map(n => {
                            const style = getStyle(n.type);
                            return (
                              <div
                                key={n.id}
                                onClick={() => markRead(n.id)}
                                className={`px-4 py-3 border-b border-white/5 last:border-0 cursor-pointer transition-all hover:bg-white/5 ${!n.read ? 'bg-white/3' : ''}`}
                              >
                                <div className="flex items-start gap-2">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 mt-0.5 ${style.bg} ${style.color} ${style.border}`}>
                                    {style.label}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-semibold ${!n.read ? 'text-white' : 'text-slate-400'}`}>{n.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                                  </div>
                                  {!n.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />}
                                </div>
                              </div>
                            );
                          })
                      }
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profil */}
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
              <span className="text-sm text-slate-300">{user?.prenom || user?.username || t('nav.student')}</span>
            </motion.div>

            {/* Déconnexion */}
            <motion.button
              onClick={handleLogout}
              className="btn-ghost hidden sm:flex items-center gap-1.5 text-xs py-2 px-3 text-slate-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              title={t('nav.logout')}
            >
              <LogOut size={15} />
            </motion.button>

            {/* Hamburger mobile */}
            <button
              className="md:hidden p-2 rounded-xl btn-ghost"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Menu mobile ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-30 pt-16 md:hidden"
            style={{ background: 'rgba(10,10,20,0.97)', backdropFilter: 'blur(20px)' }}
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
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white transition-all"
              >
                <LogOut size={18} /> {t('nav.logout')}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay pour fermer le panneau notif */}
      {notifOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
      )}
    </>
  );
}
