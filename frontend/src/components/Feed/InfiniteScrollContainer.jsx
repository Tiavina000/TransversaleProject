import { useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * Carte individuelle d'un cours avec :
 * - Gradient métallique animé
 * - Barre de progression
 * - Hover effect
 */
function CourseCard({ course, index, onSelect }) {
  const { t } = useTranslation();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      className="card-shine cursor-pointer p-5"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      onClick={() => onSelect?.(course)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: course.color || 'rgba(124,58,237,0.3)' }}
        >
          {course.emoji || '📚'}
        </div>
        <span className="text-xs text-slate-500 glass-sm px-2 py-0.5 rounded-full">
          {course.niveau}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{course.titre}</h3>
      <p className="text-slate-500 text-xs mb-4 line-clamp-1">{course.matiere}</p>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400">
          <span>{t('dashboard.progress')}</span>
          <span className="text-primary font-medium">{course.progress || 0}%</span>
        </div>
        <div className="progress-bar-track">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${course.progress || 0}%` }}
            transition={{ duration: 1.2, delay: index * 0.06 + 0.3 }}
          />
        </div>
      </div>

      {/* CTA */}
      <button className="btn-metal w-full mt-4 text-xs py-2">
        {t('dashboard.continue')} →
      </button>
    </motion.div>
  );
}

/**
 * Conteneur avec scroll infini (react-intersection-observer).
 * Charge les cours par lots comme un fil d'actualité.
 */
export function InfiniteScrollContainer({ courses = [], onLoadMore, hasMore, onSelectCourse }) {
  const { t } = useTranslation();
  const { ref: loaderRef, inView } = useInView({ threshold: 0.5 });

  // Déclencher le chargement suivant
  if (inView && hasMore) onLoadMore?.();

  return (
    <div className="space-y-6">
      {/* Grid de cours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {courses.map((course, i) => (
          <CourseCard
            key={course.id}
            course={course}
            index={i}
            onSelect={onSelectCourse}
          />
        ))}
      </div>

      {/* Sentinel de scroll infini */}
      <div ref={loaderRef} className="flex justify-center py-4">
        {hasMore ? (
          <div className="flex items-center gap-3 text-slate-500 text-sm">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            {t('common.loading')}
          </div>
        ) : (
          courses.length > 0 && (
            <span className="text-slate-600 text-xs">— Fin des résultats —</span>
          )
        )}
      </div>
    </div>
  );
}
