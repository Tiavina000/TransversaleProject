import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook de gestion du plein écran.
 * - Demande le plein écran sur un élément ref
 * - Suit l'état isFullscreen
 * - Expose enter / exit / toggle
 */
export function useFullscreen() {
  const ref             = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const enter = useCallback(async () => {
    const el = ref.current;
    if (!el) return;
    try {
      if (el.requestFullscreen)            await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    } catch (e) {
      console.warn('Fullscreen unavailable:', e);
    }
  }, []);

  const exit = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch { /* silencieux */ }
  }, []);

  const toggle = useCallback(() => {
    isFullscreen ? exit() : enter();
  }, [isFullscreen, enter, exit]);

  return { ref, isFullscreen, enter, exit, toggle };
}
