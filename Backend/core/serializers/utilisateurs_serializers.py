from rest_framework import serializers
from core.models import Utilisateur, Etudiant, Enseignant, AdminPlateforme
from .base_serializers import UtilisateurSerializer


class EtudiantSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer(read_only=True)
    utilisateur_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Etudiant
        fields = ['id', 'utilisateur', 'utilisateur_id', 'points_global', 'date_inscription']
        read_only_fields = ['id', 'date_inscription']


class EnseignantSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer(read_only=True)
    utilisateur_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Enseignant
        fields = ['id', 'utilisateur', 'utilisateur_id', 'specialite', 'date_embauche']
        read_only_fields = ['id']


class AdminPlateformeSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer(read_only=True)
    utilisateur_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = AdminPlateforme
        fields = ['id', 'utilisateur', 'utilisateur_id', 'niveau_acces']
        read_only_fields = ['id']
