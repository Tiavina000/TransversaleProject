import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './i18n';

import { Navbar }          from './components/Layout/Navbar';
import { authAPI }         from './services/api';
import { StudentDashboard } from './components/Feed/StudentDashboard';
import { AdminDashboard }   from './components/Feed/AdminDashboard';
import { ExamMode }        from './components/Exam/ExamMode';
import { LoginPage }       from './pages/LoginPage';
import { LandingPage }     from './pages/LandingPage';
import { CoursesPage }     from './pages/CoursesPage';
import { CoursePlayer }    from './pages/CoursePlayer';
import { LiveClass }       from './pages/LiveClass';
import { ShopPage }        from './pages/ShopPage';

// ── Transition de page ───────────────────────────────────────────────────────
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.28 }}
  >
    {children}
  </motion.div>
);

// ── Données examen de démo ───────────────────────────────────────────────────
const DEMO_EXAM = {
  id: 1,
  titre: 'Mathématiques — Algèbre Linéaire',
  duree_minutes: 60,
  questions: [
    { id: 1, texte: "Qu'est-ce qu'une matrice carrée ?", type_question: 'TEXTE', points: 4 },
    { id: 2, texte: "Quel est le déterminant d'une matrice identité 3×3 ?",
      type_question: 'QCM', points: 2, options: ['0', '1', '3', '-1'] },
    { id: 3, texte: 'Une matrice nulle est toujours symétrique.', type_question: 'VRAI_FAUX', points: 1 },
  ],
};

// ── Route protégée ───────────────────────────────────────────────────────────
function ProtectedRoute({ user, children }) {
  const token = sessionStorage.getItem('eneni_token');
  if (!user && !token) return <Navigate to="/login" replace />;
  return children;
}

// ── Dashboard adaptatif selon le rôle ───────────────────────────────────────
function RoleDashboard({ user }) {
  if (user?.role === 'ADMINISTRATEUR') {
    return (
      <PageTransition>
        <AdminDashboard user={user} />
      </PageTransition>
    );
  }
  return (
    <PageTransition>
      <StudentDashboard user={user} />
    </PageTransition>
  );
}

// ── Application principale ───────────────────────────────────────────────────
export default function App() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérification de l'authentification au démarrage
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('eneni_token');
      if (token) {
        try {
          const res = await authAPI.me();
          setUser(res.data);
        } catch (err) {
          console.error("Auth check failed:", err);
          sessionStorage.removeItem('eneni_token');
          sessionStorage.removeItem('eneni_refresh');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Chargement de la plateforme...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          {/* ── Routes publiques ── */}
          <Route path="/"      element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={(u) => {
            setUser(u);
            // On force un petit délai pour être sûr que le token est bien en session
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 100);
          }} />} />

          {/* ── Routes privées (avec Navbar) ── */}
          <Route
            path="/*"
            element={
              <ProtectedRoute user={user}>
                <div className="min-h-screen bg-[#0A0A14]">
                  <Navbar user={user} onLogout={() => setUser(null)} />
                  <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <Routes>
                      {/* Dashboard adaptatif : admin → AdminDashboard, autres → StudentDashboard */}
                      <Route path="/dashboard"   element={<RoleDashboard user={user} />} />
                      {/* Route dédiée pour la gestion des actus (admin) */}
                      <Route path="/admin/news"  element={
                        <PageTransition>
                          <AdminDashboard user={user} />
                        </PageTransition>
                      } />
                      <Route path="/courses"     element={<PageTransition><CoursesPage user={user} /></PageTransition>} />
                      <Route path="/courses/:id" element={<CoursePlayer />} />
                      <Route path="/live/:id"    element={<LiveClass />} />
                      <Route path="/exams"       element={<PageTransition><ExamMode exam={DEMO_EXAM} onFinish={() => {}} /></PageTransition>} />
                      <Route path="/shop"        element={<PageTransition><ShopPage /></PageTransition>} />
                      <Route path="*"            element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}
