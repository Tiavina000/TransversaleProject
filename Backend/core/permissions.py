# pyrefly: ignore [missing-import]
from rest_framework import permissions

class IsEnseignantOrReadOnly(permissions.BasePermission):
    """
    Permission personnalisée :
    - Lecture (GET, HEAD, OPTIONS) autorisée pour tous les utilisateurs authentifiés.
    - Écriture (POST, PUT, PATCH, DELETE) autorisée uniquement pour les ENSEIGNANTS et ADMINISTRATEURS.
    """

    def has_permission(self, request, view):
        # Autoriser toutes les requêtes de lecture (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Pour les méthodes d'écriture, vérifier si l'utilisateur est un enseignant ou un admin
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.type_utilisateur in ['ENSEIGNANT', 'ADMINISTRATEUR']
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission personnalisée :
    - Lecture autorisée pour tous les utilisateurs authentifiés.
    - Écriture autorisée uniquement pour les ADMINISTRATEURS.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.type_utilisateur == 'ADMINISTRATEUR'
        )

class IsEtudiant(permissions.BasePermission):
    """
    Permission permettant l'accès uniquement aux utilisateurs de type ETUDIANT.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.type_utilisateur == 'ETUDIANT'
        )
