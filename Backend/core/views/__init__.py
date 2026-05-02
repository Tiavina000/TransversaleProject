# Views package for API endpoints
from .utilisateurs_views import (
    UtilisateurViewSet, EtudiantViewSet, EnseignantViewSet,
<<<<<<< HEAD
    AdminPlateformeViewSet, CustomTokenObtainPairView, LogoutView
=======
    AdminPlateformeViewSet
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
)
from .etablissements_views import EtablissementViewSet, AdminEtablissementViewSet
from .pedagogie_views import (
    NiveauScolaireViewSet, MatiereViewSet, ChapitreViewSet,
<<<<<<< HEAD
    LeconViewSet, FichierMultimediaViewSet, PublicSearchView,
    SessionEtudeViewSet, ClasseViewSet
)
from .examens_views import (
    ExamenViewSet, QuestionExamenViewSet, CopieExamenViewSet,
    ReponseExamenViewSet, LogSurveillanceViewSet, CorrectionViewSet
=======
    LeconViewSet, FichierMultimediaViewSet
)
from .examens_views import (
    ExamenViewSet, QuestionExamenViewSet, CopieExamenViewSet,
    ReponseExamenViewSet, LogSurveillanceViewSet
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
)
from .visioconference_views import SessionVisioViewSet, ParticipationVisioViewSet
from .boutique_views import (
    RessourceBoutiqueViewSet, PanierViewSet, PanierItemViewSet,
    CommandeViewSet
)
<<<<<<< HEAD
from .communications_views import ActualiteViewSet, NotificationViewSet, PartenaireViewSet, RenovationViewSet
=======
from .communications_views import ActualiteViewSet, NotificationViewSet
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
from .ia_views import RequestIAViewSet, RecommandationViewSet

__all__ = [
    # Utilisateurs
    'UtilisateurViewSet', 'EtudiantViewSet', 'EnseignantViewSet',
<<<<<<< HEAD
    'AdminPlateformeViewSet', 'CustomTokenObtainPairView', 'LogoutView',
=======
    'AdminPlateformeViewSet',
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
    # Établissements
    'EtablissementViewSet', 'AdminEtablissementViewSet',
    # Pédagogie
    'NiveauScolaireViewSet', 'MatiereViewSet', 'ChapitreViewSet',
<<<<<<< HEAD
    'LeconViewSet', 'FichierMultimediaViewSet', 'PublicSearchView',
    'SessionEtudeViewSet', 'ClasseViewSet',
    # Examens
    'ExamenViewSet', 'QuestionExamenViewSet', 'CopieExamenViewSet',
    'ReponseExamenViewSet', 'LogSurveillanceViewSet', 'CorrectionViewSet',
=======
    'LeconViewSet', 'FichierMultimediaViewSet',
    # Examens
    'ExamenViewSet', 'QuestionExamenViewSet', 'CopieExamenViewSet',
    'ReponseExamenViewSet', 'LogSurveillanceViewSet',
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
    # Visioconférence
    'SessionVisioViewSet', 'ParticipationVisioViewSet',
    # Boutique
    'RessourceBoutiqueViewSet', 'PanierViewSet', 'PanierItemViewSet',
    'CommandeViewSet',
    # Communications
<<<<<<< HEAD
    'ActualiteViewSet', 'NotificationViewSet', 'PartenaireViewSet', 'RenovationViewSet',
=======
    'ActualiteViewSet', 'NotificationViewSet',
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
    # IA
    'RequestIAViewSet', 'RecommandationViewSet',
]
