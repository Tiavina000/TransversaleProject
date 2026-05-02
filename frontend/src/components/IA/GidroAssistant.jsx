import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSpeech } from '../../hooks/useSpeech';
import { iaAPI } from '../../services/api';
import { Sparkles, X, Mic, Send, Volume2, VolumeX, Loader } from 'lucide-react';

/**
 * GidroAssistant — Bulle IA flottante style Antigravity.
 *
 * Fonctionnalités :
 * - Bulle animée (float) avec lueur néon
 * - Chat textuel via iaAPI.ask()
 * - Dictée vocale en entrée (STT)
 * - Synthèse vocale en sortie (TTS) — auto-activé si langue = Malgache
 * - Recommandations de leçons
 */
export function GidroAssistant() {
  const { t, i18n }  = useTranslation();
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: t('gidro.greeting') },
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [ttsOn,   setTtsOn]   = useState(i18n.language === 'mg');
  const bottomRef = useRef(null);

  const { speak, stopSpeaking, startListening, stopListening, isListening, transcript, setTranscript } = useSpeech(i18n.language);

  // ── Envoyer un message ────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const q = text || input;
    if (!q.trim()) return;

    setInput('');
    setTranscript('');
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setLoading(true);

    let answer = '';
    try {
      const res = await iaAPI.ask(q);
      answer = res.data?.reponse || 'Je n\'ai pas trouvé de réponse.';
    } catch {
      answer = t('common.error');
    }

    setMessages((m) => [...m, { role: 'assistant', text: answer }]);
    setLoading(false);

    // TTS auto si langue MG ou option activée
    if (ttsOn) speak(answer, i18n.language);

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // ── Dictée vocale ─────────────────────────────────────────────────────────
  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript) sendMessage(transcript);
    } else {
      startListening(i18n.language);
    }
  };

  return (
    <>
      {/* ── Bulle flottante ─────────────────────────────────────────────── */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
          boxShadow: '0 0 24px rgba(124,58,237,0.6), 0 0 48px rgba(6,182,212,0.3)',
        }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.15, boxShadow: '0 0 36px rgba(124,58,237,0.9), 0 0 64px rgba(6,182,212,0.5)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        title="Gidro — Assistant IA"
      >
        <Sparkles size={24} className="text-white" />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30" />
      </motion.button>

      {/* ── Panneau de chat ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col"
            style={{ height: '500px' }}
            initial={{ opacity: 0, scale: 0.85, y: 20, originY: 1 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
          >
            <div className="glass neon-border flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center animate-float"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
                >
                  <Sparkles size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">Gidro</p>
                  <p className="text-green-400 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> En ligne
                  </p>
                </div>
                {/* TTS toggle */}
                <button
                  onClick={() => { setTtsOn(!ttsOn); stopSpeaking(); }}
                  className={`p-1.5 rounded-lg transition-colors ${ttsOn ? 'text-primary' : 'text-slate-500'}`}
                  title="Activer/désactiver la lecture vocale"
                >
                  {ttsOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-metal text-white rounded-br-sm'
                          : 'glass-sm text-slate-200 rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="glass-sm px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                      <Loader size={14} className="animate-spin text-primary" />
                      <span className="text-xs text-slate-400">Gidro réfléchit...</span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-white/10">
                {/* Transcript preview */}
                {isListening && (
                  <div className="mb-2 glass-sm px-3 py-1.5 text-xs text-slate-400 rounded-lg flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    {transcript || t('gidro.listen')}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={t('gidro.hint')}
                    className="flex-1 glass-sm bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 rounded-xl focus:outline-none border border-white/10 focus:border-primary/50 transition"
                  />
                  {/* Micro */}
                  <motion.button
                    onClick={handleVoiceToggle}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isListening ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'btn-ghost'
                    }`}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  >
                    {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                  </motion.button>
                  {/* Envoyer */}
                  <motion.button
                    onClick={() => sendMessage()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center btn-metal"
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  >
                    <Send size={14} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
