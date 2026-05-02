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
    LeconViewSet, FichierMultimediaViewSet,
    # Examens
    ExamenViewSet, QuestionExamenViewSet, CopieExamenViewSet,
    ReponseExamenViewSet, LogSurveillanceViewSet,
    # Visioconférence
    SessionVisioViewSet, ParticipationVisioViewSet,
    # Boutique
    RessourceBoutiqueViewSet, PanierViewSet, PanierItemViewSet,
    CommandeViewSet,
    # Communications
    ActualiteViewSet, NotificationViewSet,
    # IA
    RequestIAViewSet, RecommandationViewSet,
)

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

# Enregistrer les ViewSets pour les examens
router.register(r'examens', ExamenViewSet, basename='examen')
router.register(r'questions-examen', QuestionExamenViewSet, basename='question-examen')
router.register(r'copies-examen', CopieExamenViewSet, basename='copie-examen')
router.register(r'reponses-examen', ReponseExamenViewSet, basename='reponse-examen')
router.register(r'logs-surveillance', LogSurveillanceViewSet, basename='log-surveillance')

# Enregistrer les ViewSets pour la visioconférence
router.register(r'sessions-visio', SessionVisioViewSet, basename='session-visio')
router.register(r'participations-visio', ParticipationVisioViewSet, basename='participation-visio')

# Enregistrer les ViewSets pour la boutique
router.register(r'ressources-boutique', RessourceBoutiqueViewSet, basename='ressource-boutique')
router.register(r'paniers', PanierViewSet, basename='panier')
router.register(r'panier-items', PanierItemViewSet, basename='panier-item')
router.register(r'commandes', CommandeViewSet, basename='commande')

# Enregistrer les ViewSets pour les communications
router.register(r'actualites', ActualiteViewSet, basename='actualite')
router.register(r'notifications', NotificationViewSet, basename='notification')

# Enregistrer les ViewSets pour l'IA
router.register(r'requetes-ia', RequestIAViewSet, basename='requete-ia')
router.register(r'recommandations', RecommandationViewSet, basename='recommandation')

urlpatterns = [
    path('api/', include(router.urls)),
]