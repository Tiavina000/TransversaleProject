import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Hand, MessageSquare, Users, Video, Mic, MicOff,
  Check, X, ChevronLeft, AlertTriangle, Send,
  Ban, Timer, Wifi, WifiOff
} from 'lucide-react';
import { liveAPI, notifAPI } from '../services/api';
import {
  LiveKitRoom, VideoTrack, AudioTrack,
  useLocalParticipant, useRemoteParticipants,
  RoomAudioRenderer, ControlBar
} from '@livekit/components-react';
import { Track } from 'livekit-client';

const DEMO_SESSION = {
  id: 1,
  titre: 'Cours en direct — Physique-Chimie : La Lumière',
  enseignant: { nom: 'Prof. Rasoamanarivo', photo: null },
  status: 'live',
  participants: 42,
};

function ParticipantBadge({ name, hasHand, isBanned, isMuted, onBan, onPenalty, onToggleMute, isTeacher }) {
  const { t } = useTranslation();
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
              <Timer size={14} /> {t('liveClass.penalty_1h')}
            </button>
            <button onClick={() => { onPenalty(24); setShowMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-500/10 text-amber-400 text-sm transition-all">
              <Timer size={14} /> {t('liveClass.penalty_24h')}
            </button>
            <div className="border-t border-white/10 my-1" />
            <button onClick={() => { onBan(); setShowMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 text-sm transition-all">
              <Ban size={14} /> {t('liveClass.ban')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestionCard({ q, onMarkAnswered, isTeacher }) {
  const { t } = useTranslation();
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
            title={t('liveClass.mark_answered')}>
            <Check size={13} />
          </button>
        )}
        {q.answered && <Check size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />}
      </div>
    </motion.div>
  );
}

function VideoGrid() {
  const remoteParticipants = useRemoteParticipants();
  const { localParticipant } = useLocalParticipant();
  const allParticipants = [localParticipant, ...remoteParticipants].filter(Boolean);

  return (
    <div className="flex-1 bg-black relative grid gap-2 p-2" style={{
      gridTemplateColumns: `repeat(${Math.min(allParticipants.length || 1, 2)}, 1fr)`,
    }}>
      {allParticipants.map(p => (
        <div key={p.identity} className="relative rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
          {p.isCameraEnabled ? (
            <VideoTrack trackRef={{ participant: p, source: Track.Source.Camera }} className="w-full h-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
              <span className="text-xl font-bold text-white/70">
                {p.identity?.split('-')[1]?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          <AudioTrack trackRef={{ participant: p, source: Track.Source.Microphone }} />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/50 text-xs text-white/80">
            {p.isMicrophoneEnabled ? <Mic size={10} /> : <MicOff size={10} className="text-red-400" />}
            <span className="truncate max-w-[80px]">{p.identity?.split('-')[1] || p.identity}</span>
          </div>
          {p.isSpeaking && (
            <div className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400/60 pointer-events-none" />
          )}
        </div>
      ))}
    </div>
  );
}

function MuteStudentOnConnect({ isTeacher }) {
  const { localParticipant } = useLocalParticipant();
  useEffect(() => {
    if (!isTeacher && localParticipant) {
      localParticipant.setMicrophoneEnabled(false);
    }
  }, [localParticipant, isTeacher]);
  return null;
}

function LiveKitStream({ token, url, room, isTeacher, onLeave }) {
  return (
    <LiveKitRoom
      serverUrl={url}
      token={token}
      connect={true}
      audio={true}
      video={isTeacher}
      onDisconnected={onLeave}
      className="flex-1 flex flex-col"
      options={{
        adaptiveStream: { pixelDropper: true },
        dynacast: true,
      }}
    >
      <MuteStudentOnConnect isTeacher={isTeacher} />
      <div className="flex-1 flex flex-col">
        <VideoGrid />
      </div>

      <div className="flex-shrink-0 flex items-center justify-center gap-4 p-4 bg-black/30 backdrop-blur-sm">
        <ControlBar
          controls={{ microphone: true, camera: isTeacher, screenShare: false, leave: false }}
          className="!bg-transparent !p-0 !gap-3"
        />
        <button onClick={onLeave}
          className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all">
          <X size={18} />
        </button>
      </div>
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

export function LiveClass() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [session, setSession]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [joined, setJoined]           = useState(false);
  const [questions, setQuestions]     = useState([]);
  const [participants, setParticipants] = useState([]);
  const [handRaised, setHandRaised]   = useState(false);
  const [question, setQuestion]       = useState('');
  const [activeTab, setActiveTab]     = useState('questions');
  const isTeacher = sessionStorage.getItem('eneni_role') === 'ENSEIGNANT';
  const [notificationSent, setNotificationSent] = useState(false);

  const [liveKitInfo, setLiveKitInfo] = useState(null);

  useEffect(() => {
    liveAPI.detail(id)
      .then(res => {
        setSession(res.data);
        setQuestions((res.data.questions || []).map(q => ({
          id: q.id,
          content: q.content || q.texte,
          author: q.author || t('liveClass.student_default'),
          answered: q.answered || false,
          raised_hand: q.raised_hand || false
        })));
        setParticipants((res.data.participants || []).map(p => ({
          id: p.id || p.etudiant?.id,
          name: p.name || p.etudiant?.utilisateur?.prenom || t('liveClass.student_default'),
          hasHand: p.hasHand || p.main_levee || false,
          isBanned: p.isBanned || false,
          isMuted: p.isMuted !== undefined ? p.isMuted : true
        })));
      })
      .catch(() => setSession({ ...DEMO_SESSION, titre: t('liveClass.demo_title') }))
      .finally(() => setLoading(false));
  }, [id]);

  const sendNotification = useCallback(async () => {
    if (notificationSent) return;
    try {
      await notifAPI.list();
      setNotificationSent(true);
    } catch { /* silencieux */ }
  }, [notificationSent]);

  const handleJoin = useCallback(async () => {
    try {
      await liveAPI.join(id);
      const tokenRes = await liveAPI.livekitToken(id);
      setLiveKitInfo(tokenRes.data);
      setJoined(true);
      sendNotification();
    } catch {
      setJoined(true);
    }
  }, [id, sendNotification]);

  const handleLeave = useCallback(async () => {
    try { await liveAPI.leave(id); } catch { /* silencieux */ }
    setJoined(false);
    setLiveKitInfo(null);
    navigate('/courses');
  }, [id, navigate]);

  const toggleHand = useCallback(async () => {
    try {
      handRaised ? await liveAPI.lowerHand(id) : await liveAPI.raiseHand(id);
    } catch { /* silencieux */ }
    setHandRaised(h => !h);
  }, [id, handRaised]);

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
        <button onClick={() => { handleLeave(); }}
          className="p-2 rounded-xl hover:bg-white/5 transition flex-shrink-0">
          <ChevronLeft size={18} className="text-slate-400" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-red-400 font-bold uppercase tracking-wider">{t('liveClass.live_badge')}</span>
            {isTeacher && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 ml-2">{t('liveClass.prof_badge')}</span>}
          </div>
          <h1 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{session?.titre}</h1>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users size={13} />
            <span>{session?.participants || participants.length}</span>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: liveKitInfo ? 'var(--success)' : 'var(--danger)' }}>
            {liveKitInfo ? <Wifi size={12} /> : <WifiOff size={12} />}
          </div>
          {joined && (
            <button onClick={handleLeave}
              className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-1.5 rounded-xl text-sm hover:bg-red-500/30 transition-all flex items-center gap-1.5">
              <X size={14} /> {t('liveClass.quit')}
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
              <span className="text-xs text-red-400 font-bold uppercase tracking-widest">{t('liveClass.live_session_title')}</span>
              <h2 className="text-2xl font-black mt-2">{session?.titre}</h2>
              <p className="text-slate-400 text-sm mt-2">
                {isTeacher ? t('liveClass.you_are_teacher') : t('liveClass.teacher_label')}{session?.enseignant?.nom && !isTeacher ? session?.enseignant?.nom : ''}
              </p>
              <div className="flex items-center justify-center gap-2 mt-3 text-slate-500 text-sm">
                <Users size={14} />
                <span>{t('liveClass.participants_count', { count: session?.participants || participants.length })}</span>
              </div>
            </div>
            {!isTeacher && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300 text-left space-y-1">
                <p className="font-semibold flex items-center gap-2"><AlertTriangle size={14} /> Rappel :</p>
                <p className="text-xs text-amber-400/80">{t('liveClass.reminder_muted')}</p>
              </div>
            )}
            <motion.button
              onClick={handleJoin}
              className="btn-metal w-full py-4 flex items-center justify-center gap-3 text-base"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Video size={20} /> {isTeacher ? t('liveClass.start_course') : t('liveClass.join_course')}
            </motion.button>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

          {liveKitInfo ? (
            <LiveKitStream
              token={liveKitInfo.token}
              url={liveKitInfo.url}
              room={liveKitInfo.room}
              isTeacher={isTeacher}
              onLeave={handleLeave}
            />
          ) : (
            <div className="flex-1 bg-black flex items-center justify-center text-slate-500">
              <div className="text-center space-y-3">
                <WifiOff size={40} className="mx-auto opacity-50" />
                <p className="text-sm">{t('liveClass.connecting')}</p>
              </div>
            </div>
          )}

          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col"
            style={{ background: 'var(--bg-app)' }}>

            <div className="flex border-b border-white/10 flex-shrink-0">
              {[
                { key: 'questions',    label: t('liveClass.questions_tab'),    icon: MessageSquare },
                { key: 'participants', label: t('liveClass.participants_tab'), icon: Users },
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
                    ? <p className="text-center text-slate-600 text-sm py-8">{t('liveClass.no_questions')}</p>
                    : questions.map(q => (
                        <QuestionCard key={q.id} q={q} onMarkAnswered={markAnswered} isTeacher={isTeacher} />
                      ))
                  }
                </AnimatePresence>
              ) : (
                participants.length === 0 ? (
                  <p className="text-center text-slate-600 text-sm py-8">{t('liveClass.no_participants')}</p>
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
                    placeholder={isTeacher ? t('liveClass.answer_input_teacher') : t('liveClass.answer_input_student')}
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
