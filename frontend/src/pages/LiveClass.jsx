import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Hand, MessageSquare, Users, Video, VideoOff, Mic, MicOff,
  Check, X, ChevronLeft, AlertTriangle, Send,
  Ban, Timer, UserCheck
} from 'lucide-react';
import { liveAPI, notifAPI } from '../services/api';

const DEMO_SESSION = {
  id: 1,
  titre: 'Cours en direct — Physique-Chimie : La Lumière',
  enseignant: { nom: 'Prof. Rasoamanarivo', photo: null },
  status: 'live',
  participants: 42,
};

function ParticipantBadge({ name, hasHand, isBanned, isMuted, onBan, onPenalty, onToggleMute, isTeacher }) {
  const [showMenu, setShowMenu] = useState(false);
  const initial = name[0]?.toUpperCase() || '?';

  return (
    <div className="relative">
      <motion.div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${
          isBanned ? 'opacity-40' : 'hover:bg-white/5'
        }`}
        onClick={() => isTeacher && setShowMenu(m => !m)}
        whileHover={{ x: 2 }}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          hasHand ? 'bg-amber-500/30 text-amber-400 ring-2 ring-amber-500/50' : 'bg-white/10'
        }`} style={!hasHand ? { color: 'var(--text-primary)' } : {}}>
          {initial}
        </div>
        <span className="text-sm text-slate-300 truncate flex-1">{name}</span>
        {hasHand && <Hand size={12} className="text-amber-400 animate-bounce flex-shrink-0" />}
        {isBanned && <Ban size={12} className="text-red-400 flex-shrink-0" />}
        {isMuted && !hasHand && <MicOff size={12} className="text-slate-500 flex-shrink-0" />}
        {!isMuted && isTeacher && <Mic size={12} className="text-emerald-400 flex-shrink-0" />}
      </motion.div>

      <AnimatePresence>
        {showMenu && isTeacher && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute left-0 top-full mt-1 z-50 glass border border-white/10 rounded-xl shadow-2xl p-2 w-52"
          >
            <button onClick={() => { onToggleMute(); setShowMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-500/10 text-sky-400 text-sm transition-all">
              {isMuted ? <Mic size={14} /> : <MicOff size={14} />} {isMuted ? 'Activer micro' : 'Couper micro'}
            </button>
            <button onClick={() => { onPenalty(1); setShowMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-500/10 text-amber-400 text-sm transition-all">
              <Timer size={14} /> Pénalité 1 heure
            </button>
            <button onClick={() => { onPenalty(24); setShowMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-500/10 text-amber-400 text-sm transition-all">
              <Timer size={14} /> Pénalité 24 heures
            </button>
            <div className="border-t border-white/10 my-1" />
            <button onClick={() => { onBan(); setShowMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 text-sm transition-all">
              <Ban size={14} /> Bannir du cours live
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestionCard({ q, onMarkAnswered, isTeacher }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`p-3 rounded-xl border transition-all ${
        q.answered
          ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60'
          : 'glass-sm border-white/10 hover:border-primary/30'
      }`}
    >
      <div className="flex items-start gap-2">
        {q.raised_hand && <Hand size={13} className="text-amber-400 mt-0.5 flex-shrink-0 animate-bounce" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{q.content}</p>
          <p className="text-xs text-slate-500 mt-1">— {q.author}</p>
        </div>
        {!q.answered && isTeacher && (
          <button onClick={() => onMarkAnswered(q.id)}
            className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/30 transition-all"
            title="Marquer comme répondu">
            <Check size={13} />
          </button>
        )}
        {q.answered && <Check size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />}
      </div>
    </motion.div>
  );
}

export function LiveClass() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [session, setSession]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [joined, setJoined]           = useState(false);
  const [questions, setQuestions]     = useState([]);
  const [participants, setParticipants] = useState([]);
  const [handRaised, setHandRaised]   = useState(false);
  const [question, setQuestion]       = useState('');
  const [activeTab, setActiveTab]     = useState('questions');
  const [isMuted, setIsMuted]         = useState(true);
  const isTeacher = sessionStorage.getItem('eneni_role') === 'ENSEIGNANT';
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [streamActive, setStreamActive] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  useEffect(() => {
    liveAPI.detail(id)
      .then(res => {
        setSession(res.data);
        setQuestions((res.data.questions || []).map(q => ({
          id: q.id,
          content: q.content || q.texte,
          author: q.author || 'Élève',
          answered: q.answered || false,
          raised_hand: q.raised_hand || false
        })));
        setParticipants((res.data.participants || []).map(p => ({
          id: p.id || p.etudiant?.id,
          name: p.name || p.etudiant?.utilisateur?.prenom || 'Élève',
          hasHand: p.hasHand || p.main_levee || false,
          isBanned: p.isBanned || false,
          isMuted: p.isMuted !== undefined ? p.isMuted : true
        })));
      })
      .catch(() => setSession(DEMO_SESSION))
      .finally(() => setLoading(false));
  }, [id]);

  const sendNotification = useCallback(async () => {
    if (notificationSent) return;
    try {
      await notifAPI.list();
      setNotificationSent(true);
    } catch { /* silencieux */ }
  }, [notificationSent]);

  const initWebRTC = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isTeacher,
        audio: true
      });
      localStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreamActive(true);

      const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      const pc = new RTCPeerConnection(config);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      if (!isTeacher) {
        setIsMuted(true);
        stream.getAudioTracks().forEach(t => t.enabled = false);
      }

      sendNotification();
    } catch (err) {
      console.warn('WebRTC non disponible, mode démo:', err.message);
    }
  }, [isTeacher, sendNotification]);

  useEffect(() => {
    if (!joined) return;
    const start = async () => {
      await initWebRTC();
    };
    start();
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [joined]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleJoin = useCallback(async () => {
    try { await liveAPI.join(id); } catch { /* silencieux */ }
    setJoined(true);
  }, [id]);

  const handleLeave = useCallback(async () => {
    try { await liveAPI.leave(id); } catch { /* silencieux */ }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    navigate('/courses');
  }, [id, navigate]);

  const toggleHand = useCallback(async () => {
    try {
      handRaised ? await liveAPI.lowerHand(id) : await liveAPI.raiseHand(id);
    } catch { /* silencieux */ }
    setHandRaised(h => !h);
  }, [id, handRaised]);

  const toggleMute = useCallback(async () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => t.enabled = isMuted);
    }
    setIsMuted(m => !m);
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => t.enabled = !videoEnabled);
    }
    setVideoEnabled(v => !v);
  }, [videoEnabled]);

  const sendQuestion = useCallback(async () => {
    if (!question.trim()) return;
    const newQ = { id: Date.now(), content: question, author: isTeacher ? 'Moi (Prof)' : 'Moi', answered: false, raised_hand: false };
    setQuestions(prev => [newQ, ...prev]);
    setQuestion('');
    try { await liveAPI.sendQuestion(id, question); } catch { /* silencieux */ }
  }, [id, question, isTeacher]);

  const markAnswered = useCallback(async (qId) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, answered: true } : q));
    try { await liveAPI.markAnswered(id, qId); } catch { /* silencieux */ }
  }, [id]);

  const banParticipant = useCallback(async (userId) => {
    setParticipants(prev => prev.map(p => p.id === userId ? { ...p, isBanned: true } : p));
    try {
      await liveAPI.banStudent(id, userId, 0);
      await notifAPI.list();
    } catch { /* silencieux */ }
  }, [id]);

  const penalizeParticipant = useCallback(async (userId, hours) => {
    try { await liveAPI.banStudent(id, userId, hours); } catch { /* silencieux */ }
  }, [id]);

  const toggleMuteParticipant = useCallback((userId) => {
    setParticipants(prev => prev.map(p =>
      p.id === userId ? { ...p, isMuted: !p.isMuted } : p
    ));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-app flex flex-col" style={{ color: 'var(--text-primary)' }}>

      <div className="flex-shrink-0 border-b border-white/10 px-4 sm:px-6 py-3 flex items-center gap-3"
        style={{ background: 'var(--bg-app)', backdropFilter: 'blur(20px)' }}>
        <button onClick={handleLeave}
          className="p-2 rounded-xl hover:bg-white/5 transition flex-shrink-0">
          <ChevronLeft size={18} className="text-slate-400" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-red-400 font-bold uppercase tracking-wider">EN DIRECT</span>
            {isTeacher && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 ml-2">PROF</span>}
          </div>
          <h1 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{session?.titre}</h1>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users size={13} />
            <span>{session?.participants || participants.length}</span>
          </div>
          {joined && (
            <button onClick={handleLeave}
              className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-1.5 rounded-xl text-sm hover:bg-red-500/30 transition-all flex items-center gap-1.5">
              <X size={14} /> Quitter
            </button>
          )}
        </div>
      </div>

      {!joined ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            className="glass rounded-3xl p-10 max-w-md w-full text-center space-y-6"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="relative mx-auto w-24 h-24">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-xl shadow-red-500/30">
                <Video size={36} className="text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full" />
            </div>
            <div>
              <span className="text-xs text-red-400 font-bold uppercase tracking-widest">Cours en Direct</span>
              <h2 className="text-2xl font-black mt-2">{session?.titre}</h2>
              <p className="text-slate-400 text-sm mt-2">
                {isTeacher ? 'Vous êtes l\'enseignant' : `Enseignant : ${session?.enseignant?.nom}`}
              </p>
              <div className="flex items-center justify-center gap-2 mt-3 text-slate-500 text-sm">
                <Users size={14} />
                <span>{session?.participants || participants.length} participants</span>
              </div>
            </div>
            {!isTeacher && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300 text-left space-y-1">
                <p className="font-semibold flex items-center gap-2"><AlertTriangle size={14} /> Rappel :</p>
                <p className="text-xs text-amber-400/80">Votre micro est coupé par défaut. Levez la main pour intervenir.</p>
              </div>
            )}
            <motion.button
              onClick={handleJoin}
              className="btn-metal w-full py-4 flex items-center justify-center gap-3 text-base"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Video size={20} /> {isTeacher ? 'Commencer le cours' : 'Rejoindre le cours'}
            </motion.button>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

          <div className="flex-1 bg-black relative flex items-center justify-center min-h-[300px] lg:min-h-0">
            {streamActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isTeacher}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 space-y-4 p-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10">
                  {videoEnabled ? <Video size={48} className="text-primary/50" /> : <VideoOff size={48} className="text-red-400/50" />}
                </div>
                <p className="text-sm text-center">
                  {isTeacher ? 'Votre flux vidéo' : `Flux en direct — ${session?.enseignant?.nom || 'Professeur'}`}
                </p>
              </div>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
              {isTeacher && (
                <button onClick={toggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    videoEnabled ? 'bg-white/10 text-white border border-white/20' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                  {videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                </button>
              )}
              <button onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/10 text-white border border-white/20'
                }`}>
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              {!isTeacher && (
                <motion.button
                  onClick={toggleHand}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all ${
                    handRaised
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/15'
                  }`}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Hand size={16} className={handRaised ? 'animate-bounce' : ''} />
                  {handRaised ? 'Main levée' : 'Lever la main'}
                </motion.button>
              )}
              {isTeacher && (
                <motion.button
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <UserCheck size={16} /> Animateur
                </motion.button>
              )}
            </div>

            <AnimatePresence>
              {handRaised && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="absolute top-4 right-4 bg-amber-500/90 text-black px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                  <Hand size={14} className="animate-bounce" /> En attente de parole...
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col"
            style={{ background: 'var(--bg-app)' }}>

            <div className="flex border-b border-white/10 flex-shrink-0">
              {[
                { key: 'questions',    label: 'Questions',    icon: MessageSquare },
                { key: 'participants', label: 'Participants', icon: Users },
              ].map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${
                    activeTab === key ? 'text-white border-b-2 border-primary' : 'text-slate-500 hover:text-slate-300'
                  }`}>
                  <Icon size={14} /> {label}
                  {key === 'questions' && questions.filter(q => !q.answered).length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                      {questions.filter(q => !q.answered).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
              {activeTab === 'questions' ? (
                <AnimatePresence>
                  {questions.length === 0
                    ? <p className="text-center text-slate-600 text-sm py-8">Aucune question pour l'instant.</p>
                    : questions.map(q => (
                        <QuestionCard key={q.id} q={q} onMarkAnswered={markAnswered} isTeacher={isTeacher} />
                      ))
                  }
                </AnimatePresence>
              ) : (
                participants.length === 0 ? (
                  <p className="text-center text-slate-600 text-sm py-8">Aucun participant.</p>
                ) : (
                  participants.map(p => (
                    <ParticipantBadge
                      key={p.id}
                      name={p.name}
                      hasHand={p.hasHand}
                      isBanned={p.isBanned}
                      isMuted={p.isMuted}
                      isTeacher={isTeacher}
                      onBan={() => banParticipant(p.id)}
                      onPenalty={(h) => penalizeParticipant(p.id, h)}
                      onToggleMute={() => toggleMuteParticipant(p.id)}
                    />
                  ))
                )
              )}
            </div>

            {activeTab === 'questions' && (
              <div className="flex-shrink-0 border-t border-white/10 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendQuestion()}
                    placeholder={isTeacher ? "Répondre à la classe..." : "Poser une question..."}
                    className="flex-1 glass-sm bg-transparent px-3 py-2 text-sm rounded-xl focus:outline-none border border-white/10 focus:border-primary/50 transition"
                    style={{ color: 'var(--text-primary)' }}
                  />
                  <motion.button
                    onClick={sendQuestion}
                    disabled={!question.trim()}
                    className="w-10 h-10 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center disabled:opacity-40 hover:bg-primary/30 transition-all"
                    whileTap={{ scale: 0.95 }}>
                    <Send size={15} />
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
