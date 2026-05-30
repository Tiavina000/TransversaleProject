import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { notifAPI } from '../services/api';

const normalize = (n) => ({
  ...n,
  title: n.title ?? n.titre ?? '',
  message: n.message ?? '',
  read: n.read ?? n.est_lue ?? false,
  type: n.type ?? 'info',
  created_at: n.created_at ?? n.date_creation ?? new Date().toISOString(),
  id: n.id,
});

export function useNotifications() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const NOTIF_TYPES = {
    exam:     { label: t('notifications.type_exam'),         color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
    cancel:   { label: t('notifications.type_cancellation'), color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20'   },
    live:     { label: t('notifications.type_live'),         color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'  },
    news:     { label: t('notifications.type_new'),          color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20'},
    reminder: { label: t('notifications.type_reminder'),     color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20'},
    grade:    { label: t('notifications.type_grade', 'Note'), color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20'  },
    default:  { label: t('notifications.type_info'),         color: 'text-slate-300',  bg: 'bg-white/5',       border: 'border-white/10'     },
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notifAPI.list();
      const data = res.data?.results || res.data || [];
      setNotifications(data.map(normalize));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchNotifications, 0);
    const id = setInterval(fetchNotifications, 120_000);
    return () => { clearTimeout(timer); clearInterval(id); };
  }, [fetchNotifications])

  const markRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try { await notifAPI.markRead(id); } catch { /* silencieux */ }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try { await notifAPI.markAllRead(); } catch { /* silencieux */ }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getStyle = (type) => NOTIF_TYPES[type] || NOTIF_TYPES.default;

  return { notifications, loading, unreadCount, markRead, markAllRead, getStyle, refresh: fetchNotifications };
}
