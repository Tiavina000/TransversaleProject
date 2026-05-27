import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
import { BulletinPage }    from './pages/BulletinPage';
import { LiveClass }       from './pages/LiveClass';
import { ShopPage }        from './pages/ShopPage';

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

  const handleLogin = (userData) => {
    setUser(userData);
    navigate('/dashboard', { replace: true });
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
          <p className="text-slate-500 text-sm">Chargement de la plateforme...</p>
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
            <div className="min-h-screen" style={{ background: 'var(--bg-app)' }}>
              <Navbar user={user} onLogout={handleLogout} />
              <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <Routes>
                  <Route path="/dashboard"   element={<RoleDashboard user={user} />} />
                  <Route path="/admin/news"  element={<PageTransition><AdminDashboard user={user} /></PageTransition>} />
                  <Route path="/courses"     element={<PageTransition><CoursesPage user={user} /></PageTransition>} />
                  <Route path="/courses/:id" element={<CoursePlayer />} />
                  <Route path="/live/:id"    element={<LiveClass />} />
                  <Route path="/exams"       element={<PageTransition><ExamsPage user={user} /></PageTransition>} />
                  <Route path="/bulletin"    element={<PageTransition><BulletinPage user={user} /></PageTransition>} />
                  <Route path="/corrections" element={<PageTransition><div className="text-center py-20 text-slate-400"><p className="text-lg font-bold">Page de correction</p><p className="text-sm mt-2">Utilisez l'API /api/corrections/</p></div></PageTransition>} />
                  <Route path="/shop"        element={<PageTransition><ShopPage /></PageTransition>} />
                  <Route path="*"            element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
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
