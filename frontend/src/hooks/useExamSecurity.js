import { useEffect, useCallback } from 'react';

/**
 * Hook de sécurité pour le mode Examen.
 *
 * Actions :
 * - Force le mode plein écran (Fullscreen API)
 * - Bloque le clic droit (contextmenu)
 * - Bloque Copier / Coller (copy, paste, cut)
 * - Bloque les raccourcis clavier dangereux (Ctrl+C, Ctrl+V, Ctrl+U, F12, etc.)
 * - Signale la sortie du plein écran (fullscreenchange)
 *
 * @param {boolean} active         - Active ou désactive la sécurité
 * @param {Function} onEscapeAttempt - Callback si l'utilisateur tente de sortir du plein écran
 */
export function useExamSecurity(active, onEscapeAttempt) {
  // ── Plein écran ───────────────────────────────────────────────────────────
  const requestFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      }
    } catch {
      // Le navigateur peut refuser (ex : iframe)
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    if (!active) {
      exitFullscreen();
      return;
    }

    requestFullscreen();

    // ── Bloquer clic droit ────────────────────────────────────────────────
    const blockContextMenu = (e) => { e.preventDefault(); };

    // ── Bloquer copier / coller / couper ──────────────────────────────────
    const blockClipboard   = (e) => { e.preventDefault(); };

    // ── Bloquer raccourcis dangereux ──────────────────────────────────────
    const blockKeys = (e) => {
      const dangerous = [
        e.ctrlKey && ['c','v','u','s','a','p'].includes(e.key.toLowerCase()),
        e.key === 'F12',
        e.key === 'PrintScreen',
        e.altKey && e.key === 'Tab',
        e.metaKey,
      ];
      if (dangerous.some(Boolean)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // ── Détecter sortie du plein écran avec re‑entrée automatique ────────
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        requestFullscreen();
        onEscapeAttempt?.();
      }
    };

    document.addEventListener('contextmenu',      blockContextMenu);
    document.addEventListener('copy',             blockClipboard);
    document.addEventListener('paste',            blockClipboard);
    document.addEventListener('cut',              blockClipboard);
    document.addEventListener('keydown',          blockKeys);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('contextmenu',      blockContextMenu);
      document.removeEventListener('copy',             blockClipboard);
      document.removeEventListener('paste',            blockClipboard);
      document.removeEventListener('cut',              blockClipboard);
      document.removeEventListener('keydown',          blockKeys);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      exitFullscreen();
    };
  }, [active, requestFullscreen, exitFullscreen, onEscapeAttempt]);
}
