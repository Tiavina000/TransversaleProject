from rest_framework import serializers
from core.models import Etablissement, AdminEtablissement
from .base_serializers import UtilisateurSerializer


class EtablissementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etablissement
        fields = ['id', 'nom', 'adresse', 'telephone', 'email', 'code_etablissement']
        read_only_fields = ['id']


class AdminEtablissementSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer(read_only=True)
    utilisateur_id = serializers.IntegerField(write_only=True)
    etablissement = EtablissementSerializer(read_only=True)
    etablissement_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = AdminEtablissement
        fields = [
            'id', 'utilisateur', 'utilisateur_id', 'etablissement',
            'etablissement_id', 'fonction'
        ]
        read_only_fields = ['id']
