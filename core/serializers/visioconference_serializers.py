from rest_framework import serializers
from core.models import SessionVisio, ParticipationVisio


class ParticipationVisioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParticipationVisio
        fields = [
            'id', 'etudiant', 'session', 'date_joindre', 'date_quitter',
            'duree_participation', 'evenements_inactive'
        ]
        read_only_fields = ['id', 'date_joindre']


class SessionVisioSerializer(serializers.ModelSerializer):
    participations = ParticipationVisioSerializer(
        many=True, read_only=True, source='participationvisio_set'
    )

    class Meta:
        model = SessionVisio
        fields = [
            'id', 'titre', 'enseignant', 'lecon', 'date_debut', 'date_fin',
            'url_visio', 'est_active', 'participations',
            'date_creation', 'date_modification'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification']
