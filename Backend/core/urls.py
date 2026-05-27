from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import (
    # Utilisateurs
    UtilisateurViewSet, EtudiantViewSet, EnseignantViewSet,
    AdminPlateformeViewSet,
    # Établissements
    EtablissementViewSet, AdminEtablissementViewSet,
    # Pédagogie
    NiveauScolaireViewSet, MatiereViewSet, ChapitreViewSet,
    LeconViewSet, FichierMultimediaViewSet, SessionEtudeViewSet,
    # Examens
    ExamenViewSet, QuestionExamenViewSet, CopieExamenViewSet,
    ReponseExamenViewSet, LogSurveillanceViewSet,
    CorrectionViewSet,
    # Visioconférence
    SessionVisioViewSet, ParticipationVisioViewSet,
    # Boutique
    RessourceBoutiqueViewSet, PanierViewSet, PanierItemViewSet,
    CommandeViewSet,
    # Communications
    ActualiteViewSet, NotificationViewSet, PartenaireViewSet, RenovationViewSet,
    # IA
    RequestIAViewSet, RecommandationViewSet,
    CustomTokenObtainPairView, LogoutView, PublicSearchView
)
from core.views.stats_views import GlobalStatsView, StudentStatsView
from core.views.examens_views import FileDownloadView, MesNotesView

# Initialiser le routeur
router = DefaultRouter()

# Enregistrer les ViewSets pour les utilisateurs
router.register(r'utilisateurs', UtilisateurViewSet, basename='utilisateur')
router.register(r'etudiants', EtudiantViewSet, basename='etudiant')
router.register(r'enseignants', EnseignantViewSet, basename='enseignant')
router.register(r'admins-plateforme', AdminPlateformeViewSet, basename='admin-plateforme')

# Enregistrer les ViewSets pour les établissements
router.register(r'etablissements', EtablissementViewSet, basename='etablissement')
router.register(r'admin-etablissements', AdminEtablissementViewSet, basename='admin-etablissement')

# Enregistrer les ViewSets pour la pédagogie
router.register(r'niveaux-scolaires', NiveauScolaireViewSet, basename='niveau-scolaire')
router.register(r'matieres', MatiereViewSet, basename='matiere')
router.register(r'chapitres', ChapitreViewSet, basename='chapitre')
router.register(r'lecons', LeconViewSet, basename='lecon')
router.register(r'fichiers-multimedia', FichierMultimediaViewSet, basename='fichier-multimedia')
router.register(r'sessions-etude', SessionEtudeViewSet, basename='session-etude')

# Enregistrer les ViewSets pour les examens
router.register(r'examens', ExamenViewSet, basename='examen')
router.register(r'questions-examen', QuestionExamenViewSet, basename='question-examen')
router.register(r'copies-examen', CopieExamenViewSet, basename='copie-examen')
router.register(r'reponses-examen', ReponseExamenViewSet, basename='reponse-examen')
router.register(r'logs-surveillance', LogSurveillanceViewSet, basename='log-surveillance')

# Enregistrer les ViewSets pour la visioconférence
router.register(r'sessions-visio', SessionVisioViewSet, basename='session-visio')
router.register(r'participations-visio', ParticipationVisioViewSet, basename='participation-visio')

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Enregistrer les ViewSets pour la boutique
router.register(r'boutique', RessourceBoutiqueViewSet, basename='ressource-boutique')
router.register(r'paniers', PanierViewSet, basename='panier')
router.register(r'panier-items', PanierItemViewSet, basename='panier-item')
router.register(r'commandes', CommandeViewSet, basename='commande')

# Enregistrer les ViewSets pour les communications
router.register(r'actualites', ActualiteViewSet, basename='actualite')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'partenaires', PartenaireViewSet, basename='partenaire')
router.register(r'renovations', RenovationViewSet, basename='renovation')

# Enregistrer les ViewSets pour l'IA
router.register(r'requetes-ia', RequestIAViewSet, basename='requete-ia')
router.register(r'recommandations', RecommandationViewSet, basename='recommandation')

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'prenom': user.prenom or user.username,
            'role': user.type_utilisateur,
            'type_utilisateur': user.type_utilisateur,
        }
        if user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile'):
            profile = user.etudiant_profile
            if profile.niveau:
                data['niveau'] = profile.niveau.nom
            if profile.etablissement:
                data['etablissement'] = profile.etablissement.nom
                data['etablissement_id'] = profile.etablissement.id
            data['numero_etudiant'] = profile.numero_etudiant
        elif user.type_utilisateur == 'ENSEIGNANT' and hasattr(user, 'enseignant_profile'):
            profile = user.enseignant_profile
            data['specialite'] = profile.specialite
            if profile.etablissement:
                data['etablissement'] = profile.etablissement.nom
                data['etablissement_id'] = profile.etablissement.id
            examens = user.enseignant_profile.examens.all()
            matieres = set()
            niveaux = set()
            for ex in examens:
                if ex.matiere:
                    matieres.add(ex.matiere.nom)
                if ex.niveau:
                    niveaux.add(ex.niveau.nom)
            data['matieres_enseignees'] = list(matieres)
            data['niveaux_enseignes'] = list(niveaux)
        return Response(data)

urlpatterns = [
    # Specific notification routes BEFORE router include to avoid {pk} catch-all
    path('api/notifications/creer-visio/', NotificationViewSet.as_view({'post': 'creer_visio'}), name='notif-creer-visio'),
    path('api/notifications/notifier-ban/', NotificationViewSet.as_view({'post': 'notifier_ban'}), name='notif-ban'),
    path('api/notifications/lire/<int:pk>/', NotificationViewSet.as_view({'patch': 'lire'}), name='notif-lire'),
    path('api/notifications/tout-lire/', NotificationViewSet.as_view({'post': 'tout_lire'}), name='notif-tout-lire'),
    path('api/notifications/compte/', NotificationViewSet.as_view({'get': 'compte'}), name='notif-compte'),
    path('api/', include(router.urls)),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', UserMeView.as_view(), name='user_me'),
    
    # Map courses to Matieres for the catalogue
    path('api/courses/', MatiereViewSet.as_view({'get': 'list'}), name='courses_list'),
    path('api/courses/<int:pk>/', MatiereViewSet.as_view({'get': 'retrieve'}), name='courses_detail'),
    path('api/courses/<int:pk>/session/start/', SessionEtudeViewSet.as_view({'post': 'start_session'})),
    
    # Missing API endpoints mapped to Real Views
    path('api/live-sessions/', SessionVisioViewSet.as_view({'get': 'list', 'post': 'create'}), name='live_sessions'),
    path('api/live-sessions/<int:pk>/', SessionVisioViewSet.as_view({'get': 'retrieve'}), name='live_sessions_detail'),
    path('api/live-sessions/<int:pk>/join/', SessionVisioViewSet.as_view({'post': 'join'}), name='live-join'),
    path('api/live-sessions/<int:pk>/leave/', SessionVisioViewSet.as_view({'post': 'leave'}), name='live-leave'),
    path('api/live-sessions/<int:pk>/raise-hand/', SessionVisioViewSet.as_view({'post': 'raise_hand'}), name='live-raise-hand'),
    path('api/live-sessions/<int:pk>/lower-hand/', SessionVisioViewSet.as_view({'post': 'lower_hand'}), name='live-lower-hand'),
    path('api/live-sessions/<int:pk>/questions/', SessionVisioViewSet.as_view({'get': 'questions', 'post': 'questions'}), name='live-questions'),
    path('api/live-sessions/<int:pk>/questions/<int:qid>/answered/', SessionVisioViewSet.as_view({'patch': 'mark_answered'}), name='live-questions-answered'),
    path('api/live-sessions/<int:pk>/ban/', SessionVisioViewSet.as_view({'post': 'ban'}), name='live-ban'),
    
    path('api/sessions/<int:pk>/pause/', SessionEtudeViewSet.as_view({'post': 'pause_session'})),
    path('api/sessions/<int:pk>/resume/', SessionEtudeViewSet.as_view({'post': 'resume_session'})),
    path('api/sessions/<int:pk>/end/', SessionEtudeViewSet.as_view({'post': 'end_session'})),
    path('api/sessions/<int:pk>/heartbeat/', SessionEtudeViewSet.as_view({'post': 'heartbeat'})),
    
    path('api/examens/<int:pk>/start/', ExamenViewSet.as_view({'post': 'start'}), name='examen-start'),
    path('api/examens/<int:pk>/submit/', ExamenViewSet.as_view({'post': 'soumettre'}), name='examen-submit'),
    path('api/examens/<int:pk>/timer/', ExamenViewSet.as_view({'get': 'timer'}), name='examen-timer'),
    path('api/examens/<int:pk>/logs/', ExamenViewSet.as_view({'post': 'log_event'}), name='examen-logs'),
    
    path('api/public/search/', PublicSearchView.as_view()),
    path('api/public/partners/', PartenaireViewSet.as_view({'get': 'list'})),
    path('api/public/renovations/', RenovationViewSet.as_view({'get': 'list'})),
    path('api/public/stats/', GlobalStatsView.as_view()),
    
    path('api/stats/', GlobalStatsView.as_view(), name='global_stats'),
    path('api/stats/student/', StudentStatsView.as_view(), name='student_stats'),
    
    # Correction endpoints (R12)
    path('api/corrections/', CorrectionViewSet.as_view({'get': 'list'}), name='corrections-list'),
    path('api/corrections/classes/', CorrectionViewSet.as_view({'get': 'classes'}), name='corrections-classes'),
    path('api/corrections/matieres/', CorrectionViewSet.as_view({'get': 'matieres'}), name='corrections-matieres'),
    path('api/corrections/<int:pk>/noter/', CorrectionViewSet.as_view({'post': 'noter'}), name='corrections-noter'),
    path('api/corrections/<int:pk>/spellcheck/', CorrectionViewSet.as_view({'get': 'spellcheck'}), name='corrections-spellcheck'),
    
    # Examens submission & correction
    path('api/examens/<int:pk>/soumettre/', ExamenViewSet.as_view({'post': 'soumettre'}), name='examen-soumettre'),
    path('api/examens/<int:pk>/publier/', ExamenViewSet.as_view({'post': 'publier'}), name='examen-publier'),
    path('api/examens/<int:pk>/ajouter-question/', ExamenViewSet.as_view({'post': 'ajouter_question'}), name='examen-ajouter-question'),
    path('api/examens/<int:pk>/questions/', ExamenViewSet.as_view({'get': 'questions'}), name='examen-questions'),
    path('api/examens/corrigeables/', ExamenViewSet.as_view({'get': 'corrigeables'}), name='examens-corrigeables'),
    path('api/examens/<int:pk>/corriger/<int:copie_id>/', ExamenViewSet.as_view({'post': 'corriger_copie'}), name='examen-corriger'),
    
    # File download (R16)
    path('api/courses/<int:course_id>/files/<int:file_id>/download/', FileDownloadView.as_view(), name='file-download'),
    
    # Panier (frontend uses singular /api/panier/)
    path('api/panier/', PanierViewSet.as_view({'get': 'list'}), name='panier-list'),
    path('api/panier/add/', PanierViewSet.as_view({'post': 'add'}), name='panier-add'),
    # Student bulletin / notes (R21)
    path('api/mes-notes/', MesNotesView.as_view(), name='mes-notes'),

    # Teacher course management (R7)
    path('api/teacher/chapitres/', ChapitreViewSet.as_view({'get': 'list', 'post': 'create'}), name='teacher-chapitres'),
    path('api/teacher/chapitres/<int:pk>/', ChapitreViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='teacher-chapitre-detail'),
    path('api/teacher/lecons/', LeconViewSet.as_view({'get': 'list', 'post': 'create'}), name='teacher-lecons'),
    path('api/teacher/lecons/<int:pk>/', LeconViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='teacher-lecon-detail'),
]