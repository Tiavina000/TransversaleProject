import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Mic, MicOff, Video, VideoOff, Phone,
  Hand, Users, MessageCircle, Settings
} from 'lucide-react';

/** Particule d'animation pour le bouton "Lever la main" */
function HandParticle({ x, y }) {
  return (
    <motion.div
      className="absolute text-lg pointer-events-none"
      initial={{ x, y, opacity: 1, scale: 1 }}
      animate={{ x: x + (Math.random() - 0.5) * 80, y: y - 80 - Math.random() * 60, opacity: 0, scale: 1.5 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      ✋
    </motion.div>
  );
}

/**
 * RaiseHandButton — Bouton "Lever la main" avec animation de particules.
 */
function RaiseHandButton() {
  const { t }      = useTranslation();
  const [raised, setRaised]       = useState(false);
  const [particles, setParticles] = useState([]);

  const handleClick = (e) => {
    const rect   = e.currentTarget.getBoundingClientRect();
    const x      = e.clientX - rect.left - rect.width / 2;
    const y      = e.clientY - rect.top  - rect.height / 2;
    const id     = Date.now();
    setParticles((p) => [...p, { id, x, y }]);
    setTimeout(() => setParticles((p) => p.filter((pp) => pp.id !== id)), 1300);
    setRaised((r) => !r);
  };

  return (
    <div className="relative">
      {particles.map((p) => <HandParticle key={p.id} x={p.x} y={p.y} />)}
      <motion.button
        onClick={handleClick}
        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${
          raised ? 'bg-warning/20 border border-warning/50 text-warning animate-pulse-slow' : 'btn-ghost'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        title={t('visio.raise_hand')}
      >
        <Hand size={20} />
        <span className="text-xs">{t('visio.raise_hand')}</span>
      </motion.button>
    </div>
  );
}

/** Carte vidéo individuelle avec effet verre */
function VideoCard({ participant, isLocal }) {
  return (
    <motion.div
      className="relative glass rounded-2xl overflow-hidden aspect-video flex items-center justify-center group"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Placeholder caméra */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
      >
        {participant.name?.[0]?.toUpperCase() || '?'}
      </div>

      {/* Badge nom */}
      <div className="absolute bottom-3 left-3 glass-sm px-2 py-1 text-xs text-white rounded-lg">
        {participant.name} {isLocal && '(Vous)'}
      </div>

      {/* Indicateur micro */}
      {participant.isMuted && (
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-500/90 flex items-center justify-center">
          <MicOff size={12} className="text-white" />
        </div>
      )}

      {/* Neon border on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(124,58,237,0.5)' }}
      />
    </motion.div>
  );
}

const MOCK_PARTICIPANTS = [
  { id: 1, name: 'Vous',            isMuted: false, isLocal: true },
  { id: 2, name: 'Prof. Rakoto',   isMuted: false },
  { id: 3, name: 'Haja',           isMuted: true  },
  { id: 4, name: 'Noro',           isMuted: false },
];

/**
 * VisioGrid — Interface de visioconférence avec grille flottante.
 */
export function VisioGrid({ session }) {
  const { t } = useTranslation();
  const [isMuted,     setIsMuted]     = useState(false);
  const [cameraOff,   setCameraOff]   = useState(false);
  const [showChat,    setShowChat]    = useState(false);
  const [showPeople,  setShowPeople]  = useState(false);

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      {/* Header */}
      <div className="glass border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">{session?.titre || t('visio.title')}</h2>
          <p className="text-slate-400 text-xs">{MOCK_PARTICIPANTS.length} {t('visio.participants')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-xs font-medium">LIVE</span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className={`grid gap-3 h-full ${
          MOCK_PARTICIPANTS.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
          MOCK_PARTICIPANTS.length <= 4 ? 'grid-cols-2' :
          'grid-cols-2 lg:grid-cols-3'
        }`}>
          {MOCK_PARTICIPANTS.map((p) => (
            <VideoCard key={p.id} participant={p} isLocal={p.isLocal} />
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="glass border-t border-white/10 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Micro */}
          <motion.button
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isMuted ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'btn-ghost'
            }`}
            onClick={() => setIsMuted(!isMuted)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={isMuted ? t('visio.unmute') : t('visio.mute')}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </motion.button>

          {/* Caméra */}
          <motion.button
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              cameraOff ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'btn-ghost'
            }`}
            onClick={() => setCameraOff(!cameraOff)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={cameraOff ? t('visio.camera_on') : t('visio.camera_off')}
          >
            {cameraOff ? <VideoOff size={20} /> : <Video size={20} />}
          </motion.button>

          {/* Lever la main */}
          <RaiseHandButton />

          {/* Participants */}
          <motion.button
            className={`w-12 h-12 rounded-2xl flex items-center justify-center btn-ghost ${showPeople ? 'border-primary text-primary' : ''}`}
            onClick={() => setShowPeople(!showPeople)}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          >
            <Users size={20} />
          </motion.button>

          {/* Chat */}
          <motion.button
            className={`w-12 h-12 rounded-2xl flex items-center justify-center btn-ghost ${showChat ? 'border-primary text-primary' : ''}`}
            onClick={() => setShowChat(!showChat)}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          >
            <MessageCircle size={20} />
          </motion.button>

          {/* Quitter */}
          <motion.button
            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
            title={t('visio.leave')}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          >
            <Phone size={20} className="rotate-[135deg]" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
