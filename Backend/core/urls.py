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
        }
        if user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile'):
            if user.etudiant_profile.niveau:
                data['niveau'] = user.etudiant_profile.niveau.nom
        return Response(data)

class MockArrayView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        return Response([])
    def post(self, request, *args, **kwargs):
        return Response({})
    def patch(self, request, *args, **kwargs):
        return Response({})

class MockObjectView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        return Response({})
    def post(self, request, *args, **kwargs):
        return Response({})
    def patch(self, request, *args, **kwargs):
        return Response({})

urlpatterns = [
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
    path('api/live-sessions/<int:pk>/join/', MockObjectView.as_view()),
    path('api/live-sessions/<int:pk>/leave/', MockObjectView.as_view()),
    path('api/live-sessions/<int:pk>/raise-hand/', MockObjectView.as_view()),
    path('api/live-sessions/<int:pk>/lower-hand/', MockObjectView.as_view()),
    path('api/live-sessions/<int:pk>/questions/', MockObjectView.as_view()),
    path('api/live-sessions/<int:pk>/questions/<int:qid>/answered/', MockObjectView.as_view()),
    path('api/live-sessions/<int:pk>/ban/', MockObjectView.as_view()),
    
    path('api/sessions/<int:pk>/pause/', SessionEtudeViewSet.as_view({'post': 'pause_session'})),
    path('api/sessions/<int:pk>/resume/', SessionEtudeViewSet.as_view({'post': 'resume_session'})),
    path('api/sessions/<int:pk>/end/', SessionEtudeViewSet.as_view({'post': 'end_session'})),
    path('api/sessions/<int:pk>/heartbeat/', SessionEtudeViewSet.as_view({'post': 'heartbeat'})),
    
    path('api/examens/<int:pk>/start/', MockObjectView.as_view()),
    path('api/examens/<int:pk>/submit/', MockObjectView.as_view()),
    path('api/examens/<int:pk>/timer/', MockObjectView.as_view()),
    path('api/examens/<int:pk>/logs/', MockObjectView.as_view()),
    
    path('api/public/search/', PublicSearchView.as_view()),
    path('api/public/partners/', PartenaireViewSet.as_view({'get': 'list'})),
    path('api/public/renovations/', RenovationViewSet.as_view({'get': 'list'})),
    path('api/public/stats/', GlobalStatsView.as_view()),
    path('api/stats/', GlobalStatsView.as_view(), name='global_stats'),
    path('api/stats/student/', StudentStatsView.as_view(), name='student_stats'),
]