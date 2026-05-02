import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './i18n';

import { Navbar }           from './components/Layout/Navbar';
import { StudentDashboard } from './components/Feed/StudentDashboard';
import { ExamMode }         from './components/Exam/ExamMode';
import { VisioGrid }        from './components/Visio/VisioGrid';
import { GidroAssistant }   from './components/IA/GidroAssistant';
import { LoginPage }        from './pages/LoginPage';

// ── Page wrapper avec transition ──────────────────────────────────────────────
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

// ── Pages placeholder pour les sections non encore développées ───────────────
const PlaceholderPage = ({ title, emoji }) => (
  <PageTransition>
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <motion.div className="text-6xl animate-float">{emoji}</motion.div>
      <h2 className="text-2xl font-bold text-gradient">{title}</h2>
      <p className="text-slate-500 text-sm">Section en cours de développement...</p>
    </div>
  </PageTransition>
);

// ── Examen de démonstration ───────────────────────────────────────────────────
const DEMO_EXAM = {
  id: 1,
  titre: 'Mathématiques — Algèbre Linéaire',
  duree_minutes: 60,
  questions: [
    { id: 1, texte: 'Qu\'est-ce qu\'une matrice carrée ?', type_question: 'TEXTE', points: 4 },
    { id: 2, texte: 'Quel est le déterminant d\'une matrice identité 3×3 ?',
      type_question: 'QCM', points: 2,
      options: ['0', '1', '3', '-1'] },
    { id: 3, texte: 'Une matrice nulle est toujours symétrique.', type_question: 'VRAI_FAUX', points: 1 },
  ],
};

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null); // null = non connecté (demo : any value = connecté)

  const isAuth = !!user;

  if (!isAuth) {
    return (
      <>
        <LoginPage onLogin={(u) => setUser(u || { prenom: 'Étudiant', username: 'demo' })} />
        {/* Bouton de démonstration rapide */}
        <button
          className="fixed bottom-6 left-6 z-50 btn-ghost text-xs px-4 py-2"
          onClick={() => setUser({ prenom: 'Demo', username: 'demo' })}
        >
          👁 Mode démo
        </button>
      </>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#0A0A14]">
        {/* Navigation */}
        <Navbar user={user} />

        {/* Main content */}
        <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={
                <PageTransition>
                  <StudentDashboard user={user} />
                </PageTransition>
              } />
              <Route path="/courses" element={<PlaceholderPage title="Mes Cours" emoji="📚" />} />
              <Route path="/exams"   element={
                <PageTransition>
                  <ExamMode exam={DEMO_EXAM} onFinish={() => {}} />
                </PageTransition>
              } />
              <Route path="/shop"    element={<PlaceholderPage title="Boutique" emoji="🛍️" />} />
              <Route path="/visio"   element={
                <PageTransition>
                  <VisioGrid session={{ titre: 'Session Maths — Prof. Rakoto' }} />
                </PageTransition>
              } />
              <Route path="*"        element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>

        {/* Gidro — Always visible */}
        <GidroAssistant />
      </div>
    </Router>
  );
}
