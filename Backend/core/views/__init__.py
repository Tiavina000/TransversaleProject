# Views package for API endpoints
from .utilisateurs_views import (
    UtilisateurViewSet, EtudiantViewSet, EnseignantViewSet,
    AdminPlateformeViewSet
)
from .etablissements_views import EtablissementViewSet, AdminEtablissementViewSet
from .pedagogie_views import (
    NiveauScolaireViewSet, MatiereViewSet, ChapitreViewSet,
    LeconViewSet, FichierMultimediaViewSet
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
from .communications_views import ActualiteViewSet, NotificationViewSet
from .ia_views import RequestIAViewSet, RecommandationViewSet

__all__ = [
    # Utilisateurs
    'UtilisateurViewSet', 'EtudiantViewSet', 'EnseignantViewSet',
    'AdminPlateformeViewSet',
    # Établissements
    'EtablissementViewSet', 'AdminEtablissementViewSet',
    # Pédagogie
    'NiveauScolaireViewSet', 'MatiereViewSet', 'ChapitreViewSet',
    'LeconViewSet', 'FichierMultimediaViewSet',
    # Examens
    'ExamenViewSet', 'QuestionExamenViewSet', 'CopieExamenViewSet',
    'ReponseExamenViewSet', 'LogSurveillanceViewSet',
    # Visioconférence
    'SessionVisioViewSet', 'ParticipationVisioViewSet',
    # Boutique
    'RessourceBoutiqueViewSet', 'PanierViewSet', 'PanierItemViewSet',
    'CommandeViewSet',
    # Communications
    'ActualiteViewSet', 'NotificationViewSet',
    # IA
    'RequestIAViewSet', 'RecommandationViewSet',
]
