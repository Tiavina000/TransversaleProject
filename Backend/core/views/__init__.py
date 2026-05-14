# Views package for API endpoints
from .utilisateurs_views import (
    UtilisateurViewSet, EtudiantViewSet, EnseignantViewSet,
    AdminPlateformeViewSet, CustomTokenObtainPairView, LogoutView
)
from .etablissements_views import EtablissementViewSet, AdminEtablissementViewSet
from .pedagogie_views import (
    NiveauScolaireViewSet, MatiereViewSet, ChapitreViewSet,
    LeconViewSet, FichierMultimediaViewSet, PublicSearchView,
    SessionEtudeViewSet, StudentStatsView
)
from .examens_views import (
    ExamenViewSet, QuestionExamenViewSet, CopieExamenViewSet,
    ReponseExamenViewSet, LogSurveillanceViewSet
)
from .visioconference_views import SessionVisioViewSet, ParticipationVisioViewSet
from .boutique_views import (
    RessourceBoutiqueViewSet, PanierViewSet, PanierItemViewSet,
    CommandeViewSet
)
from .communications_views import ActualiteViewSet, NotificationViewSet, PartenaireViewSet, RenovationViewSet
from .ia_views import RequestIAViewSet, RecommandationViewSet

__all__ = [
    # Utilisateurs
    'UtilisateurViewSet', 'EtudiantViewSet', 'EnseignantViewSet',
    'AdminPlateformeViewSet', 'CustomTokenObtainPairView', 'LogoutView',
    # Établissements
    'EtablissementViewSet', 'AdminEtablissementViewSet',
    # Pédagogie
    'NiveauScolaireViewSet', 'MatiereViewSet', 'ChapitreViewSet',
    'LeconViewSet', 'FichierMultimediaViewSet', 'PublicSearchView',
    # Examens
    'ExamenViewSet', 'QuestionExamenViewSet', 'CopieExamenViewSet',
    'ReponseExamenViewSet', 'LogSurveillanceViewSet',
    # Visioconférence
    'SessionVisioViewSet', 'ParticipationVisioViewSet',
    # Boutique
    'RessourceBoutiqueViewSet', 'PanierViewSet', 'PanierItemViewSet',
    'CommandeViewSet',
    # Communications
    'ActualiteViewSet', 'NotificationViewSet', 'PartenaireViewSet', 'RenovationViewSet',
    # IA
    'RequestIAViewSet', 'RecommandationViewSet',
]
