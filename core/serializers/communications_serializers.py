from rest_framework import serializers
from core.models import Actualite, Notification


class ActualiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actualite
        fields = [
            'id', 'titre', 'contenu', 'date_expiration', 'est_publie',
            'public_ciblie', 'etablissement_cible', 'date_creation',
            'date_modification'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'utilisateur', 'titre', 'message', 'est_lue',
            'date_lecture', 'url_lien', 'date_creation'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification']
