import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { surveillanceAPI } from '../services/api';

/**
 * Hook de surveillance invisible pour les examens.
 *
 * Événements interceptés :
 * - `visibilitychange` : L'utilisateur change d'onglet / minimise la fenêtre
 * - `blur`             : La fenêtre perd le focus (ex: Alt+Tab)
 * - `focus`            : Retour sur la fenêtre
 *
 * Actions :
 * - Affiche une notification discrète "Attention requise"
 * - Envoie un log silencieux au backend via surveillanceAPI.logEvent()
 *
 * @param {number|null} examId - ID de l'examen actif (null = surveillance désactivée)
 * @param {Function} onAlert  - Callback appelé avec le message d'alerte
 */
export function useSurveillance(examId, onAlert) {
  const { t } = useTranslation();
  const leaveCount = useRef(0);

  useEffect(() => {
    if (!examId) return;

    const sendLog = (eventType, details = {}) => {
      surveillanceAPI.logEvent(examId, eventType, details).catch(() => {
        // Silencieux : on ne bloque pas l'utilisateur si l'API échoue
      });
    };

    // ── Changement d'onglet ────────────────────────────────────────────────
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        leaveCount.current += 1;
        onAlert?.(t('exam.attention'));
        sendLog('TAB_SWITCH', {
          count: leaveCount.current,
          timestamp: new Date().toISOString(),
        });
      }
    };

    // ── Perte de focus (autre application) ────────────────────────────────
    const handleBlur = () => {
      onAlert?.(t('exam.attention'));
      sendLog('WINDOW_BLUR', { timestamp: new Date().toISOString() });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [examId, onAlert, t]);

  return {};
}
