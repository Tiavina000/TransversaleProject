from rest_framework import serializers
from core.models import Utilisateur


class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = [
            'id', 'username', 'email', 'prenom', 'first_name',
            'langue_preferee', 'type_utilisateur', 'photo_profil',
            'est_actif', 'date_creation', 'date_modification'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification']


class UtilisateurDetailSerializer(UtilisateurSerializer):
    """Serializer détaillé avec plus d'informations"""
    class Meta(UtilisateurSerializer.Meta):
        fields = UtilisateurSerializer.Meta.fields + [
            'options_accessibilite', 'date_suppression'
        ]
