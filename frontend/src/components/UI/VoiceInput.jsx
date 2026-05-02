import { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSpeech } from '../../hooks/useSpeech';
import { useTranslation } from 'react-i18next';

/**
 * VoiceInput — Icône micro attachable à n'importe quel champ de texte.
 * Pour les élèves en situation de handicap moteur.
 *
 * @param {Function} onResult - Callback avec le texte reconnu
 * @param {string}   lang     - Langue de reconnaissance ('fr'|'en'|'mg')
 */
export function VoiceInput({ onResult, lang = 'fr', className = '' }) {
  const { t, i18n } = useTranslation();
  const { startListening, stopListening, isListening, transcript } = useSpeech(i18n.language);

  const handleToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript) onResult?.(transcript);
    } else {
      startListening(lang);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      className={`relative p-2 rounded-xl transition-all ${className} ${
        isListening
          ? 'bg-red-500/20 border border-red-500/50 text-red-400'
          : 'bg-white/5 border border-white/10 text-slate-400 hover:border-primary hover:text-primary'
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={isListening ? t('gidro.listen') : t('gidro.speak')}
    >
      {isListening ? (
        <>
          <MicOff size={16} />
          {/* Pulse ring animation */}
          <span className="absolute inset-0 rounded-xl border border-red-400 animate-ping opacity-40" />
        </>
      ) : (
        <Mic size={16} />
      )}
    </motion.button>
  );
}
