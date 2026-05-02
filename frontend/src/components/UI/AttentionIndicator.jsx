import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * Indicateur d'attention (Vert = focus / Orange = hors focus)
 * Affiché discrètement en haut de l'interface pendant un examen
 */
export function AttentionIndicator({ isFocused = true }) {
  const { t } = useTranslation();

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className={`attention-dot ${isFocused ? 'green' : 'orange'}`} />
      <AnimatePresence mode="wait">
        {!isFocused && (
          <motion.span
            key="alert"
            className="text-xs text-warning font-medium"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            {t('exam.attention')}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
