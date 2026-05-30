import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './i18n';

import { ThemeProvider }   from './context/ThemeContext';
import { Navbar }          from './components/Layout/Navbar';
import { authAPI }         from './services/api';
import { StudentDashboard } from './components/Feed/StudentDashboard';
import { TeacherDashboard } from './components/Feed/TeacherDashboard';
import { AdminDashboard }   from './components/Feed/AdminDashboard';
import { LoginPage }       from './pages/LoginPage';
import { LandingPage }     from './pages/LandingPage';
import { CoursesPage }     from './pages/CoursesPage';
import { CoursePlayer }    from './pages/CoursePlayer';
import { ExamsPage }       from './pages/ExamsPage';
import { ExamView }        from './components/Exam/ExamMode';
import { BulletinPage }    from './pages/BulletinPage';
import { LiveClass }       from './pages/LiveClass';
import { ShopPage }        from './pages/ShopPage';
import { CorrectionsPage }  from './pages/CorrectionsPage';

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

function ProtectedRoute({ user, children }) {
  const token = sessionStorage.getItem('eneni_token');
  if (!user && !token) return <Navigate to="/login" replace />;
  return children;
}

function RoleDashboard({ user }) {
  if (user?.role === 'ADMINISTRATEUR') {
    return (
      <PageTransition>
        <AdminDashboard user={user} />
      </PageTransition>
    );
  }
  if (user?.role === 'ENSEIGNANT' || user?.type_utilisateur === 'ENSEIGNANT') {
    return (
      <PageTransition>
        <TeacherDashboard user={user} />
      </PageTransition>
    );
  }
  return (
    <PageTransition>
      <StudentDashboard user={user} />
    </PageTransition>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

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

  const handleLogin = async (userData) => {
    try {
      const res = await authAPI.me();
      setUser(res.data);
    } catch {
      setUser(userData);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('eneni_token');
    sessionStorage.removeItem('eneni_refresh');
    setUser(null);
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-app)' }}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">{t('app.loading_platform')}</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />
        } />
        <Route path="/*" element={
          <ProtectedRoute user={user}>
            <Routes>
              <Route path="/exams/:id" element={<ExamView />} />
              <Route path="*" element={
                <div className="min-h-screen" style={{ background: 'var(--bg-app)' }}>
                  <Navbar user={user} onLogout={handleLogout} />
                  <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <Routes>
                      <Route path="/dashboard"   element={<RoleDashboard user={user} />} />
                      <Route path="/admin/news"  element={<PageTransition><AdminDashboard user={user} /></PageTransition>} />
                      <Route path="/courses"     element={<PageTransition><CoursesPage user={user} /></PageTransition>} />
                      <Route path="/courses/:id" element={<CoursePlayer />} />
                      <Route path="/live"        element={<Navigate to="/dashboard" replace />} />
                      <Route path="/live/:id"    element={<LiveClass />} />
                      <Route path="/exams"       element={<PageTransition><ExamsPage user={user} /></PageTransition>} />
                      <Route path="/bulletin"    element={<PageTransition><BulletinPage user={user} /></PageTransition>} />
                      <Route path="/corrections" element={<PageTransition><CorrectionsPage /></PageTransition>} />
                      <Route path="/shop"        element={<PageTransition><ShopPage user={user} /></PageTransition>} />
                      <Route path="*"            element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              } />
            </Routes>
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Router>
  );
}
