from rest_framework import serializers
from core.models import (
    NiveauScolaire, Matiere, Chapitre, Lecon, FichierMultimedia
)


class NiveauScolaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = NiveauScolaire
        fields = ['id', 'nom', 'ordre', 'description']
        read_only_fields = ['id']


class MatiereSerializer(serializers.ModelSerializer):
    niveaux = NiveauScolaireSerializer(many=True, read_only=True)
    niveaux_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, 
        queryset=NiveauScolaire.objects.all(),
        source='niveaux'
    )

    class Meta:
        model = Matiere
        fields = ['id', 'nom', 'code', 'description', 'niveaux', 'niveaux_ids', 'ordre']
        read_only_fields = ['id']


class FichierMultimediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = FichierMultimedia
        fields = [
            'id', 'type_fichier', 'titre', 'url_fichier', 'taille_no',
            'lecon', 'format', 'metadata'
        ]
        read_only_fields = ['id']


class LeconSerializer(serializers.ModelSerializer):
    fichiers = FichierMultimediaSerializer(many=True, read_only=True)

    class Meta:
        model = Lecon
        fields = [
            'id', 'titre', 'order', 'chapitre', 'contenue_texte',
            'duree_estimee', 'objectifs', 'fichiers'
        ]
        read_only_fields = ['id']


class ChapitreSerializer(serializers.ModelSerializer):
    lecons = LeconSerializer(many=True, read_only=True)

    class Meta:
        model = Chapitre
        fields = [
            'id', 'titre', 'order', 'matiere', 'niveau',
            'description', 'lecons'
        ]
        read_only_fields = ['id']


class ChapitreDetailSerializer(serializers.ModelSerializer):
    """Serializer complet avec les leçons imbriquées"""
    matiere = MatiereSerializer(read_only=True)
    niveau = NiveauScolaireSerializer(read_only=True)
    lecons = LeconSerializer(many=True, read_only=True)

    class Meta:
        model = Chapitre
        fields = [
            'id', 'titre', 'order', 'matiere', 'niveau',
            'description', 'lecons'
        ]
