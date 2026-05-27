import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook d'encapsulation de la Web Speech API.
 *
 * Fournit :
 * - `speak(text, lang)`  : Synthèse vocale (TTS) - lit un texte dans la langue choisie
 * - `startListening()`   : Reconnaissance vocale (STT) - déclenche l'écoute du micro
 * - `stopListening()`    : Arrête la reconnaissance vocale
 * - `transcript`         : Le texte reconnu
 * - `isListening`        : Booléen d'état d'écoute
 * - `isSpeaking`         : Booléen d'état TTS
 */
const LANG_MAP = {
  fr: 'fr-FR',
  en: 'en-US',
  mg: 'mg',  // Malagasy (disponible sur certains navigateurs)
};

export function useSpeech(defaultLang = 'fr-FR') {
  const [transcript, setTranscript]   = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const recognitionRef = useRef(null);

  // ── TTS : Synthèse vocale ─────────────────────────────────────────────────
  const speak = useCallback((text, lang = defaultLang) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();

    const utterance     = new SpeechSynthesisUtterance(text);
    utterance.lang      = LANG_MAP[lang] || lang;
    utterance.rate      = 0.95;
    utterance.pitch     = 1;

    utterance.onstart   = () => setIsSpeaking(true);
    utterance.onend     = () => setIsSpeaking(false);
    utterance.onerror   = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [defaultLang]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // ── STT : Reconnaissance vocale ───────────────────────────────────────────
  const startListening = useCallback((lang = defaultLang) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition non supporté par ce navigateur.');
      return;
    }

    const recognition           = new SpeechRecognition();
    recognition.lang            = LANG_MAP[lang] || lang;
    recognition.continuous      = false;
    recognition.interimResults  = true;

    recognition.onstart  = () => setIsListening(true);
    recognition.onend    = () => setIsListening(false);
    recognition.onerror  = () => setIsListening(false);

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      setTranscript(text);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [defaultLang]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // ── Nettoyage ─────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  return { speak, stopSpeaking, startListening, stopListening, transcript, setTranscript, isListening, isSpeaking };
}
