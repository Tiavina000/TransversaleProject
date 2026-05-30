import axios from 'axios';
import i18n from '../i18n';

let API_BASE = import.meta.env.VITE_API_URL || '';
if (API_BASE.endsWith('/')) {
  API_BASE = API_BASE.slice(0, -1);
}

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

  // JWT from sessionStorage
  const token = sessionStorage.getItem('eneni_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si on reçoit un 401 et que ce n'est pas déjà une tentative de rafraîchissement
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = sessionStorage.getItem('eneni_refresh');

      if (refreshToken) {
        try {
          // Appel direct à l'API pour rafraîchir le token
          const res = await axios.post(`${API_BASE}/api/auth/refresh/`, { refresh: refreshToken });
          
          if (res.status === 200) {
            const newAccessToken = res.data.access;
            sessionStorage.setItem('eneni_token', newAccessToken);
            
            // On met à jour l'en-tête et on rejoue la requête initiale
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("Token refresh failed", refreshError);
        }
      }
      
      // Si pas de refresh token ou échec du refresh, on déconnecte
      sessionStorage.removeItem('eneni_token');
      sessionStorage.removeItem('eneni_refresh');
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
  validationQuestion: (id) => api.get(`/api/chapitres/${id}/validation-question/`),
};

// ─── Exams ───────────────────────────────────────────────────────────────────
export const examAPI = {
  list:         ()       => api.get('/api/examens/'),
  detail:       (id)     => api.get(`/api/examens/${id}/`),
  create:       (d)      => api.post('/api/examens/', d),
  update:       (id, d)  => api.patch(`/api/examens/${id}/`, d),
  delete:       (id)     => api.delete(`/api/examens/${id}/`),
  start:        (id)     => api.post(`/api/examens/${id}/start/`),
  submit:       (id, d)  => api.post(`/api/examens/${id}/submit/`, d),
  syncTimer:    (id)     => api.get(`/api/examens/${id}/timer/`),
  publier:      (id)     => api.post(`/api/examens/${id}/publier/`),
  ajouterQuestion: (id, d) => api.post(`/api/examens/${id}/ajouter-question/`, d),
  questions:    (id)     => api.get(`/api/examens/${id}/questions/`),
  updateQuestion: (id, d) => api.patch(`/api/questions-examen/${id}/`, d),
  deleteQuestion: (id) => api.delete(`/api/questions-examen/${id}/`),
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
    })
  };

// ─── Visio ───────────────────────────────────────────────────────────────────
export const visioAPI = {
  sessions: ()   => api.get('/api/sessions-visio/'),
  create:   (d)  => api.post('/api/sessions-visio/', d),
  detail:   (id) => api.get(`/api/sessions-visio/${id}/`),
  join:     (id) => api.post(`/api/sessions-visio/${id}/join/`),
  leave:    (id) => api.post(`/api/sessions-visio/${id}/leave/`),
};

// ─── Shop ─────────────────────────────────────────────────────────────────────
export const shopAPI = {
  resources:    (p) => api.get('/api/boutique/', { params: p }),
  addToCart:    (id) => api.post('/api/panier/add/', { ressource_id: id }),
  cart:         ()   => api.get('/api/panier/'),
  checkout:     ()   => api.post('/api/commandes/'),
};

export const statsAPI = {
  getGlobal:   () => api.get('/api/stats/'),
  getStudent:  () => api.get('/api/stats/student/'),
  getTeacher:  () => api.get('/api/stats/teacher/'),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifAPI = {
  list:          () => api.get('/api/notifications/'),
  markRead:      (id) => api.patch(`/api/notifications/lire/${id}/`),
  markAllRead:   () => api.post('/api/notifications/tout-lire/'),
  count:         () => api.get('/api/notifications/compte/'),
  creerVisio:    (data) => api.post('/api/notifications/creer-visio/', data),
  notifierBan:   (data) => api.post('/api/notifications/notifier-ban/', data),
  signalerRetard: (data) => api.post('/api/notifications/signaler-retard/', data),
};

// ─── News / Actualités établissement ─────────────────────────────────────────
export const newsAPI = {
  list:     (params)      => api.get('/api/actualites/', { params }),
  detail:   (id)          => api.get(`/api/actualites/${id}/`),
  // Fil infini : toutes les actus d'un coup, sans pagination
  infinite: (params)      => api.get('/api/actualites/infinite/', { params }),
  // Création avec image (FormData multipart)
  create: (formData)      => api.post('/api/actualites/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData)  => api.patch(`/api/actualites/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  remove: (id)            => api.delete(`/api/actualites/${id}/`),
};

// ─── Notes / Bulletin (R21) ──────────────────────────────────────────────────
export const notesAPI = {
  mesNotes: () => api.get('/api/mes-notes/'),
  notesEnseignant: (params) => api.get('/api/notes-enseignant/', { params }),
};

// ─── Live Class (cours en direct) ────────────────────────────────────────────
export const liveAPI = {
  sessions:     ()     => api.get('/api/live-sessions/'),
  detail:       (id)   => api.get(`/api/live-sessions/${id}/`),
  join:         (id)   => api.post(`/api/live-sessions/${id}/join/`),
  leave:        (id)   => api.post(`/api/live-sessions/${id}/leave/`),
  raiseHand:    (id)   => api.post(`/api/live-sessions/${id}/raise-hand/`),
  lowerHand:    (id)   => api.post(`/api/live-sessions/${id}/lower-hand/`),
  sendQuestion: (id, q) => api.post(`/api/live-sessions/${id}/questions/`, { content: q }),
  markAnswered: (id, qId) => api.patch(`/api/live-sessions/${id}/questions/${qId}/answered/`),
  banStudent:   (id, userId, duration) => api.post(`/api/live-sessions/${id}/ban/`, { user_id: userId, duration_hours: duration }),
  livekitToken: (id)   => api.get(`/api/live-sessions/${id}/livekit-token/`),
};

// ─── Teacher Course Management (R7) ──────────────────────────────────────────
export const teacherCourseAPI = {
  chapitres:   (params) => api.get('/api/teacher/chapitres/', { params }),
  createChapitre: (d)   => api.post('/api/teacher/chapitres/', d),
  updateChapitre: (id, d) => api.patch(`/api/teacher/chapitres/${id}/`, d),
  deleteChapitre: (id)  => api.delete(`/api/teacher/chapitres/${id}/`),
  lecons:      (params) => api.get('/api/teacher/lecons/', { params }),
  createLecon: (d)      => api.post('/api/teacher/lecons/', d),
  updateLecon: (id, d)  => api.patch(`/api/teacher/lecons/${id}/`, d),
  deleteLecon: (id)     => api.delete(`/api/teacher/lecons/${id}/`),
  uploadFile:  (formData) => api.post('/api/chapitres/upload_file/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteFile:  (id)      => api.delete(`/api/fichiers-multimedia/${id}/`),
  getQCM:      (chapitreId) => api.get(`/api/chapitres/${chapitreId}/qcm-validation/`),
  createQCM:   (chapitreId, data) => api.post(`/api/chapitres/${chapitreId}/qcm-validation/`, data),
  deleteQCM:   (chapitreId) => api.delete(`/api/chapitres/${chapitreId}/qcm-validation/`),
};

// ─── Corrections (R12) ───────────────────────────────────────────────────────
export const correctionAPI = {
  list:        (params) => api.get('/api/corrections/', { params }),
  classes:     ()       => api.get('/api/corrections/classes/'),
  matieres:    ()       => api.get('/api/corrections/matieres/'),
  noter:       (id, note) => api.post(`/api/corrections/${id}/noter/`, { note }),
  spellcheck:  (id)     => api.get(`/api/corrections/${id}/spellcheck/`),
  valider:     (id)     => api.post(`/api/corrections/${id}/valider/`),
  corrigeables: ()      => api.get('/api/examens/corrigeables/'),
  corriger:    (examId, copieId, data) => api.post(`/api/examens/${examId}/corriger/${copieId}/`, data),
};

export const copieAPI = {
  detail: (id) => api.get(`/api/copies-examen/${id}/`),
};

export const reponseAPI = {
  update: (id, data) => api.patch(`/api/reponses-examen/${id}/`, data),
};

// ─── Course Session (chrono de présence) ─────────────────────────────────────
export const sessionAPI = {
  start:     (chapitreId) => api.post(`/api/courses/${chapitreId}/session/start/`, { chapitre_id: chapitreId }),
  pause:     (sessionId) => api.post(`/api/sessions/${sessionId}/pause/`),
  resume:    (sessionId) => api.post(`/api/sessions/${sessionId}/resume/`),
  end:       (sessionId) => api.post(`/api/sessions/${sessionId}/end/`),
  heartbeat: (sessionId) => api.post(`/api/sessions/${sessionId}/heartbeat/`),
};

// ─── Public (sans auth) ──────────────────────────────────────────────────────
export const publicAPI = {
  search:        (q)  => api.get('/api/public/search/', { params: { q } }),
  getStats:      ()   => api.get('/api/public/stats/'),
  getPartners:   ()   => api.get('/api/public/partners/'),
  getRenovations: ()  => api.get('/api/public/renovations/'),
  getEstablishments: (params) => api.get('/api/etablissements/', { params }),
};

// ─── Classes (R13) ───────────────────────────────────────────────────────────
export const classesAPI = {
  list: (params) => api.get('/api/classes/', { params }),
  get:  (id)     => api.get(`/api/classes/${id}/`),
};

export default api;
