import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * Stories — Pastilles de rappels rapides style Instagram.
 * Affiche des annonces ou rappels d'examens en haut du dashboard.
 *
 * @param {Array} stories - [{ id, title, content, emoji, color }]
 */
export function Stories({ stories = [] }) {
  const [activeIdx, setActiveIdx] = useState(null);

  if (!stories.length) return null;

  const active = activeIdx !== null ? stories[activeIdx] : null;

  return (
    <>
      {/* ── Pastilles horizontales ─────────────────────────────── */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {stories.map((s, i) => (
          <motion.button
            key={s.id}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
            onClick={() => setActiveIdx(i)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="story-ring p-0.5">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{ background: s.color || 'rgba(124,58,237,0.3)' }}
              >
                {s.emoji || '📢'}
              </div>
            </div>
            <span className="text-xs text-slate-400 max-w-[64px] truncate">{s.title}</span>
          </motion.button>
        ))}
      </div>

      {/* ── Viewer plein écran ─────────────────────────────────── */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIdx(null)}
          >
            <motion.div
              className="glass neon-border w-full max-w-sm mx-4 p-6 relative"
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1,    y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Progress bar */}
              <div className="flex gap-1 mb-4">
                {stories.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: i <= activeIdx ? '100%' : '0%' }}
                    />
                  </div>
                ))}
              </div>

              {/* Close */}
              <button
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                onClick={() => setActiveIdx(null)}
              >
                <X size={18} />
              </button>

              <div className="text-4xl mb-3">{active.emoji}</div>
              <h3 className="text-lg font-bold text-white mb-2">{active.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{active.content}</p>

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button
                  className="btn-ghost text-sm flex items-center gap-1"
                  onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                  disabled={activeIdx === 0}
                >
                  <ChevronLeft size={16} /> Préc.
                </button>
                <button
                  className="btn-metal text-sm flex items-center gap-1"
                  onClick={() => {
                    if (activeIdx < stories.length - 1) setActiveIdx(activeIdx + 1);
                    else setActiveIdx(null);
                  }}
                >
                  Suiv. <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
