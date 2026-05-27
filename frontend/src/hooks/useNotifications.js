import { useState, useEffect, useCallback } from 'react';
import { notifAPI } from '../services/api';

const NOTIF_TYPES = {
  exam:     { label: 'Examen',        color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
  cancel:   { label: 'Annulation',    color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20'   },
  live:     { label: 'Cours en direct',color: 'text-blue-400',  bg: 'bg-blue-500/10',   border: 'border-blue-500/20'  },
  news:     { label: 'Nouveauté',     color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20'},
  reminder: { label: 'Rappel',        color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20'},
  default:  { label: 'Info',          color: 'text-slate-300',  bg: 'bg-white/5',       border: 'border-white/10'     },
};

// Données de démo si le backend ne répond pas
const DEMO_NOTIFS = [
  { id: 1,  type: 'exam',     title: 'Examen de Mathématiques',    message: 'Examen prévu le 15/05 à 08h00 — salle 12.', created_at: new Date().toISOString(), read: false },
  { id: 2,  type: 'live',     title: 'Cours en direct ce soir',    message: 'Prof. Rakoto — Physique-Chimie à 17h30.', created_at: new Date().toISOString(), read: false },
  { id: 3,  type: 'news',     title: 'Nouveaux cours disponibles', message: '3 nouvelles leçons de Français ajoutées.', created_at: new Date().toISOString(), read: true  },
  { id: 4,  type: 'cancel',   title: 'Annulation de cours',        message: 'Le cours de SVT du 10/05 est annulé.', created_at: new Date().toISOString(), read: false },
  { id: 5,  type: 'reminder', title: 'Exercice non complété',      message: 'Vous avez un exercice en attente en Histoire-Géo.', created_at: new Date().toISOString(), read: false },
];

/**
 * Hook de gestion des notifications.
 * - Charge les notifications depuis le backend
 * - Retombe sur des données de démo si erreur
 * - Fournit des helpers : markRead, markAllRead, unreadCount
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notifAPI.list();
      const data = res.data?.results || res.data || [];
      setNotifications(data.length > 0 ? data : DEMO_NOTIFS);
    } catch {
      setNotifications(DEMO_NOTIFS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await notifAPI.list();
        const data = res.data?.results || res.data || [];
        setNotifications(data.length > 0 ? data : DEMO_NOTIFS);
      } catch {
        setNotifications(DEMO_NOTIFS);
      } finally {
        setLoading(false);
      }
    };
    init();
    const id = setInterval(fetchNotifications, 120_000);
    return () => clearInterval(id);
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
