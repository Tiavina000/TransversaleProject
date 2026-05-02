from rest_framework import serializers
from core.models import RequestIA, Recommandation


class RequestIASerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestIA
        fields = [
            'id', 'etudiant', 'request', 'reponse', 'type_requete',
            'date_creation'
        ]
        read_only_fields = ['id', 'date_creation']


class RecommandationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommandation
        fields = [
            'id', 'etudiant', 'lecon', 'score_pertinence', 'explication',
            'est_consultee', 'date_creation'
        ]
        read_only_fields = ['id', 'date_creation']
