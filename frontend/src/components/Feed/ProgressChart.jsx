import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Award, Calendar } from 'lucide-react';

export function ProgressChart() {
  const { t } = useTranslation();

  const stats = [
    { label: "Cours complétés", value: "12", color: "text-emerald-400", bg: "bg-emerald-500/20" },
    { label: "Heures d'étude", value: "34h", color: "text-blue-400", bg: "bg-blue-500/20" },
    { label: "Score moyen", value: "16/20", color: "text-purple-400", bg: "bg-purple-500/20" }
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" /> 
          Ma Progression
        </h3>
        <span className="text-xs text-slate-400 flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
          <Calendar size={12} /> Ce mois
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5">
            <span className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider text-center">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Award size={16} className="text-amber-400" /> Derniers Badges
        </h4>
        <div className="flex gap-3">
          <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-lg" title="Explorateur de Savoir">
            🧭
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-lg" title="Parfait en Maths">
            🧮
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-lg" title="Régularité">
            🔥
          </motion.div>
        </div>
      </div>
    </div>
  );
}
