# Ce fichier a été remplacé - voir les nouveaux fichiers:
# - base_serializers.py
# - utilisateurs_serializers.py
# Les serializers sont maintenant mieux organisés dans des fichiers séparés

from .base_serializers import UtilisateurSerializer, UtilisateurDetailSerializer
from .utilisateurs_serializers import (
    EtudiantSerializer, EnseignantSerializer, AdminPlateformeSerializer
)

__all__ = [
    'UtilisateurSerializer',
    'UtilisateurDetailSerializer',
    'EtudiantSerializer',
    'EnseignantSerializer',
    'AdminPlateformeSerializer',
]
        
