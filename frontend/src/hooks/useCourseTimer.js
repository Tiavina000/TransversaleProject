import { useState, useEffect, useRef, useCallback } from 'react';
import { sessionAPI } from '../services/api';

/**
 * Hook de chronomètre de session de cours.
 * - Démarre quand le cours commence
 * - Se met en PAUSE automatiquement si :
 *   - L'onglet perd le focus (visibilitychange)
 *   - La fenêtre n'est plus en plein écran (fullscreenchange)
 * - Synchronise avec le backend via sessionAPI
 */
export function useCourseTimer(courseId) {
  const [seconds, setSeconds]       = useState(0);
  const [running, setRunning]       = useState(false);
  const [sessionId, setSessionId]   = useState(null);
  const [warning, setWarning]       = useState('');
  const [started, setStarted]       = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // ── Heartbeat (30s) ───────────────────────────────────────────────────────
  useEffect(() => {
    if (running && sessionId) {
      const hb = setInterval(() => {
        sessionAPI.heartbeat(sessionId).catch(() => {});
      }, 30000);
      return () => clearInterval(hb);
    }
  }, [running, sessionId]);

  // ── Surveillance visibilité & plein écran ─────────────────────────────────
  useEffect(() => {
    if (!started) return;

    const handlePause = () => {
      const isHidden     = document.hidden;
      const isFullscreen = !!document.fullscreenElement;

      if (isHidden || !isFullscreen) {
        setRunning(false);
        setWarning('⏸ Le chronomètre est en pause. Revenez en plein écran pour continuer.');
        if (sessionId) sessionAPI.pause(sessionId).catch(() => {});
      } else {
        setRunning(true);
        setWarning('');
        if (sessionId) sessionAPI.resume(sessionId).catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handlePause);
    document.addEventListener('fullscreenchange', handlePause);
    return () => {
      document.removeEventListener('visibilitychange', handlePause);
      document.removeEventListener('fullscreenchange', handlePause);
    };
  }, [started, sessionId]);

  // ── Actions exposées ──────────────────────────────────────────────────────
  const start = useCallback(async (overridenId) => {
    const idToUse = overridenId || courseId;
    try {
      const res = await sessionAPI.start(idToUse);
      setSessionId(res.data?.id || null);
    } catch {
      // Mode dégradé
    }
    setSeconds(0);
    setRunning(true);
    setStarted(true);
    setWarning('');
  }, [courseId]);

  const pause = useCallback(() => {
    setRunning(false);
    if (sessionId) sessionAPI.pause(sessionId).catch(() => {});
  }, [sessionId]);

  const resume = useCallback(() => {
    setRunning(true);
    setWarning('');
    if (sessionId) sessionAPI.resume(sessionId).catch(() => {});
  }, [sessionId]);

  const stop = useCallback(async () => {
    setRunning(false);
    setStarted(false);
    if (sessionId) {
      try { await sessionAPI.end(sessionId); } catch { /* silencieux */ }
    }
  }, [sessionId]);

  // ── Formatage ─────────────────────────────────────────────────────────────
  const formatted = `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${
    String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:${
    String(seconds % 60).padStart(2, '0')}`;

  return { seconds, formatted, running, started, warning, start, pause, resume, stop };
}
