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
    participations_count = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    enseignant_details = serializers.SerializerMethodField()

    class Meta:
        model = SessionVisio
        fields = [
            'id', 'titre', 'enseignant', 'enseignant_details', 'status', 'participations_count',
            'lecon', 'date_debut', 'date_fin',
            'url_visio', 'est_active',
            'date_creation', 'date_modification'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['enseignant'] = rep.pop('enseignant_details')
        rep['participants'] = rep.pop('participations_count')
        return rep

    def get_participations_count(self, obj):
        return obj.participationvisio_set.count()

    def get_status(self, obj):
        return 'live' if obj.est_active else 'scheduled'

    def get_enseignant_details(self, obj):
        return {
            'nom': obj.enseignant.utilisateur.username if obj.enseignant and obj.enseignant.utilisateur else 'Inconnu',
            'photo': None
        }
