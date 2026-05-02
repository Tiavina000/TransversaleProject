import axios from 'axios';
import i18n from '../i18n';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: true,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attach Accept-Language & CSRF token automatically
api.interceptors.request.use((config) => {
  // Dynamic language header → backend sends translated DB content
  config.headers['Accept-Language'] = i18n.language || 'fr';

  // CSRF token from cookie
  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrftoken='))
    ?.split('=')[1];
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }

  // JWT from localStorage
  const token = localStorage.getItem('eneni_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('eneni_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:   (data) => api.post('/api/auth/login/', data),
  logout:  ()     => api.post('/api/auth/logout/'),
  me:      ()     => api.get('/api/auth/me/'),
};

// ─── Courses / Pedagogie ──────────────────────────────────────────────────────
export const courseAPI = {
  list:         (params) => api.get('/api/courses/', { params }),
  detail:       (id)     => api.get(`/api/courses/${id}/`),
  matieres:     ()       => api.get('/api/matieres/'),
  chapitres:    (id)     => api.get(`/api/matieres/${id}/chapitres/`),
  lecons:       (id)     => api.get(`/api/chapitres/${id}/lecons/`),
  progress:     (id)     => api.get(`/api/lecons/${id}/progress/`),
};

// ─── Exams ───────────────────────────────────────────────────────────────────
export const examAPI = {
  list:         ()       => api.get('/api/examens/'),
  detail:       (id)     => api.get(`/api/examens/${id}/`),
  start:        (id)     => api.post(`/api/examens/${id}/start/`),
  submit:       (id, d)  => api.post(`/api/examens/${id}/submit/`, d),
  syncTimer:    (id)     => api.get(`/api/examens/${id}/timer/`),
};

// ─── Surveillance (Logs silencieux) ──────────────────────────────────────────
export const surveillanceAPI = {
  /**
   * Envoie un événement de surveillance discret au backend.
   * Utilisé par le hook useSurveillance pour les changements d'onglet.
   */
  logEvent: (examId, eventType, details = {}) =>
    api.post(`/api/examens/${examId}/logs/`, {
      evenement:      eventType,
      details:        details,
      date_evenement: new Date().toISOString(),
    }),
};

// ─── Visio ───────────────────────────────────────────────────────────────────
export const visioAPI = {
  sessions: ()   => api.get('/api/sessions-visio/'),
  detail:   (id) => api.get(`/api/sessions-visio/${id}/`),
  join:     (id) => api.post(`/api/sessions-visio/${id}/join/`),
  leave:    (id) => api.post(`/api/sessions-visio/${id}/leave/`),
};

// ─── IA / Gidro ──────────────────────────────────────────────────────────────
export const iaAPI = {
  ask:          (q) => api.post('/api/ia/ask/', { request: q }),
  recommend:    ()  => api.get('/api/ia/recommendations/'),
};

// ─── Shop ─────────────────────────────────────────────────────────────────────
export const shopAPI = {
  resources:    (p) => api.get('/api/boutique/', { params: p }),
  addToCart:    (id) => api.post('/api/panier/add/', { ressource_id: id }),
  cart:         ()   => api.get('/api/panier/'),
  checkout:     ()   => api.post('/api/commandes/'),
};

export default api;
